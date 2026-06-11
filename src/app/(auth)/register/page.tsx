"use client";

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import TextInput from '@/components/TextInput';
import PasswordInput from '@/components/PasswordInput';
import Alert from '@/components/Alert';
import UserService from '@/services/userService';
import { registerSchema, RegisterInput } from '@/lib/validation';

const empty: RegisterInput = { userName: '', firstName: '', lastName: '', email: '', password: '' };

export default function RegisterPage() {
    const router = useRouter();
    const [form, setForm] = useState<RegisterInput>(empty);
    const [errors, setErrors] = useState<Partial<Record<keyof RegisterInput, string>>>({});
    const [formError, setFormError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const update = (field: keyof RegisterInput) => (e: React.ChangeEvent<HTMLInputElement>) =>
        setForm(f => ({ ...f, [field]: e.target.value }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);
        const parsed = registerSchema.safeParse(form);
        if (!parsed.success) {
            const fieldErrors: Partial<Record<keyof RegisterInput, string>> = {};
            for (const issue of parsed.error.issues) {
                const key = issue.path[0] as keyof RegisterInput;
                fieldErrors[key] ??= issue.message;
            }
            setErrors(fieldErrors);
            return;
        }
        setErrors({});
        setSubmitting(true);
        try {
            await UserService.register(parsed.data);
            const result = await signIn('credentials', { email: form.email, password: form.password, redirect: false });
            if (result?.error) {
                router.push('/login');
                return;
            }
            router.push('/');
            router.refresh();
        } catch (err) {
            setFormError(err instanceof Error ? err.message : 'Failed to register');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-md mx-auto px-4 py-16">
            <h1 className="text-2xl font-black text-gray-900 mb-6">Create account</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                {formError && <Alert variant="error">{formError}</Alert>}
                <TextInput label="Username" name="userName" value={form.userName} onChange={update('userName')} error={errors.userName} required />
                <div className="grid grid-cols-2 gap-4">
                    <TextInput label="First name" name="firstName" value={form.firstName} onChange={update('firstName')} error={errors.firstName} required />
                    <TextInput label="Last name" name="lastName" value={form.lastName} onChange={update('lastName')} error={errors.lastName} required />
                </div>
                <TextInput label="Email" name="email" type="email" value={form.email} onChange={update('email')} error={errors.email} required />
                <PasswordInput label="Password" name="password" value={form.password} onChange={update('password')} error={errors.password} required />
                <button
                    type="submit"
                    disabled={submitting}
                    className="w-full rounded-lg bg-primary text-primary-foreground font-semibold py-2.5 hover:brightness-95 disabled:opacity-60 transition"
                >
                    {submitting ? 'Creating…' : 'Create account'}
                </button>
            </form>
            <p className="mt-6 text-sm text-gray-600">
                Already have an account? <Link href="/login" className="font-semibold text-gray-900">Sign in</Link>
            </p>
        </div>
    );
}
