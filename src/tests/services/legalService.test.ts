import { describe, it, expect, beforeEach, vi } from 'vitest';

const { put, revalidate } = vi.hoisted(() => ({ put: vi.fn(), revalidate: vi.fn() }));

vi.mock('@/services/axiosInstance', () => ({ default: { put: (...a: unknown[]) => put(...a) } }));
vi.mock('@/lib/cacheTags', () => ({ REVALIDATE_TARGETS: { legal: 'legal' }, revalidateTarget: (t: string) => revalidate(t) }));

import LegalService, { LEGAL_LOCALE } from '@/services/legalService';

describe('LegalService', () => {
    beforeEach(() => {
        put.mockReset().mockResolvedValue({ data: { key: 'terms', locale: 'en', title: 'T', bodyMarkdown: 'B', updatedAt: '' } });
        revalidate.mockReset().mockResolvedValue(undefined);
    });

    it('offers the terms, privacy and cookie pages, in English', () => {
        expect(LegalService.keys).toEqual(['terms', 'privacy', 'cookies']);
        expect(LEGAL_LOCALE).toBe('en');
    });

    it('refreshes the cached legal pages after saving one', async () => {
        await LegalService.save({ key: 'terms', locale: 'en', title: 'T', bodyMarkdown: 'B' });
        expect(put).toHaveBeenCalledWith('/content/legal/terms/en', { title: 'T', bodyMarkdown: 'B' });
        expect(revalidate).toHaveBeenCalledWith('legal');
    });
});
