import { describe, it, expect, vi, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import StructuredData from '@/components/StructuredData';

const api = {
    name: 'NS Tuning',
    legalName: 'Nordmark Service AS',
    orgNumber: '923 202 374',
    vatRegistered: true,
    address: 'Håbakken 7, 4355 Kvernaland',
    streetAddress: 'Håbakken 7',
    postalCode: '4355',
    addressLocality: 'Kvernaland',
    addressRegion: 'Rogaland',
    email: 'post@nstuning.no',
    phone: '+47 900 00 000',
};

const structuredData = async (answer: object | null) => {
    if (answer) {
        vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify(answer), { status: 200, headers: { 'Content-Type': 'application/json' } }));
    } else {
        vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('ECONNREFUSED'));
    }
    const { container } = render(await StructuredData());
    return JSON.parse(container.querySelector('script[type="application/ld+json"]')!.innerHTML);
};

afterEach(() => vi.restoreAllMocks());

describe('StructuredData', () => {
    it('describes the address in its parts, with the email, phone and VAT ID', async () => {
        const data = await structuredData(api);
        expect(data.address).toEqual({
            '@type': 'PostalAddress',
            streetAddress: 'Håbakken 7',
            postalCode: '4355',
            addressLocality: 'Kvernaland',
            addressRegion: 'Rogaland',
            addressCountry: 'NO',
        });
        expect(data).toMatchObject({ legalName: 'Nordmark Service AS', email: 'post@nstuning.no', telephone: '+47 900 00 000', vatID: '923 202 374' });
    });

    it('leaves out the email, phone, region and VAT ID when they do not apply', async () => {
        const data = await structuredData({ ...api, email: '', phone: '', addressRegion: '', vatRegistered: false });
        expect(data).not.toHaveProperty('email');
        expect(data).not.toHaveProperty('telephone');
        expect(data).not.toHaveProperty('vatID');
        expect(data.address).not.toHaveProperty('addressRegion');
    });

    it('falls back to the one line address when the parts are missing', async () => {
        const data = await structuredData(null);
        expect(data.address.streetAddress).toBe('Håbakken 7, 4355 Kvernaland');
        expect(data.vatID).toBe('923 202 374');
    });
});
