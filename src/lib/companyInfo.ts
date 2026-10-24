import { mergeCompanyInfo, type CompanyInfo } from '@sjolystinnovation/app-kit/company';
import { publicGetOptional } from '@/lib/publicApi';
import { COMPANY } from '@/lib/company';
import { REVALIDATE_TARGETS } from '@/lib/cacheTags';

export { formatOrgNumber, type CompanyInfo } from '@sjolystinnovation/app-kit/company';

// The company has always been VAT registered, so that is the default when the API cannot say.
export async function getCompanyInfo(): Promise<CompanyInfo> {
    return mergeCompanyInfo(await publicGetOptional<CompanyInfo>('/company', { tags: [REVALIDATE_TARGETS.company] }), { ...COMPANY, vatRegistered: true });
}
