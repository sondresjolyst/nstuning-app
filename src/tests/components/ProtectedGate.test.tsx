import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ProtectedGate from '@/app/(protected)/ProtectedGate';
import { makeSession, navigation, resetTestMocks, setSession } from '@sjolystinnovation/app-kit/testing';

// The gate itself is tested in app-kit. These tests cover what this app passes to it.

vi.mock('next/navigation', async () => (await import('@sjolystinnovation/app-kit/testing')).nextNavigationMock());
vi.mock('next-auth/react', async () => (await import('@sjolystinnovation/app-kit/testing')).nextAuthMock());

const gate = () => (
    <ProtectedGate>
        <p>admin work</p>
    </ProtectedGate>
);

describe('ProtectedGate', () => {
    beforeEach(() => {
        resetTestMocks();
        navigation.pathname = '/admin/dyno-runs';
    });

    it('shows the loading text while the session loads', () => {
        setSession('loading');
        render(gate());

        expect(screen.getByText('Loading…')).toBeInTheDocument();
        expect(screen.queryByText('admin work')).not.toBeInTheDocument();
    });

    it('sends a signed-out visitor to /login', () => {
        setSession(null);
        render(gate());

        expect(navigation.router.replace).toHaveBeenCalledWith('/login');
    });

    it('renders the page for a healthy session', () => {
        setSession(makeSession({ roles: ['Admin'] }));
        render(gate());

        expect(screen.getByText('admin work')).toBeInTheDocument();
    });
});
