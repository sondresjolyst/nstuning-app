"use client";

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import CredentialsForm from '@/components/CredentialsForm';

export default function LoginPage() {
    const router = useRouter();

    return (
        <div className="max-w-md mx-auto px-4 py-16">
            <h1 className="text-2xl font-black text-gray-900 mb-6">Sign in</h1>
            <CredentialsForm
                onSignedIn={() => {
                    router.push('/');
                    router.refresh();
                }}
            />
            <p className="mt-6 text-sm text-gray-600">
                <Link href="/reset-password" className="font-semibold text-gray-900">Forgot your password?</Link>
            </p>
            <p className="mt-2 text-sm text-gray-600">
                No account? <Link href="/register" className="font-semibold text-gray-900">Create one</Link>
            </p>
        </div>
    );
}
