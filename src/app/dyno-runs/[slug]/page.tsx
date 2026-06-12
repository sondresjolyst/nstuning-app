import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import { DynoRun, reportUrl, reportProxyUrl } from '@/services/dynoRunService';
import { publicGet } from '@/lib/publicApi';
import { COMPANY } from '@/lib/company';
import PdfViewer from '@/components/PdfViewer';

export const revalidate = 60;

const getRun = (slug: string) => publicGet<DynoRun>(`/dyno-runs/${slug}`);

const carLineOf = (run: DynoRun) =>
    [run.carMake, run.carModel, run.trim, run.year].filter(Boolean).join(' ');

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const run = await getRun(slug);
    if (!run) return { title: `Dyno run — ${COMPANY.name}` };
    const carLine = carLineOf(run);
    return {
        title: `${run.title} — ${COMPANY.name}`,
        description: [carLine, run.powerAfterHp ? `${run.powerAfterHp} hp` : null].filter(Boolean).join(' · ') || undefined,
    };
}

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

export default async function DynoRunDetail({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const run = await getRun(slug);
    if (!run) notFound();

    const carLine = [carLineOf(run), run.engine && `Engine ${run.engine}`, run.fuelType && `Fuel ${run.fuelType}`]
        .filter(Boolean).join(' · ');

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
            <Link href="/dyno-runs" className="text-sm font-semibold text-gray-500 hover:text-gray-900">← Dyno runs</Link>
            <h1 className="mt-3 text-3xl font-black text-gray-900">{run.title}</h1>
            {carLine && <p className="mt-1 text-gray-600">{carLine}</p>}

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
                    <PdfViewer url={reportProxyUrl(run.id)} />
                </div>
            )}
        </div>
    );
}
