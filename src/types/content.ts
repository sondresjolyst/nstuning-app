import { cloneSection, createSectionFactory, type SectionOf, type Sections } from '@sjolystinnovation/app-kit/sections';

export type StatSource = 'dynoRuns' | 'brandsTuned';

export type Section = Sections<Record<never, never>, StatSource>;
export type SectionType = Section['type'];
export type StatsSection = SectionOf<Section, 'stats'>;

export const createSection = createSectionFactory<Section>({
    hero: { heading: 'Heading', subheading: 'Subheading', primaryLabel: 'Book a dyno run', primaryHref: '#contact', secondaryLabel: 'See results', secondaryHref: '/dyno-runs' },
    feature: { heading: 'Feature', text: '', bullets: [''] },
    text: { heading: 'Heading', body: '' },
    feed: { heading: 'Dyno runs', limit: 3 },
    contact: { heading: 'Get in touch', text: '' },
    cta: { heading: 'Ready to find your power?', text: '', primaryLabel: 'Book a dyno run', primaryHref: '#contact' },
    stats: { heading: '', items: [{ source: 'dynoRuns', value: '', label: 'Dyno runs published' }] },
    image: { imageId: null, alt: '', caption: '', layout: 'standard', text: '' },
});

export { cloneSection };
