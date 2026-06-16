"use client";

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import TextInput from '@/components/TextInput';
import ReportUploader from '@/components/ReportUploader';
import Toggle from '@/components/Toggle';
import DynoRunService, { DynoRun, coverImageSrc } from '@/services/dynoRunService';
import VehicleService, { BrandNode } from '@/services/vehicleService';

function LabeledSelect({ label, value, options, disabled, onChange }: {
    label: string; value: string; options: string[]; disabled?: boolean; onChange: (v: string) => void;
}) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <select
                value={value}
                disabled={disabled}
                onChange={e => onChange(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-50 disabled:text-gray-400"
            >
                <option value="">—</option>
                {options.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
        </div>
    );
}

interface DynoRunFormProps {
    initial?: DynoRun | null;
    onSaved: () => void;
    onCancel: () => void;
}

interface FormState {
    title: string;
    carMake: string;
    carModel: string;
    trim: string;
    year: string;
    engine: string;
    fuelType: string;
    dynoDate: string;
    hubPowerBeforeWhp: string;
    hubPowerAfterWhp: string;
    hubTorqueBeforeWnm: string;
    hubTorqueAfterWnm: string;
    enginePowerBeforeHp: string;
    enginePowerAfterHp: string;
    engineTorqueBeforeNm: string;
    engineTorqueAfterNm: string;
    description: string;
    sortOrder: string;
    published: boolean;
}

function toState(run?: DynoRun | null): FormState {
    return {
        title: run?.title ?? '',
        carMake: run?.carMake ?? '',
        carModel: run?.carModel ?? '',
        trim: run?.trim ?? '',
        year: run?.year?.toString() ?? '',
        engine: run?.engine ?? '',
        fuelType: run?.fuelType ?? '',
        dynoDate: run?.dynoDate ?? '',
        hubPowerBeforeWhp: run?.hubPowerBeforeWhp?.toString() ?? '',
        hubPowerAfterWhp: run?.hubPowerAfterWhp?.toString() ?? '',
        hubTorqueBeforeWnm: run?.hubTorqueBeforeWnm?.toString() ?? '',
        hubTorqueAfterWnm: run?.hubTorqueAfterWnm?.toString() ?? '',
        enginePowerBeforeHp: run?.enginePowerBeforeHp?.toString() ?? '',
        enginePowerAfterHp: run?.enginePowerAfterHp?.toString() ?? '',
        engineTorqueBeforeNm: run?.engineTorqueBeforeNm?.toString() ?? '',
        engineTorqueAfterNm: run?.engineTorqueAfterNm?.toString() ?? '',
        description: run?.description ?? '',
        sortOrder: run?.sortOrder?.toString() ?? '0',
        published: run?.published ?? false,
    };
}

export default function DynoRunForm({ initial, onSaved, onCancel }: DynoRunFormProps) {
    const [form, setForm] = useState<FormState>(toState(initial));
    const [report, setReport] = useState<File | null>(null);
    const [cover, setCover] = useState<File | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [tree, setTree] = useState<BrandNode[]>([]);

    useEffect(() => {
        VehicleService.getTree().then(setTree).catch(() => { });
    }, []);

    const set = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setForm(f => ({ ...f, [field]: e.target.value }));

    const selectedBrand = tree.find(b => b.name === form.carMake);
    const selectedModel = selectedBrand?.models.find(m => m.name === form.carModel);
    const selectedVariant = selectedModel?.variants.find(v => v.name === form.trim);

    const withCurrent = (options: string[], current: string) =>
        current && !options.includes(current) ? [current, ...options] : options;

    const brandOptions = withCurrent(tree.map(b => b.name), form.carMake);
    const modelOptions = withCurrent(selectedBrand?.models.map(m => m.name) ?? [], form.carModel);
    const variantOptions = withCurrent(selectedModel?.variants.map(v => v.name) ?? [], form.trim);
    const engineOptions = withCurrent(selectedVariant?.engines.map(e => e.name) ?? [], form.engine);

    const buildFormData = (): FormData => {
        const fd = new FormData();
        fd.append('Title', form.title);
        if (form.carMake) fd.append('CarMake', form.carMake);
        if (form.carModel) fd.append('CarModel', form.carModel);
        if (form.trim) fd.append('Trim', form.trim);
        if (form.year) fd.append('Year', form.year);
        if (form.engine) fd.append('Engine', form.engine);
        if (form.fuelType) fd.append('FuelType', form.fuelType);
        if (form.dynoDate) fd.append('DynoDate', form.dynoDate);
        if (form.hubPowerBeforeWhp) fd.append('HubPowerBeforeWhp', form.hubPowerBeforeWhp);
        if (form.hubPowerAfterWhp) fd.append('HubPowerAfterWhp', form.hubPowerAfterWhp);
        if (form.hubTorqueBeforeWnm) fd.append('HubTorqueBeforeWnm', form.hubTorqueBeforeWnm);
        if (form.hubTorqueAfterWnm) fd.append('HubTorqueAfterWnm', form.hubTorqueAfterWnm);
        if (form.enginePowerBeforeHp) fd.append('EnginePowerBeforeHp', form.enginePowerBeforeHp);
        if (form.enginePowerAfterHp) fd.append('EnginePowerAfterHp', form.enginePowerAfterHp);
        if (form.engineTorqueBeforeNm) fd.append('EngineTorqueBeforeNm', form.engineTorqueBeforeNm);
        if (form.engineTorqueAfterNm) fd.append('EngineTorqueAfterNm', form.engineTorqueAfterNm);
        if (form.description) fd.append('Description', form.description);
        fd.append('SortOrder', form.sortOrder || '0');
        fd.append('Published', String(form.published));
        if (report) fd.append('Report', report);
        if (cover) fd.append('CoverImage', cover);
        return fd;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.title.trim()) {
            toast.error('Title is required');
            return;
        }
        setSubmitting(true);
        try {
            if (initial) {
                await DynoRunService.update(initial.id, buildFormData());
                toast.success('Dyno run updated');
            } else {
                await DynoRunService.create(buildFormData());
                toast.success('Dyno run created');
            }
            onSaved();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to save');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-gray-200 p-6">
            <h2 className="font-bold text-gray-900">{initial ? 'Edit dyno run' : 'New dyno run'}</h2>

            <TextInput label="Title" name="title" value={form.title} onChange={set('title')} required />

            <div className="grid sm:grid-cols-3 gap-4">
                <LabeledSelect label="Make" value={form.carMake} options={brandOptions}
                    onChange={v => setForm(f => ({ ...f, carMake: v, carModel: '', trim: '', engine: '' }))} />
                <LabeledSelect label="Model" value={form.carModel} options={modelOptions} disabled={!form.carMake}
                    onChange={v => setForm(f => ({ ...f, carModel: v, trim: '', engine: '' }))} />
                <LabeledSelect label="Variant" value={form.trim} options={variantOptions} disabled={!form.carModel}
                    onChange={v => setForm(f => ({ ...f, trim: v, engine: '' }))} />
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <LabeledSelect label="Engine" value={form.engine} options={engineOptions} disabled={!form.trim}
                    onChange={v => setForm(f => ({ ...f, engine: v }))} />
                <TextInput label="Fuel" name="fuelType" value={form.fuelType} onChange={set('fuelType')} />
                <TextInput label="Year" name="year" type="number" value={form.year} onChange={set('year')} />
                <TextInput label="Dyno date" name="dynoDate" type="date" value={form.dynoDate} onChange={set('dynoDate')} />
            </div>

            <p className="text-sm font-semibold text-gray-700 pt-2">Measured hub</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <TextInput label="Power before (whp)" name="hubPowerBeforeWhp" type="number" value={form.hubPowerBeforeWhp} onChange={set('hubPowerBeforeWhp')} />
                <TextInput label="Power after (whp)" name="hubPowerAfterWhp" type="number" value={form.hubPowerAfterWhp} onChange={set('hubPowerAfterWhp')} />
                <TextInput label="Torque before (wNm)" name="hubTorqueBeforeWnm" type="number" value={form.hubTorqueBeforeWnm} onChange={set('hubTorqueBeforeWnm')} />
                <TextInput label="Torque after (wNm)" name="hubTorqueAfterWnm" type="number" value={form.hubTorqueAfterWnm} onChange={set('hubTorqueAfterWnm')} />
            </div>

            <p className="text-sm font-semibold text-gray-700 pt-2">Calculated engine</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <TextInput label="Power before (hp)" name="enginePowerBeforeHp" type="number" value={form.enginePowerBeforeHp} onChange={set('enginePowerBeforeHp')} />
                <TextInput label="Power after (hp)" name="enginePowerAfterHp" type="number" value={form.enginePowerAfterHp} onChange={set('enginePowerAfterHp')} />
                <TextInput label="Torque before (Nm)" name="engineTorqueBeforeNm" type="number" value={form.engineTorqueBeforeNm} onChange={set('engineTorqueBeforeNm')} />
                <TextInput label="Torque after (Nm)" name="engineTorqueAfterNm" type="number" value={form.engineTorqueAfterNm} onChange={set('engineTorqueAfterNm')} />
            </div>

            <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description (markdown)</label>
                <textarea
                    id="description"
                    name="description"
                    rows={4}
                    value={form.description}
                    onChange={set('description')}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
                />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cover image</label>
                    {(() => {
                        const existing = initial ? coverImageSrc(initial) : null;
                        const preview = cover ? URL.createObjectURL(cover) : existing;
                        return (
                            <>
                                {preview && (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={preview} alt="" className="mb-2 h-24 w-auto rounded-lg border border-gray-200 object-cover" />
                                )}
                                <label className="inline-flex items-center gap-1.5 rounded-lg bg-gray-100 text-gray-700 font-medium px-4 py-2 text-sm hover:bg-gray-200 transition cursor-pointer">
                                    {cover ? 'Change image' : existing ? 'Replace image' : 'Upload image'}
                                    <input type="file" accept="image/*" onChange={e => setCover(e.target.files?.[0] ?? null)} className="hidden" />
                                </label>
                                {cover && <span className="ml-2 text-xs text-gray-500">{cover.name}</span>}
                            </>
                        );
                    })()}
                </div>
                <ReportUploader onSelect={setReport} existingFileName={initial?.reportFileName ?? null} />
            </div>

            <div className="flex items-center justify-between">
                <TextInput label="Sort order" name="sortOrder" type="number" value={form.sortOrder} onChange={set('sortOrder')} />
                <div className="mt-6">
                    <Toggle label="Published" checked={form.published} onChange={v => setForm(f => ({ ...f, published: v }))} />
                </div>
            </div>

            <div className="flex gap-3 pt-2">
                <button
                    type="submit"
                    disabled={submitting}
                    className="rounded-lg bg-primary text-primary-foreground font-semibold px-5 py-2.5 hover:brightness-95 disabled:opacity-60 transition"
                >
                    {submitting ? 'Saving…' : initial ? 'Save changes' : 'Create'}
                </button>
                <button type="button" onClick={onCancel} className="rounded-lg bg-gray-100 text-gray-700 font-medium px-5 py-2.5 hover:bg-gray-200 transition">
                    Cancel
                </button>
            </div>
        </form>
    );
}
