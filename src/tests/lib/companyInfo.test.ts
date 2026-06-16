import { describe, it, expect } from 'vitest';
import { formatOrgNumber, CompanyInfo } from '@/lib/companyInfo';

const base: CompanyInfo = {
    name: 'NS Tuning',
    legalName: 'Nordmark Service AS',
    orgNumber: '923 202 374',
    vatRegistered: true,
    address: 'Håbakken 7, 4355 Kvernaland',
};

describe('formatOrgNumber', () => {
    it('appends MVA when VAT-registered', () => {
        expect(formatOrgNumber(base)).toBe('923 202 374 MVA');
    });

    it('omits MVA when not VAT-registered', () => {
        expect(formatOrgNumber({ ...base, vatRegistered: false })).toBe('923 202 374');
    });
});
