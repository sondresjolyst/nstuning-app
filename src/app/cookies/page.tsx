import type { Metadata } from "next";
import Link from "next/link";
import { COMPANY } from "@/lib/company";

export const metadata: Metadata = {
    title: "Cookie Policy",
    description: `How ${COMPANY.name} uses cookies.`,
    alternates: { canonical: "/cookies" },
};

export default function CookiesPage() {
    return (
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 space-y-6">
            <h1 className="text-3xl font-black text-gray-900">Cookie Policy</h1>
            <p className="text-xs text-gray-500">Last updated: June 2026</p>

            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-6 text-sm text-gray-600 leading-relaxed">
                <section className="space-y-2">
                    <h2 className="text-base font-semibold text-gray-900">What are cookies?</h2>
                    <p>Cookies are small text files stored in your browser. They help a site remember your session between requests.</p>
                </section>

                <section className="space-y-2">
                    <h2 className="text-base font-semibold text-gray-900">Cookies we use</h2>
                    <p>Browsing the site sets no tracking or advertising cookies. The cookies below are only set when you sign in to an account.</p>
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs border-collapse">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left py-2 pr-4 text-gray-900 font-semibold">Name</th>
                                    <th className="text-left py-2 pr-4 text-gray-900 font-semibold">Purpose</th>
                                    <th className="text-left py-2 text-gray-900 font-semibold">Duration</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                <tr>
                                    <td className="py-2 pr-4 text-gray-900 font-mono">next-auth.session-token</td>
                                    <td className="py-2 pr-4">Keeps you signed in</td>
                                    <td className="py-2">Session / 30 days</td>
                                </tr>
                                <tr>
                                    <td className="py-2 pr-4 text-gray-900 font-mono">next-auth.csrf-token</td>
                                    <td className="py-2 pr-4">Security — prevents cross-site request forgery</td>
                                    <td className="py-2">Session</td>
                                </tr>
                                <tr>
                                    <td className="py-2 pr-4 text-gray-900 font-mono">next-auth.callback-url</td>
                                    <td className="py-2 pr-4">Remembers where to redirect after login</td>
                                    <td className="py-2">Session</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>

                <section className="space-y-2">
                    <h2 className="text-base font-semibold text-gray-900">Third-party cookies</h2>
                    <p>We do not use any third-party analytics, advertising, or tracking cookies.</p>
                </section>

                <section className="space-y-2">
                    <h2 className="text-base font-semibold text-gray-900">Managing cookies</h2>
                    <p>You can clear or block cookies through your browser settings. Blocking the cookies above only affects staying signed in; the rest of the site works without them.</p>
                </section>

                <section className="space-y-2">
                    <h2 className="text-base font-semibold text-gray-900">Questions?</h2>
                    <p><Link href="/contact" className="font-medium text-gray-900 underline hover:text-gray-600">Contact us</Link> if you have any questions about how we use cookies.</p>
                </section>
            </div>

            <p className="text-xs text-gray-500">
                <Link href="/" className="hover:text-gray-900 transition-colors">← Back to home</Link>
            </p>
        </div>
    );
}
