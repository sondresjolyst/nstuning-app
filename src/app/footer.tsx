"use client";

import Link from 'next/link';
import { useBranding } from '@sjolystinnovation/app-kit/branding';
import { brregUrl } from '@sjolystinnovation/app-kit/company';
import { formatOrgNumber, type CompanyInfo } from '@/lib/companyInfo';
import { mailtoHref, telHref } from '@/lib/contactLinks';

const linkClass = 'underline underline-offset-4 hover:text-gray-900';

function MaybeLink({ href, children }: { href: string | null; children: string }) {
    return href ? <a href={href} className={linkClass}>{children}</a> : <span>{children}</span>;
}

// Ehandelsloven § 8 wants the name, address, email, register, org number and VAT status easy to find.
export default function Footer({ company }: { company: CompanyInfo }) {
    const year = new Date().getFullYear();
    const { logoUrl } = useBranding();
    const legalName = company.legalName || company.name;
    const registerUrl = brregUrl(company.orgNumber);
    const contact = [
        company.address && <span key="address">{company.address}</span>,
        company.email && <MaybeLink key="email" href={mailtoHref(company.email)}>{company.email}</MaybeLink>,
        company.phone && <MaybeLink key="phone" href={telHref(company.phone)}>{company.phone}</MaybeLink>,
    ].filter(Boolean);

    return (
        <footer className="border-t border-gray-200 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                    {logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={logoUrl} alt={company.name} className="h-7 w-auto" />
                    ) : (
                        <>
                            <span className="inline-flex items-center justify-center h-7 px-2 rounded-md bg-primary text-primary-foreground font-extrabold text-sm">
                                NS
                            </span>
                            <span className="text-sm font-semibold text-gray-900">{company.name}</span>
                            <span className="text-sm text-gray-500">— {legalName}</span>
                        </>
                    )}
                </div>

                <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm text-gray-600">
                    <Link href="/contact" className="hover:text-gray-900">Contact</Link>
                    <Link href="/terms" className="hover:text-gray-900">Terms of Service</Link>
                    <Link href="/privacy" className="hover:text-gray-900">Privacy Policy</Link>
                    <Link href="/cookies" className="hover:text-gray-900">Cookie Policy</Link>
                </nav>

                <div className="min-w-0 max-w-full space-y-0.5 text-center text-xs text-gray-600 break-words sm:text-right">
                    <p>
                        © {year} {legalName}
                        <span aria-hidden="true"> · </span>
                        Created by{' '}
                        <a href="https://www.sjolystinnovation.no/" target="_blank" rel="noopener noreferrer" className={linkClass}>
                            Sjølyst Innovation AS
                        </a>
                    </p>
                    {company.orgNumber && (
                        <p>
                            {/* Foretaksregisterloven § 10-2 wants the register next to the org number. */}
                            Org.nr.{' '}
                            {registerUrl ? (
                                <a href={registerUrl} target="_blank" rel="noopener noreferrer" className={linkClass}>
                                    {formatOrgNumber(company)}
                                </a>
                            ) : (
                                <span>{formatOrgNumber(company)}</span>
                            )}{' '}
                            Foretaksregisteret
                            {!company.vatRegistered && (
                                <>
                                    <span aria-hidden="true"> · </span>
                                    Not VAT registered
                                </>
                            )}
                        </p>
                    )}
                    {contact.length > 0 && (
                        <p>
                            {contact.flatMap((item, i) => (i === 0 ? [item] : [<span key={`sep-${i}`} aria-hidden="true"> · </span>, item]))}
                        </p>
                    )}
                </div>
            </div>
        </footer>
    );
}
