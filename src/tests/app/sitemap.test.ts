import { describe, it, expect, vi, afterEach } from 'vitest';
import sitemap from '@/app/sitemap';
import { COMPANY } from '@/lib/company';

/** Answers by path, so each legal key can return its own payload. */
function mockApi(routes: Record<string, unknown>) {
    return vi.spyOn(globalThis, 'fetch').mockImplementation(async (input: RequestInfo | URL) => {
        const url = String(input);
        const match = Object.keys(routes).find(path => url.includes(path));
        if (match == null) return new Response('null', { status: 404 });
        return new Response(JSON.stringify(routes[match]), { status: 200, headers: { 'content-type': 'application/json' } });
    });
}

afterEach(() => vi.restoreAllMocks());

describe('sitemap', () => {
    it('lists the legal pages once each', async () => {
        mockApi({});
        const urls = (await sitemap()).map(e => e.url);

        for (const path of ['/terms', '/privacy', '/cookies']) {
            expect(urls.filter(u => u === `${COMPANY.url}${path}`)).toHaveLength(1);
        }
    });

    it('dates a legal page by its last edit in English, and leaves it undated without one', async () => {
        const fetchMock = mockApi({
            '/content/legal/terms': { key: 'terms', locale: 'en', title: 'Terms of Service', bodyMarkdown: 'x', updatedAt: '2026-06-01T00:00:00Z' },
            '/dyno-runs': [],
        });
        const entries = await sitemap();

        expect(entries.find(e => e.url === `${COMPANY.url}/terms`)?.lastModified).toEqual(new Date('2026-06-01T00:00:00Z'));
        expect(entries.find(e => e.url === `${COMPANY.url}/privacy`)?.lastModified).toBeUndefined();
        expect(fetchMock.mock.calls.map(([url]) => String(url))).toContain('http://api.test/api/content/legal/terms?locale=en');
    });
});
