"use client";

import { useState } from 'react';
import { toast } from 'sonner';
import TextInput from '@/components/TextInput';
import ReportUploader from '@/components/ReportUploader';
import DynoRunService, { DynoRun } from '@/services/dynoRunService';

interface DynoRunFormProps {
    initial?: DynoRun | null;
    onSaved: () => void;
    onCancel: () => void;
}

interface FormState {
    title: string;
    carMake: string;
    carModel: string;
    year: string;
    engine: string;
    fuelType: string;
    powerBeforeHp: string;
    powerAfterHp: string;
    torqueBeforeNm: string;
    torqueAfterNm: string;
    description: string;
    sortOrder: string;
    published: boolean;
}

function toState(run?: DynoRun | null): FormState {
    return {
        title: run?.title ?? '',
        carMake: run?.carMake ?? '',
        carModel: run?.carModel ?? '',
        year: run?.year?.toString() ?? '',
        engine: run?.engine ?? '',
        fuelType: run?.fuelType ?? '',
        powerBeforeHp: run?.powerBeforeHp?.toString() ?? '',
        powerAfterHp: run?.powerAfterHp?.toString() ?? '',
        torqueBeforeNm: run?.torqueBeforeNm?.toString() ?? '',
        torqueAfterNm: run?.torqueAfterNm?.toString() ?? '',
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

    const set = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setForm(f => ({ ...f, [field]: e.target.value }));

    const buildFormData = (): FormData => {
        const fd = new FormData();
        fd.append('Title', form.title);
        if (form.carMake) fd.append('CarMake', form.carMake);
        if (form.carModel) fd.append('CarModel', form.carModel);
        if (form.year) fd.append('Year', form.year);
        if (form.engine) fd.append('Engine', form.engine);
        if (form.fuelType) fd.append('FuelType', form.fuelType);
        if (form.powerBeforeHp) fd.append('PowerBeforeHp', form.powerBeforeHp);
        if (form.powerAfterHp) fd.append('PowerAfterHp', form.powerAfterHp);
        if (form.torqueBeforeNm) fd.append('TorqueBeforeNm', form.torqueBeforeNm);
        if (form.torqueAfterNm) fd.append('TorqueAfterNm', form.torqueAfterNm);
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
                <TextInput label="Make" name="carMake" value={form.carMake} onChange={set('carMake')} />
                <TextInput label="Model" name="carModel" value={form.carModel} onChange={set('carModel')} />
                <TextInput label="Year" name="year" type="number" value={form.year} onChange={set('year')} />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
                <TextInput label="Engine" name="engine" value={form.engine} onChange={set('engine')} />
                <TextInput label="Fuel" name="fuelType" value={form.fuelType} onChange={set('fuelType')} />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <TextInput label="Power before (hp)" name="powerBeforeHp" type="number" value={form.powerBeforeHp} onChange={set('powerBeforeHp')} />
                <TextInput label="Power after (hp)" name="powerAfterHp" type="number" value={form.powerAfterHp} onChange={set('powerAfterHp')} />
                <TextInput label="Torque before (Nm)" name="torqueBeforeNm" type="number" value={form.torqueBeforeNm} onChange={set('torqueBeforeNm')} />
                <TextInput label="Torque after (Nm)" name="torqueAfterNm" type="number" value={form.torqueAfterNm} onChange={set('torqueAfterNm')} />
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
                    <input type="file" accept="image/*" onChange={e => setCover(e.target.files?.[0] ?? null)} className="text-sm" />
                </div>
                <ReportUploader onSelect={setReport} existingFileName={initial?.hasReport ? 'report.pdf' : null} />
            </div>

            <div className="flex items-center justify-between">
                <TextInput label="Sort order" name="sortOrder" type="number" value={form.sortOrder} onChange={set('sortOrder')} />
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mt-6">
                    <input type="checkbox" checked={form.published} onChange={e => setForm(f => ({ ...f, published: e.target.checked }))} />
                    Published
                </label>
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
