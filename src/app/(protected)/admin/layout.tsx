"use client";

import { ADMIN_ROLE } from '@/lib/roles';
import { AdminShell } from '@sjolystinnovation/app-kit/admin';

const tabs = [
    { href: '/admin', label: 'Overview' },
    { href: '/admin/content', label: 'Content' },
    { href: '/admin/dyno-runs', label: 'Dyno runs' },
    { href: '/admin/vehicles', label: 'Vehicles' },
    { href: '/admin/stats', label: 'Stats' },
    { href: '/admin/users', label: 'Users' },
    { href: '/admin/settings', label: 'Settings' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <AdminShell
            role={ADMIN_ROLE}
            title="Admin"
            tabs={tabs}
            fallback={<div className="max-w-5xl mx-auto px-4 sm:px-6 py-20 text-center text-gray-500">Loading…</div>}
            deniedHref="/"
        >
            {children}
        </AdminShell>
    );
}
