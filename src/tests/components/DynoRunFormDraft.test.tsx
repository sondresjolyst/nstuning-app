import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DynoRunForm from '@/app/(protected)/admin/dyno-runs/DynoRunForm';

const USER_ID = 'user-1';
const KEY = `nstuning:draft:${USER_ID}:dyno-run:new`;

let sessionState: { data: unknown; status: string } = {
    data: { user: { id: USER_ID, name: 'admin', email: 'a@b.no', roles: ['Admin'] }, accessToken: 't', expires: '' },
    status: 'authenticated',
};

vi.mock('next-auth/react', () => ({
    useSession: () => sessionState,
}));

const authenticated = () => ({
    data: { user: { id: USER_ID, name: 'admin', email: 'a@b.no', roles: ['Admin'] }, accessToken: 't', expires: '' },
    status: 'authenticated',
});

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

vi.mock('@/services/vehicleService', () => ({
    default: { getTree: async () => ({ brands: [], engines: [] }) },
}));

const createRun = vi.fn();

vi.mock('@/services/dynoRunService', () => ({
    default: { create: (...args: unknown[]) => createRun(...args), update: vi.fn() },
    coverImageSrc: () => null,
}));

const draft = {
    title: 'Supra dyno day',
    carMake: 'Toyota',
    carModel: 'Supra',
    trim: '',
    year: '1998',
    engine: '2JZ-GTE',
    fuelType: 'Petrol',
    dynoDate: '2024-05-01',
    displacementCc: '3000',
    absolutePressureKpa: '100',
    hubPowerBeforeWhp: '280',
    hubPowerAfterWhp: '320',
    hubTorqueBeforeWnm: '400',
    hubTorqueAfterWnm: '450',
    enginePowerBeforeHp: '330',
    enginePowerAfterHp: '380',
    engineTorqueBeforeNm: '430',
    engineTorqueAfterNm: '480',
    description: 'A short writeup of the run.',
    sortOrder: '0',
    published: false,
};

const form = () => <DynoRunForm onSaved={vi.fn()} onCancel={vi.fn()} />;

describe('the dyno run form draft bar', () => {
    beforeEach(() => {
        window.localStorage.clear();
        sessionState = authenticated();
    });

    it('stays out of the way when there is no draft', async () => {
        render(form());

        expect(await screen.findByText('New dyno run')).toBeInTheDocument();
        expect(screen.queryByText('You have an unsaved draft.')).not.toBeInTheDocument();
    });

    it('offers an unsaved draft without applying it', async () => {
        window.localStorage.setItem(KEY, JSON.stringify({ savedAt: Date.now(), value: draft }));
        render(form());

        expect(await screen.findByText('You have an unsaved draft.')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Restore draft' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Discard draft' })).toBeInTheDocument();
        // Offered, not applied: the form behind it is still empty.
        expect(screen.getByLabelText(/^Title/)).toHaveValue('');
    });

    it('fills the form in from the draft when the user restores it', async () => {
        window.localStorage.setItem(KEY, JSON.stringify({ savedAt: Date.now(), value: draft }));
        render(form());

        await userEvent.click(await screen.findByRole('button', { name: 'Restore draft' }));

        expect(screen.getByLabelText(/^Title/)).toHaveValue('Supra dyno day');
        expect(screen.getByDisplayValue('A short writeup of the run.')).toBeInTheDocument();
        expect(screen.queryByText('You have an unsaved draft.')).not.toBeInTheDocument();
    });

    it('throws the draft away when the user discards it', async () => {
        window.localStorage.setItem(KEY, JSON.stringify({ savedAt: Date.now(), value: draft }));
        render(form());

        await userEvent.click(await screen.findByRole('button', { name: 'Discard draft' }));

        expect(window.localStorage.getItem(KEY)).toBeNull();
        expect(screen.getByLabelText(/^Title/)).toHaveValue('');
    });

    it('does not offer a draft stored for a different dyno run', async () => {
        window.localStorage.setItem(
            `nstuning:draft:${USER_ID}:dyno-run:42`,
            JSON.stringify({ savedAt: Date.now(), value: draft }),
        );
        render(form());

        expect(await screen.findByText('New dyno run')).toBeInTheDocument();
        expect(screen.queryByText('You have an unsaved draft.')).not.toBeInTheDocument();
    });

    it('keeps saving when the session cookie disappears mid-edit', async () => {
        const view = render(form());
        await userEvent.type(screen.getByLabelText(/^Title/), 'Supra');

        // The cookie is gone, so useSession reports nobody on the form already on screen. This
        // is the incident the draft exists for, and the worst possible moment to stop storing.
        sessionState = { data: null, status: 'unauthenticated' };
        view.rerender(form());
        await userEvent.type(screen.getByLabelText(/^Title/), ' dyno day');

        await vi.waitFor(() => expect(window.localStorage.getItem(KEY)).not.toBeNull());
        expect(JSON.parse(window.localStorage.getItem(KEY)!).value.title).toBe('Supra dyno day');
    });

    it('stores nothing on a form opened with no session at all', async () => {
        sessionState = { data: null, status: 'unauthenticated' };
        render(form());

        await userEvent.type(screen.getByLabelText(/^Title/), 'Supra');
        await new Promise(resolve => setTimeout(resolve, 700));

        // No owner was ever known here, so there is no key that could not belong to someone else.
        expect(window.localStorage.length).toBe(0);
    });

    it('keeps a field the stored draft predates', async () => {
        // Drafts are kept for a week, so one can easily predate a newly added field. Replacing
        // the whole state would send the literal string "undefined" for the missing key.
        const { published: _dropped, ...older } = draft;
        window.localStorage.setItem(KEY, JSON.stringify({ savedAt: Date.now(), value: older }));
        render(form());

        await userEvent.click(await screen.findByRole('button', { name: 'Restore draft' }));
        await userEvent.click(screen.getByRole('button', { name: 'Create' }));

        const sent = createRun.mock.calls[0][0] as FormData;
        expect(sent.get('Published')).toBe('false');
    });
});
