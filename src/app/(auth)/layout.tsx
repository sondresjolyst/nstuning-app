import type { Metadata } from 'next';

// Sign-in pages are not for search results. A robots.txt rule alone does not deindex.
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return children;
}
