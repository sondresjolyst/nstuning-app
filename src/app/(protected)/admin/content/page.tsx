"use client";

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
    ArrowUpIcon, ArrowDownIcon, TrashIcon, PlusIcon, EyeIcon, EyeSlashIcon,
} from '@heroicons/react/24/outline';
import ContentService from '@/services/contentService';
import { Section, SectionType, SECTION_LABELS, createSection } from '@/types/content';
import { DEFAULT_SECTIONS } from '@/lib/defaultSections';
import TextInput from '@/components/TextInput';

const SECTION_TYPES: SectionType[] = ['hero', 'feature', 'text', 'dynoRuns', 'contact'];

export default function AdminContentPage() {
    const [sections, setSections] = useState<Section[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [addType, setAddType] = useState<SectionType>('feature');

    useEffect(() => {
        ContentService.getHome()
            .then(data => setSections(data.length > 0 ? data : DEFAULT_SECTIONS))
            .catch(() => setSections(DEFAULT_SECTIONS))
            .finally(() => setLoading(false));
    }, []);

    const patch = (id: string, changes: Partial<Section>) =>
        setSections(prev => prev.map(s => (s.id === id ? { ...s, ...changes } as Section : s)));

    const move = (index: number, dir: -1 | 1) => {
        setSections(prev => {
            const next = [...prev];
            const target = index + dir;
            if (target < 0 || target >= next.length) return prev;
            [next[index], next[target]] = [next[target], next[index]];
            return next;
        });
    };

    const remove = (id: string) => setSections(prev => prev.filter(s => s.id !== id));
    const add = () => setSections(prev => [...prev, createSection(addType)]);

    const save = async () => {
        setSaving(true);
        try {
            await ContentService.updateHome(sections);
            toast.success('Home page saved');
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to save');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <p className="text-gray-500">Loading…</p>;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="font-bold text-gray-900">Home page</h2>
                <div className="flex items-center gap-2">
                    <button onClick={() => setSections(DEFAULT_SECTIONS)} className="text-sm text-gray-500 hover:text-gray-900">
                        Reset to starter
                    </button>
                    <button
                        onClick={save}
                        disabled={saving}
                        className="rounded-lg bg-primary text-primary-foreground font-semibold px-5 py-2 text-sm hover:brightness-95 disabled:opacity-60 transition"
                    >
                        {saving ? 'Saving…' : 'Save'}
                    </button>
                </div>
            </div>

            {sections.map((section, index) => (
                <div key={section.id} className="rounded-2xl border border-gray-200 p-5">
                    <div className="flex items-center justify-between mb-4">
                        <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                            {SECTION_LABELS[section.type]}
                        </span>
                        <div className="flex items-center gap-1">
                            <button onClick={() => patch(section.id, { visible: !section.visible })} title={section.visible ? 'Hide' : 'Show'} className="p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100">
                                {section.visible ? <EyeIcon className="h-4 w-4" /> : <EyeSlashIcon className="h-4 w-4" />}
                            </button>
                            <button onClick={() => move(index, -1)} disabled={index === 0} title="Move up" className="p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-30">
                                <ArrowUpIcon className="h-4 w-4" />
                            </button>
                            <button onClick={() => move(index, 1)} disabled={index === sections.length - 1} title="Move down" className="p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-30">
                                <ArrowDownIcon className="h-4 w-4" />
                            </button>
                            <button onClick={() => remove(section.id)} title="Remove" className="p-2 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50">
                                <TrashIcon className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                    <SectionEditor section={section} patch={changes => patch(section.id, changes)} />
                </div>
            ))}

            <div className="flex items-center gap-2 pt-2">
                <select
                    value={addType}
                    onChange={e => setAddType(e.target.value as SectionType)}
                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
                >
                    {SECTION_TYPES.map(t => <option key={t} value={t}>{SECTION_LABELS[t]}</option>)}
                </select>
                <button onClick={add} className="inline-flex items-center gap-1.5 rounded-lg bg-gray-100 text-gray-700 font-medium px-4 py-2 text-sm hover:bg-gray-200 transition">
                    <PlusIcon className="h-4 w-4" /> Add section
                </button>
            </div>
        </div>
    );
}

function Field({ label, value, onChange, textarea }: { label: string; value: string; onChange: (v: string) => void; textarea?: boolean }) {
    if (textarea) {
        return (
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <textarea
                    rows={3}
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
                />
            </div>
        );
    }
    return <TextInput label={label} value={value} onChange={e => onChange(e.target.value)} />;
}

function SectionEditor({ section, patch }: { section: Section; patch: (changes: Partial<Section>) => void }) {
    switch (section.type) {
        case 'hero':
            return (
                <div className="space-y-4">
                    <Field label="Heading" value={section.heading} onChange={v => patch({ heading: v })} />
                    <Field label="Subheading" value={section.subheading} onChange={v => patch({ subheading: v })} textarea />
                    <div className="grid sm:grid-cols-2 gap-4">
                        <Field label="Primary button label" value={section.primaryLabel} onChange={v => patch({ primaryLabel: v })} />
                        <Field label="Primary button link" value={section.primaryHref} onChange={v => patch({ primaryHref: v })} />
                        <Field label="Secondary button label" value={section.secondaryLabel} onChange={v => patch({ secondaryLabel: v })} />
                        <Field label="Secondary button link" value={section.secondaryHref} onChange={v => patch({ secondaryHref: v })} />
                    </div>
                </div>
            );

        case 'feature':
            return (
                <div className="space-y-4">
                    <Field label="Heading" value={section.heading} onChange={v => patch({ heading: v })} />
                    <Field label="Text" value={section.text} onChange={v => patch({ text: v })} textarea />
                    <BulletEditor bullets={section.bullets} onChange={bullets => patch({ bullets })} />
                </div>
            );

        case 'text':
            return (
                <div className="space-y-4">
                    <Field label="Heading" value={section.heading} onChange={v => patch({ heading: v })} />
                    <Field label="Body (markdown)" value={section.body} onChange={v => patch({ body: v })} textarea />
                </div>
            );

        case 'dynoRuns':
            return (
                <div className="grid sm:grid-cols-2 gap-4">
                    <Field label="Heading" value={section.heading} onChange={v => patch({ heading: v })} />
                    <TextInput
                        label="Number to show"
                        type="number"
                        value={section.limit.toString()}
                        onChange={e => patch({ limit: Math.max(1, Number(e.target.value) || 1) })}
                    />
                </div>
            );

        case 'contact':
            return (
                <div className="space-y-4">
                    <Field label="Heading" value={section.heading} onChange={v => patch({ heading: v })} />
                    <Field label="Text" value={section.text} onChange={v => patch({ text: v })} textarea />
                </div>
            );
    }
}

function BulletEditor({ bullets, onChange }: { bullets: string[]; onChange: (bullets: string[]) => void }) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bullet points</label>
            <div className="space-y-2">
                {bullets.map((bullet, i) => (
                    <div key={i} className="flex items-center gap-2">
                        <input
                            value={bullet}
                            onChange={e => onChange(bullets.map((b, j) => (j === i ? e.target.value : b)))}
                            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        <button type="button" onClick={() => onChange(bullets.filter((_, j) => j !== i))} className="p-2 rounded-lg text-red-500 hover:bg-red-50">
                            <TrashIcon className="h-4 w-4" />
                        </button>
                    </div>
                ))}
                <button type="button" onClick={() => onChange([...bullets, ''])} className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900">
                    <PlusIcon className="h-4 w-4" /> Add bullet
                </button>
            </div>
        </div>
    );
}
