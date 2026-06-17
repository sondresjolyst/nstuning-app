"use client";

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { PlusIcon, XMarkIcon, ChevronRightIcon, ChevronDownIcon, PencilSquareIcon, CheckIcon } from '@heroicons/react/24/outline';
import VehicleService, { VehicleTree, EngineCatalogItem } from '@/services/vehicleService';

function EditableName({ editing, value, name, className, onEdit, onChange, onSave, onCancel }: {
    editing: boolean; value: string; name: string; className: string;
    onEdit: () => void; onChange: (v: string) => void; onSave: () => void; onCancel: () => void;
}) {
    if (editing) {
        return (
            <span className="flex items-center gap-1">
                <input
                    autoFocus
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); onSave(); } if (e.key === 'Escape') onCancel(); }}
                    className="rounded border border-gray-300 px-2 py-0.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button onClick={onSave} className="text-green-600 hover:text-green-700" title="Save"><CheckIcon className="h-4 w-4" /></button>
                <button onClick={onCancel} className="text-gray-400 hover:text-gray-700" title="Cancel"><XMarkIcon className="h-4 w-4" /></button>
            </span>
        );
    }
    return (
        <span className="flex items-center gap-1.5">
            <span className={className}>{name}</span>
            <button onClick={onEdit} className="text-gray-300 hover:text-gray-600" title="Rename"><PencilSquareIcon className="h-3.5 w-3.5" /></button>
        </span>
    );
}

function AddRow({ value, onChange, onAdd, placeholder }: { value: string; onChange: (v: string) => void; onAdd: () => void; placeholder: string }) {
    return (
        <div className="flex gap-2">
            <input
                value={value}
                onChange={e => onChange(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); onAdd(); } }}
                placeholder={placeholder}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button onClick={onAdd} className="inline-flex items-center gap-1 rounded-lg bg-gray-100 text-gray-700 font-medium px-3 py-1.5 text-sm hover:bg-gray-200 transition">
                <PlusIcon className="h-4 w-4" /> Add
            </button>
        </div>
    );
}

const EMPTY_TREE: VehicleTree = { brands: [], engines: [] };

