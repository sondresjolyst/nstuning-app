import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import LeaderboardBoards from '@/components/LeaderboardBoards';
import { defaultBoards } from '@/lib/leaderboard';
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

        const perLitre = within(board('whp per litre calculated for 100 kPa')).getAllByRole('listitem');
        expect(perLitre.map(li => li.textContent)).toEqual([
            '1.Per litre at 100 kPaPower72.2 whp/LBMW E36',
            '2.Per litre at 100 kPaPower53.6 whp/LPorsche 911',
            '3.Per litre at 100 kPaPower43.9 whp/LVolvo 242',
        ]);
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
        expect(within(board('whp per litre calculated for 100 kPa')).getByText('No runs yet.')).toBeInTheDocument();
        expect(within(board('Max measured whp')).getAllByRole('listitem')).toHaveLength(1);
    });

    it('renders nothing when no run qualifies', () => {
        const { container } = render(<LeaderboardBoards section={section()} runs={[run(9, { hubPowerAfterWhp: null })]} />);
        expect(container).toBeEmptyDOMElement();
    });
});
