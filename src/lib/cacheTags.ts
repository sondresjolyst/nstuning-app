// Identifiers the client sends to POST /api/revalidate, mapped server-side to
// the ISR paths each one affects.
export const REVALIDATE_TARGETS = {
    home: 'home',
    dynoRuns: 'dynoRuns',
} as const;

export type RevalidateTarget = (typeof REVALIDATE_TARGETS)[keyof typeof REVALIDATE_TARGETS];

// Which page paths to purge for each target. Dyno runs also appear on the
// homepage (featured runs + stats), so they purge '/' too, and in the sitemap.
export const TARGET_PATHS: Record<RevalidateTarget, string[]> = {
    home: ['/'],
    dynoRuns: ['/', '/dyno-runs', '/dyno-runs/[slug]', '/sitemap.xml'],
};
