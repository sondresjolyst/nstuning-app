import Link from 'next/link';
import {
    SectionRenderer as BaseSectionRenderer,
    createContactRenderer,
    createImageRenderer,
    type SectionImageProps,
    type SectionRenderers,
} from '@sjolystinnovation/app-kit/sections';
import type { Section } from '@/types/content';
import { imageUrl } from '@/services/imageService';
import FeaturedRuns from './FeaturedRuns';
import ContactForm from './ContactForm';
import StatsBand from './StatsBand';
import Leaderboard from './Leaderboard';

function Image({ imageId, alt, className }: SectionImageProps) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={imageUrl(imageId)} alt={alt} className={className} />;
}

const renderers: SectionRenderers<Section> = {
    image: createImageRenderer({ intrinsicSize: false }),
    contact: createContactRenderer({ form: <ContactForm /> }),
    feed: section => (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
            <div className="flex items-end justify-between gap-4 mb-6">
                {section.heading && <h2 className="min-w-0 break-words text-2xl font-bold text-gray-900">{section.heading}</h2>}
                <Link href="/dyno-runs" className="shrink-0 text-sm font-semibold text-gray-700 hover:text-gray-900">View all →</Link>
            </div>
            <FeaturedRuns limit={section.limit} />
        </section>
    ),
    stats: section => <StatsBand section={section} />,
    leaderboard: section => <Leaderboard section={section} />,
};

export default function SectionRenderer({ section }: { section: Section }) {
    return <BaseSectionRenderer section={section} renderers={renderers} context={{ Image }} />;
}
