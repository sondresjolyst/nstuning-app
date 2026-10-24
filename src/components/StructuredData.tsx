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
            streetAddress: company.streetAddress || company.address,
            ...(company.postalCode && { postalCode: company.postalCode }),
            ...(company.addressLocality && { addressLocality: company.addressLocality }),
            ...(company.addressRegion && { addressRegion: company.addressRegion }),
            addressCountry: 'NO',
        },
        areaServed: 'NO',
        ...(company.email && { email: company.email }),
        ...(company.phone && { telephone: company.phone }),
        // A VAT ID is the org number with MVA, so it only applies once the company is VAT registered.
        ...(company.vatRegistered && company.orgNumber && { vatID: company.orgNumber }),
    };

    const json = JSON.stringify(data).replace(/</g, '\\u003c');

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: json }}
        />
    );
}
