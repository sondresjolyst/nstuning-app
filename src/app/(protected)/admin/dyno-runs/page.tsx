"use client";

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { PencilSquareIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
import DynoRunService, { DynoRun } from '@/services/dynoRunService';
import DynoRunForm from './DynoRunForm';

export default function AdminDynoRunsPage() {
    const [runs, setRuns] = useState<DynoRun[]>([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState<DynoRun | null>(null);
    const [creating, setCreating] = useState(false);

    const load = useCallback(() => {
        setLoading(true);
        DynoRunService.list(true)
            .then(setRuns)
            .catch(() => toast.error('Failed to load dyno runs'))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        let active = true;
        DynoRunService.list(true)
            .then(data => { if (active) setRuns(data); })
            .catch(() => toast.error('Failed to load dyno runs'))
            .finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, []);

    const handleSaved = () => {
        setCreating(false);
        setEditing(null);
        load();
    };

    const handleDelete = async (run: DynoRun) => {
        if (!confirm(`Delete "${run.title}"?`)) return;
        try {
            await DynoRunService.remove(run.id);
            toast.success('Deleted');
            load();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to delete');
        }
    };

    if (creating) return <DynoRunForm onSaved={handleSaved} onCancel={() => setCreating(false)} />;
    if (editing) return <DynoRunForm initial={editing} onSaved={handleSaved} onCancel={() => setEditing(null)} />;

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h2 className="font-bold text-gray-900">Dyno runs</h2>
                <button
                    onClick={() => setCreating(true)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-primary text-primary-foreground font-semibold px-4 py-2 text-sm hover:brightness-95 transition"
                >
                    <PlusIcon className="h-4 w-4" /> New
                </button>
            </div>

            {loading ? (
                <p className="text-gray-500">Loading…</p>
            ) : runs.length === 0 ? (
                <p className="text-gray-500">No dyno runs yet.</p>
            ) : (
                <ul className="divide-y divide-gray-200 rounded-2xl border border-gray-200">
                    {runs.map(run => (
                        <li key={run.id} className="flex items-center justify-between gap-4 px-4 py-3">
                            <div className="min-w-0">
                                <p className="font-medium text-gray-900 truncate">{run.title}</p>
                                <p className="text-xs text-gray-500">
                                    {[run.carMake, run.carModel].filter(Boolean).join(' ')}
                                    {run.published ? ' · Published' : ' · Draft'}
                                    {run.hasReport ? ' · PDF' : ''}
                                </p>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                                <button onClick={() => setEditing(run)} className="p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition" title="Edit">
                                    <PencilSquareIcon className="h-4 w-4" />
                                </button>
                                <button onClick={() => handleDelete(run)} className="p-2 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 transition" title="Delete">
                                    <TrashIcon className="h-4 w-4" />
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
