import { describe, it, expect } from 'vitest';
import {
    LEADERBOARD_METRICS, LEADERBOARD_METRIC_IDS, boardLimit, defaultBoards, metricOf, normaliseBoards, rankRuns,
} from '@/lib/leaderboard';
import type { DynoRun } from '@/services/dynoRunService';

let nextId = 1;
const run = (fields: Partial<DynoRun>): DynoRun => ({
    id: nextId,
    slug: `run-${nextId++}`,
    title: 'Run',
    published: true,
    sortOrder: 0,
    hasReport: false,
    createdAt: '2026-06-01T00:00:00Z',
    updatedAt: '2026-06-01T00:00:00Z',
    ...fields,
});

const slugs = (entries: { run: DynoRun }[]) => entries.map(e => e.run.slug);

describe('leaderboard metrics', () => {
    it('reads each metric from the matching run field', () => {
        const r = run({
            hubPowerAfterWhp: 265, hubTorqueAfterWnm: 417, enginePowerAfterHp: 315, engineTorqueAfterNm: 480,
            displacementCc: 3430, absolutePressureKpa: 176,
        });
        expect(LEADERBOARD_METRICS.hubPowerWhp.value(r)).toBe(265);
        expect(LEADERBOARD_METRICS.hubPowerPerLitre.value(r)).toBe(43.9);
        expect(LEADERBOARD_METRICS.hubTorqueWnm.value(r)).toBe(417);
        expect(LEADERBOARD_METRICS.hubTorquePerLitre.value(r)).toBe(69.1);
        expect(LEADERBOARD_METRICS.enginePowerHp.value(r)).toBe(315);
        expect(LEADERBOARD_METRICS.engineTorqueNm.value(r)).toBe(480);
    });

    it('uses the wheel figure, not the engine figure, per litre', () => {
        const r = run({ hubPowerAfterWhp: 200, enginePowerAfterHp: 260, displacementCc: 2000, absolutePressureKpa: 100 });
        expect(LEADERBOARD_METRICS.hubPowerPerLitre.value(r)).toBe(100);
    });

    it('labels and units match the run detail page', () => {
        expect(LEADERBOARD_METRICS.hubPowerWhp).toMatchObject({ label: 'Measured at hub', quantity: 'Power', unit: 'whp' });
        expect(LEADERBOARD_METRICS.hubPowerPerLitre).toMatchObject({ label: 'Per litre at 100 kPa', quantity: 'Power', unit: 'whp/L' });
        expect(LEADERBOARD_METRICS.hubTorquePerLitre).toMatchObject({ quantity: 'Torque', unit: 'wNm/L' });
        expect(LEADERBOARD_METRICS.enginePowerHp.unit).toBe('hp');
        expect(LEADERBOARD_METRICS.engineTorqueNm.unit).toBe('Nm');
    });

    it('finds known metrics and rejects unknown ones', () => {
        expect(metricOf('hubPowerWhp')).toBe(LEADERBOARD_METRICS.hubPowerWhp);
        expect(metricOf('nope')).toBeNull();
        expect(metricOf('toString')).toBeNull();
        expect(metricOf(undefined)).toBeNull();
        expect(metricOf(42)).toBeNull();
    });

    it('defaults to the max whp and whp per litre boards of five', () => {
        expect(defaultBoards()).toEqual([
            { title: 'Max measured whp', metric: 'hubPowerWhp', limit: 5 },
            { title: 'whp per litre calculated for 100 kPa', metric: 'hubPowerPerLitre', limit: 5 },
        ]);
        expect(defaultBoards().every(b => LEADERBOARD_METRIC_IDS.includes(b.metric))).toBe(true);
    });

    it('keeps a board limit between 1 and 20', () => {
        expect(boardLimit(3)).toBe(3);
        expect(boardLimit(0)).toBe(1);
        expect(boardLimit(-4)).toBe(1);
        expect(boardLimit(99)).toBe(20);
        expect(boardLimit(2.7)).toBe(2);
        expect(boardLimit('5')).toBe(5);
        expect(boardLimit(undefined)).toBe(5);
        expect(boardLimit(NaN)).toBe(5);
    });

    it('drops stored boards that are not objects and fills in missing fields', () => {
        expect(normaliseBoards([
            null,
            'hubPowerWhp',
            42,
            ['x'],
            { title: 'A', metric: 'hubPowerWhp', limit: 3 },
            { metric: 'quarterMile' },
            { title: 7, metric: null, limit: 99 },
        ])).toEqual([
            { title: 'A', metric: 'hubPowerWhp', limit: 3 },
            { title: '', metric: 'quarterMile', limit: 5 },
            { title: '', metric: '', limit: 20 },
        ]);
    });

    it('treats stored boards that are not a list as none', () => {
        expect(normaliseBoards(undefined)).toEqual([]);
        expect(normaliseBoards('nope')).toEqual([]);
        expect(normaliseBoards({ title: 'A' })).toEqual([]);
    });
});

