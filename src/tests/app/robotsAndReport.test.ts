import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import robots from '@/app/robots';
import { GET } from '@/app/api/report/[id]/route';
import { NextRequest } from 'next/server';

const original = { ...process.env };

beforeEach(() => { delete process.env.SITE_ENV; });
afterEach(() => {
    process.env = { ...original };
    vi.restoreAllMocks();
});

describe('robots', () => {
    it('lets the live site be crawled, except private paths', () => {
        process.env.SITE_ENV = 'prod';
        const r = robots();
        const rules = Array.isArray(r.rules) ? r.rules[0] : r.rules;
        expect(rules.allow).toBe('/');
        expect(rules.disallow).toContain('/admin');
        expect(r.sitemap).toMatch(/\/sitemap\.xml$/);
    });

    it('disallows everything on a test host', () => {
        process.env.SITE_ENV = 'dev';
        const r = robots();
        expect(r.rules).toEqual({ userAgent: '*', disallow: '/' });
        expect(r.sitemap).toBeUndefined();
    });
});

describe('report proxy', () => {
    const call = (id: string) => GET(new NextRequest('http://localhost/api/report/' + id), { params: Promise.resolve({ id }) });

    it('forwards a dyno run id to its report', async () => {
        process.env.NEXT_PUBLIC_API_URL = 'https://api.example.invalid/api';
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
            new Response('pdf', { status: 200, headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': 'attachment; filename="r.pdf"' } }));

        const res = await call('42');

        expect(fetchMock).toHaveBeenCalledWith('https://api.example.invalid/api/dyno-runs/42/report', { cache: 'no-store' });
        expect(res.status).toBe(200);
        expect(res.headers.get('Content-Disposition')).toBe('attachment; filename="r.pdf"');
    });

    it.each(['..', '..%2Fusers', '42%2F..%2F..%2Fusers', '0', '-1', '1.5', 'abc', '42?x=1', '12345678901', ''])(
        'refuses %j without calling the API', async id => {
            const fetchMock = vi.spyOn(globalThis, 'fetch');

            const res = await call(id);

            expect(res.status).toBe(404);
            expect(fetchMock).not.toHaveBeenCalled();
        });
});
