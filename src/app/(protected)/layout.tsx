import SessionExpiryGuard from '@/components/SessionExpiryGuard';
import ProtectedGate from './ProtectedGate';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <ProtectedGate>{children}</ProtectedGate>
            <SessionExpiryGuard />
        </>
    );
}
