import type { Metadata } from 'next';
import ContactForm from '@/components/ContactForm';
import { COMPANY } from '@/lib/company';

export const metadata: Metadata = {
    title: 'Contact',
    description: `Book a dyno run or ask ${COMPANY.name} about tuning your car.`,
    alternates: { canonical: '/contact' },
};

export default function ContactPage() {
    return (
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
            <h1 className="text-3xl font-black text-gray-900">Get in touch</h1>
            <p className="mt-1 text-gray-600 mb-8">
                Book a dyno run or ask us anything.
            </p>
            <ContactForm />
        </div>
    );
}
