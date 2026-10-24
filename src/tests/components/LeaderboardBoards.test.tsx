import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import LeaderboardBoards from '@/components/LeaderboardBoards';
import { LEADERBOARD_METRIC_IDS, defaultBoards } from '@/lib/leaderboard';
import { uppercaseUnitText } from '@/tests/unitCasing';
import type { DynoRun } from '@/services/dynoRunService';
import type { LeaderboardSection } from '@/types/content';

const run = (id: number, fields: Partial<DynoRun>): DynoRun => ({
    id,
    slug: `run-${id}`,
    title: `Run ${id}`,
    published: true,
    sortOrder: 0,
    hasReport: false,
    createdAt: '2026-06-01T00:00:00Z',
    updatedAt: '2026-06-01T00:00:00Z',
    ...fields,
});

const runs = [
    run(2, { title: 'Volvo 242', hubPowerAfterWhp: 265, displacementCc: 3430, absolutePressureKpa: 176, coverImageId: 'volvo' }),
    run(3, { title: 'BMW E36', hubPowerAfterWhp: 215, displacementCc: 2979, absolutePressureKpa: 100 }),
    run(4, { title: 'Porsche 911', hubPowerAfterWhp: 193, displacementCc: 3600, absolutePressureKpa: 100 }),
];

const section = (fields: Partial<LeaderboardSection> = {}): LeaderboardSection =>
    ({ id: 'lb', type: 'leaderboard', visible: true, heading: 'Leader Board', boards: defaultBoards(), ...fields });

const board = (name: string) => screen.getByRole('heading', { name }).parentElement!;

describe('LeaderboardBoards', () => {
    it('renders the two default boards with ranked cards', () => {
        render(<LeaderboardBoards section={section()} runs={runs} />);
        expect(screen.getByRole('heading', { level: 2, name: 'Leader Board' })).toBeInTheDocument();

        const whp = within(board('Max measured whp')).getAllByRole('listitem');
        expect(whp.map(li => li.textContent)).toEqual([
            '1.Measured at hubPower265 whpVolvo 242',
            '2.Measured at hubPower215 whpBMW E36',
            '3.Measured at hubPower193 whpPorsche 911',
        ]);

        const perLitre = within(board('Theoretical naturally aspirated power per litre')).getAllByRole('listitem');
        expect(perLitre.map(li => li.textContent)).toEqual([
            '1.Theoretical naturally aspirated power per litrePower72.2 whp/LBMW E36',
            '2.Theoretical naturally aspirated power per litrePower53.6 whp/LPorsche 911',
            '3.Theoretical naturally aspirated power per litrePower43.9 whp/LVolvo 242',
        ]);
    });

    it('shows the metric formula under the board title, and none for a plain metric', () => {
        render(<LeaderboardBoards section={section()} runs={runs} />);
        expect(within(board('Theoretical naturally aspirated power per litre')).getByText('whp / litre / ((boost kPa + 100) / 100)')).toBeInTheDocument();
        expect(within(board('Max measured whp')).queryByText(/litre/)).not.toBeInTheDocument();
    });

    it('keeps units and formulas out of uppercase styling for every metric', () => {
        const boards = LEADERBOARD_METRIC_IDS.map(metric => ({ title: metric, metric, limit: 5 }));
        const full = run(7, {
            hubPowerAfterWhp: 200, hubTorqueAfterWnm: 300, enginePowerAfterHp: 250, engineTorqueAfterNm: 350, displacementCc: 2000, absolutePressureKpa: 150,
        });
        const { container } = render(<LeaderboardBoards section={section({ boards })} runs={[full]} />);
        expect(screen.getAllByText(/boost kPa/)).toHaveLength(2);
        expect(uppercaseUnitText(container)).toEqual([]);
    });

    it('links each card to its run and shows the cover thumbnail', () => {
        render(<LeaderboardBoards section={section()} runs={runs} />);
        const first = within(board('Max measured whp')).getAllByRole('link')[0];
        expect(first).toHaveAttribute('href', '/dyno-runs/run-2');
        expect(first.querySelector('img')).toHaveAttribute('src', 'http://api.test/api/content-images/volvo');
    });

    it('respects each board limit and order', () => {
        render(<LeaderboardBoards section={section({ boards: [
            { title: 'Torque', metric: 'hubTorqueWnm', limit: 5 },
            { title: 'Top whp', metric: 'hubPowerWhp', limit: 1 },
        ] })} runs={[...runs, run(5, { hubPowerAfterWhp: 100, hubTorqueAfterWnm: 300 })]} />);
        const headings = screen.getAllByRole('heading', { level: 3 }).map(h => h.textContent);
        expect(headings).toEqual(['Torque', 'Top whp']);
        expect(within(board('Top whp')).getAllByRole('listitem')).toHaveLength(1);
        expect(within(board('Torque')).getAllByRole('listitem')).toHaveLength(1);
    });

    it('skips a board with an unknown metric and keeps the rest', () => {
        const boards = [{ title: 'Broken', metric: 'quarterMile', limit: 5 }, ...defaultBoards()] as unknown as LeaderboardSection['boards'];
        render(<LeaderboardBoards section={section({ boards })} runs={runs} />);
        expect(screen.queryByRole('heading', { name: 'Broken' })).not.toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'Max measured whp' })).toBeInTheDocument();
    });

    it('skips stored board entries that are not objects', () => {
        const boards = [null, 'x', { title: 'Max measured whp', metric: 'hubPowerWhp', limit: 1 }] as unknown as LeaderboardSection['boards'];
        render(<LeaderboardBoards section={section({ boards })} runs={runs} />);
        expect(screen.getAllByRole('heading', { level: 3 }).map(h => h.textContent)).toEqual(['Max measured whp']);
        expect(within(board('Max measured whp')).getAllByRole('listitem')).toHaveLength(1);
    });

    it('hides the rank number from screen readers, since the list already numbers the cards', () => {
        render(<LeaderboardBoards section={section()} runs={runs} />);
        const rank = within(board('Max measured whp')).getByText('1.');
        expect(rank).toHaveAttribute('aria-hidden', 'true');
    });

    it('survives stored boards that are not a list', () => {
        const broken = { ...section(), boards: 'nope' } as unknown as LeaderboardSection;
        const { container } = render(<LeaderboardBoards section={broken} runs={runs} />);
        expect(container).toBeEmptyDOMElement();
    });

    it('says no runs yet on a board that has none, while another has runs', () => {
        render(<LeaderboardBoards section={section()} runs={[run(9, { hubPowerAfterWhp: 150 })]} />);
        expect(within(board('Theoretical naturally aspirated power per litre')).getByText('No runs yet.')).toBeInTheDocument();
        expect(within(board('Max measured whp')).getAllByRole('listitem')).toHaveLength(1);
    });

    it('renders nothing when no run qualifies', () => {
        const { container } = render(<LeaderboardBoards section={section()} runs={[run(9, { hubPowerAfterWhp: null })]} />);
        expect(container).toBeEmptyDOMElement();
    });
});
