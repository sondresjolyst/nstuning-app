import { publicGet } from '@/lib/publicApi';
import { COMPANY } from '@/lib/company';

export interface CompanyInfo {
    name: string;
    legalName: string;
    address: string;
}

export async function getCompanyInfo(): Promise<CompanyInfo> {
    const data = await publicGet<CompanyInfo>('/company');
    return {
        name: data?.name || COMPANY.name,
        legalName: data?.legalName || COMPANY.legalName,
        address: data?.address || COMPANY.address,
    };
}