export default function AdminVehiclesPage() {
    const [tree, setTree] = useState<VehicleTree>(EMPTY_TREE);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});
    const [drafts, setDrafts] = useState<Record<string, string>>({});
    const [editing, setEditing] = useState<Record<string, string>>({});
    const [newEngine, setNewEngine] = useState<{ name: string; brandId: string }>({ name: '', brandId: '' });

    useEffect(() => {
        VehicleService.getTree()
            .then(setTree)
            .catch(err => toast.error(err instanceof Error ? err.message : 'Failed to load vehicles'))
            .finally(() => setLoading(false));
    }, []);

    const reload = () => VehicleService.getTree().then(setTree).catch(() => { });
    const toggle = (key: string) => setExpanded(p => ({ ...p, [key]: !p[key] }));
    const draft = (key: string) => drafts[key] ?? '';
    const setDraft = (key: string, v: string) => setDrafts(p => ({ ...p, [key]: v }));

    const wrap = async (key: string, fn: () => Promise<unknown>) => {
        const name = draft(key).trim();
        if (!name) return;
        try {
            await fn();
            setDraft(key, '');
            await reload();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed');
        }
    };

    const run = async (fn: () => Promise<unknown>) => {
        try { await fn(); await reload(); }
        catch (err) { toast.error(err instanceof Error ? err.message : 'Failed'); }
    };

    const addBrand = () => wrap('brand', () => VehicleService.addBrand(draft('brand').trim()));
    const addModel = (brandId: number) => wrap(`b${brandId}`, () => VehicleService.addModel(brandId, draft(`b${brandId}`).trim()));
    const addVariant = (modelId: number) => wrap(`m${modelId}`, () => VehicleService.addVariant(modelId, draft(`m${modelId}`).trim()));

    const addEngine = () => {
        const name = newEngine.name.trim();
        if (!name) return;
        const brandId = newEngine.brandId ? Number(newEngine.brandId) : null;
        run(() => VehicleService.addEngine(name, brandId)).then(() => setNewEngine({ name: '', brandId: newEngine.brandId }));
    };

    const startEdit = (key: string, current: string) => setEditing(p => ({ ...p, [key]: current }));
    const editChange = (key: string, v: string) => setEditing(p => ({ ...p, [key]: v }));
    const cancelEdit = (key: string) => setEditing(p => { const n = { ...p }; delete n[key]; return n; });
    const saveEdit = async (level: 'brands' | 'models' | 'variants' | 'engines', id: number, key: string) => {
        const name = (editing[key] ?? '').trim();
        if (!name) return;
        try {
            await VehicleService.rename(level, id, name);
            cancelEdit(key);
            await reload();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to rename');
        }
    };

    const saveFamily = (modelId: number) => {
        const key = `fam${modelId}`;
        const value = (editing[key] ?? '').trim();
        run(() => VehicleService.setModelFamily(modelId, value || null)).then(() => cancelEdit(key));
    };

    if (loading) return <p className="text-gray-500">Loading…</p>;

    return (
        <div className="space-y-8">
            <div>
                <h2 className="font-bold text-gray-900">Vehicles</h2>
                <p className="mt-1 text-sm text-gray-600">
                    Organize cars by brand, model, then variant. Use Family to group related models, such as the 240 series.
                </p>
            </div>

            <AddRow value={draft('brand')} onChange={v => setDraft('brand', v)} placeholder="New brand, e.g. Volvo" onAdd={addBrand} />

            <ul className="divide-y divide-gray-100 rounded-2xl border border-gray-200">
                {tree.brands.map(brand => {
                    const bKey = `brand-${brand.id}`;
                    const bOpen = expanded[bKey];
                    const brandEngines = tree.engines.filter(e => e.brandId === brand.id || e.brandId === null);
                    return (
                        <li key={brand.id} className="p-3">
                            <div className="flex items-center gap-2">
                                <button onClick={() => toggle(bKey)} className="text-gray-400 hover:text-gray-700">
                                    {bOpen ? <ChevronDownIcon className="h-4 w-4" /> : <ChevronRightIcon className="h-4 w-4" />}
                                </button>
                                <EditableName
                                    editing={editing[`b${brand.id}`] !== undefined}
                                    value={editing[`b${brand.id}`] ?? ''}
                                    name={brand.name}
                                    className="font-medium text-gray-900"
                                    onEdit={() => startEdit(`b${brand.id}`, brand.name)}
                                    onChange={v => editChange(`b${brand.id}`, v)}
                                    onSave={() => saveEdit('brands', brand.id, `b${brand.id}`)}
                                    onCancel={() => cancelEdit(`b${brand.id}`)}
                                />
                                <span className="text-xs text-gray-400">{brand.models.length} model{brand.models.length === 1 ? '' : 's'}</span>
                                <button onClick={() => run(() => VehicleService.removeBrand(brand.id))} className="ml-auto text-gray-400 hover:text-red-600" title="Remove brand">
                                    <XMarkIcon className="h-4 w-4" />
                                </button>
                            </div>

                            {bOpen && (
                                <div className="mt-3 ml-6 space-y-3">
                                    {brand.models.map(model => {
                                        const mKey = `model-${model.id}`;
                                        const mOpen = expanded[mKey];
                                        const famKey = `fam${model.id}`;
                                        const famEditing = editing[famKey] !== undefined;
                                        const fittedIds = new Set(model.engineIds);
                                        return (
                                            <div key={model.id}>
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <button onClick={() => toggle(mKey)} className="text-gray-400 hover:text-gray-700">
                                                        {mOpen ? <ChevronDownIcon className="h-4 w-4" /> : <ChevronRightIcon className="h-4 w-4" />}
                                                    </button>
                                                    <EditableName
                                                        editing={editing[`m${model.id}`] !== undefined}
                                                        value={editing[`m${model.id}`] ?? ''}
                                                        name={model.name}
                                                        className="text-sm text-gray-800"
                                                        onEdit={() => startEdit(`m${model.id}`, model.name)}
                                                        onChange={v => editChange(`m${model.id}`, v)}
                                                        onSave={() => saveEdit('models', model.id, `m${model.id}`)}
                                                        onCancel={() => cancelEdit(`m${model.id}`)}
                                                    />
                                                    {famEditing ? (
                                                        <span className="flex items-center gap-1">
                                                            <input
                                                                autoFocus
                                                                value={editing[famKey] ?? ''}
                                                                onChange={e => editChange(famKey, e.target.value)}
                                                                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); saveFamily(model.id); } if (e.key === 'Escape') cancelEdit(famKey); }}
                                                                placeholder="Family / series"
                                                                className="rounded border border-gray-300 px-2 py-0.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                                                            />
                                                            <button onClick={() => saveFamily(model.id)} className="text-green-600 hover:text-green-700" title="Save"><CheckIcon className="h-4 w-4" /></button>
                                                            <button onClick={() => cancelEdit(famKey)} className="text-gray-400 hover:text-gray-700" title="Cancel"><XMarkIcon className="h-4 w-4" /></button>
                                                        </span>
                                                    ) : (
                                                        <button
                                                            onClick={() => startEdit(famKey, model.family ?? '')}
                                                            className={`text-xs rounded-full px-2 py-0.5 border ${model.family ? 'bg-primary/10 border-primary/30 text-gray-700' : 'border-dashed border-gray-300 text-gray-400 hover:text-gray-600'}`}
                                                            title="Set grouping folder (picker only)"
                                                        >
                                                            {model.family ? `📁 ${model.family}` : '+ family'}
                                                        </button>
                                                    )}
                                                    <span className="text-xs text-gray-400">{model.variants.length} variant{model.variants.length === 1 ? '' : 's'}</span>
                                                    <button onClick={() => run(() => VehicleService.removeModel(model.id))} className="ml-auto text-gray-400 hover:text-red-600" title="Remove model">
                                                        <XMarkIcon className="h-4 w-4" />
                                                    </button>
                                                </div>

                                                {mOpen && (
                                                    <div className="mt-2 ml-6 space-y-3">
                                                        <div className="space-y-1.5">
                                                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Variants</p>
                                                            <div className="flex flex-wrap gap-1.5">
                                                                {model.variants.map(variant => (
                                                                    <span key={variant.id} className="flex items-center gap-1 pl-2.5 pr-1.5 py-0.5 bg-gray-100 border border-gray-200 rounded-lg text-xs text-gray-700">
                                                                        <EditableName
                                                                            editing={editing[`v${variant.id}`] !== undefined}
                                                                            value={editing[`v${variant.id}`] ?? ''}
                                                                            name={variant.name}
                                                                            className="text-xs text-gray-700"
                                                                            onEdit={() => startEdit(`v${variant.id}`, variant.name)}
                                                                            onChange={val => editChange(`v${variant.id}`, val)}
                                                                            onSave={() => saveEdit('variants', variant.id, `v${variant.id}`)}
                                                                            onCancel={() => cancelEdit(`v${variant.id}`)}
                                                                        />
                                                                        <button onClick={() => run(() => VehicleService.removeVariant(variant.id))} className="text-gray-400 hover:text-red-600" title="Remove variant">
                                                                            <XMarkIcon className="h-3 w-3" />
                                                                        </button>
                                                                    </span>
                                                                ))}
                                                            </div>
                                                            <AddRow value={draft(`m${model.id}`)} onChange={v => setDraft(`m${model.id}`, v)} placeholder="New variant, e.g. Turbo" onAdd={() => addVariant(model.id)} />
                                                        </div>

                                                        <div className="space-y-1.5">
                                                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Factory engines</p>
                                                            {brandEngines.length === 0 ? (
                                                                <p className="text-xs text-gray-400">No engines in the catalog for this brand yet — add some below.</p>
                                                            ) : (
                                                                <div className="flex flex-wrap gap-1.5">
                                                                    {brandEngines.map(engine => {
                                                                        const linked = fittedIds.has(engine.id);
                                                                        return (
                                                                            <button
                                                                                key={engine.id}
                                                                                onClick={() => run(() => linked
                                                                                    ? VehicleService.unlinkEngine(model.id, engine.id)
                                                                                    : VehicleService.linkEngine(model.id, engine.id))}
                                                                                className={`px-2.5 py-0.5 rounded-lg text-xs border transition ${linked
                                                                                    ? 'bg-primary/20 border-primary/40 text-gray-900 font-medium'
                                                                                    : 'bg-white border-gray-200 text-gray-500 hover:border-gray-400'}`}
                                                                                title={linked ? 'Fitted — click to remove' : 'Click to mark as factory-fitted'}
                                                                            >
                                                                                {linked ? '✓ ' : '+ '}{engine.name}{engine.brandId === null ? ' (global)' : ''}
                                                                            </button>
                                                                        );
                                                                    })}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                    <AddRow value={draft(`b${brand.id}`)} onChange={v => setDraft(`b${brand.id}`, v)} placeholder="New model, e.g. 242" onAdd={() => addModel(brand.id)} />
                                </div>
                            )}
                        </li>
                    );
                })}
            </ul>

            <EngineCatalog
                engines={tree.engines}
                brands={tree.brands.map(b => ({ id: b.id, name: b.name }))}
                editing={editing}
                newEngine={newEngine}
                onNewEngine={setNewEngine}
                onAdd={addEngine}
                onEdit={startEdit}
                onEditChange={editChange}
                onSave={key => { const id = Number(key.slice(1)); return saveEdit('engines', id, key); }}
                onCancel={cancelEdit}
                onRemove={id => run(() => VehicleService.removeEngine(id))}
            />
        </div>
    );
}

function EngineCatalog({ engines, brands, editing, newEngine, onNewEngine, onAdd, onEdit, onEditChange, onSave, onCancel, onRemove }: {
    engines: EngineCatalogItem[];
    brands: { id: number; name: string }[];
    editing: Record<string, string>;
    newEngine: { name: string; brandId: string };
    onNewEngine: (v: { name: string; brandId: string }) => void;
    onAdd: () => void;
    onEdit: (key: string, current: string) => void;
    onEditChange: (key: string, v: string) => void;
    onSave: (key: string) => void;
    onCancel: (key: string) => void;
    onRemove: (id: number) => void;
}) {
    const [open, setOpen] = useState<Record<string, boolean>>({});
    const toggle = (group: string) => setOpen(p => ({ ...p, [group]: !p[group] }));

    const brandName = (id: number | null) => id === null ? 'Global' : (brands.find(b => b.id === id)?.name ?? `#${id}`);
    const groups = new Map<string, EngineCatalogItem[]>();
    for (const e of engines) {
        const key = brandName(e.brandId);
        groups.set(key, [...(groups.get(key) ?? []), e]);
    }
    const sortedGroups = [...groups.entries()].sort(([a], [b]) => a === 'Global' ? 1 : b === 'Global' ? -1 : a.localeCompare(b));

    return (
        <div className="space-y-3">
            <div>
                <h3 className="font-bold text-gray-900">Engine catalog</h3>
                <p className="mt-1 text-sm text-gray-600">
                    One engine list for every car. Pick any engine for any build.
                </p>
            </div>

            <div className="flex flex-wrap gap-2">
                <input
                    value={newEngine.name}
                    onChange={e => onNewEngine({ ...newEngine, name: e.target.value })}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); onAdd(); } }}
                    placeholder="New engine, e.g. B230FT"
                    className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <select
                    value={newEngine.brandId}
                    onChange={e => onNewEngine({ ...newEngine, brandId: e.target.value })}
                    className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                    <option value="">Global</option>
                    {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
                <button onClick={onAdd} className="inline-flex items-center gap-1 rounded-lg bg-gray-100 text-gray-700 font-medium px-3 py-1.5 text-sm hover:bg-gray-200 transition">
                    <PlusIcon className="h-4 w-4" /> Add
                </button>
            </div>

            {engines.length === 0 ? (
                <p className="text-sm text-gray-400">No engines yet.</p>
            ) : (
                <ul className="divide-y divide-gray-100 rounded-2xl border border-gray-200">
                    {sortedGroups.map(([group, items]) => (
                        <li key={group} className="p-3">
                            <button onClick={() => toggle(group)} className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide hover:text-gray-700">
                                {open[group] ? <ChevronDownIcon className="h-3.5 w-3.5" /> : <ChevronRightIcon className="h-3.5 w-3.5" />}
                                {group}
                                <span className="text-gray-400 normal-case">({items.length})</span>
                            </button>
                            {open[group] && (
                            <div className="flex flex-wrap gap-1.5 mt-1.5">
                                {items.map(engine => (
                                    <span key={engine.id} className="flex items-center gap-1 pl-2.5 pr-1.5 py-0.5 bg-gray-100 border border-gray-200 rounded-lg text-xs text-gray-700">
                                        <EditableName
                                            editing={editing[`e${engine.id}`] !== undefined}
                                            value={editing[`e${engine.id}`] ?? ''}
                                            name={engine.name}
                                            className="text-xs text-gray-700"
                                            onEdit={() => onEdit(`e${engine.id}`, engine.name)}
                                            onChange={v => onEditChange(`e${engine.id}`, v)}
                                            onSave={() => onSave(`e${engine.id}`)}
                                            onCancel={() => onCancel(`e${engine.id}`)}
                                        />
                                        <button onClick={() => onRemove(engine.id)} className="text-gray-400 hover:text-red-600" title="Remove engine">
                                            <XMarkIcon className="h-3 w-3" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
