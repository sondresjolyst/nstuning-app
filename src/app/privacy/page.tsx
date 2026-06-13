import Link from "next/link";
import { COMPANY } from "@/lib/company";

export default function PrivacyPage() {
    return (
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 space-y-6">
            <h1 className="text-3xl font-black text-gray-900">Privacy Policy</h1>
            <p className="text-xs text-gray-500">Last updated: June 2026</p>

            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-6 text-sm text-gray-600 leading-relaxed">
                <section className="space-y-2">
                    <h2 className="text-base font-semibold text-gray-900">Who is responsible</h2>
                    <p>{COMPANY.legalName} ({COMPANY.name}) is the data controller for personal data collected through this website.</p>
                </section>

                <section className="space-y-2">
                    <h2 className="text-base font-semibold text-gray-900">What data we collect</h2>
                    <ul className="list-disc list-inside space-y-1">
                        <li>Account information: username, first and last name, email address, hashed password.</li>
                        <li>Contact enquiries: the name, email, phone number, vehicle, and message you submit through the contact form.</li>
                        <li>Usage data: basic server logs (opaque user IDs, request paths) for debugging and security purposes.</li>
                    </ul>
                    <p>We do not collect payment data through this site.</p>
                </section>

                <section className="space-y-2">
                    <h2 className="text-base font-semibold text-gray-900">How we use your data</h2>
                    <ul className="list-disc list-inside space-y-1">
                        <li>To create and operate your account.</li>
                        <li>To send account-related emails (email confirmation, password reset).</li>
                        <li>To answer your enquiry and arrange any tuning work you ask about.</li>
                        <li>To improve the service and diagnose technical issues.</li>
                    </ul>
                    <p>We do not use your data for advertising and we do not sell or trade it.</p>
                </section>

                <section className="space-y-2">
                    <h2 className="text-base font-semibold text-gray-900">Legal basis for processing</h2>
                    <p>We process your personal data under the following legal bases (GDPR Article 6):</p>
                    <ul className="list-disc list-inside space-y-1">
                        <li><span className="text-gray-900">Contract (Art. 6(1)(b))</span> — account data and account-related emails are necessary to provide the account you signed up for.</li>
                        <li><span className="text-gray-900">Legitimate interests (Art. 6(1)(f))</span> — contact enquiries are processed so we can respond to you, and server logs are retained for security monitoring and debugging. Our interest does not override your rights — you can object at any time.</li>
                    </ul>
                </section>

                <section className="space-y-2">
                    <h2 className="text-base font-semibold text-gray-900">Data sharing</h2>
                    <p>We do not sell or trade your personal data. The platform is self-hosted on infrastructure under our direct control; there is no upstream cloud or hosting provider. We use the following third-party data processor:</p>
                    <ul className="list-disc list-inside space-y-1">
                        <li>
                            <a href="https://www.brevo.com/legal/termsofuse/" target="_blank" rel="noopener noreferrer" className="font-medium text-gray-900 underline hover:text-gray-600">Brevo</a>
                            {' '}(France, EEA) — transactional email delivery (email confirmation, password reset) and delivery of contact-form enquiries. Your email address and the email body are shared with Brevo solely for this purpose.
                        </li>
                    </ul>
                    <p>We may also disclose data when required by law.</p>
                </section>

                <section className="space-y-2">
                    <h2 className="text-base font-semibold text-gray-900">Data retention</h2>
                    <ul className="list-disc list-inside space-y-1">
                        <li><span className="text-gray-900">Account &amp; preferences</span> — until you delete your account, after which your username, name, email and password are scrubbed.</li>
                        <li><span className="text-gray-900">Contact enquiries</span> — kept for as long as needed to handle your request and any follow-up, then deleted.</li>
                        <li><span className="text-gray-900">Server logs</span> — 90 days. <span className="text-gray-900">Metrics</span> — 60 days.</li>
                        <li><span className="text-gray-900">Database backups</span> — encrypted at rest. After account deletion, residual data may persist in backups for up to about 6 months until rotation completes; backups are not used for any processing.</li>
                    </ul>
                </section>

                <section className="space-y-2">
                    <h2 className="text-base font-semibold text-gray-900">Your rights</h2>
                    <p>Under GDPR you have the right to:</p>
                    <ul className="list-disc list-inside space-y-1">
                        <li><span className="text-gray-900">Access &amp; portability</span> — download a copy of your account data in JSON format from your <Link href="/profile" className="font-medium text-gray-900 underline hover:text-gray-600">account page</Link>. For a copy of any enquiry we still hold, <Link href="/contact" className="font-medium text-gray-900 underline hover:text-gray-600">contact us</Link>.</li>
                        <li><span className="text-gray-900">Erasure</span> — permanently delete your account and associated data from your <Link href="/profile" className="font-medium text-gray-900 underline hover:text-gray-600">account page</Link>.</li>
                        <li><span className="text-gray-900">Correction</span> — update your name from your <Link href="/profile" className="font-medium text-gray-900 underline hover:text-gray-600">account page</Link>. For email or username changes, <Link href="/contact" className="font-medium text-gray-900 underline hover:text-gray-600">contact us</Link>.</li>
                        <li><span className="text-gray-900">Object</span> — object to processing carried out on the basis of our legitimate interests.</li>
                    </ul>
                    <p>For any other request, <Link href="/contact" className="font-medium text-gray-900 underline hover:text-gray-600">contact us</Link>{COMPANY.email && <> at <a href={`mailto:${COMPANY.email}`} className="font-medium text-gray-900 underline hover:text-gray-600">{COMPANY.email}</a></>}. You may also lodge a complaint with the Norwegian Data Protection Authority.</p>
                </section>

                <section className="space-y-2">
                    <h2 className="text-base font-semibold text-gray-900">Cookies</h2>
                    <p>We use cookies for authentication and session management. See our <Link href="/cookies" className="font-medium text-gray-900 underline hover:text-gray-600">Cookie Policy</Link> for details.</p>
                </section>
            </div>

            <p className="text-xs text-gray-500">
                <Link href="/" className="hover:text-gray-900 transition-colors">← Back to home</Link>
            </p>
        </div>
    );
}
