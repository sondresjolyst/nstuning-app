import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AdminSettingsPage from '@/app/(protected)/admin/settings/page';

const { get, update, toastError } = vi.hoisted(() => ({ get: vi.fn(), update: vi.fn(), toastError: vi.fn() }));

vi.mock('@/services/settingsService', () => ({ default: { get: () => get(), update: (s: unknown) => update(s) } }));
vi.mock('@/services/brandingService', () => ({ default: { update: vi.fn() } }));
vi.mock('@sjolystinnovation/app-kit/branding', () => ({ BrandingManager: () => null }));
vi.mock('@sjolystinnovation/app-kit/toast', () => ({ toast: { success: vi.fn(), error: (m: string) => toastError(m) } }));

const stored = {
    contactRecipientEmail: 'inbox@nstuning.no',
    companyName: 'NS Tuning',
    companyLegalName: 'Nordmark Service',
    orgNumber: '923 202 374',
    vatRegistered: true,
    streetAddress: 'Håbakken 7',
    postalCode: '4355',
    addressLocality: 'Kvernaland',
    addressRegion: '',
    publicEmail: '',
    publicPhone: '',
};

describe('admin settings page', () => {
    beforeEach(() => {
        get.mockReset().mockResolvedValue(stored);
        update.mockReset().mockImplementation(async (s: unknown) => s);
        toastError.mockReset();
    });

    it('shows the address in its parts', async () => {
        render(<AdminSettingsPage />);

        expect(await screen.findByLabelText(/^Street address/)).toHaveValue('Håbakken 7');
        expect(screen.getByLabelText(/^Postal code/)).toHaveValue('4355');
        expect(screen.getByLabelText(/^Place/)).toHaveValue('Kvernaland');
        expect(screen.getByLabelText(/^Legal name/)).toHaveValue('Nordmark Service');
    });

    it('saves every field, including the new public contact details', async () => {
        render(<AdminSettingsPage />);
        await userEvent.type(await screen.findByLabelText(/^Public email/), 'post@nstuning.no');
        await userEvent.type(screen.getByLabelText(/^Public phone/), '+47 900 00 000');
        await userEvent.type(screen.getByLabelText(/^County/), 'Rogaland');

        await userEvent.click(screen.getByRole('button', { name: 'Save' }));

        await waitFor(() => expect(update).toHaveBeenCalledWith({
            ...stored, publicEmail: 'post@nstuning.no', publicPhone: '+47 900 00 000', addressRegion: 'Rogaland',
        }));
    });

    it("shows the API's reason when saving fails", async () => {
        update.mockRejectedValue(new Error('Not a valid organisation number.'));
        get.mockResolvedValue({ ...stored, publicEmail: 'post@nstuning.no', publicPhone: '1' });
        render(<AdminSettingsPage />);

        await userEvent.click(await screen.findByRole('button', { name: 'Save' }));

        await waitFor(() => expect(toastError).toHaveBeenCalledWith('Not a valid organisation number.'));
    });
});
