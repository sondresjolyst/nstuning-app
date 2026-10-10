import { MetadataRoute } from 'next';
import { COMPANY } from '@/lib/company';
import { isIndexableEnvironment } from '@/lib/seo/environment';

// Read per request, so a deployment can be pointed at either environment.
export const dynamic = 'force-dynamic';

export default function robots(): MetadataRoute.Robots {
    if (!isIndexableEnvironment()) {
        return { rules: { userAgent: '*', disallow: '/' } };
    }

    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/admin', '/profile', '/login', '/register', '/reset-password', '/api/'],
        },
        sitemap: `${COMPANY.url}/sitemap.xml`,
        host: COMPANY.url,
    };
}
