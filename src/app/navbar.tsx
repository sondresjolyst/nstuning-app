"use client";

import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import { ArrowRightStartOnRectangleIcon } from '@heroicons/react/24/outline';
import { useBranding } from '@/components/BrandingProvider';
import { ADMIN_ROLE } from '@/lib/roles';
import { COMPANY } from '@/lib/company';

export default function Navbar() {
    const { data: session, status } = useSession();
    const isAuthenticated = status === 'authenticated';
    const isAdmin = (session?.user?.roles ?? []).includes(ADMIN_ROLE);
    const { logoUrl } = useBranding();

    return (
        <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-gray-200">
            <div className="px-4 sm:px-6 py-3 flex items-center justify-between max-w-7xl mx-auto">

                <Link href="/" className="flex items-center gap-2.5">
                    {logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={logoUrl} alt={COMPANY.name} className="h-8 w-auto" />
                    ) : (
                        <>
                            <span className="inline-flex items-center justify-center h-8 px-2.5 rounded-md bg-primary text-primary-foreground font-extrabold tracking-tight">
                                NS
                            </span>
                            <span className="text-sm font-bold tracking-wide text-gray-900 hidden sm:block">
                                {COMPANY.name}
                            </span>
                        </>
                    )}
                </Link>

                <nav className="flex items-center gap-1 sm:gap-2">
                    <Link href="/dyno-runs" className="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors">
                        Dyno runs
                    </Link>
                    <Link href="/contact" className="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors">
                        Contact
                    </Link>

                    {isAuthenticated ? (
                        <>
                            {isAdmin && (
                                <Link href="/admin" className="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors">
                                    Admin
                                </Link>
                            )}
                            <Link href="/profile" className="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors">
                                Account
                            </Link>
                            <button
                                onClick={() => signOut({ callbackUrl: '/' })}
                                title="Sign out"
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                            >
                                <ArrowRightStartOnRectangleIcon className="h-4 w-4" />
                                <span className="hidden sm:block">Sign out</span>
                            </button>
                        </>
                    ) : (
                        <>
                            <Link href="/login" className="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors">
                                Sign in
                            </Link>
                            <Link href="/register" className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-primary text-primary-foreground hover:brightness-95 transition">
                                Create account
                            </Link>
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
}
