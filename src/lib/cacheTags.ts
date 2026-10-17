import { defineRevalidateTargets } from '@sjolystinnovation/app-kit/api';

// Identifiers the client sends to POST /api/revalidate, mapped server-side to
// the ISR paths each one affects.
export const { targets: REVALIDATE_TARGETS, paths: TARGET_PATHS, revalidate: revalidateTarget } = defineRevalidateTargets({
    targets: {
        home: { pages: ['/'] },
        // Dyno runs also appear on the homepage (featured runs + stats), so they
        // purge '/' too, and in the sitemap.
        dynoRuns: { pages: ['/', '/dyno-runs', '/dyno-runs/[slug]'], root: ['/sitemap.xml'] },
        // Every page renders branding through the layout, and so does /icon: the tag reaches them all.
        branding: {},
        // An admin edits the legal pages, and the sitemap dates them by their last edit.
        legal: { pages: ['/terms', '/privacy', '/cookies'], root: ['/sitemap.xml'] },
    },
});

export type RevalidateTarget = keyof typeof REVALIDATE_TARGETS;
