import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import { DynoRun, reportUrl, reportProxyUrl, coverImageSrc, coverImageSrcSet } from '@/services/dynoRunService';
import { publicGet } from '@/lib/publicApi';
import { REVALIDATE_TARGETS } from '@/lib/cacheTags';
import { COMPANY } from '@/lib/company';
import PdfViewer from '@/components/PdfViewer';

export const revalidate = 60;

const getRun = (slug: string) => publicGet<DynoRun>(`/dyno-runs/${slug}`, { tags: [REVALIDATE_TARGETS.dynoRuns] });

const carLineOf = (run: DynoRun) =>
    [run.carMake, run.carModel, run.trim, run.year].filter(Boolean).join(' ');

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const run = await getRun(slug);
    if (!run) return { title: `Dyno run — ${COMPANY.name}` };
    const carLine = carLineOf(run);
    return {
        title: `${run.title} — ${COMPANY.name}`,
        description: [carLine, run.enginePowerAfterHp ? `${run.enginePowerAfterHp} hp` : null].filter(Boolean).join(' · ') || undefined,
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


// Specific output per litre, normalised to 100 kPa absolute manifold pressure.
// NA (≈100 kPa) divides by 1; e.g. 200 kPa absolute halves the figure.
function perLitreAt100kPa(value?: number | null, displacementCc?: number | null, kPa?: number | null): number | null {
    if (value == null || !displacementCc) return null;
    const litres = displacementCc / 1000;
    const ratio = (kPa && kPa > 0 ? kPa : 100) / 100;
    return Math.round((value / litres / ratio) * 10) / 10;
}

export default async function DynoRunDetail({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const run = await getRun(slug);
    if (!run) notFound();

    const hpPerLitre = perLitreAt100kPa(run.enginePowerAfterHp, run.displacementCc, run.absolutePressureKpa);
    const nmPerLitre = perLitreAt100kPa(run.engineTorqueAfterNm, run.displacementCc, run.absolutePressureKpa);

    const carLine = [carLineOf(run), run.engine && `Engine ${run.engine}`, run.fuelType && `Fuel ${run.fuelType}`]
        .filter(Boolean).join(' · ');

    const dynoDate = run.dynoDate
        ? new Date(run.dynoDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
        : null;

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
            <Link href="/dyno-runs" className="text-sm font-semibold text-gray-500 hover:text-gray-900">← Dyno runs</Link>
            <div className="mt-3 flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900">{run.title}</h1>
                    {carLine && <p className="mt-1 text-gray-600">{carLine}</p>}
                    {dynoDate && <p className="mt-1 text-sm text-gray-500">Dynoed on {dynoDate}</p>}
                </div>
                {coverImageSrc(run) && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={coverImageSrc(run)!} srcSet={coverImageSrcSet(run)} sizes="112px" alt={run.title} className="h-16 w-24 sm:h-20 sm:w-28 shrink-0 rounded-lg border border-gray-200 object-cover" />
                )}
            </div>

            <p className="mt-6 text-xs font-semibold uppercase tracking-wide text-gray-500">Measured at hub</p>
            <div className="mt-2 grid grid-cols-2 gap-4">
                <Stat label="Power" before={run.hubPowerBeforeWhp} after={run.hubPowerAfterWhp} unit="whp" />
                <Stat label="Torque" before={run.hubTorqueBeforeWnm} after={run.hubTorqueAfterWnm} unit="wNm" />
            </div>

            <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-gray-500">Calculated engine</p>
            <div className="mt-2 grid grid-cols-2 gap-4">
                <Stat label="Power" before={run.enginePowerBeforeHp} after={run.enginePowerAfterHp} unit="hp" />
                <Stat label="Torque" before={run.engineTorqueBeforeNm} after={run.engineTorqueAfterNm} unit="Nm" />
            </div>

            {(hpPerLitre != null || nmPerLitre != null) && (
                <>
                    <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-gray-500">Per litre at 100 kPa</p>
                    <div className="mt-2 grid grid-cols-2 gap-4">
                        {hpPerLitre != null && (
                            <div className="rounded-xl border border-gray-200 p-4">
                                <p className="text-xs uppercase tracking-wide text-gray-500">Power</p>
                                <p className="mt-1 text-2xl font-extrabold text-gray-900">{hpPerLitre} <span className="text-sm font-medium text-gray-500">hp/L</span></p>
                            </div>
                        )}
                        {nmPerLitre != null && (
                            <div className="rounded-xl border border-gray-200 p-4">
                                <p className="text-xs uppercase tracking-wide text-gray-500">Torque</p>
                                <p className="mt-1 text-2xl font-extrabold text-gray-900">{nmPerLitre} <span className="text-sm font-medium text-gray-500">Nm/L</span></p>
                            </div>
                        )}
                    </div>
                </>
            )}

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
