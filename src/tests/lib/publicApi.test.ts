import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { PHASE_PRODUCTION_BUILD } from 'next/constants';
import { publicGet, publicGetWithMeta, PublicApiError } from '@/lib/publicApi';

const respond = (body: unknown, init: { status?: number } = {}) =>
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response(JSON.stringify(body), { status: init.status ?? 200, headers: { 'content-type': 'application/json' } }),
    );

afterEach(() => vi.restoreAllMocks());

describe('during next build', () => {
    beforeEach(() => vi.stubEnv('NEXT_PHASE', PHASE_PRODUCTION_BUILD));
    afterEach(() => vi.unstubAllEnvs());

    it('builds the page empty with a warning when the API is unreachable', async () => {
        vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('ECONNREFUSED'));
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

        expect(await publicGet('/content/legal/terms')).toBeNull();
        expect(warn).toHaveBeenCalledWith(expect.stringContaining('/content/legal/terms'));
    });

    it('builds the page empty when the API answers with a server error', async () => {
        respond({}, { status: 503 });
        vi.spyOn(console, 'warn').mockImplementation(() => {});

        expect(await publicGetWithMeta('/content/home')).toBeNull();
    });

    it('still throws once the build is over', async () => {
        vi.unstubAllEnvs();
        vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('ECONNREFUSED'));

        await expect(publicGet('/content/legal/terms')).rejects.toThrow(PublicApiError);
    });
});
