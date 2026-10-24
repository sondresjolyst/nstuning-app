import type { DynoRun } from '@/services/dynoRunService';
import type { LeaderboardSection } from '@/types/content';
import { publicGetOptional } from '@/lib/publicApi';
import { REVALIDATE_TARGETS } from '@/lib/cacheTags';
import LeaderboardBoards from './LeaderboardBoards';

// Rendered on the server under the dyno runs tag, so a new, changed or deleted run refreshes it.
// The home page does without it when the API fails.
export default async function Leaderboard({ section }: { section: LeaderboardSection }) {
    const runs = await publicGetOptional<DynoRun[]>('/dyno-runs', { tags: [REVALIDATE_TARGETS.dynoRuns] });
    if (!Array.isArray(runs)) return null;
    return <LeaderboardBoards section={section} runs={runs} />;
}
