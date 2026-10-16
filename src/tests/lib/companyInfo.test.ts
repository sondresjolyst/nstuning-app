import { describe, it, expect, vi } from 'vitest';
import { formatOrgNumber, getCompanyInfo, CompanyInfo } from '@/lib/companyInfo';

vi.mock('@/lib/publicApi', () => ({ publicGetOptional: async () => null }));

const base: CompanyInfo = {
    name: 'NS Tuning',
    legalName: 'Nordmark Service AS',
    orgNumber: '923 202 374',
    vatRegistered: true,
    address: 'Håbakken 7, 4355 Kvernaland',
    streetAddress: 'Håbakken 7',
    postalCode: '4355',
    addressLocality: 'Kvernaland',
    addressRegion: '',
    email: '',
    phone: '',
};

describe('formatOrgNumber', () => {
    it('appends MVA when VAT-registered', () => {
        expect(formatOrgNumber(base)).toBe('923 202 374 MVA');
    });

    it('omits MVA when not VAT-registered', () => {
        expect(formatOrgNumber({ ...base, vatRegistered: false })).toBe('923 202 374');
    });
});

describe('getCompanyInfo', () => {
    it('falls back to the company constants, VAT registered, when the API cannot answer', async () => {
        const info = await getCompanyInfo();

        expect(info).toMatchObject({ name: 'NS Tuning', legalName: 'Nordmark Service AS', orgNumber: '923 202 374', vatRegistered: true });
        expect(formatOrgNumber(info)).toBe('923 202 374 MVA');
    });
});
