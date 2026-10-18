"use client";

import { useEffect, useState } from 'react';
import { toast } from '@sjolystinnovation/app-kit/toast';
import { SectionsEditor, StatsSectionEditor, type SectionEditorProps, type SectionEditors } from '@sjolystinnovation/app-kit/sections';
import ContentService from '@/services/contentService';
import ImageService, { imageUrl } from '@/services/imageService';
import { createSection, type Section, type StatSource, type StatsSection } from '@/types/content';
import { DEFAULT_SECTIONS } from '@/lib/defaultSections';

function StatsEditor(props: SectionEditorProps<StatsSection>) {
    return (
        <StatsSectionEditor<StatSource>
            {...props}
            sources={[
                { value: 'dynoRuns', label: 'Published dyno runs (live)', defaultItemLabel: 'Dyno runs published' },
                { value: 'brandsTuned', label: 'Brands tuned (live)', defaultItemLabel: 'Brands tuned' },
            ]}
        />
    );
}

const editors: SectionEditors<Section> = { stats: StatsEditor };

const images = { upload: (file: File) => ImageService.upload(file), src: imageUrl };

export default function AdminContentPage() {
    const [sections, setSections] = useState<Section[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        ContentService.getHome()
            .then(data => setSections(data.length > 0 ? data : DEFAULT_SECTIONS))
            .catch(() => setSections(DEFAULT_SECTIONS))
            .finally(() => setLoading(false));
    }, []);

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

            <SectionsEditor
                unwrapped
                sections={sections}
                onChange={setSections}
                createSection={createSection}
                initialAddType="feature"
                editors={editors}
                images={images}
            />

            <div className="flex justify-end border-t border-gray-200 pt-4">
                <button
                    onClick={save}
                    disabled={saving}
                    className="rounded-lg bg-primary text-primary-foreground font-semibold px-5 py-2 text-sm hover:brightness-95 disabled:opacity-60 transition"
                >
                    {saving ? 'Saving…' : 'Save'}
                </button>
            </div>
        </div>
    );
}
