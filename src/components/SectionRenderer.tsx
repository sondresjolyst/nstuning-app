import Link from 'next/link';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import { CheckIcon } from '@heroicons/react/24/outline';
import { Section } from '@/types/content';
import FeaturedRuns from './FeaturedRuns';
import ContactForm from './ContactForm';

export default function SectionRenderer({ section }: { section: Section }) {
    if (!section.visible) return null;

    switch (section.type) {
        case 'hero':
            return (
                <section className="bg-primary">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 sm:py-28">
                        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-primary-foreground max-w-3xl whitespace-pre-line">
                            {section.heading}
                        </h1>
                        {section.subheading && (
                            <p className="mt-5 text-lg text-primary-foreground/80 max-w-xl whitespace-pre-line">{section.subheading}</p>
                        )}
                        <div className="mt-8 flex flex-wrap gap-3">
                            {section.primaryLabel && (
                                <Link href={section.primaryHref || '#'} className="rounded-lg bg-gray-900 text-white font-semibold px-6 py-3 hover:bg-gray-800 transition">
                                    {section.primaryLabel}
                                </Link>
                            )}
                            {section.secondaryLabel && (
                                <Link href={section.secondaryHref || '#'} className="rounded-lg bg-white text-gray-900 font-semibold px-6 py-3 hover:bg-gray-100 transition">
                                    {section.secondaryLabel}
                                </Link>
                            )}
                        </div>
                    </div>
                </section>
            );

        case 'feature':
            return (
                <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
                    {section.heading && <h2 className="text-2xl font-bold text-gray-900 mb-6">{section.heading}</h2>}
                    <div className="w-full sm:max-w-md rounded-2xl border border-gray-200 p-6">
                        {section.text && <p className="text-sm text-gray-600">{section.text}</p>}
                        <ul className="mt-4 space-y-2">
                            {section.bullets.filter(Boolean).map((item, i) => (
                                <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                                    <CheckIcon className="h-4 w-4 text-gray-900 shrink-0" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>
            );

        case 'text':
            return (
                <section className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
                    {section.heading && <h2 className="text-2xl font-bold text-gray-900 mb-4">{section.heading}</h2>}
                    <div className="prose prose-sm max-w-none text-gray-700">
                        <Markdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>{section.body}</Markdown>
                    </div>
                </section>
            );

        case 'dynoRuns':
            return (
                <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                    <div className="flex items-end justify-between mb-6">
                        {section.heading && <h2 className="text-2xl font-bold text-gray-900">{section.heading}</h2>}
                        <Link href="/dyno-runs" className="text-sm font-semibold text-gray-700 hover:text-gray-900">View all →</Link>
                    </div>
                    <FeaturedRuns limit={section.limit} />
                </section>
            );

        case 'contact':
            return (
                <section id="contact" className="bg-gray-50 border-t border-gray-200">
                    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
                        {section.heading && <h2 className="text-2xl font-bold text-gray-900">{section.heading}</h2>}
                        {section.text && <p className="mt-1 text-sm text-gray-600 mb-6">{section.text}</p>}
                        <ContactForm />
                    </div>
                </section>
            );
    }
}
