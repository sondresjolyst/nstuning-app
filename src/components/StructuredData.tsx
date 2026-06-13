import { COMPANY } from '@/lib/company';

// schema.org AutoRepair (a LocalBusiness) for the tuning shop. Helps Google
// build a knowledge panel and rank for local "dyno tuning" queries.
export default function StructuredData() {
    const data = {
        '@context': 'https://schema.org',
        '@type': 'AutoRepair',
        name: COMPANY.name,
        legalName: COMPANY.legalName,
        url: COMPANY.url,
        image: `${COMPANY.url}/icon.svg`,
        address: {
            '@type': 'PostalAddress',
            streetAddress: 'Håbakken 7',
            postalCode: '4355',
            addressLocality: 'Kvernaland',
            addressCountry: 'NO',
        },
        areaServed: 'NO',
        vatID: COMPANY.orgNumber,
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        />
    );
}
