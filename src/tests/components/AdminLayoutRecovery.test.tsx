import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import ProtectedGate from '@/app/(protected)/ProtectedGate';
import AdminLayout from '@/app/(protected)/admin/layout';
import { closeSessionPrompt, openSessionPrompt } from '@sjolystinnovation/app-kit/session';
import { makeSession, navigation, resetTestMocks, setSession } from '@sjolystinnovation/app-kit/testing';

vi.mock('next/navigation', async () => (await import('@sjolystinnovation/app-kit/testing')).nextNavigationMock());
vi.mock('next-auth/react', async () => (await import('@sjolystinnovation/app-kit/testing')).nextAuthMock());

// The real nesting: the gate wraps the admin layout, which wraps the form. Testing the gate on
// its own hid the fact that the layout below it made its own decision to blank the page.
const tree = () => (
    <ProtectedGate>
        <AdminLayout>
            <p>admin work</p>
        </AdminLayout>
    </ProtectedGate>
);

describe('the admin layout inside the gate', () => {
    beforeEach(() => {
        resetTestMocks();
        navigation.pathname = '/admin/dyno-runs';
        setSession(makeSession());
        closeSessionPrompt();
    });

    afterEach(() => closeSessionPrompt());

    it('renders the admin page for a healthy admin session', () => {
        render(tree());

        expect(screen.getByText('admin work')).toBeInTheDocument();
    });

    it('keeps the form on screen while the prompt recovers a signed-out session', () => {
        const view = render(tree());
        expect(screen.getByText('admin work')).toBeInTheDocument();

        // The cookie is gone and the 401 handler has raised the prompt. The gate declines to
        // redirect, so the layout must not blank the page either, or the form is lost anyway.
        setSession(null);
        act(() => openSessionPrompt());
        view.rerender(tree());

        expect(screen.getByText('admin work')).toBeInTheDocument();
        expect(navigation.router.push).not.toHaveBeenCalled();
        expect(navigation.router.replace).not.toHaveBeenCalled();
    });

    it('still keeps a non-admin out of the admin page', () => {
        setSession(makeSession({ roles: [] }));

        render(tree());

        expect(screen.queryByText('admin work')).not.toBeInTheDocument();
        expect(navigation.router.replace).toHaveBeenCalledWith('/');
    });
});
