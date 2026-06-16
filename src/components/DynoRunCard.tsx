import Link from 'next/link';
import { DynoRun, coverImageSrc, coverImageSrcSet } from '@/services/dynoRunService';

function gain(before?: number | null, after?: number | null): number | null {
    if (before == null || after == null) return null;
    return after - before;
}

export default function DynoRunCard({ run }: { run: DynoRun }) {
    const cover = coverImageSrc(run);
    const hpGain = gain(run.enginePowerBeforeHp, run.enginePowerAfterHp);
    const carLine = [run.carMake, run.carModel, run.trim, run.year].filter(Boolean).join(' ');
    const metaLine = [carLine, run.engine && `Engine ${run.engine}`, run.fuelType && `Fuel ${run.fuelType}`]
        .filter(Boolean).join(' · ');

    return (
        <Link
            href={`/dyno-runs/${run.slug}`}
            className="group block rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-gray-300 transition"
        >
            <div className="aspect-video bg-gray-100 relative overflow-hidden">
                {cover ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={cover} srcSet={coverImageSrcSet(run)} sizes="(max-width: 768px) 100vw, 400px" alt={run.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-4xl font-black">NS</div>
                )}
                {!run.published && (
                    <span className="absolute top-2 left-2 rounded bg-gray-900/80 text-white text-xs px-2 py-0.5">Draft</span>
                )}
            </div>
            <div className="p-4">
                <h3 className="font-bold text-gray-900 group-hover:text-gray-700">{run.title}</h3>
                {metaLine && <p className="text-sm text-gray-500 mt-0.5">{metaLine}</p>}
                {run.enginePowerAfterHp != null && (
                    <div className="mt-3 flex items-baseline gap-2">
                        <span className="text-2xl font-extrabold text-gray-900">{run.enginePowerAfterHp}</span>
                        <span className="text-sm text-gray-500">hp</span>
                        {hpGain != null && hpGain > 0 && (
                            <span className="ml-auto rounded-full bg-primary/20 text-gray-900 text-xs font-semibold px-2 py-0.5">
                                +{hpGain} hp
                            </span>
                        )}
                    </div>
                )}
            </div>
        </Link>
    );
}
