import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import SectionRenderer from '@/components/SectionRenderer';
import type { Section } from '@/types/content';

vi.mock('@/components/ContactForm', () => ({ default: () => <form data-testid="contact-form" /> }));
vi.mock('@/components/FeaturedRuns', () => ({ default: ({ limit }: { limit: number }) => <div data-testid="runs" data-limit={limit} /> }));
vi.mock('@/components/StatsBand', () => ({ default: ({ section }: { section: { heading: string } }) => <div data-testid="stats">{section.heading}</div> }));

const base = { id: 's1', visible: true };

describe('SectionRenderer', () => {
    it('renders the hero with its buttons', () => {
        const section: Section = { ...base, type: 'hero', heading: 'Power', subheading: '', primaryLabel: 'Book', primaryHref: '#contact', secondaryLabel: 'Runs', secondaryHref: '/dyno-runs' };
        render(<SectionRenderer section={section} />);
        expect(screen.getByRole('heading', { level: 1, name: 'Power' })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Book' })).toHaveAttribute('href', '#contact');
        expect(screen.getByRole('link', { name: 'Runs' })).toHaveAttribute('href', '/dyno-runs');
    });

    it('serves images straight from the API without an intrinsic size', () => {
        const section: Section = { ...base, type: 'image', imageId: 'pic', alt: 'Dyno', caption: '', layout: 'standard', text: '' };
        render(<SectionRenderer section={section} />);
        const img = screen.getByAltText('Dyno');
        expect(img).toHaveAttribute('src', 'http://api.test/api/content-images/pic');
        expect(img).not.toHaveAttribute('width');
        expect(img).not.toHaveAttribute('srcset');
        expect(img.className).not.toContain('h-auto');
    });

    it('renders the contact section with the form', () => {
        const section: Section = { ...base, type: 'contact', heading: 'Get in touch', text: '' };
        const { container } = render(<SectionRenderer section={section} />);
        expect(container.querySelector('section#contact')).toBeInTheDocument();
        expect(screen.getByTestId('contact-form')).toBeInTheDocument();
    });

    it('renders the dyno run feed with a link to every run', () => {
        const section: Section = { ...base, type: 'feed', heading: 'Latest runs', limit: 5 };
        render(<SectionRenderer section={section} />);
        expect(screen.getByRole('heading', { name: 'Latest runs' })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /View all/ })).toHaveAttribute('href', '/dyno-runs');
        expect(screen.getByTestId('runs')).toHaveAttribute('data-limit', '5');
    });

    it('renders the stats band', () => {
        const section: Section = { ...base, type: 'stats', heading: 'Numbers', items: [] };
        render(<SectionRenderer section={section} />);
        expect(screen.getByTestId('stats')).toHaveTextContent('Numbers');
    });
});
