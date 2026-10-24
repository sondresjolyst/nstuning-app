import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { CompanyInfo } from '@/lib/companyInfo';

const { useBranding } = vi.hoisted(() => ({ useBranding: vi.fn(() => ({ logoUrl: null as string | null })) }));
vi.mock('@sjolystinnovation/app-kit/branding', () => ({ useBranding }));

import Footer from '@/app/footer';
import { getCompanyInfo } from '@/lib/companyInfo';

const company: CompanyInfo = {
    name: 'NS Tuning',
    legalName: 'Nordmark Service AS',
    orgNumber: '923 202 374',
    vatRegistered: true,
    address: 'Håbakken 7, 4355 Kvernaland',
    streetAddress: 'Håbakken 7',
    postalCode: '4355',
    addressLocality: 'Kvernaland',
    addressRegion: '',
    email: 'post@nstuning.no',
    phone: '',
};

const footer = () => screen.getByRole('contentinfo');
const year = new Date().getFullYear();

// Elements styled uppercase in the footer whose text holds the given words.
const uppercased = (text: string) =>
    [...footer().querySelectorAll<HTMLElement>('.uppercase, .small-caps, [style*="text-transform"]')]
        .filter(el => el.textContent?.includes(text));

afterEach(() => {
    vi.restoreAllMocks();
    useBranding.mockReturnValue({ logoUrl: null });
});

