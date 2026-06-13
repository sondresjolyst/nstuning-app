"use client";

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { PlusIcon, XMarkIcon, ChevronRightIcon, ChevronDownIcon, PencilSquareIcon, CheckIcon } from '@heroicons/react/24/outline';
import VehicleService, { BrandNode } from '@/services/vehicleService';

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

export default function AdminVehiclesPage() {
    const [tree, setTree] = useState<BrandNode[]>([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});
    const [drafts, setDrafts] = useState<Record<string, string>>({});

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

    const addBrand = () => wrap('brand', () => VehicleService.addBrand(draft('brand').trim()));
    const addModel = (brandId: number) => wrap(`b${brandId}`, () => VehicleService.addModel(brandId, draft(`b${brandId}`).trim()));
    const addVariant = (modelId: number) => wrap(`m${modelId}`, () => VehicleService.addVariant(modelId, draft(`m${modelId}`).trim()));
    const addEngine = (variantId: number) => wrap(`v${variantId}`, () => VehicleService.addEngine(variantId, draft(`v${variantId}`).trim()));

    const del = async (fn: () => Promise<unknown>) => {
        try { await fn(); await reload(); }
        catch (err) { toast.error(err instanceof Error ? err.message : 'Failed to delete'); }
    };

    const [editing, setEditing] = useState<Record<string, string>>({});
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

    if (loading) return <p className="text-gray-500">Loading…</p>;

    return (
        <div className="space-y-5">
            <div>
                <h2 className="font-bold text-gray-900">Vehicles</h2>
                <p className="mt-1 text-sm text-gray-600">Brands → models → variants → engines — used when creating a dyno run.</p>
            </div>

            <AddRow value={draft('brand')} onChange={v => setDraft('brand', v)} placeholder="New brand, e.g. Saab" onAdd={addBrand} />

            <ul className="divide-y divide-gray-100 rounded-2xl border border-gray-200">
                {tree.map(brand => {
                    const bKey = `brand-${brand.id}`;
                    const bOpen = expanded[bKey];
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
                                <button onClick={() => del(() => VehicleService.removeBrand(brand.id))} className="ml-auto text-gray-400 hover:text-red-600" title="Remove brand">
                                    <XMarkIcon className="h-4 w-4" />
                                </button>
                            </div>

                            {bOpen && (
                                <div className="mt-3 ml-6 space-y-3">
                                    {brand.models.map(model => {
                                        const mKey = `model-${model.id}`;
                                        const mOpen = expanded[mKey];
                                        return (
                                            <div key={model.id}>
                                                <div className="flex items-center gap-2">
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
                                                    <span className="text-xs text-gray-400">{model.variants.length} variant{model.variants.length === 1 ? '' : 's'}</span>
                                                    <button onClick={() => del(() => VehicleService.removeModel(model.id))} className="ml-auto text-gray-400 hover:text-red-600" title="Remove model">
                                                        <XMarkIcon className="h-4 w-4" />
                                                    </button>
                                                </div>
                                                {mOpen && (
                                                    <div className="mt-2 ml-6 space-y-3">
                                                        {model.variants.map(variant => {
                                                            const vKey = `variant-${variant.id}`;
                                                            const vOpen = expanded[vKey];
                                                            return (
                                                                <div key={variant.id}>
                                                                    <div className="flex items-center gap-2">
                                                                        <button onClick={() => toggle(vKey)} className="text-gray-400 hover:text-gray-700">
                                                                            {vOpen ? <ChevronDownIcon className="h-4 w-4" /> : <ChevronRightIcon className="h-4 w-4" />}
                                                                        </button>
                                                                        <EditableName
                                                                            editing={editing[`v${variant.id}`] !== undefined}
                                                                            value={editing[`v${variant.id}`] ?? ''}
                                                                            name={variant.name}
                                                                            className="text-sm text-gray-700"
                                                                            onEdit={() => startEdit(`v${variant.id}`, variant.name)}
                                                                            onChange={val => editChange(`v${variant.id}`, val)}
                                                                            onSave={() => saveEdit('variants', variant.id, `v${variant.id}`)}
                                                                            onCancel={() => cancelEdit(`v${variant.id}`)}
                                                                        />
                                                                        <span className="text-xs text-gray-400">{variant.engines.length} engine{variant.engines.length === 1 ? '' : 's'}</span>
                                                                        <button onClick={() => del(() => VehicleService.removeVariant(variant.id))} className="ml-auto text-gray-400 hover:text-red-600" title="Remove variant">
                                                                            <XMarkIcon className="h-4 w-4" />
                                                                        </button>
                                                                    </div>
                                                                    {vOpen && (
                                                                        <div className="mt-2 ml-6 space-y-2">
                                                                            <div className="flex flex-wrap gap-1.5">
                                                                                {variant.engines.map(engine => (
                                                                                    <span key={engine.id} className="flex items-center gap-1 pl-2.5 pr-1.5 py-0.5 bg-gray-100 border border-gray-200 rounded-lg text-xs text-gray-700">
                                                                                        <EditableName
                                                                                            editing={editing[`e${engine.id}`] !== undefined}
                                                                                            value={editing[`e${engine.id}`] ?? ''}
                                                                                            name={engine.name}
                                                                                            className="text-xs text-gray-700"
                                                                                            onEdit={() => startEdit(`e${engine.id}`, engine.name)}
                                                                                            onChange={v => editChange(`e${engine.id}`, v)}
                                                                                            onSave={() => saveEdit('engines', engine.id, `e${engine.id}`)}
                                                                                            onCancel={() => cancelEdit(`e${engine.id}`)}
                                                                                        />
                                                                                        <button onClick={() => del(() => VehicleService.removeEngine(engine.id))} className="text-gray-400 hover:text-red-600" title="Remove engine">
                                                                                            <XMarkIcon className="h-3 w-3" />
                                                                                        </button>
                                                                                    </span>
                                                                                ))}
                                                                            </div>
                                                                            <AddRow value={draft(`v${variant.id}`)} onChange={v => setDraft(`v${variant.id}`, v)} placeholder="New engine, e.g. 2.0" onAdd={() => addEngine(variant.id)} />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                        <AddRow value={draft(`m${model.id}`)} onChange={v => setDraft(`m${model.id}`, v)} placeholder="New variant, e.g. EMS" onAdd={() => addVariant(model.id)} />
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                    <AddRow value={draft(`b${brand.id}`)} onChange={v => setDraft(`b${brand.id}`, v)} placeholder="New model, e.g. 99" onAdd={() => addModel(brand.id)} />
                                </div>
                            )}
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
