import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { defaultPasswordStrings } from '@sjolystinnovation/app-kit/validation';
import ResetPasswordPage from '@/app/(auth)/reset-password/page';

const resetPassword = vi.fn();
const requestPasswordReset = vi.fn();

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
    });

    it('names each rule a new password breaks, without sending it', async () => {
        await toStepTwo();
        await userEvent.type(screen.getByLabelText(/^New password/), 'password');
        await userEvent.click(screen.getByRole('button', { name: 'Reset password' }));

        expect(resetPassword).not.toHaveBeenCalled();
        expect(screen.getByRole('alert')).toHaveTextContent(defaultPasswordStrings.uppercase);
        expect(screen.getByRole('alert')).toHaveTextContent(defaultPasswordStrings.digit);
    });

    it('sends a password that meets the rules', async () => {
        await toStepTwo();
        await userEvent.type(screen.getByLabelText(/^New password/), 'Password1');
        await userEvent.click(screen.getByRole('button', { name: 'Reset password' }));

        expect(resetPassword).toHaveBeenCalledWith({ email: 'a@b.no', code: '123456', newPassword: 'Password1' });
    });
});
