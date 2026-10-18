import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import AdminUsersPage from '@/app/(protected)/admin/users/page';
import { resetTestMocks, toastSpies } from '@sjolystinnovation/app-kit/testing';

const { get } = vi.hoisted(() => ({ get: vi.fn() }));

vi.mock('@/services/axiosInstance', () => ({ default: { get, post: vi.fn(), delete: vi.fn() } }));
vi.mock('@sjolystinnovation/app-kit/toast', async () => (await import('@sjolystinnovation/app-kit/testing')).toastMock());

const users = [{ id: 'u1', userName: 'ola@nstuning.invalid', email: 'ola@nstuning.invalid', firstName: 'Ola', lastName: 'Nordmann', roles: ['Default'], isDeleted: false }];

describe('admin users page', () => {
    beforeEach(() => {
        get.mockReset();
        resetTestMocks();
    });

    it("loads the roles from the user admin endpoints' roles route", async () => {
        get.mockImplementation(async (url: string) => {
            if (url === '/users') return { data: users };
            if (url === '/users/roles') return { data: ['Default', 'Admin', 'Mechanic'] };
            throw new Error(`unexpected ${url}`);
        });
        render(<AdminUsersPage />);

        await waitFor(() => expect(screen.getAllByRole('option', { name: 'Mechanic' }).length).toBeGreaterThan(0));
        expect(get).toHaveBeenCalledWith('/users/roles');
        expect(get).not.toHaveBeenCalledWith('/admin/roles');
    });

    it('says the roles could not load when the roles route fails', async () => {
        get.mockImplementation(async (url: string) => {
            if (url === '/users') return { data: users };
            throw new Error('Failed to load roles');
        });
        render(<AdminUsersPage />);

        await waitFor(() => expect(toastSpies.error).toHaveBeenCalled());
    });
});
