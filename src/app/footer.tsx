"use client";

import Link from 'next/link';
import { useBranding } from '@/components/BrandingProvider';

export default function Footer() {
    const year = new Date().getFullYear();
    const { logoUrl } = useBranding();
    return (
        <footer className="border-t border-gray-200 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                    {logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={logoUrl} alt="NS Tuning" className="h-7 w-auto" />
                    ) : (
                        <>
                            <span className="inline-flex items-center justify-center h-7 px-2 rounded-md bg-primary text-primary-foreground font-extrabold text-sm">
                                NS
                            </span>
                            <span className="text-sm font-semibold text-gray-900">NS Tuning</span>
                            <span className="text-sm text-gray-500">— Nordmark Service</span>
                        </>
                    )}
                </div>

                <nav className="flex items-center gap-4 text-sm text-gray-600">
                    <Link href="/dyno-runs" className="hover:text-gray-900">Dyno runs</Link>
                    <Link href="/contact" className="hover:text-gray-900">Contact</Link>
                </nav>

                <p className="text-xs text-gray-400">
                    © {year} NS Tuning · Created by{' '}
                    <span className="text-gray-500">Sjølyst Innovations</span>
                </p>
            </div>
        </footer>
    );
}
