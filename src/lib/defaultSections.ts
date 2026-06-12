import { Section } from '@/types/content';
import { COMPANY } from '@/lib/company';

export const DEFAULT_SECTIONS: Section[] = [
    {
        id: 'default-hero',
        type: 'hero',
        visible: true,
        heading: COMPANY.name,
        subheading: 'Dyno tuning by Nordmark Service.',
        primaryLabel: 'Book a dyno run',
        primaryHref: '#contact',
        secondaryLabel: 'See results',
        secondaryHref: '/dyno-runs',
    },
    {
        id: 'default-stats',
        type: 'stats',
        visible: true,
        heading: '',
        items: [
            { source: 'dynoRuns', value: '', label: 'Dyno runs published' },
            { source: 'brandsTuned', value: '', label: 'Brands tuned' },
        ],
    },
    {
        id: 'default-feature',
        type: 'feature',
        visible: true,
        heading: 'Dyno run',
        text: '',
        bullets: ['Power & torque at the wheels'],
    },
    {
        id: 'default-feed',
        type: 'feed',
        visible: true,
        heading: 'Featured dyno runs',
        limit: 3,
    },
    {
        id: 'default-cta',
        type: 'cta',
        visible: true,
        heading: 'Ready to find your power?',
        text: 'Documented gains on the dyno.',
        primaryLabel: 'Book a dyno run',
        primaryHref: '#contact',
    },
    {
        id: 'default-contact',
        type: 'contact',
        visible: true,
        heading: 'Book a dyno run',
        text: '',
    },
];
