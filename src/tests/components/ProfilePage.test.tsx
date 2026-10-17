import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProfilePage from '@/app/(protected)/profile/page';
import { resetTestMocks, toastSpies } from '@sjolystinnovation/app-kit/testing';

const { changePassword, deleteAccount, signOut } = vi.hoisted(() => ({ changePassword: vi.fn(), deleteAccount: vi.fn(), signOut: vi.fn() }));

vi.mock('@/services/userService', () => ({
    default: {
        getProfile: async () => ({ id: 'u1', userName: 'ada', email: 'ada@nstuning.no', firstName: 'Ada', lastName: 'Admin' }),
        changePassword: (d: unknown) => changePassword(d),
        deleteAccount: () => deleteAccount(),
    },
}));
vi.mock('next-auth/react', () => ({ signOut: (o: unknown) => signOut(o) }));
vi.mock('@sjolystinnovation/app-kit/toast', async () => (await import('@sjolystinnovation/app-kit/testing')).toastMock());

/** The error `request` from app-kit throws for a refused call. */
const refused = (message: string, extra: object) => Object.assign(new Error(message), extra);

async function changeTo(currentPassword: string, newPassword: string) {
    await userEvent.type(await screen.findByLabelText(/^Current password/), currentPassword);
    await userEvent.type(screen.getByLabelText(/^New password/), newPassword);
    await userEvent.click(screen.getByRole('button', { name: 'Change password' }));
}

async function deleteMine() {
    await userEvent.click(await screen.findByRole('button', { name: 'Delete my account' }));
    await userEvent.click(screen.getByRole('button', { name: 'Yes, delete' }));
}

describe('profile page', () => {
    beforeEach(() => {
        changePassword.mockReset().mockResolvedValue({ message: 'Password changed.' });
        deleteAccount.mockReset().mockResolvedValue(undefined);
        signOut.mockReset();
        resetTestMocks();
    });

    it('shows a wrong current password under the current password field, not in a toast', async () => {
        changePassword.mockRejectedValue(refused('Incorrect password.', { fieldErrors: { currentPassword: ['Incorrect password.'] } }));
        render(<ProfilePage />);

        await changeTo('Wrong-password-1', 'Password2!');

        const current = screen.getByLabelText(/^Current password/);
        await waitFor(() => expect(current).toHaveAttribute('aria-invalid', 'true'));
        expect(current).toHaveAccessibleDescription('Incorrect password.');
        expect(screen.getByLabelText(/^New password/)).not.toHaveAttribute('aria-invalid', 'true');
        expect(toastSpies.error).not.toHaveBeenCalled();
    });

    it('shows the new password rules from the API under the new password field', async () => {
        changePassword.mockRejectedValue(refused('Failed', { fieldErrors: { newPassword: ['Passwords must be at least 8 characters.', 'Passwords must have at least one digit.'] } }));
        render(<ProfilePage />);

        await changeTo('Password1!', 'Password2!');

        const next = screen.getByLabelText(/^New password/);
        await waitFor(() => expect(next).toHaveAccessibleDescription('Passwords must be at least 8 characters. Passwords must have at least one digit.'));
        expect(screen.getByLabelText(/^Current password/)).not.toHaveAttribute('aria-invalid', 'true');
        expect(toastSpies.error).not.toHaveBeenCalled();
    });

    it('clears the field error once the field is edited', async () => {
        changePassword.mockRejectedValue(refused('Incorrect password.', { fieldErrors: { currentPassword: ['Incorrect password.'] } }));
        render(<ProfilePage />);
        await changeTo('Wrong-password-1', 'Password2!');
        const current = screen.getByLabelText(/^Current password/);
        await waitFor(() => expect(current).toHaveAttribute('aria-invalid', 'true'));

        await userEvent.type(current, 'x');

        expect(current).not.toHaveAttribute('aria-invalid', 'true');
    });

    it('falls back to a toast for a failure without field errors', async () => {
        changePassword.mockRejectedValue(new Error('The server could not be reached.'));
        render(<ProfilePage />);

        await changeTo('Password1!', 'Password2!');

        await waitFor(() => expect(toastSpies.error).toHaveBeenCalledWith('The server could not be reached.'));
        expect(screen.getByLabelText(/^Current password/)).not.toHaveAttribute('aria-invalid', 'true');
    });

    it('says the last admin account cannot be deleted', async () => {
        deleteAccount.mockRejectedValue(refused('The last admin account cannot be deleted.', { errorCode: 'lastAdmin' }));
        render(<ProfilePage />);

        await deleteMine();

        await waitFor(() => expect(toastSpies.error).toHaveBeenCalledWith('Your account is the last admin account and cannot be deleted. Give someone else the admin role first.'));
        expect(signOut).not.toHaveBeenCalled();
        expect(screen.getByRole('button', { name: 'Yes, delete' })).toBeEnabled();
    });

    it('asks to try again when another account change collided with the deletion', async () => {
        deleteAccount.mockRejectedValue(refused('Conflict', { errorCode: 'accountChangeConflict' }));
        render(<ProfilePage />);

        await deleteMine();

        await waitFor(() => expect(toastSpies.error).toHaveBeenCalledWith('Another change to the accounts happened at the same time. Try again.'));
    });

    it("shows the API's message for a refusal with another code", async () => {
        deleteAccount.mockRejectedValue(refused('Something else went wrong.', { errorCode: 'toString' }));
        render(<ProfilePage />);

        await deleteMine();

        await waitFor(() => expect(toastSpies.error).toHaveBeenCalledWith('Something else went wrong.'));
    });

    it('signs out after deleting the account', async () => {
        render(<ProfilePage />);

        await deleteMine();

        await waitFor(() => expect(signOut).toHaveBeenCalledWith({ callbackUrl: '/' }));
        expect(toastSpies.success).toHaveBeenCalledWith('Account deleted.');
    });
});