describe('rankRuns', () => {
    it('ranks by the metric, best first, and cuts at the limit', () => {
        const runs = [100, 300, 200, 250, 150, 50].map(whp => run({ slug: `w${whp}`, hubPowerAfterWhp: whp }));
        expect(slugs(rankRuns(runs, LEADERBOARD_METRICS.hubPowerWhp, 5))).toEqual(['w300', 'w250', 'w200', 'w150', 'w100']);
        expect(slugs(rankRuns(runs, LEADERBOARD_METRICS.hubPowerWhp, 2))).toEqual(['w300', 'w250']);
    });

    it('shows five by default', () => {
        const runs = [1, 2, 3, 4, 5, 6, 7].map(whp => run({ hubPowerAfterWhp: whp }));
        expect(rankRuns(runs, LEADERBOARD_METRICS.hubPowerWhp)).toHaveLength(5);
    });

    it('leaves out drafts and runs without the figure', () => {
        const runs = [
            run({ slug: 'draft', hubPowerAfterWhp: 999, published: false }),
            run({ slug: 'no-whp', hubPowerAfterWhp: null, enginePowerAfterHp: 400 }),
            run({ slug: 'ok', hubPowerAfterWhp: 100 }),
        ];
        expect(slugs(rankRuns(runs, LEADERBOARD_METRICS.hubPowerWhp))).toEqual(['ok']);
    });

    it('leaves runs without a displacement off the per litre board', () => {
        const runs = [
            run({ slug: 'no-cc', hubPowerAfterWhp: 400, displacementCc: null }),
            run({ slug: 'cc', hubPowerAfterWhp: 100, displacementCc: 1000 }),
        ];
        expect(slugs(rankRuns(runs, LEADERBOARD_METRICS.hubPowerPerLitre))).toEqual(['cc']);
    });

    it('normalises per litre figures by boost', () => {
        const runs = [
            run({ slug: 'turbo', hubPowerAfterWhp: 300, displacementCc: 2000, absolutePressureKpa: 200 }),
            run({ slug: 'na', hubPowerAfterWhp: 200, displacementCc: 2000, absolutePressureKpa: 100 }),
        ];
        const ranked = rankRuns(runs, LEADERBOARD_METRICS.hubPowerPerLitre);
        expect(slugs(ranked)).toEqual(['na', 'turbo']);
        expect(ranked.map(e => e.value)).toEqual([100, 75]);
    });

    it('counts the dyno date as newer before the upload time', () => {
        const runs = [
            run({ slug: 'uploaded-later', hubPowerAfterWhp: 100, dynoDate: '2026-01-01', createdAt: '2026-09-01T00:00:00Z' }),
            run({ slug: 'dynoed-later', hubPowerAfterWhp: 100, dynoDate: '2026-05-01', createdAt: '2026-02-01T00:00:00Z' }),
        ];
        expect(slugs(rankRuns(runs, LEADERBOARD_METRICS.hubPowerWhp))).toEqual(['dynoed-later', 'uploaded-later']);
    });

    it('falls back to the higher id when everything else ties', () => {
        const runs = [
            run({ id: 10, slug: 'id-10', hubPowerAfterWhp: 100 }),
            run({ id: 30, slug: 'id-30', hubPowerAfterWhp: 100 }),
            run({ id: 20, slug: 'id-20', hubPowerAfterWhp: 100 }),
        ];
        expect(slugs(rankRuns(runs, LEADERBOARD_METRICS.hubPowerWhp))).toEqual(['id-30', 'id-20', 'id-10']);
        expect(slugs(rankRuns([...runs].reverse(), LEADERBOARD_METRICS.hubPowerWhp))).toEqual(['id-30', 'id-20', 'id-10']);
    });

    it('breaks a tie on the higher whp, then on the newer run', () => {
        const runs = [
            run({ slug: 'old-low', hubPowerAfterWhp: 100, displacementCc: 1000, createdAt: '2026-01-01T00:00:00Z' }),
            run({ slug: 'high', hubPowerAfterWhp: 200, displacementCc: 2000, createdAt: '2026-01-01T00:00:00Z' }),
            run({ slug: 'new-low', hubPowerAfterWhp: 100, displacementCc: 1000, createdAt: '2026-03-01T00:00:00Z' }),
        ];
        expect(slugs(rankRuns(runs, LEADERBOARD_METRICS.hubPowerPerLitre))).toEqual(['high', 'new-low', 'old-low']);
        expect(slugs(rankRuns(runs.slice(0, 1).concat(runs[2]), LEADERBOARD_METRICS.hubPowerWhp))).toEqual(['new-low', 'old-low']);
    });

    it('does not reorder the input', () => {
        const runs = [run({ slug: 'a', hubPowerAfterWhp: 1 }), run({ slug: 'b', hubPowerAfterWhp: 2 }), run({ slug: 'c', hubPowerAfterWhp: 3 })];
        const order = () => runs.map(r => r.slug);
        expect(order()).toEqual(['a', 'b', 'c']);
        expect(slugs(rankRuns(runs, LEADERBOARD_METRICS.hubPowerWhp))).toEqual(['c', 'b', 'a']);
        expect(order()).toEqual(['a', 'b', 'c']);
    });
});
