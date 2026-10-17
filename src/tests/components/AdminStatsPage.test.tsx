import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import AdminStatsPage from '@/app/(protected)/admin/stats/page';
import { resetTestMocks } from '@sjolystinnovation/app-kit/testing';

const { get } = vi.hoisted(() => ({ get: vi.fn() }));

vi.mock('@/services/axiosInstance', () => ({ default: { get } }));
vi.mock('@sjolystinnovation/app-kit/toast', async () => (await import('@sjolystinnovation/app-kit/testing')).toastMock());

const stats = {
    totalUsers: 3,
    publishedDynoRuns: 7,
    draftDynoRuns: 2,
    contentImages: 11,
    storageUsedBytes: 73400320,
    diskTotalBytes: 10737418240,
    diskFreeBytes: 8589934592,
};
const email = { days: 30, requests: 120, delivered: 110, hardBounces: 2, softBounces: 3, spamReports: 1, blocked: 4, invalid: 5 };

function answer(byUrl: Record<string, unknown>) {
    get.mockImplementation(async (url: string) => {
        if (!(url in byUrl)) throw new Error(`unexpected ${url}`);
        const data = byUrl[url];
        if (data instanceof Error) throw data;
        return { data };
    });
}

const card = (title: string) => screen.getByRole('heading', { name: title }).parentElement as HTMLElement;

describe('admin stats page', () => {
    beforeEach(() => {
        get.mockReset();
        resetTestMocks();
    });

    it('shows the storage numbers from the stats endpoint', async () => {
        answer({ '/admin/stats': stats, '/admin/stats/history': [], '/admin/email-stats': email });
        render(<AdminStatsPage />);

        await screen.findByText('70.0 MB');
        const storage = within(card('Storage'));
        expect(storage.getByText('Uploads').nextSibling).toHaveTextContent('70.0 MB');
        expect(storage.getByText('Disk free').nextSibling).toHaveTextContent('8.0 GB');
        expect(storage.getByText('Disk total').nextSibling).toHaveTextContent('10.0 GB');
    });

    it('shows the email stats of the last 30 days from the email stats endpoint', async () => {
        answer({ '/admin/stats': stats, '/admin/stats/history': [], '/admin/email-stats': email });
        render(<AdminStatsPage />);

        const panel = within(await screen.findByRole('heading', { name: 'Email (last 30 days)' }).then(h => h.parentElement as HTMLElement));
        await panel.findByText('Sent');
        expect(panel.getByText('Sent').nextSibling).toHaveTextContent('120');
        expect(panel.getByText('Delivered').nextSibling).toHaveTextContent('110');
        expect(panel.getByText('Bounces').nextSibling).toHaveTextContent('5');
        expect(panel.getByText('Blocked / spam').nextSibling).toHaveTextContent('5');
        expect(get).toHaveBeenCalledWith('/admin/email-stats', { params: { days: 30 } });
    });

    it('says the email stats are unavailable when Brevo fails, and still shows the storage', async () => {
        answer({ '/admin/stats': stats, '/admin/stats/history': [], '/admin/email-stats': new Error('502') });
        render(<AdminStatsPage />);

        expect(await screen.findByText('Unavailable.')).toBeInTheDocument();
        expect(await screen.findByText('70.0 MB')).toBeInTheDocument();
    });
});
