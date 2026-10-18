import { mergeCompanyInfo, type CompanyInfo } from '@sjolystinnovation/app-kit/company';
import { publicGetOptional } from '@/lib/publicApi';
import { COMPANY } from '@/lib/company';

export { formatOrgNumber, type CompanyInfo } from '@sjolystinnovation/app-kit/company';

// The company has always been VAT registered, so that is the default when the API cannot say.
export async function getCompanyInfo(): Promise<CompanyInfo> {
    return mergeCompanyInfo(await publicGetOptional<CompanyInfo>('/company'), { ...COMPANY, vatRegistered: true });
}
