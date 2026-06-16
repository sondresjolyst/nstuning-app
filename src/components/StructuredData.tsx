import { COMPANY } from '@/lib/company';
import { getCompanyInfo } from '@/lib/companyInfo';

export default async function StructuredData() {
    const company = await getCompanyInfo();
    const data = {
        '@context': 'https://schema.org',
        '@type': 'AutoRepair',
        name: company.name,
        legalName: company.legalName,
        url: COMPANY.url,
        image: `${COMPANY.url}/icon.svg`,
        address: {
            '@type': 'PostalAddress',
            streetAddress: company.address,
            addressCountry: 'NO',
        },
        areaServed: 'NO',
        vatID: company.orgNumber,
    };

    const json = JSON.stringify(data).replace(/</g, '\\u003c');

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: json }}
        />
    );
}
