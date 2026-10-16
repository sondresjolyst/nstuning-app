import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CredentialsForm } from '@sjolystinnovation/app-kit/ui';
import { auth, resetTestMocks } from '@sjolystinnovation/app-kit/testing';

vi.mock('next-auth/react', async () => (await import('@sjolystinnovation/app-kit/testing')).nextAuthMock());

beforeEach(resetTestMocks);

async function submitWith(error: string) {
    auth.signIn.mockResolvedValue({ error });
    render(<CredentialsForm initialEmail="a@b.no" onSignedIn={() => {}} />);
    await userEvent.type(screen.getByLabelText(/^Password/), 'pw');
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));
}

describe('CredentialsForm on a failed sign-in', () => {
    it('says the API is unavailable when it is', async () => {
        await submitWith('SignInUnavailable');

        expect(await screen.findByText('Sign-in is unavailable right now. Try again shortly.')).toBeInTheDocument();
    });

    it('says the credentials are wrong for any other failure', async () => {
        await submitWith('InvalidCredentials');

        expect(await screen.findByText('Invalid email or password.')).toBeInTheDocument();
    });
});
