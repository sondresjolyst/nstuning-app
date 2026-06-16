import { publicGet } from '@/lib/publicApi';
import { COMPANY } from '@/lib/company';

export interface CompanyInfo {
    name: string;
    legalName: string;
    orgNumber: string;
    vatRegistered: boolean;
    address: string;
}

export async function getCompanyInfo(): Promise<CompanyInfo> {
    const data = await publicGet<CompanyInfo>('/company');
    return {
        name: data?.name || COMPANY.name,
        legalName: data?.legalName || COMPANY.legalName,
        orgNumber: data?.orgNumber || COMPANY.orgNumber,
        vatRegistered: data?.vatRegistered ?? true,
        address: data?.address || COMPANY.address,
    };
}

/** Org number with the Norwegian " MVA" suffix when the company is VAT-registered. */
export function formatOrgNumber(info: CompanyInfo): string {
    return info.vatRegistered ? `${info.orgNumber} MVA` : info.orgNumber;
}
