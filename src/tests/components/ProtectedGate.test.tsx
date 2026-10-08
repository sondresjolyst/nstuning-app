import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { Session } from 'next-auth';
import ProtectedGate from '@/app/(protected)/ProtectedGate';

// The gate itself is tested in app-kit. These tests cover what this app passes to it.

const replace = vi.fn();
let sessionState: { data: Session | null; status: 'loading' | 'authenticated' | 'unauthenticated' };

vi.mock('next/navigation', () => ({
    useRouter: () => ({ replace, push: vi.fn() }),
    usePathname: () => '/admin/dyno-runs',
}));

vi.mock('next-auth/react', () => ({
    useSession: () => sessionState,
}));

const gate = () => (
    <ProtectedGate>
        <p>admin work</p>
    </ProtectedGate>
);

describe('ProtectedGate', () => {
    beforeEach(() => {
        replace.mockClear();
    });

    it('shows the loading text while the session loads', () => {
        sessionState = { data: null, status: 'loading' };
        render(gate());

        expect(screen.getByText('Loading…')).toBeInTheDocument();
        expect(screen.queryByText('admin work')).not.toBeInTheDocument();
    });

    it('sends a signed-out visitor to /login', () => {
        sessionState = { data: null, status: 'unauthenticated' };
        render(gate());

        expect(replace).toHaveBeenCalledWith('/login');
    });

    it('renders the page for a healthy session', () => {
        sessionState = {
            data: { user: { id: '1', name: 'admin', email: 'a@b.no', roles: ['Admin'] }, accessToken: 'token', expires: '' },
            status: 'authenticated',
        };
        render(gate());

        expect(screen.getByText('admin work')).toBeInTheDocument();
    });
});
