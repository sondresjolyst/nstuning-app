"use client";

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
    const { status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        }
    }, [status, router]);

    if (status === 'loading' || status === 'unauthenticated') {
        return (
            <div className="max-w-7xl mx-auto px-4 py-20 text-center text-gray-500">Loading…</div>
        );
    }

    return <>{children}</>;
}
