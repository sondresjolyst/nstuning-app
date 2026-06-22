import type { Metadata } from 'next';
import { DynoRun } from '@/services/dynoRunService';
import { publicGet } from '@/lib/publicApi';
import { REVALIDATE_TARGETS } from '@/lib/cacheTags';
import { COMPANY } from '@/lib/company';
import DynoRunCard from '@/components/DynoRunCard';

export const revalidate = 60;

export const metadata: Metadata = {
    title: 'Dyno runs',
    description: `Documented dyno results from ${COMPANY.name}.`,
    alternates: { canonical: '/dyno-runs' },
};

export default async function DynoRunsPage() {
    const runs = await publicGet<DynoRun[]>('/dyno-runs', { tags: [REVALIDATE_TARGETS.dynoRuns] }) ?? [];

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
            <h1 className="text-3xl font-black text-gray-900">Dyno runs</h1>
            <p className="mt-1 text-gray-600 mb-8">Documented results from the dyno.</p>

            {runs.length === 0 ? (
                <p className="text-gray-500">No dyno runs published yet.</p>
            ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {runs.map(run => <DynoRunCard key={run.id} run={run} />)}
                </div>
            )}
        </div>
    );
}
