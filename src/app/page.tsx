"use client";

import { useEffect, useState } from 'react';
import SectionRenderer from '@/components/SectionRenderer';
import ContentService from '@/services/contentService';
import { Section } from '@/types/content';
import { DEFAULT_SECTIONS } from '@/lib/defaultSections';

export default function Home() {
    const [sections, setSections] = useState<Section[] | null>(null);

    useEffect(() => {
        ContentService.getHome()
            .then(data => setSections(data.length > 0 ? data : DEFAULT_SECTIONS))
            .catch(() => setSections(DEFAULT_SECTIONS));
    }, []);

    if (sections === null) {
        return <div className="max-w-7xl mx-auto px-4 py-24"><div className="h-64 rounded-2xl bg-gray-100 animate-pulse" /></div>;
    }

    return (
        <div>
            {sections.map(section => <SectionRenderer key={section.id} section={section} />)}
        </div>
    );
}
