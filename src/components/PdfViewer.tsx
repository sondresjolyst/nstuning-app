'use client';

import { useEffect, useRef, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
).toString();

const A4_RATIO = 297 / 210;
const VIEWPORT_FRACTION = 0.92;
const PAGE_PADDING = 16;
const PEEK_FACTOR = 1.25;

export default function PdfViewer({ url }: { url: string }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const boxRef = useRef<HTMLDivElement>(null);
    const [availWidth, setAvailWidth] = useState(0);
    const [innerWidth, setInnerWidth] = useState(0);
    const [viewportHeight, setViewportHeight] = useState(0);
    const [numPages, setNumPages] = useState<number | null>(null);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const obs = new ResizeObserver(([entry]) => setAvailWidth(entry.contentRect.width));
        obs.observe(el);
        return () => obs.disconnect();
    }, []);

    // boxRef excludes the vertical scrollbar, so the page never overflows horizontally
    useEffect(() => {
        const el = boxRef.current;
        if (!el) return;
        const obs = new ResizeObserver(([entry]) => setInnerWidth(entry.contentRect.width));
        obs.observe(el);
        return () => obs.disconnect();
    }, []);

    useEffect(() => {
        const update = () => setViewportHeight(window.innerHeight);
        update();
        window.addEventListener('resize', update);
        return () => window.removeEventListener('resize', update);
    }, []);

    const pageFactor = numPages && numPages > 1 ? PEEK_FACTOR : 1;
    const boxWidth = availWidth;
    const pageWidth = innerWidth;
    const onePeekHeight = pageWidth > 0 ? pageWidth * A4_RATIO * pageFactor + PAGE_PADDING : undefined;
    const maxBoxHeight = viewportHeight > 0 ? viewportHeight * VIEWPORT_FRACTION : undefined;
    const boxHeight = onePeekHeight != null && maxBoxHeight != null
        ? Math.min(onePeekHeight, maxBoxHeight)
        : (onePeekHeight ?? maxBoxHeight);

    return (
        <div ref={containerRef} className="w-full">
            <div
                ref={boxRef}
                className="mx-auto overflow-y-auto rounded-xl border border-gray-200 bg-gray-50"
                style={{
                    width: Number.isFinite(boxWidth) && boxWidth > 0 ? boxWidth : '100%',
                    maxHeight: boxHeight,
                }}
            >
                <Document
                    file={url}
                    onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                    className="flex flex-col items-center gap-2 py-2"
                    loading={<p className="p-8 text-sm text-gray-400">Loading PDF…</p>}
                    error={<p className="p-8 text-sm text-red-500">Failed to load PDF.</p>}
                >
                    {numPages && pageWidth > 0 && Array.from({ length: numPages }, (_, i) => (
                        <Page key={i + 1} pageNumber={i + 1} width={pageWidth} className="shadow-sm" />
                    ))}
                </Document>
            </div>
        </div>
    );
}
