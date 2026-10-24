import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { CompanyInfo } from '@/lib/companyInfo';

vi.mock('@/components/BrandingProvider', () => ({
    useBranding: () => ({ logoUrl: null }),
}));

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

afterEach(() => vi.restoreAllMocks());

describe('Footer', () => {
    it('credits the maker by registered legal name', () => {
        render(<Footer company={company} />);
        expect(screen.getByRole('link', { name: 'Sjølyst Innovation AS' })).toHaveAttribute('href', 'https://www.sjolystinnovation.no/');
    });

    it('shows the legal name in the copyright', () => {
        render(<Footer company={company} />);
        expect(footer()).toHaveTextContent(`© ${year} Nordmark Service AS · Created by Sjølyst Innovation AS`);
    });

    it('shows the org number with MVA, linked to Brønnøysund, next to the register', () => {
        render(<Footer company={company} />);
        const org = screen.getByRole('link', { name: '923 202 374 MVA' });
        expect(org).toHaveAttribute('href', 'https://virksomhet.brreg.no/nb/oppslag/enheter/923202374');
        expect(org.closest('p')).toHaveTextContent('Org.nr. 923 202 374 MVA Foretaksregisteret');
        expect(org.closest('.uppercase')).toBeNull();
    });

    it('leaves MVA off when the company is not VAT registered', () => {
        render(<Footer company={{ ...company, vatRegistered: false }} />);
        expect(screen.getByRole('link', { name: '923 202 374' })).toBeInTheDocument();
        expect(footer()).not.toHaveTextContent('MVA');
    });

    it('shows the address and the email as a mailto link', () => {
        render(<Footer company={company} />);
        expect(footer()).toHaveTextContent('Håbakken 7, 4355 Kvernaland · post@nstuning.no');
        expect(screen.getByRole('link', { name: 'post@nstuning.no' })).toHaveAttribute('href', 'mailto:post@nstuning.no');
    });

    it('shows no phone or email when they are empty', () => {
        render(<Footer company={{ ...company, email: '' }} />);
        expect(footer().querySelector('a[href^="tel:"]')).toBeNull();
        expect(footer().querySelector('a[href^="mailto:"]')).toBeNull();
        expect(screen.getByText('Håbakken 7, 4355 Kvernaland').parentElement!.textContent).toBe('Håbakken 7, 4355 Kvernaland');
    });

    it('shows the phone as a call link when it is set', () => {
        render(<Footer company={{ ...company, phone: '+47 900 00 000' }} />);
        expect(screen.getByRole('link', { name: '+47 900 00 000' })).toHaveAttribute('href', 'tel:+4790000000');
        expect(footer()).toHaveTextContent('Håbakken 7, 4355 Kvernaland · post@nstuning.no · +47 900 00 000');
    });

    it('keeps the legal page links', () => {
        render(<Footer company={company} />);
        for (const [name, href] of [['Contact', '/contact'], ['Terms of Service', '/terms'], ['Privacy Policy', '/privacy'], ['Cookie Policy', '/cookies']]) {
            expect(screen.getByRole('link', { name })).toHaveAttribute('href', href);
        }
    });

    it('falls back to the built-in company details when the API cannot be reached', async () => {
        vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('ECONNREFUSED'));
        render(<Footer company={await getCompanyInfo()} />);
        expect(footer()).toHaveTextContent(`© ${year} Nordmark Service AS`);
        expect(screen.getByRole('link', { name: '923 202 374 MVA' })).toBeInTheDocument();
        expect(footer()).toHaveTextContent('Org.nr. 923 202 374 MVA Foretaksregisteret');
        expect(footer()).toHaveTextContent('Håbakken 7, 4355 Kvernaland');
    });

    it('uses the company details the API gives, under the company tag', async () => {
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ ...company, email: 'hei@nstuning.no' }), { status: 200, headers: { 'Content-Type': 'application/json' } }));
        render(<Footer company={await getCompanyInfo()} />);
        expect(String(fetchMock.mock.calls[0][0])).toBe('http://api.test/api/company');
        expect((fetchMock.mock.calls[0][1] as { next?: { tags?: string[] } }).next?.tags).toEqual(['company']);
        expect(screen.getByRole('link', { name: 'hei@nstuning.no' })).toHaveAttribute('href', 'mailto:hei@nstuning.no');
    });
});
