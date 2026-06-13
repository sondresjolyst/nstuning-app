import Link from 'next/link';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import { CheckIcon } from '@heroicons/react/24/outline';
import { Section } from '@/types/content';
import { imageUrl } from '@/services/imageService';
import FeaturedRuns from './FeaturedRuns';
import ContactForm from './ContactForm';
import StatsBand from './StatsBand';

function Img(props: React.ImgHTMLAttributes<HTMLImageElement>) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} />;
}

function ScrimText({ text, big }: { text: string; big?: boolean }) {
    if (!text) return null;
    return (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-6">
            <p className={`text-white font-black text-center whitespace-pre-line ${big ? 'text-3xl sm:text-5xl max-w-3xl' : 'text-2xl sm:text-4xl max-w-2xl'}`}>{text}</p>
        </div>
    );
}

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

        case 'feed':
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

        case 'cta':
            return (
                <section className="bg-primary">
                    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-14 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                        <div>
                            <h2 className="text-2xl sm:text-3xl font-black text-primary-foreground whitespace-pre-line">{section.heading}</h2>
                            {section.text && <p className="mt-2 text-primary-foreground/80 whitespace-pre-line">{section.text}</p>}
                        </div>
                        {section.primaryLabel && (
                            <Link href={section.primaryHref || '#'} className="shrink-0 rounded-lg bg-gray-900 text-white font-semibold px-6 py-3 hover:bg-gray-800 transition">
                                {section.primaryLabel}
                            </Link>
                        )}
                    </div>
                </section>
            );

        case 'stats':
            return <StatsBand section={section} />;

        case 'image': {
            if (section.imageId == null) return null;
            const src = imageUrl(section.imageId);
            const layout = section.layout ?? 'standard';

            if (layout === 'full') {
                return (
                    <section className="py-8">
                        <Img src={src} alt={section.alt} className="w-full max-h-[70vh] object-cover" />
                    </section>
                );
            }

            if (layout === 'overlay') {
                return (
                    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                        <div className="relative rounded-2xl overflow-hidden">
                            <Img src={src} alt={section.alt} className="w-full h-[420px] object-cover" />
                            <ScrimText text={section.text} />
                        </div>
                    </section>
                );
            }

            if (layout === 'overlayFull') {
                return (
                    <section className="relative">
                        <Img src={src} alt={section.alt} className="w-full h-[480px] object-cover" />
                        <ScrimText text={section.text} big />
                    </section>
                );
            }

            if (layout === 'left' || layout === 'right') {
                return (
                    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                        <div className="grid sm:grid-cols-2 gap-8 items-center">
                            <Img src={src} alt={section.alt} className={`w-full rounded-2xl ${layout === 'right' ? 'sm:order-2' : ''}`} />
                            {section.text && (
                                <p className="text-gray-700 leading-relaxed whitespace-pre-line">{section.text}</p>
                            )}
                        </div>
                    </section>
                );
            }

            return (
                <section className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
                    <figure>
                        <Img src={src} alt={section.alt} className="w-full rounded-2xl" />
                        {section.caption && <figcaption className="mt-2 text-center text-sm text-gray-500">{section.caption}</figcaption>}
                    </figure>
                </section>
            );
        }
    }
}
