import type { DynoRun } from '@/services/dynoRunService';
import type { LeaderboardSection } from '@/types/content';
import { publicGet } from '@/lib/publicApi';
import { REVALIDATE_TARGETS } from '@/lib/cacheTags';
import LeaderboardBoards from './LeaderboardBoards';

// Rendered on the server under the dyno runs tag, so a new, changed or deleted run refreshes it.
export default async function Leaderboard({ section }: { section: LeaderboardSection }) {
    const runs = await publicGet<DynoRun[]>('/dyno-runs', { tags: [REVALIDATE_TARGETS.dynoRuns] }) ?? [];
    return <LeaderboardBoards section={section} runs={runs} />;
}
