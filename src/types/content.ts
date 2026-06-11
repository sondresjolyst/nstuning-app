export type SectionType = 'hero' | 'feature' | 'text' | 'dynoRuns' | 'contact';

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

export interface DynoRunsSection extends BaseSection {
    type: 'dynoRuns';
    heading: string;
    limit: number;
}

export interface ContactSection extends BaseSection {
    type: 'contact';
    heading: string;
    text: string;
}

export type Section = HeroSection | FeatureSection | TextSection | DynoRunsSection | ContactSection;

export const SECTION_LABELS: Record<SectionType, string> = {
    hero: 'Hero',
    feature: 'Feature',
    text: 'Text',
    dynoRuns: 'Dyno runs feed',
    contact: 'Contact form',
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
        case 'dynoRuns':
            return { ...base, type, heading: 'Dyno runs', limit: 3 };
        case 'contact':
            return { ...base, type, heading: 'Get in touch', text: '' };
    }
}
