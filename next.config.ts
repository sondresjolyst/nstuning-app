import { defineAppConfig } from '@sjolystinnovation/app-kit/next-config';

export default defineAppConfig({
    apiUrl: process.env.NEXT_PUBLIC_API_URL,
    dev: process.env.NODE_ENV !== 'production',
    // Images load straight from the API.
    imgFromApi: true,
    // The PDF report is shown in a viewer on the app's own pages.
    pathHeaders: [{
        source: '/api/report/:path*',
        headers: [
            { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
            { key: 'Content-Security-Policy', value: "frame-ancestors 'self'" },
        ],
    }],
});
