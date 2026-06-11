import { Section } from '@/types/content';

export const DEFAULT_SECTIONS: Section[] = [
    {
        id: 'default-hero',
        type: 'hero',
        visible: true,
        heading: 'NS Tuning',
        subheading: 'Dyno tuning by Nordmark Service.',
        primaryLabel: 'Book a dyno run',
        primaryHref: '#contact',
        secondaryLabel: 'See results',
        secondaryHref: '/dyno-runs',
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
        id: 'default-dynoruns',
        type: 'dynoRuns',
        visible: true,
        heading: 'Featured dyno runs',
        limit: 3,
    },
    {
        id: 'default-contact',
        type: 'contact',
        visible: true,
        heading: 'Book a dyno run',
        text: 'Tell us about your car.',
    },
];
