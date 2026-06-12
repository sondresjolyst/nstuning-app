"use client";

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import DynoRunService, { DynoRun, reportUrl, reportProxyUrl } from '@/services/dynoRunService';

function Stat({ label, before, after, unit }: { label: string; before?: number | null; after?: number | null; unit: string }) {
    if (after == null) return null;
    const gain = before != null ? after - before : null;
    return (
        <div className="rounded-xl border border-gray-200 p-4">
            <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
            <p className="mt-1 text-2xl font-extrabold text-gray-900">{after} <span className="text-sm font-medium text-gray-500">{unit}</span></p>
            {before != null && (
                <p className="text-xs text-gray-500 mt-0.5">
                    from {before} {unit}{gain != null && gain > 0 ? ` · +${gain}` : ''}
                </p>
            )}
        </div>
    );
}

export default function DynoRunDetail({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);
    const [run, setRun] = useState<DynoRun | null>(null);
    const [status, setStatus] = useState<'loading' | 'ready' | 'notfound'>('loading');

    useEffect(() => {
        DynoRunService.getBySlug(slug)
            .then(r => { setRun(r); setStatus('ready'); })
            .catch(() => setStatus('notfound'));
    }, [slug]);

    if (status === 'loading') {
        return <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12"><div className="h-64 rounded-2xl bg-gray-100 animate-pulse" /></div>;
    }

    if (status === 'notfound' || !run) {
        return (
            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-20 text-center">
                <p className="text-gray-600">Dyno run not found.</p>
                <Link href="/dyno-runs" className="mt-4 inline-block text-sm font-semibold text-gray-900">← Back to dyno runs</Link>
            </div>
        );
    }

    const carLine = [run.carMake, run.carModel, run.year].filter(Boolean).join(' ');

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
            <Link href="/dyno-runs" className="text-sm font-semibold text-gray-500 hover:text-gray-900">← Dyno runs</Link>
            <h1 className="mt-3 text-3xl font-black text-gray-900">{run.title}</h1>
            {carLine && <p className="mt-1 text-gray-600">{carLine}{run.engine ? ` · ${run.engine}` : ''}{run.fuelType ? ` · ${run.fuelType}` : ''}</p>}

            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Stat label="Power" before={run.powerBeforeHp} after={run.powerAfterHp} unit="hp" />
                <Stat label="Torque" before={run.torqueBeforeNm} after={run.torqueAfterNm} unit="Nm" />
            </div>

            {run.description && (
                <div className="prose prose-sm mt-8 max-w-none text-gray-700">
                    <Markdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>{run.description}</Markdown>
                </div>
            )}

            {run.hasReport && (
                <div className="mt-8">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="font-bold text-gray-900">Dyno report</h2>
                        <a href={reportUrl(run.id)} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-gray-700 hover:text-gray-900">
                            Open PDF ↗
                        </a>
                    </div>
                    <iframe
                        src={reportProxyUrl(run.id)}
                        title={`${run.title} dyno report`}
                        className="w-full h-[80vh] rounded-xl border border-gray-200"
                    />
                </div>
            )}
        </div>
    );
}