describe('Footer', () => {
    it('credits the maker by registered legal name', () => {
        render(<Footer company={company} />);
        expect(screen.getByRole('link', { name: 'Sjølyst Innovation AS' })).toHaveAttribute('href', 'https://www.sjolystinnovation.no/');
    });

    it('shows the legal name in the copyright', () => {
        render(<Footer company={company} />);
        expect(footer()).toHaveTextContent(`© ${year} Nordmark Service AS · Created by Sjølyst Innovation AS`);
    });

    it('shows the name block without a logo, and the logo once one is uploaded', () => {
        const { unmount } = render(<Footer company={company} />);
        expect(footer()).toHaveTextContent('NS Tuning');
        expect(footer().querySelector('img')).toBeNull();
        unmount();

        useBranding.mockReturnValue({ logoUrl: 'https://cdn.example/logo.png' });
        render(<Footer company={company} />);
        expect(screen.getByRole('img', { name: 'NS Tuning' })).toHaveAttribute('src', 'https://cdn.example/logo.png');
    });

    it('shows the org number with MVA, linked to Brønnøysund, next to the register', () => {
        render(<Footer company={company} />);
        const org = screen.getByRole('link', { name: '923 202 374 MVA' });
        expect(org).toHaveAttribute('href', 'https://virksomhet.brreg.no/nb/oppslag/enheter/923202374');
        expect(org.closest('p')!.textContent).toBe('Org.nr. 923 202 374 MVA Foretaksregisteret');
        expect(uppercased('Org.nr.')).toEqual([]);
    });

    it('says the company is not VAT registered when it is not', () => {
        render(<Footer company={{ ...company, vatRegistered: false }} />);
        const org = screen.getByRole('link', { name: '923 202 374' });
        expect(org.closest('p')!.textContent).toBe('Org.nr. 923 202 374 Foretaksregisteret · Not VAT registered');
        expect(footer()).not.toHaveTextContent('MVA');
    });

    it('says nothing about VAT registration when the company is registered', () => {
        render(<Footer company={company} />);
        expect(footer()).not.toHaveTextContent('Not VAT registered');
    });

    it('shows an org number with no digits as text, never as an empty link', () => {
        render(<Footer company={{ ...company, orgNumber: 'pending' }} />);
        expect(screen.getByText('pending MVA').tagName).toBe('SPAN');
        expect(footer().querySelector('a[href=""]')).toBeNull();
        expect(screen.queryByRole('link', { name: /pending/ })).toBeNull();
    });

    it('shows the address and the email as a mailto link', () => {
        render(<Footer company={company} />);
        expect(footer()).toHaveTextContent('Håbakken 7, 4355 Kvernaland · post@nstuning.no');
        expect(screen.getByRole('link', { name: 'post@nstuning.no' })).toHaveAttribute('href', 'mailto:post@nstuning.no');
    });

    it('shows an email that would change the mailto link as text only', () => {
        for (const email of ['post@nstuning.no?subject=Hi', 'post@nstuning.no#x', 'post@nstuning.no?cc=x@y.no']) {
            const { unmount } = render(<Footer company={{ ...company, email }} />);
            expect(screen.getByText(email).tagName).toBe('SPAN');
            expect(footer().querySelector('a[href^="mailto:"]')).toBeNull();
            unmount();
        }
    });

    it('shows no phone or email when they are empty', () => {
        render(<Footer company={{ ...company, email: '' }} />);
        expect(footer().querySelector('a[href^="tel:"]')).toBeNull();
        expect(footer().querySelector('a[href^="mailto:"]')).toBeNull();
        expect(screen.getByText('Håbakken 7, 4355 Kvernaland').parentElement!.textContent).toBe('Håbakken 7, 4355 Kvernaland');
    });

    it('shows the phone as a call link with only digits and a leading +', () => {
        render(<Footer company={{ ...company, phone: '+47 900 00 000' }} />);
        expect(screen.getByRole('link', { name: '+47 900 00 000' })).toHaveAttribute('href', 'tel:+4790000000');
        expect(footer()).toHaveTextContent('Håbakken 7, 4355 Kvernaland · post@nstuning.no · +47 900 00 000');
    });

    it('strips anything but digits from the call link', () => {
        render(<Footer company={{ ...company, phone: '900 00 000?subject=x#y' }} />);
        expect(screen.getByRole('link', { name: '900 00 000?subject=x#y' })).toHaveAttribute('href', 'tel:90000000');
    });

    it('shows a phone with no digits as text only', () => {
        render(<Footer company={{ ...company, phone: 'ask us' }} />);
        expect(screen.getByText('ask us').tagName).toBe('SPAN');
        expect(footer().querySelector('a[href^="tel:"]')).toBeNull();
    });

    it('keeps the legal page links', () => {
        render(<Footer company={company} />);
        for (const [name, href] of [['Contact', '/contact'], ['Terms of Service', '/terms'], ['Privacy Policy', '/privacy'], ['Cookie Policy', '/cookies']]) {
            expect(screen.getByRole('link', { name })).toHaveAttribute('href', href);
        }
    });

    describe('when the API cannot be reached', () => {
        const renderFallback = async () => {
            vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('ECONNREFUSED'));
            render(<Footer company={await getCompanyInfo()} />);
        };

        it('still shows the legal name', async () => {
            await renderFallback();
            expect(footer()).toHaveTextContent(`© ${year} Nordmark Service AS`);
        });

        it('still shows the org number with MVA, linked to Brønnøysund, and the register', async () => {
            await renderFallback();
            const org = screen.getByRole('link', { name: '923 202 374 MVA' });
            expect(org).toHaveAttribute('href', 'https://virksomhet.brreg.no/nb/oppslag/enheter/923202374');
            expect(org.closest('p')!.textContent).toBe('Org.nr. 923 202 374 MVA Foretaksregisteret');
        });

        it('still shows the address', async () => {
            await renderFallback();
            expect(footer()).toHaveTextContent('Håbakken 7, 4355 Kvernaland');
        });

        it('shows no email or phone link, since the built-in details have none yet', async () => {
            await renderFallback();
            expect(footer().querySelector('a[href^="mailto:"]')).toBeNull();
            expect(footer().querySelector('a[href^="tel:"]')).toBeNull();
        });
    });

    it('uses the company details the API gives, under the company tag', async () => {
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ ...company, email: 'hei@nstuning.no' }), { status: 200, headers: { 'Content-Type': 'application/json' } }));
        render(<Footer company={await getCompanyInfo()} />);
        expect(String(fetchMock.mock.calls[0][0])).toBe('http://api.test/api/company');
        expect((fetchMock.mock.calls[0][1] as { next?: { tags?: string[] } }).next?.tags).toEqual(['company']);
        expect(screen.getByRole('link', { name: 'hei@nstuning.no' })).toHaveAttribute('href', 'mailto:hei@nstuning.no');
    });
});
