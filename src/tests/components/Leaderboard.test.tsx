import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import Leaderboard from '@/components/Leaderboard';
import { REVALIDATE_TARGETS } from '@/lib/cacheTags';
import { defaultBoards } from '@/lib/leaderboard';
import type { LeaderboardSection } from '@/types/content';

const section: LeaderboardSection = { id: 'lb', type: 'leaderboard', visible: true, heading: 'Leader Board', boards: defaultBoards() };

const run = (id: number, fields: object) => ({
    id, slug: `run-${id}`, title: `Run ${id}`, published: true, sortOrder: 0, hasReport: false,
    createdAt: '2026-06-01T00:00:00Z', updatedAt: '2026-06-01T00:00:00Z', ...fields,
});

const respond = (body: unknown, status = 200) =>
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } }));

afterEach(() => vi.restoreAllMocks());

describe('Leaderboard', () => {
    it('loads the runs under the dyno runs tag, so new runs refresh it', async () => {
        const fetchMock = respond([run(1, { hubPowerAfterWhp: 200 })]);
        render(await Leaderboard({ section }));
        expect(String(fetchMock.mock.calls[0][0])).toBe('http://api.test/api/dyno-runs');
        const init = fetchMock.mock.calls[0][1] as { next?: { tags?: string[] } };
        expect(init.next?.tags).toEqual([REVALIDATE_TARGETS.dynoRuns]);
        expect(screen.getByRole('heading', { name: 'Leader Board' })).toBeInTheDocument();
    });

    it('leaves drafts off the boards', async () => {
        respond([run(1, { title: 'Public', hubPowerAfterWhp: 200 }), run(2, { title: 'Draft', hubPowerAfterWhp: 900, published: false })]);
        render(await Leaderboard({ section }));
        expect(screen.getByText('Public')).toBeInTheDocument();
        expect(screen.queryByText('Draft')).not.toBeInTheDocument();
    });

    it('renders nothing when the API fails', async () => {
        respond({ title: 'Server error' }, 500);
        const { container } = render(await Leaderboard({ section }));
        expect(container).toBeEmptyDOMElement();
    });

    it('renders nothing when the API cannot be reached', async () => {
        vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('ECONNREFUSED'));
        const { container } = render(await Leaderboard({ section }));
        expect(container).toBeEmptyDOMElement();
    });

    it('renders nothing when the API answers with something other than a list', async () => {
        respond({ unexpected: true });
        const { container } = render(await Leaderboard({ section }));
        expect(container).toBeEmptyDOMElement();
    });
});
