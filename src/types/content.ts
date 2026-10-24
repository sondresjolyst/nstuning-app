import { cloneSection, createSectionFactory, type BaseSection, type SectionOf, type Sections } from '@sjolystinnovation/app-kit/sections';
import { defaultBoards, type LeaderboardBoard } from '@/lib/leaderboard';

export type StatSource = 'dynoRuns' | 'brandsTuned';

/** Ranked dyno runs, one board per metric, side by side. */
export interface LeaderboardSection extends BaseSection<'leaderboard'> {
    heading: string;
    boards: LeaderboardBoard[];
}

export type Section = Sections<Record<never, never>, StatSource> | LeaderboardSection;
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
    leaderboard: { heading: 'Leader Board', boards: defaultBoards() },
});

export { cloneSection };
