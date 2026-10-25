import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { auth, navigation, resetTestMocks } from '@sjolystinnovation/app-kit/testing';

const register = vi.fn();
vi.mock('next/navigation', async () => (await import('@sjolystinnovation/app-kit/testing')).nextNavigationMock());
vi.mock('next-auth/react', async () => (await import('@sjolystinnovation/app-kit/testing')).nextAuthMock());
vi.mock('@/services/userService', () => ({
    default: { register: (...args: unknown[]) => register(...args) },
}));

import RegisterPage from '@/app/(auth)/register/page';

const signedIn = { ok: true, error: null, status: 200, url: 'http://localhost:3000/register' };
const csrfRefusal = { ok: true, error: null, status: 200, url: 'http://localhost:3000/api/auth/signin?csrf=true' };
const wrongCredentials = { ok: false, error: 'CredentialsSignin', status: 401, url: null };

const submitForm = async () => {
    render(<RegisterPage />);
    await userEvent.type(screen.getByLabelText(/^Username/), 'ada');
    await userEvent.type(screen.getByLabelText(/^First name/), 'Ada');
    await userEvent.type(screen.getByLabelText(/^Last name/), 'Lovelace');
    await userEvent.type(screen.getByLabelText(/^Email/), 'ada@example.com');
    await userEvent.type(screen.getByLabelText(/^Password/), 'Sup3rSecret');
    await userEvent.click(screen.getByRole('button', { name: 'Create account' }));
};

describe('register page sign-in after registering', () => {
    beforeEach(() => {
        resetTestMocks();
        register.mockReset().mockResolvedValue({ message: 'ok' });
    });

    it('signs in with the new credentials and goes home once', async () => {
        auth.signIn.mockResolvedValueOnce(signedIn);
        await submitForm();

        await waitFor(() => expect(navigation.router.push).toHaveBeenCalledWith('/'));
        expect(auth.signIn).toHaveBeenCalledTimes(1);
        expect(auth.signIn).toHaveBeenCalledWith('credentials', {
            email: 'ada@example.com',
            password: 'Sup3rSecret',
            redirect: false,
        });
        expect(navigation.router.push).toHaveBeenCalledTimes(1);
        expect(navigation.router.refresh).toHaveBeenCalledTimes(1);
    });

    it('retries a sign-in refused for CSRF once and goes home when the retry works', async () => {
        auth.signIn.mockResolvedValueOnce(csrfRefusal).mockResolvedValueOnce(signedIn);
        await submitForm();

        await waitFor(() => expect(navigation.router.push).toHaveBeenCalledWith('/'));
        expect(auth.signIn).toHaveBeenCalledTimes(2);
        expect(navigation.router.push).toHaveBeenCalledTimes(1);
        expect(navigation.router.refresh).toHaveBeenCalledTimes(1);
    });

    it.each([
        ['wrong credentials', [wrongCredentials], 1],
        ['CSRF twice', [csrfRefusal, csrfRefusal], 2],
        ['no answer', [undefined], 1],
    ])('sends the user to sign in by hand when the sign-in is refused for %s', async (_, answers, calls) => {
        for (const answer of answers) auth.signIn.mockResolvedValueOnce(answer);
        await submitForm();

        await waitFor(() => expect(navigation.router.push).toHaveBeenCalledWith('/login'));
        expect(auth.signIn).toHaveBeenCalledTimes(calls);
        expect(navigation.router.push).toHaveBeenCalledTimes(1);
        expect(navigation.router.refresh).not.toHaveBeenCalled();
    });

    it('does not sign in when registering fails', async () => {
        register.mockRejectedValueOnce(new Error('Email already taken'));
        await submitForm();

        expect(await screen.findByText('Email already taken')).toBeInTheDocument();
        expect(auth.signIn).not.toHaveBeenCalled();
        expect(navigation.router.push).not.toHaveBeenCalled();
    });
});
