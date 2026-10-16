import { MetadataRoute } from 'next';
import { parseTimestamp } from '@sjolystinnovation/app-kit/seo';
import { site } from '@/lib/seo/site';
import { publicGet } from '@/lib/publicApi';
import { REVALIDATE_TARGETS } from '@/lib/cacheTags';
import { DynoRun } from '@/services/dynoRunService';

export const revalidate = 3600;

const STATIC_PAGES = ['', '/dyno-runs', '/contact', '/terms', '/privacy', '/cookies'];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const runs = await publicGet<DynoRun[]>('/dyno-runs', { tags: [REVALIDATE_TARGETS.dynoRuns] }) ?? [];

    return [
        ...STATIC_PAGES.flatMap(path => site.localeEntries(path)),
        ...runs.flatMap(run => site.localeEntries(`/dyno-runs/${run.slug}`, { lastModified: () => parseTimestamp(run.updatedAt) })),
    ];
}
