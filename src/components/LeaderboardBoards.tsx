import Link from 'next/link';
import { coverImageSrc, coverImageSrcSet, type DynoRun } from '@/services/dynoRunService';
import { metricOf, normaliseBoards, rankRuns, type LeaderboardEntry, type LeaderboardMetric } from '@/lib/leaderboard';
import type { LeaderboardSection } from '@/types/content';
import { StatLabel, StatValue, statTileClass } from './Stat';

function Board({ title, metric, entries }: { title: string; metric: LeaderboardMetric; entries: LeaderboardEntry[] }) {
    return (
        // From md up each board spans a header row and a list row of the section grid, so the headers
        // share one height and the first cards of every board line up.
        <div className="grid min-w-0 gap-y-3 md:row-span-2 md:grid-rows-subgrid">
            <div className={title || metric.formula ? 'min-w-0' : 'hidden md:block'}>
                {title && <h3 className="font-bold text-gray-900 break-words">{title}</h3>}
                {metric.formula && <p className="mt-0.5 text-xs text-gray-500 break-words">{metric.formula}</p>}
            </div>
            {entries.length === 0 ? (
                <p className="text-gray-500">No runs yet.</p>
            ) : (
                <ol className="min-w-0 space-y-4">
                    {entries.map(({ run, value }, i) => {
                        const cover = coverImageSrc(run);
                        return (
                            <li key={run.id} className="flex items-start gap-3">
                                <span aria-hidden="true" className="w-6 shrink-0 pt-4 text-lg font-black text-gray-900 tabular-nums">{i + 1}.</span>
                                <Link
                                    href={`/dyno-runs/${run.slug}`}
                                    className={`${statTileClass} group flex min-w-0 flex-1 items-center justify-between gap-4 transition hover:border-gray-300 hover:shadow-sm`}
                                >
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-gray-900 break-words group-hover:text-gray-700">{run.title}</p>
                                        <div className="mt-2">
                                            <StatLabel>{metric.quantity}</StatLabel>
                                            <StatValue value={value} unit={metric.unit} />
                                        </div>
                                    </div>
                                    {cover && (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={cover} srcSet={coverImageSrcSet(run)} sizes="112px" alt="" className="h-16 w-24 sm:h-20 sm:w-28 shrink-0 rounded-lg border border-gray-200 object-cover" />
                                    )}
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
            <div className={`grid gap-x-8 gap-y-8 md:grid-cols-2 ${boards.length >= 3 ? 'lg:grid-cols-3' : ''}`}>
                {boards.map((board, i) => <Board key={i} {...board} />)}
            </div>
        </section>
    );
}
