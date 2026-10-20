import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AdminLegalPage from '@/app/(protected)/admin/legal/page';
import { resetTestMocks } from '@sjolystinnovation/app-kit/testing';

const { listAll, save, listRevisions } = vi.hoisted(() => ({ listAll: vi.fn(), save: vi.fn(), listRevisions: vi.fn() }));

vi.mock('@/services/legalService', async importOriginal => ({
    ...(await importOriginal<typeof import('@/services/legalService')>()),
    default: { listAll: () => listAll(), save: (p: unknown) => save(p), listRevisions: (...args: unknown[]) => listRevisions(...args) },
}));
vi.mock('@sjolystinnovation/app-kit/toast', async () => (await import('@sjolystinnovation/app-kit/testing')).toastMock());

describe('admin legal page', () => {
    beforeEach(() => {
        listAll.mockReset().mockResolvedValue([
            { key: 'terms', locale: 'en', title: 'Terms of Service', bodyMarkdown: 'Terms text', updatedAt: '2026-06-01T00:00:00Z' },
            { key: 'privacy', locale: 'en', title: 'Privacy Policy', bodyMarkdown: 'Privacy text', updatedAt: '2026-06-01T00:00:00Z' },
        ]);
        save.mockReset().mockResolvedValue({});
        listRevisions.mockReset().mockResolvedValue([]);
        resetTestMocks();
    });

    it('edits each page in English and saves it', async () => {
        const user = userEvent.setup();
        render(<AdminLegalPage />);

        expect(await screen.findByDisplayValue('Terms text')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'English' })).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: 'Privacy Policy' }));
        expect(screen.getByDisplayValue('Privacy text')).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: 'Save' }));
        await waitFor(() => expect(save).toHaveBeenCalledWith({ key: 'privacy', locale: 'en', title: 'Privacy Policy', bodyMarkdown: 'Privacy text' }));
    });

    it('lists the saved versions of the open page with the day before the month', async () => {
        listRevisions.mockResolvedValue([
            { id: 2, savedAt: '2026-10-17T12:00:00Z', title: 'Terms of Service' },
            { id: 1, savedAt: '2026-10-16T12:00:00Z', title: 'Terms' },
        ]);
        render(<AdminLegalPage />);

        const versions = await screen.findAllByRole('button', { pressed: false, name: /Oct 2026/ });
        expect(versions).toHaveLength(2);
        expect(versions[0]).toHaveTextContent(/17 Oct 2026/);
        expect(versions[1]).toHaveTextContent(/16 Oct 2026/);
        expect(listRevisions).toHaveBeenCalledWith('terms', 'en');
    });
});
