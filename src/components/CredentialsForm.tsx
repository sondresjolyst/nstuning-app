"use client";

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import TextInput from './TextInput';
import { SIGN_IN_ERRORS } from '@sjolystinnovation/app-kit/session';
import { Alert, PasswordInput } from '@sjolystinnovation/app-kit/ui';

/** Thrown by an onSignedIn handler when the message is meant for the user to read. */
export class SignInRejected extends Error {}

interface CredentialsFormProps {
    initialEmail?: string;
    /** Runs after next-auth has accepted the credentials. Throw SignInRejected to report why. */
    onSignedIn: () => void | Promise<void>;
    children?: React.ReactNode;
}

/** The email and password pair, shared by the login page and the re-sign-in prompt. */
export default function CredentialsForm({ initialEmail = '', onSignedIn, children }: CredentialsFormProps) {
    const [email, setEmail] = useState(initialEmail);
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSubmitting(true);
        try {
            const result = await signIn('credentials', { email, password, redirect: false });
            if (result?.error) {
                setError(result.error === SIGN_IN_ERRORS.unavailable ? 'Sign-in is unavailable right now. Try again shortly.' : 'Invalid email or password.');
                return;
            }
            await onSignedIn();
            setPassword('');
        } catch (err) {
            setError(err instanceof SignInRejected ? err.message : 'Something went wrong');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && <Alert variant="error">{error}</Alert>}
            <TextInput
                label="Email"
                name="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
            />
            <PasswordInput
                label="Password"
                name="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
            />
            <div className="flex gap-2">
                <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 rounded-lg bg-primary text-primary-foreground font-semibold py-2.5 hover:brightness-95 disabled:opacity-60 transition"
                >
                    {submitting ? 'Signing in…' : 'Sign in'}
                </button>
                {children}
            </div>
        </form>
    );
}
