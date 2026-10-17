import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { defaultPasswordStrings } from '@sjolystinnovation/app-kit/validation';
import ResetPasswordPage from '@/app/(auth)/reset-password/page';
import { navigation, resetTestMocks } from '@sjolystinnovation/app-kit/testing';

const resetPassword = vi.fn();
const requestPasswordReset = vi.fn();
vi.mock('next/navigation', async () => (await import('@sjolystinnovation/app-kit/testing')).nextNavigationMock());

vi.mock('@/services/userService', () => ({
    default: {
        resetPassword: (...args: unknown[]) => resetPassword(...args),
        requestPasswordReset: (...args: unknown[]) => requestPasswordReset(...args),
    },
}));

const toStepTwo = async () => {
    render(<ResetPasswordPage />);
    await userEvent.type(screen.getByLabelText(/^Email/), 'a@b.no');
    await userEvent.click(screen.getByRole('button', { name: 'Send reset code' }));
    await userEvent.type(await screen.findByLabelText(/^Reset code/), '123456');
};

describe('reset password page', () => {
    beforeEach(() => {
        resetPassword.mockReset().mockResolvedValue({ message: 'Password reset.' });
        requestPasswordReset.mockReset().mockResolvedValue({ message: 'sent' });
        resetTestMocks();
    });

    it('opens on the last step with the email and code from the emailed link', async () => {
        navigation.searchParams = new URLSearchParams('email=kari%2Btest%40example.no&code=AB12CD');
        render(<ResetPasswordPage />);

        expect(screen.getByLabelText(/^Reset code/)).toHaveValue('AB12CD');
        await userEvent.type(screen.getByLabelText(/^New password/), 'Password1');
        await userEvent.click(screen.getByRole('button', { name: 'Reset password' }));

        expect(requestPasswordReset).not.toHaveBeenCalled();
        expect(resetPassword).toHaveBeenCalledWith(expect.objectContaining({ email: 'kari+test@example.no', code: 'AB12CD' }));
    });

    it('names each rule a new password breaks, without sending it', async () => {
        await toStepTwo();
        await userEvent.type(screen.getByLabelText(/^New password/), 'password');
        await userEvent.click(screen.getByRole('button', { name: 'Reset password' }));

        expect(resetPassword).not.toHaveBeenCalled();
        const field = screen.getByLabelText(/^New password/);
        expect(field).toHaveAttribute('aria-invalid', 'true');
        expect(field).toHaveAccessibleDescription(expect.stringContaining(defaultPasswordStrings.uppercase));
        expect(field).toHaveAccessibleDescription(expect.stringContaining(defaultPasswordStrings.digit));
    });

    it("says a wrong or expired code in the app's words when the API refuses it", async () => {
        resetPassword.mockRejectedValue({ isAxiosError: true, response: { status: 400, data: { message: 'API text', code: 'invalidResetCode' } } });
        await toStepTwo();
        await userEvent.type(screen.getByLabelText(/^New password/), 'Password1');
        await userEvent.click(screen.getByRole('button', { name: 'Reset password' }));

        expect(await screen.findByRole('alert')).toHaveTextContent('Invalid or expired reset code.');
    });

    it('sends a password that meets the rules', async () => {
        await toStepTwo();
        await userEvent.type(screen.getByLabelText(/^New password/), 'Password1');
        await userEvent.click(screen.getByRole('button', { name: 'Reset password' }));

        expect(resetPassword).toHaveBeenCalledWith({ email: 'a@b.no', code: '123456', newPassword: 'Password1' });
    });
});
