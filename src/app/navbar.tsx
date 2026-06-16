"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { ArrowRightStartOnRectangleIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { useBranding } from '@/components/BrandingProvider';
import { ADMIN_ROLE } from '@/lib/roles';
import { COMPANY } from '@/lib/company';

export default function Navbar() {
    const { data: session, status } = useSession();
    const isAuthenticated = status === 'authenticated';
    const isAdmin = (session?.user?.roles ?? []).includes(ADMIN_ROLE);
    const { logoUrl } = useBranding();
    const pathname = usePathname();
    const [open, setOpen] = useState(false);

    const close = () => setOpen(false);

    const links = [
        { href: '/dyno-runs', label: 'Dyno runs' },
        { href: '/contact', label: 'Contact' },
        ...(isAuthenticated
            ? [
                  ...(isAdmin ? [{ href: '/admin', label: 'Admin' }] : []),
                  { href: '/profile', label: 'Account' },
              ]
            : []),
    ];

    const linkClass = (href: string) =>
        `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            pathname === href
                ? 'text-gray-900 bg-gray-100'
                : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
        }`;

    return (
        <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-gray-200">
            <div className="px-4 sm:px-6 py-3 flex items-center justify-between gap-2 max-w-7xl mx-auto">

                <Link href="/" onClick={close} className="flex items-center gap-2.5 shrink-0">
                    {logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={logoUrl} alt={COMPANY.name} className="h-8 w-auto max-w-[160px] object-contain" />
                    ) : (
                        <>
                            <span className="inline-flex items-center justify-center h-8 px-2.5 rounded-md bg-primary text-primary-foreground font-extrabold tracking-tight">
                                NS
                            </span>
                            <span className="text-sm font-bold tracking-wide text-gray-900">
                                {COMPANY.name}
                            </span>
                        </>
                    )}
                </Link>

                {/* Desktop nav */}
                <nav className="hidden md:flex items-center gap-1">
                    {links.map(l => (
                        <Link key={l.href} href={l.href} className={linkClass(l.href)}>
                            {l.label}
                        </Link>
                    ))}
                    {isAuthenticated ? (
                        <button
                            onClick={() => signOut({ callbackUrl: '/' })}
                            title="Sign out"
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                        >
                            <ArrowRightStartOnRectangleIcon className="h-4 w-4" />
                            <span>Sign out</span>
                        </button>
                    ) : (
                        <>
                            <Link href="/login" className={linkClass('/login')}>
                                Sign in
                            </Link>
                            <Link href="/register" className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-primary text-primary-foreground hover:brightness-95 transition">
                                Create account
                            </Link>
                        </>
                    )}
                </nav>

                {/* Mobile hamburger */}
                <button
                    onClick={() => setOpen(o => !o)}
                    aria-label={open ? 'Close menu' : 'Open menu'}
                    aria-expanded={open}
                    className="md:hidden flex items-center justify-center h-9 w-9 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors shrink-0"
                >
                    {open ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
                </button>
            </div>

            {/* Mobile menu */}
            {open && (
                <nav className="md:hidden border-t border-gray-200 bg-white px-4 py-2 flex flex-col gap-1">
                    {links.map(l => (
                        <Link key={l.href} href={l.href} onClick={close} className={`${linkClass(l.href)} w-full`}>
                            {l.label}
                        </Link>
                    ))}
                    {isAuthenticated ? (
                        <button
                            onClick={() => {
                                close();
                                signOut({ callbackUrl: '/' });
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors w-full"
                        >
                            <ArrowRightStartOnRectangleIcon className="h-4 w-4" />
                            <span>Sign out</span>
                        </button>
                    ) : (
                        <>
                            <Link href="/login" onClick={close} className={`${linkClass('/login')} w-full`}>
                                Sign in
                            </Link>
                            <Link href="/register" onClick={close} className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-primary text-primary-foreground hover:brightness-95 transition w-full text-center">
                                Create account
                            </Link>
                        </>
                    )}
                </nav>
            )}
        </header>
    );
}
