"use client";

import { useEffect, useState } from 'react';
import DynoRunService, { DynoRun } from '@/services/dynoRunService';
import DynoRunCard from '@/components/DynoRunCard';

export default function DynoRunsPage() {
    const [runs, setRuns] = useState<DynoRun[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        DynoRunService.list()
            .then(setRuns)
            .catch(() => setRuns([]))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
            <h1 className="text-3xl font-black text-gray-900">Dyno runs</h1>
            <p className="mt-1 text-gray-600 mb-8">Documented results from the rolling road.</p>

            {loading ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="aspect-video rounded-2xl bg-gray-100 animate-pulse" />
                    ))}
                </div>
            ) : runs.length === 0 ? (
                <p className="text-gray-500">No dyno runs published yet.</p>
            ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {runs.map(run => <DynoRunCard key={run.id} run={run} />)}
                </div>
            )}
        </div>
    );
}
