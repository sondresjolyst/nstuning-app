import Link from 'next/link';
import { coverImageSrc, coverImageSrcSet, type DynoRun } from '@/services/dynoRunService';
import { metricOf, normaliseBoards, rankRuns, type LeaderboardEntry, type LeaderboardMetric } from '@/lib/leaderboard';
import type { LeaderboardSection } from '@/types/content';
import { StatLabel, StatValue, statTileClass } from './Stat';

function Board({ title, metric, entries }: { title: string; metric: LeaderboardMetric; entries: LeaderboardEntry[] }) {
    return (
        <div className="min-w-0">
            {title && <h3 className="font-bold text-gray-900 break-words">{title}</h3>}
            {metric.formula && <p className="mt-0.5 text-xs text-gray-500 break-words">{metric.formula}</p>}
            {entries.length === 0 ? (
                <p className="mt-3 text-gray-500">No runs yet.</p>
            ) : (
                <ol className="mt-3 space-y-4">
                    {entries.map(({ run, value }, i) => {
                        const cover = coverImageSrc(run);
                        return (
                            <li key={run.id} className="flex items-start gap-3">
                                <span aria-hidden="true" className="w-6 shrink-0 pt-4 text-lg font-black text-gray-900 tabular-nums">{i + 1}.</span>
                                <Link href={`/dyno-runs/${run.slug}`} className="group block min-w-0 flex-1">
                                    <div className={`${statTileClass} flex items-center justify-between gap-4 transition group-hover:border-gray-300 group-hover:shadow-sm`}>
                                        <div className="min-w-0">
                                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{metric.label}</p>
                                            <div className="mt-2">
                                                <StatLabel>{metric.quantity}</StatLabel>
                                                <StatValue value={value} unit={metric.unit} />
                                            </div>
                                        </div>
                                        {cover && (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={cover} srcSet={coverImageSrcSet(run)} sizes="112px" alt="" className="h-16 w-24 sm:h-20 sm:w-28 shrink-0 rounded-lg border border-gray-200 object-cover" />
                                        )}
                                    </div>
                                    <p className="mt-1.5 text-sm font-semibold text-gray-700 break-words group-hover:text-gray-900">{run.title}</p>
                                </Link>
                            </li>
                        );
                    })}
                </ol>
            )}
        </div>
    );
}

// Stored content is not validated, so a board with an unknown metric is left out instead of breaking the page.
export default function LeaderboardBoards({ section, runs }: { section: LeaderboardSection; runs: DynoRun[] }) {
    const boards = normaliseBoards(section.boards).flatMap(board => {
        const metric = metricOf(board.metric);
        return metric ? [{ title: board.title, metric, entries: rankRuns(runs, metric, board.limit) }] : [];
    });
    if (boards.every(board => board.entries.length === 0)) return null;

    return (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
            {section.heading && <h2 className="min-w-0 break-words text-2xl font-bold text-gray-900 mb-6">{section.heading}</h2>}
            <div className={`grid gap-8 md:grid-cols-2 ${boards.length >= 3 ? 'lg:grid-cols-3' : ''}`}>
                {boards.map((board, i) => <Board key={i} {...board} />)}
            </div>
        </section>
    );
}
