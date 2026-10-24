import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Markdown } from '@sjolystinnovation/app-kit/markdown';
import { DynoRun, reportUrl, reportProxyUrl, coverImageSrc, coverImageSrcSet } from '@/services/dynoRunService';
import { publicGet } from '@/lib/publicApi';
import { slugSegment } from '@/lib/slug';
import { REVALIDATE_TARGETS } from '@/lib/cacheTags';
import { COMPANY } from '@/lib/company';
import ReportViewer from '@/components/ReportViewer';
import Stat from '@/components/Stat';
import { perLitreAt100kPa } from '@/lib/perLitre';

export const revalidate = 60;

const getRun = (slug: string) => publicGet<DynoRun>(`/dyno-runs/${slugSegment(slug)}`, { tags: [REVALIDATE_TARGETS.dynoRuns] });

const carLineOf = (run: DynoRun) =>
    [run.carMake, run.carModel, run.trim, run.year].filter(Boolean).join(' ');

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const run = await getRun(slug);
    if (!run) return { title: 'Dyno run' };
    const carLine = carLineOf(run);
    return {
        title: run.title || 'Dyno run',
        alternates: { canonical: `/dyno-runs/${run.slug || slug}` },
        description: [carLine, run.enginePowerAfterHp ? `${run.enginePowerAfterHp} hp` : null].filter(Boolean).join(' · ') || undefined,
    };
}

export default async function DynoRunDetail({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const run = await getRun(slug);
    if (!run) notFound();

    const whpPerLitre = perLitreAt100kPa(run.hubPowerAfterWhp, run.displacementCc, run.absolutePressureKpa);
    const wnmPerLitre = perLitreAt100kPa(run.hubTorqueAfterWnm, run.displacementCc, run.absolutePressureKpa);

    const carLine = [carLineOf(run), run.engine && `Engine ${run.engine}`, run.fuelType && `Fuel ${run.fuelType}`]
        .filter(Boolean).join(' · ');

    const dynoDate = run.dynoDate
        ? new Date(run.dynoDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
        : null;

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
            <Link href="/dyno-runs" className="text-sm font-semibold text-gray-500 hover:text-gray-900">← Dyno runs</Link>
            <div className="mt-3 flex items-start justify-between gap-4">
                <div className="min-w-0 break-words">
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

            {(whpPerLitre != null || wnmPerLitre != null) && (
                <>
                    <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-gray-500">Theoretical naturally aspirated power per litre</p>
                    <p className="mt-0.5 text-xs text-gray-500">whp or wNm / litre / ((boost kPa + 100) / 100)</p>
                    <div className="mt-2 grid grid-cols-2 gap-4">
                        <Stat label="Power" after={whpPerLitre} unit="whp/L" />
                        <Stat label="Torque" after={wnmPerLitre} unit="wNm/L" />
                    </div>
                </>
            )}

            <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-gray-500">Calculated engine</p>
            <div className="mt-2 grid grid-cols-2 gap-4">
                <Stat label="Power" before={run.enginePowerBeforeHp} after={run.enginePowerAfterHp} unit="hp" />
                <Stat label="Torque" before={run.engineTorqueBeforeNm} after={run.engineTorqueAfterNm} unit="Nm" />
            </div>

            {run.description && (
                <div className="mt-8 space-y-4 text-gray-700">
                    <Markdown>{run.description}</Markdown>
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
                    <ReportViewer url={reportProxyUrl(run.id)} />
                </div>
            )}
        </div>
    );
}
