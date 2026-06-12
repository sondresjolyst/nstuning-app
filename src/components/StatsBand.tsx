"use client";

import { useEffect, useState } from 'react';
import DynoRunService from '@/services/dynoRunService';
import { StatsSection } from '@/types/content';

export default function StatsBand({ section }: { section: StatsSection }) {
    const needsRuns = section.items.some(i => i.source === 'dynoRuns' || i.source === 'brandsTuned');
    const [count, setCount] = useState<number | null>(null);
    const [makes, setMakes] = useState<number | null>(null);

    useEffect(() => {
        if (!needsRuns) return;
        DynoRunService.list()
            .then(runs => {
                setCount(runs.length);
                setMakes(new Set(runs.map(r => r.carMake?.trim().toLowerCase()).filter(Boolean)).size);
            })
            .catch(() => { setCount(null); setMakes(null); });
    }, [needsRuns]);

    const display = (item: StatsSection['items'][number]): string => {
        if (item.source === 'dynoRuns') return count != null ? `${count}` : '—';
        if (item.source === 'brandsTuned') return makes != null ? `${makes}` : '—';
        return item.value;
    };

    return (
        <section className="bg-gray-50 border-y border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
                {section.heading && <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">{section.heading}</h2>}
                <dl className="flex flex-wrap justify-center gap-4 sm:gap-6">
                    {section.items.map((item, i) => (
                        <div key={i} className="rounded-2xl border border-gray-200 bg-white shadow-sm px-8 py-6 text-center min-w-[10rem]">
                            <dt className="text-4xl sm:text-5xl font-black text-gray-900 tabular-nums">{display(item)}</dt>
                            <dd className="mt-1 text-sm text-gray-600">{item.label}</dd>
                        </div>
                    ))}
                </dl>
            </div>
        </section>
    );
}
