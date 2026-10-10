"use client";

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ADMIN_ROLE } from '@/lib/roles';
import { RoleGate } from '@sjolystinnovation/app-kit/session/react';

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
    const pathname = usePathname();

    return (
        <RoleGate role={ADMIN_ROLE} fallback={<div className="max-w-5xl mx-auto px-4 sm:px-6 py-20 text-center text-gray-500">Loading…</div>} deniedHref={'/'}>
            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
                <h1 className="text-2xl font-black text-gray-900 mb-4">Admin</h1>
                <nav className="flex gap-1 border-b border-gray-200 mb-8 overflow-x-auto overflow-y-hidden no-scrollbar">
                    {tabs.map(tab => {
                        const active = pathname === tab.href;
                        return (
                            <Link
                                key={tab.href}
                                href={tab.href}
                                className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors shrink-0 whitespace-nowrap ${
                                    active ? 'border-primary text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-900'
                                }`}
                            >
                                {tab.label}
                            </Link>
                        );
                    })}
                </nav>
                {children}
            </div>
        </RoleGate>
    );
}
