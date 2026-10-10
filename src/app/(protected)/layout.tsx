import type { Metadata } from 'next';
import SessionExpiryGuard from '@/components/SessionExpiryGuard';
import ProtectedGate from './ProtectedGate';

// Account and admin pages are not for search results. A robots.txt rule alone does not deindex.
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <ProtectedGate>{children}</ProtectedGate>
            <SessionExpiryGuard />
        </>
    );
}
