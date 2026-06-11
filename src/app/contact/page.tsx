import ContactForm from '@/components/ContactForm';

export default function ContactPage() {
    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
            <h1 className="text-3xl font-black text-gray-900">Get in touch</h1>
            <p className="mt-1 text-gray-600 mb-8">
                Book a dyno run or ask about tuning your car.
            </p>
            <ContactForm />
        </div>
    );
}
