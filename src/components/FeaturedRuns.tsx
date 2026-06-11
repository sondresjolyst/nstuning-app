"use client";

import { useEffect, useState } from 'react';
import DynoRunService, { DynoRun } from '@/services/dynoRunService';
import DynoRunCard from './DynoRunCard';

export default function FeaturedRuns({ limit = 3 }: { limit?: number }) {
    const [runs, setRuns] = useState<DynoRun[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        DynoRunService.list()
            .then(data => setRuns(data.slice(0, limit)))
            .catch(() => setRuns([]))
            .finally(() => setLoading(false));
    }, [limit]);

    if (loading) {
        return <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: limit }).map((_, i) => (
                <div key={i} className="aspect-video rounded-2xl bg-gray-100 animate-pulse" />
            ))}
        </div>;
    }

    if (runs.length === 0) {
        return <p className="text-gray-500">Dyno runs coming soon.</p>;
    }

    return (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {runs.map(run => <DynoRunCard key={run.id} run={run} />)}
        </div>
    );
}
