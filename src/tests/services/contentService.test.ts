import { describe, it, expect, beforeEach, vi } from 'vitest';

const { publicGet, put, revalidate } = vi.hoisted(() => ({ publicGet: vi.fn(), put: vi.fn(), revalidate: vi.fn() }));

vi.mock('@/services/publicClient', () => ({ default: { get: (...a: unknown[]) => publicGet(...a) } }));
vi.mock('@/services/axiosInstance', () => ({ default: { put: (...a: unknown[]) => put(...a) } }));
vi.mock('@/lib/cacheTags', () => ({ REVALIDATE_TARGETS: { home: 'home' }, revalidateTarget: (t: string) => revalidate(t) }));

import ContentService from '@/services/contentService';

const sections = [{ id: 's1', type: 'text', visible: true, heading: 'Hi', body: '' }];

describe('ContentService', () => {
    beforeEach(() => {
        publicGet.mockReset();
        put.mockReset();
        revalidate.mockReset().mockResolvedValue(undefined);
    });

    it('loads the home page through the public client', async () => {
        publicGet.mockResolvedValue({ data: sections });
        await expect(ContentService.getHome()).resolves.toEqual(sections);
        expect(publicGet).toHaveBeenCalledWith('/content/home');
    });

    it('gives an empty page when the API answers something else or fails', async () => {
        publicGet.mockResolvedValueOnce({ data: { not: 'a list' } });
        await expect(ContentService.getHome()).resolves.toEqual([]);
        publicGet.mockRejectedValueOnce(new Error('down'));
        await expect(ContentService.getHome()).resolves.toEqual([]);
    });

    it('saves the home page and refreshes the cached home page', async () => {
        put.mockResolvedValue({ data: sections });
        await expect(ContentService.updateHome(sections as never)).resolves.toEqual(sections);
        expect(put).toHaveBeenCalledWith('/content/home', sections);
        expect(revalidate).toHaveBeenCalledWith('home');
    });

    it("throws the API's reason when saving fails, without refreshing", async () => {
        put.mockRejectedValue({ isAxiosError: true, response: { status: 400, data: { message: 'Section 2 has no type.' } } });
        await expect(ContentService.updateHome(sections as never)).rejects.toThrow('Section 2 has no type.');
        expect(revalidate).not.toHaveBeenCalled();
    });

    it('falls back to a general message when the API gives no reason', async () => {
        put.mockRejectedValue({ isAxiosError: true, response: { status: 400, data: '' } });
        await expect(ContentService.updateHome(sections as never)).rejects.toThrow('Failed to save content');
    });
});
