import type { Metadata } from "next";
import Link from "next/link";
import { COMPANY } from "@/lib/company";

export const metadata: Metadata = {
    title: "Terms of Service",
    description: `Terms of Service for ${COMPANY.name} (${COMPANY.legalName}).`,
    alternates: { canonical: "/terms" },
};

export default function TermsPage() {
    return (
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 space-y-6">
            <h1 className="text-3xl font-black text-gray-900">Terms of Service</h1>
            <p className="text-xs text-gray-500">Last updated: June 2026</p>

            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-6 text-sm text-gray-600 leading-relaxed">
                <section className="space-y-2">
                    <h2 className="text-base font-semibold text-gray-900">1. About us</h2>
                    <p>This website is operated by:</p>
                    <ul className="list-none space-y-0.5 pl-2">
                        <li><span className="text-gray-900">Company name:</span> {COMPANY.legalName}</li>
                        {COMPANY.orgNumber && <li><span className="text-gray-900">Organisation number:</span> {COMPANY.orgNumber}</li>}
                        {COMPANY.address && <li><span className="text-gray-900">Address:</span> {COMPANY.address}</li>}
                        {COMPANY.email && <li><span className="text-gray-900">Email:</span> {COMPANY.email}</li>}
                    </ul>
                </section>

                <section className="space-y-2">
                    <h2 className="text-base font-semibold text-gray-900">2. Acceptance of terms</h2>
                    <p>By using {COMPANY.name} you agree to these terms. If you do not agree, please do not use the site.</p>
                </section>

                <section className="space-y-2">
                    <h2 className="text-base font-semibold text-gray-900">3. Use of the service</h2>
                    <p>{COMPANY.name} provides information about our dyno and performance tuning, documented dyno run reports, and the ability to create an account and contact us. You are responsible for keeping your login credentials secure.</p>
                </section>

                <section className="space-y-2">
                    <h2 className="text-base font-semibold text-gray-900">4. Intellectual property</h2>
                    <p>All content on this site — including dyno run reports, graphs, text, images, and the {COMPANY.name} name and logo — is owned by {COMPANY.legalName}. You may view it for personal, non-commercial use. You may not republish, resell, or redistribute it without our written permission.</p>
                </section>

                <section className="space-y-2">
                    <h2 className="text-base font-semibold text-gray-900">5. Enquiries and tuning work</h2>
                    <p>Submitting the contact form is a request — it is not a binding agreement. Any tuning work, including its scope and price, is agreed directly between you and {COMPANY.legalName}.</p>
                </section>

                <section className="space-y-2">
                    <h2 className="text-base font-semibold text-gray-900">6. Results</h2>
                    <p>Dyno figures and results shown on this site relate to specific vehicles under specific conditions and are not a guarantee of the results for any other vehicle. Modifying a vehicle may affect its warranty, road-legal status, and insurance — you are responsible for ensuring any work complies with applicable rules.</p>
                </section>

                <section className="space-y-2">
                    <h2 className="text-base font-semibold text-gray-900">7. Availability</h2>
                    <p>We aim for high availability but do not guarantee uninterrupted access. The service may be updated or taken offline for maintenance at any time.</p>
                </section>

                <section className="space-y-2">
                    <h2 className="text-base font-semibold text-gray-900">8. Data and privacy</h2>
                    <p>See our <Link href="/privacy" className="font-medium text-gray-900 underline hover:text-gray-600">Privacy Policy</Link> for how we collect, use, and protect your personal data, and our <Link href="/cookies" className="font-medium text-gray-900 underline hover:text-gray-600">Cookie Policy</Link> for cookies.</p>
                </section>

                <section className="space-y-2">
                    <h2 className="text-base font-semibold text-gray-900">9. Governing law</h2>
                    <p>Norwegian law applies to these terms. Disputes that cannot be resolved directly may be brought before the Norwegian courts.</p>
                </section>

                <section className="space-y-2">
                    <h2 className="text-base font-semibold text-gray-900">10. Changes to terms</h2>
                    <p>We may update these terms from time to time. The current version always applies, with the date shown above.</p>
                </section>

                <section className="space-y-2">
                    <h2 className="text-base font-semibold text-gray-900">11. Contact</h2>
                    <p>Questions about these terms? <Link href="/contact" className="font-medium text-gray-900 underline hover:text-gray-600">Contact us</Link>.</p>
                </section>
            </div>

            <p className="text-xs text-gray-500">
                <Link href="/" className="hover:text-gray-900 transition-colors">← Back to home</Link>
            </p>
        </div>
    );
}
