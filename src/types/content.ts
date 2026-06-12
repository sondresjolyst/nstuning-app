export type SectionType = 'hero' | 'feature' | 'text' | 'feed' | 'contact' | 'cta' | 'stats' | 'image';

export interface BaseSection {
    id: string;
    type: SectionType;
    visible: boolean;
}

export interface HeroSection extends BaseSection {
    type: 'hero';
    heading: string;
    subheading: string;
    primaryLabel: string;
    primaryHref: string;
    secondaryLabel: string;
    secondaryHref: string;
}

export interface FeatureSection extends BaseSection {
    type: 'feature';
    heading: string;
    text: string;
    bullets: string[];
}

export interface TextSection extends BaseSection {
    type: 'text';
    heading: string;
    body: string;
}

export interface FeedSection extends BaseSection {
    type: 'feed';
    heading: string;
    limit: number;
}

export interface ContactSection extends BaseSection {
    type: 'contact';
    heading: string;
    text: string;
}

export interface CtaSection extends BaseSection {
    type: 'cta';
    heading: string;
    text: string;
    primaryLabel: string;
    primaryHref: string;
}

export interface StatItem {
    source: 'static' | 'dynoRuns' | 'brandsTuned';
    value: string;
    label: string;
}

export interface StatsSection extends BaseSection {
    type: 'stats';
    heading: string;
    items: StatItem[];
}

export type ImageLayout = 'standard' | 'full' | 'left' | 'right' | 'overlay' | 'overlayFull';

export interface ImageSection extends BaseSection {
    type: 'image';
    imageId: string | null;
    alt: string;
    caption: string;
    layout: ImageLayout;
    text: string;
}

export type Section =
    | HeroSection
    | FeatureSection
    | TextSection
    | FeedSection
    | ContactSection
    | CtaSection
    | StatsSection
    | ImageSection;

export const SECTION_LABELS: Record<SectionType, string> = {
    hero: 'Hero',
    feature: 'Feature',
    text: 'Text',
    feed: 'Feed',
    contact: 'Contact form',
    cta: 'Call to action',
    stats: 'Stats band',
    image: 'Image',
};

let counter = 0;
const newId = () => `s-${Date.now()}-${counter++}`;

export function createSection(type: SectionType): Section {
    const base = { id: newId(), visible: true };
    switch (type) {
        case 'hero':
            return { ...base, type, heading: 'Heading', subheading: 'Subheading', primaryLabel: 'Book a dyno run', primaryHref: '#contact', secondaryLabel: 'See results', secondaryHref: '/dyno-runs' };
        case 'feature':
            return { ...base, type, heading: 'Feature', text: '', bullets: [''] };
        case 'text':
            return { ...base, type, heading: 'Heading', body: '' };
        case 'feed':
            return { ...base, type, heading: 'Dyno runs', limit: 3 };
        case 'contact':
            return { ...base, type, heading: 'Get in touch', text: '' };
        case 'cta':
            return { ...base, type, heading: 'Ready to find your power?', text: '', primaryLabel: 'Book a dyno run', primaryHref: '#contact' };
        case 'stats':
            return { ...base, type, heading: '', items: [{ source: 'dynoRuns', value: '', label: 'Dyno runs published' }] };
        case 'image':
            return { ...base, type, imageId: null, alt: '', caption: '', layout: 'standard', text: '' };
    }
}

export function cloneSection(section: Section): Section {
    return { ...structuredClone(section), id: newId() };
}
