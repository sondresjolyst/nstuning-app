import { MetadataRoute } from 'next';
import { COMPANY } from '@/lib/company';
import { publicGet } from '@/lib/publicApi';
import { REVALIDATE_TARGETS } from '@/lib/cacheTags';
import { DynoRun } from '@/services/dynoRunService';

const BASE = COMPANY.url;

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const staticPages: MetadataRoute.Sitemap = [
        { url: BASE, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
        { url: `${BASE}/dyno-runs`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
        { url: `${BASE}/contact`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.5 },
        { url: `${BASE}/terms`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
        { url: `${BASE}/privacy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
        { url: `${BASE}/cookies`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    ];

    const runs = await publicGet<DynoRun[]>('/dyno-runs', { tags: [REVALIDATE_TARGETS.dynoRuns] }) ?? [];
    const runPages: MetadataRoute.Sitemap = runs.map(run => ({
        url: `${BASE}/dyno-runs/${run.slug}`,
        lastModified: new Date(run.updatedAt),
        changeFrequency: 'monthly',
        priority: 0.6,
    }));

    return [...staticPages, ...runPages];
}
