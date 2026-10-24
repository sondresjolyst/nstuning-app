import type { DynoRun } from '@/services/dynoRunService';
import { perLitreAt100kPa } from './perLitre';

export interface LeaderboardMetric {
    /** The name in the editor's metric list. */
    name: string;
    /** The small caps label above the figure. */
    label: string;
    /** Power or torque, shown above the number. */
    quantity: 'Power' | 'Torque';
    unit: string;
    /** The run's figure, or null when the run does not qualify for the board. */
    value: (run: DynoRun) => number | null;
}

const perLitre = (value: number | null | undefined, run: DynoRun) =>
    perLitreAt100kPa(value, run.displacementCc, run.absolutePressureKpa);

// Every metric a board can rank by. A new metric is one more entry here.
export const LEADERBOARD_METRICS = {
    hubPowerWhp: { name: 'Measured whp', label: 'Measured at hub', quantity: 'Power', unit: 'whp', value: run => run.hubPowerAfterWhp ?? null },
    hubPowerPerLitre: { name: 'whp per litre at 100 kPa', label: 'Per litre at 100 kPa', quantity: 'Power', unit: 'whp/L', value: run => perLitre(run.hubPowerAfterWhp, run) },
    hubTorqueWnm: { name: 'Measured wNm', label: 'Measured at hub', quantity: 'Torque', unit: 'wNm', value: run => run.hubTorqueAfterWnm ?? null },
    hubTorquePerLitre: { name: 'wNm per litre at 100 kPa', label: 'Per litre at 100 kPa', quantity: 'Torque', unit: 'wNm/L', value: run => perLitre(run.hubTorqueAfterWnm, run) },
    enginePowerHp: { name: 'Calculated engine hp', label: 'Calculated engine', quantity: 'Power', unit: 'hp', value: run => run.enginePowerAfterHp ?? null },
    engineTorqueNm: { name: 'Calculated engine Nm', label: 'Calculated engine', quantity: 'Torque', unit: 'Nm', value: run => run.engineTorqueAfterNm ?? null },
} satisfies Record<string, LeaderboardMetric>;

export type LeaderboardMetricId = keyof typeof LEADERBOARD_METRICS;

export const LEADERBOARD_METRIC_IDS = Object.keys(LEADERBOARD_METRICS) as LeaderboardMetricId[];

export const DEFAULT_BOARD_LIMIT = 5;
export const MAX_BOARD_LIMIT = 20;

export interface LeaderboardBoard {
    title: string;
    metric: LeaderboardMetricId;
    limit: number;
}

export const defaultBoards = (): LeaderboardBoard[] => [
    { title: 'Max measured whp', metric: 'hubPowerWhp', limit: DEFAULT_BOARD_LIMIT },
    { title: 'whp per litre calculated for 100 kPa', metric: 'hubPowerPerLitre', limit: DEFAULT_BOARD_LIMIT },
];

export function metricOf(id: unknown): LeaderboardMetric | null {
    return typeof id === 'string' && Object.prototype.hasOwnProperty.call(LEADERBOARD_METRICS, id)
        ? LEADERBOARD_METRICS[id as LeaderboardMetricId]
        : null;
}

/** A stored limit as a whole number from 1 to MAX_BOARD_LIMIT, or the default when it is not a number. */
export function boardLimit(limit: unknown): number {
    if (typeof limit !== 'number' || !Number.isFinite(limit)) return DEFAULT_BOARD_LIMIT;
    return Math.min(MAX_BOARD_LIMIT, Math.max(1, Math.floor(limit)));
}

/** A board as stored. The metric is kept as it is, so the editor can show one it does not know. */
export interface StoredBoard {
    title: string;
    metric: string;
    limit: number;
}

/**
 * The stored boards with the shape a board needs. Stored content is not validated, so entries that
 * are not objects are dropped and missing fields get their defaults.
 */
export function normaliseBoards(boards: unknown): StoredBoard[] {
    if (!Array.isArray(boards)) return [];
    return boards
        .filter((board): board is Record<string, unknown> => typeof board === 'object' && board !== null && !Array.isArray(board))
        .map(board => ({
            title: typeof board.title === 'string' ? board.title : '',
            metric: typeof board.metric === 'string' ? board.metric : '',
            limit: boardLimit(board.limit),
        }));
}

export interface LeaderboardEntry {
    run: DynoRun;
    value: number;
}

const whpOf = (run: DynoRun) => run.hubPowerAfterWhp ?? 0;
const timeOf = (run: DynoRun) => Date.parse(run.dynoDate ?? run.createdAt) || 0;

// Ties go to the higher whp, then to the newer run by dyno date or upload, then to the higher id.
const byValue = (a: LeaderboardEntry, b: LeaderboardEntry) =>
    b.value - a.value || whpOf(b.run) - whpOf(a.run) || timeOf(b.run) - timeOf(a.run) || b.run.id - a.run.id;

/** The published runs ranked by the metric, best first. */
export function rankRuns(runs: DynoRun[], metric: LeaderboardMetric, limit = DEFAULT_BOARD_LIMIT): LeaderboardEntry[] {
    return runs
        .filter(run => run.published)
        .map(run => ({ run, value: metric.value(run) }))
        .filter((entry): entry is LeaderboardEntry => entry.value != null && Number.isFinite(entry.value))
        .sort(byValue)
        .slice(0, limit);
}
