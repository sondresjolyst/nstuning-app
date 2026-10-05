import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Session } from 'next-auth';
import SessionExpiryGuard from '@/components/SessionExpiryGuard';
import { closeSessionPrompt, getSessionPromptOpen, openSessionPrompt } from '@/lib/sessionExpiry';

const signIn = vi.fn();
const signOut = vi.fn();
const getSession = vi.fn();
const success = vi.fn();
let sessionState: { data: Session | null; status: 'loading' | 'authenticated' | 'unauthenticated' };

vi.mock('next-auth/react', () => ({
    useSession: () => sessionState,
    signIn: (...args: unknown[]) => signIn(...args),
    signOut: (...args: unknown[]) => signOut(...args),
    getSession: () => getSession(),
}));

vi.mock('sonner', () => ({
    toast: { success: (message: string) => success(message), error: vi.fn() },
}));

const session = (overrides: Partial<Session> = {}): Session => ({
    user: { id: '1', name: 'admin', email: 'a@b.no', roles: ['Admin'] },
    accessToken: 'token',
    expires: '',
    ...overrides,
});

const guard = () => <SessionExpiryGuard />;

const signInWith = async (password: string) => {
    await userEvent.type(screen.getByLabelText(/^Password/), password);
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));
};

describe('SessionExpiryGuard', () => {
    beforeEach(() => {
        signIn.mockReset();
        signOut.mockReset();
        getSession.mockReset();
        success.mockReset();
        sessionState = { data: session(), status: 'authenticated' };
        closeSessionPrompt();
    });

    afterEach(() => closeSessionPrompt());

    it('shows nothing while the session is healthy and nothing has failed', () => {
        render(guard());

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        expect(screen.queryByText('Your session has expired. Sign in again to save.')).not.toBeInTheDocument();
    });

    it('opens the prompt when a request finds a dead session', () => {
        render(guard());

        act(() => openSessionPrompt());

        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByLabelText(/^Email/)).toHaveValue('a@b.no');
    });

    it('signs in without navigating away from the form', async () => {
        signIn.mockResolvedValue({ error: null });
        getSession.mockResolvedValue(session());
        render(guard());
        act(() => openSessionPrompt());

        await signInWith('Password1');

        // redirect: false is the whole point. A redirecting sign-in would unmount the form and
        // reintroduce the bug this component exists to kill.
        expect(signIn).toHaveBeenCalledWith('credentials', expect.objectContaining({ redirect: false }));
        expect(getSessionPromptOpen()).toBe(false);
        expect(success).toHaveBeenCalledWith('You are signed in again. Try saving again.');
    });

    it('keeps the prompt open when the password is wrong', async () => {
        signIn.mockResolvedValue({ error: 'CredentialsSignin' });
        render(guard());
        act(() => openSessionPrompt());

        await signInWith('wrong');

        // A typo must not cost the user their work either.
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText('Invalid email or password.')).toBeInTheDocument();
        expect(success).not.toHaveBeenCalled();
    });

    it('does not claim success when the new session still cannot save', async () => {
        signIn.mockResolvedValue({ error: null });
        getSession.mockResolvedValue(session({ error: 'RefreshTokenRejected' }));
        render(guard());
        act(() => openSessionPrompt());

        await signInWith('Password1');

        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText('We could not renew the session. Try again.')).toBeInTheDocument();
        expect(success).not.toHaveBeenCalled();
    });

    it('warns before the absolute cap, with the minutes left', () => {
        sessionState = { data: session({ absoluteExpiresAt: Date.now() + 12 * 60 * 1000 }), status: 'authenticated' };

        render(guard());

        expect(screen.getByText('Your session expires in 12 min. Sign in again to continue without interruption.')).toBeInTheDocument();
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('does not warn while the cap is still far away', () => {
        sessionState = { data: session({ absoluteExpiresAt: Date.now() + 6 * 60 * 60 * 1000 }), status: 'authenticated' };

        render(guard());

        expect(screen.queryByText(/min\. Sign in again/)).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Sign in again' })).not.toBeInTheDocument();
    });

    it('offers the prompt from the banner once the session is dead', async () => {
        sessionState = { data: session({ error: 'AbsoluteSessionExpired' }), status: 'authenticated' };
        render(guard());

        expect(screen.getByText('Your session has expired. Sign in again to save.')).toBeInTheDocument();
        await userEvent.click(screen.getByRole('button', { name: 'Sign in again' }));

        expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('refuses to hand the page to a different account', async () => {
        signIn.mockResolvedValue({ error: null });
        getSession.mockResolvedValue({
            user: { id: '2', name: 'other', email: 'c@d.no', roles: ['Admin'] },
            accessToken: 'token',
            expires: '',
        });
        render(guard());
        act(() => openSessionPrompt());

        await signInWith('Password1');

        // The form belongs to whoever opened it, and signIn has already swapped the session,
        // so detecting the mismatch has to end it rather than only report it.
        expect(signOut).toHaveBeenCalledWith(expect.objectContaining({ callbackUrl: '/login' }));
        expect(screen.getByText('This page belongs to a different user. Sign in with the same account.')).toBeInTheDocument();
        expect(getSessionPromptOpen()).toBe(true);
    });

    it('shows the generic message for a failure that is not about credentials', async () => {
        signIn.mockResolvedValue({ error: null });
        getSession.mockRejectedValue(new Error('Failed to fetch'));
        render(guard());
        act(() => openSessionPrompt());

        await signInWith('Password1');

        // A raw fetch error has no place in the UI.
        expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });

    it('closes the prompt when it unmounts, so the gate can redirect again', () => {
        const view = render(guard());
        act(() => openSessionPrompt());
        expect(getSessionPromptOpen()).toBe(true);

        view.unmount();

        expect(getSessionPromptOpen()).toBe(false);
    });

    it('reports an expired session rather than zero minutes left', () => {
        sessionState = { data: session({ absoluteExpiresAt: Date.now() - 1000 }), status: 'authenticated' };

        render(guard());

        expect(screen.getByText('Your session has expired. Sign in again to save.')).toBeInTheDocument();
        expect(screen.queryByText('Your session expires in 0 min. Sign in again to continue without interruption.')).not.toBeInTheDocument();
    });

    it('puts the cursor in the password field when it opens', () => {
        render(guard());

        act(() => openSessionPrompt());

        expect(screen.getByLabelText(/^Password/)).toHaveFocus();
    });

    it('closes on Escape', async () => {
        render(guard());
        act(() => openSessionPrompt());

        await userEvent.keyboard('{Escape}');

        expect(getSessionPromptOpen()).toBe(false);
    });

    it('keeps Tab inside the dialog', async () => {
        render(
            <>
                <input aria-label="behind the overlay" />
                <SessionExpiryGuard />
            </>,
        );
        act(() => openSessionPrompt());

        // Tab from the last control must wrap to the first, not walk into the form behind the
        // overlay, which the user cannot see and must not edit.
        const controls = screen.getByRole('dialog').querySelectorAll('input, button');
        (controls[controls.length - 1] as HTMLElement).focus();
        await userEvent.tab();

        expect(screen.getByLabelText('behind the overlay')).not.toHaveFocus();
        expect(controls[0]).toHaveFocus();
    });

    it('wraps backwards too', async () => {
        render(guard());
        act(() => openSessionPrompt());

        const controls = screen.getByRole('dialog').querySelectorAll('input, button');
        (controls[0] as HTMLElement).focus();
        await userEvent.tab({ shift: true });

        expect(controls[controls.length - 1]).toHaveFocus();
    });

    it('gives focus back where it was when it closes', async () => {
        render(
            <>
                <button type="button">save</button>
                <SessionExpiryGuard />
            </>,
        );
        const save = screen.getByRole('button', { name: 'save' });
        save.focus();

        act(() => openSessionPrompt());
        await userEvent.keyboard('{Escape}');

        expect(save).toHaveFocus();
    });

    it('still refuses another account after the cookie is gone', async () => {
        sessionState = { data: session(), status: 'authenticated' };
        const view = render(guard());

        // The cookie is lost, so useSession reports nobody. Reading the owner from the live
        // session here would leave nothing to compare against and accept any account.
        sessionState = { data: null, status: 'unauthenticated' };
        view.rerender(guard());
        act(() => openSessionPrompt());

        signIn.mockResolvedValue({ error: null });
        getSession.mockResolvedValue({
            user: { id: '2', name: 'other', email: 'c@d.no', roles: ['Admin'] },
            accessToken: 'token',
            expires: '',
        });
        await signInWith('Password1');

        expect(signOut).toHaveBeenCalled();
        expect(screen.getByText('This page belongs to a different user. Sign in with the same account.')).toBeInTheDocument();
    });

    it('offers the owner email back after the cookie is gone', async () => {
        sessionState = { data: session(), status: 'authenticated' };
        const view = render(guard());

        sessionState = { data: null, status: 'unauthenticated' };
        view.rerender(guard());
        act(() => openSessionPrompt());

        expect(screen.getByLabelText(/^Email/)).toHaveValue('a@b.no');
    });

});
