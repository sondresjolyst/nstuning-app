import { describe, it, expect, beforeEach, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { BrandingProvider } from '@sjolystinnovation/app-kit/branding';
import AdminSettingsPage from '@/app/(protected)/admin/settings/page';
import { resetTestMocks, toastSpies } from '@sjolystinnovation/app-kit/testing';

const { update } = vi.hoisted(() => ({ update: vi.fn() }));

vi.mock('@/services/settingsService', () => ({ default: { get: async () => ({}), update: vi.fn() } }));
vi.mock('@/services/brandingService', () => ({ default: { update: (f: FormData) => update(f) } }));
vi.mock('@sjolystinnovation/app-kit/toast', async () => (await import('@sjolystinnovation/app-kit/testing')).toastMock());

/** The error `request` from app-kit throws when the API refuses the logo with `code`. */
const refusedLogo = (code: string) =>
    Object.assign(new Error('API text'), { fieldErrors: { logo: ['API text'] }, fieldErrorDetails: { logo: [{ message: 'API text', code }] } });

async function saveLogo() {
    render(<BrandingProvider load={async () => ({})} initial={{}}><AdminSettingsPage /></BrandingProvider>);
    fireEvent.change(await screen.findByLabelText('Logo'), { target: { files: [new File(['x'], 'logo.png', { type: 'image/png' })] } });
    fireEvent.click(screen.getByRole('button', { name: 'Save branding' }));
}

describe('admin branding', () => {
    beforeEach(() => {
        update.mockReset();
        resetTestMocks();
    });

    it('says a file in the wrong format must be an image, under the logo', async () => {
        update.mockRejectedValue(refusedLogo('invalidImage'));
        await saveLogo();

        const text = 'Invalid file format. Upload a PNG, JPEG, WebP, GIF or ICO image.';
        await waitFor(() => expect(screen.getByLabelText('Logo')).toHaveAccessibleDescription(text));
        expect(toastSpies.error).toHaveBeenCalledWith(text);
    });

    it('says a file over 2 MB is too large, under the logo', async () => {
        update.mockRejectedValue(refusedLogo('imageTooLarge'));
        await saveLogo();

        const text = 'The file is too large. Upload a file of 2 MB or less.';
        await waitFor(() => expect(screen.getByLabelText('Logo')).toHaveAccessibleDescription(text));
        expect(toastSpies.error).toHaveBeenCalledWith(text);
    });
});
