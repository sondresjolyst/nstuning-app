"use client";

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useSessionGate } from '@/lib/useSessionGate';

export default function ProtectedGate({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const { status, promptOpen, usable, wasUsable, mayRender } = useSessionGate();

    useEffect(() => {
        // A session that is already dead when the page opens must not render the protected UI:
        // the user would start work they cannot save. One that dies later keeps the page, and
        // SessionExpiryGuard offers a sign-in that leaves the form and its draft intact, so
        // never redirect out from under that prompt.
        if (promptOpen) return;
        if (status === 'unauthenticated' || (status === 'authenticated' && !usable && !wasUsable)) {
            router.push('/login');
        }
    }, [status, usable, wasUsable, promptOpen, router]);

    if (!mayRender) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-20 text-center text-gray-500">Loading…</div>
        );
    }

    return <>{children}</>;
}
