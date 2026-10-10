'use client';

import dynamic from 'next/dynamic';

// react-pdf needs the browser's window and document, so the viewer renders in the browser only.
// On the server the page renders without it and still answers 200.
const PdfViewer = dynamic(() => import('@/components/PdfViewer'), {
    ssr: false,
    loading: () => <div className="h-96 rounded-xl bg-gray-100 animate-pulse" role="status" aria-label="Loading the dyno report" />,
});

export default function ReportViewer({ url }: { url: string }) {
    return <PdfViewer url={url} />;
}
