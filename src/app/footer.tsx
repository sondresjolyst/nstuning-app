"use client";

import Link from 'next/link';
import { useBranding } from '@/components/BrandingProvider';
import { COMPANY } from '@/lib/company';

export default function Footer() {
    const year = new Date().getFullYear();
    const { logoUrl } = useBranding();
    return (
        <footer className="border-t border-gray-200 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                    {logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={logoUrl} alt={COMPANY.name} className="h-7 w-auto" />
                    ) : (
                        <>
                            <span className="inline-flex items-center justify-center h-7 px-2 rounded-md bg-primary text-primary-foreground font-extrabold text-sm">
                                NS
                            </span>
                            <span className="text-sm font-semibold text-gray-900">{COMPANY.name}</span>
                            <span className="text-sm text-gray-500">— {COMPANY.legalName}</span>
                        </>
                    )}
                </div>

                <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm text-gray-600">
                    <Link href="/contact" className="hover:text-gray-900">Contact</Link>
                    <Link href="/terms" className="hover:text-gray-900">Terms of Service</Link>
                    <Link href="/privacy" className="hover:text-gray-900">Privacy Policy</Link>
                    <Link href="/cookies" className="hover:text-gray-900">Cookie Policy</Link>
                </nav>

                <p className="text-xs text-gray-400">
                    © {year} {COMPANY.name} · Created by{' '}
                    <span className="text-gray-500">Sjølyst Innovations</span>
                </p>
            </div>
        </footer>
    );
}
