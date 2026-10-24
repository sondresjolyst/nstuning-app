import { describe, it, expect, vi } from 'vitest';

const { put, revalidateTarget } = vi.hoisted(() => ({ put: vi.fn(), revalidateTarget: vi.fn() }));
vi.mock('@/services/axiosInstance', () => ({ default: { put, get: vi.fn() } }));
vi.mock('@/lib/cacheTags', async importOriginal => ({ ...(await importOriginal<object>()), revalidateTarget }));

import SettingsService from '@/services/settingsService';

describe('SettingsService', () => {
    it('refreshes the company details on every page after a save', async () => {
        put.mockResolvedValue({ data: { companyName: 'NS Tuning' } });
        await SettingsService.update({ companyName: 'NS Tuning' } as never);
        expect(put).toHaveBeenCalledWith('/settings', { companyName: 'NS Tuning' });
        expect(revalidateTarget).toHaveBeenCalledWith('company');
    });
});
