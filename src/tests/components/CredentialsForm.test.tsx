import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CredentialsForm from '@/components/CredentialsForm';

const signIn = vi.fn();

vi.mock('next-auth/react', () => ({
    signIn: (...args: unknown[]) => signIn(...args),
}));

async function submitWith(error: string) {
    signIn.mockResolvedValue({ error });
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
