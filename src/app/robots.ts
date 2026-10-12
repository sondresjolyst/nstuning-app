import { site } from '@/lib/seo/site';

// Read per request, so a deployment can be pointed at either environment.
export const dynamic = 'force-dynamic';

export default function robots() {
    return site.robots({
        privatePaths: ['/admin', '/profile', '/login', '/register', '/reset-password'],
        privateRootPaths: ['/api/'],
    });
}
