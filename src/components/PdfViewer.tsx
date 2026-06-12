'use client';

import { useEffect, useRef, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
).toString();

export default function PdfViewer({ url }: { url: string }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [width, setWidth] = useState(0);
    const [numPages, setNumPages] = useState<number | null>(null);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const obs = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
        obs.observe(el);
        return () => obs.disconnect();
    }, []);

    return (
        <div ref={containerRef} className="w-full overflow-y-auto max-h-[80vh] rounded-xl border border-gray-200 bg-gray-50">
            <Document
                file={url}
                onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                className="flex flex-col items-center gap-2 py-2"
                loading={<p className="p-8 text-sm text-gray-400">Loading PDF…</p>}
                error={<p className="p-8 text-sm text-red-500">Failed to load PDF.</p>}
            >
                {numPages && width > 0 && Array.from({ length: numPages }, (_, i) => (
                    <Page key={i + 1} pageNumber={i + 1} width={width} className="shadow-sm" />
                ))}
            </Document>
        </div>
    );
}
