import { MetadataRoute } from 'next';
import { parseTimestamp } from '@sjolystinnovation/app-kit/seo';
import { site } from '@/lib/seo/site';
import { publicGet } from '@/lib/publicApi';
import { REVALIDATE_TARGETS } from '@/lib/cacheTags';
import { DynoRun } from '@/services/dynoRunService';
import { getLegalPage } from '@/lib/legalPages';

export const revalidate = 3600;

const STATIC_PAGES = ['', '/dyno-runs', '/contact'];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const [runs, legal] = await Promise.all([
        publicGet<DynoRun[]>('/dyno-runs', { tags: [REVALIDATE_TARGETS.dynoRuns] }).then(r => r ?? []),
        site.legalEntries({ updatedAt: async key => (await getLegalPage(key))?.updatedAt }),
    ]);

    return [
        ...STATIC_PAGES.flatMap(path => site.localeEntries(path)),
        ...legal,
        ...runs.flatMap(run => site.localeEntries(`/dyno-runs/${run.slug}`, { lastModified: () => parseTimestamp(run.updatedAt) })),
    ];
}
