"use client";

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import TextInput from '@/components/TextInput';
import PasswordInput from '@/components/PasswordInput';
import Alert from '@/components/Alert';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSubmitting(true);
        const result = await signIn('credentials', { email, password, redirect: false });
        setSubmitting(false);
        if (result?.error) {
            setError('Invalid email or password.');
            return;
        }
        router.push('/');
        router.refresh();
    };

    return (
        <div className="max-w-md mx-auto px-4 py-16">
            <h1 className="text-2xl font-black text-gray-900 mb-6">Sign in</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && <Alert variant="error">{error}</Alert>}
                <TextInput label="Email" name="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                <PasswordInput label="Password" name="password" value={password} onChange={e => setPassword(e.target.value)} required />
                <button
                    type="submit"
                    disabled={submitting}
                    className="w-full rounded-lg bg-primary text-primary-foreground font-semibold py-2.5 hover:brightness-95 disabled:opacity-60 transition"
                >
                    {submitting ? 'Signing in…' : 'Sign in'}
                </button>
            </form>
            <p className="mt-6 text-sm text-gray-600">
                <Link href="/reset-password" className="font-semibold text-gray-900">Forgot your password?</Link>
            </p>
            <p className="mt-2 text-sm text-gray-600">
                No account? <Link href="/register" className="font-semibold text-gray-900">Create one</Link>
            </p>
        </div>
    );
}
