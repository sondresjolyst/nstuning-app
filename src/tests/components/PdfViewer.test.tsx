import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const documentProps = vi.hoisted(() => ({ current: undefined as Record<string, unknown> | undefined }));

vi.mock('react-pdf', () => ({
    pdfjs: { GlobalWorkerOptions: {} },
    Document: (props: Record<string, unknown>) => {
        documentProps.current = props;
        return null;
    },
    Page: () => null,
}));
vi.mock('react-pdf/dist/Page/AnnotationLayer.css', () => ({}));
vi.mock('react-pdf/dist/Page/TextLayer.css', () => ({}));

import PdfViewer from '@/components/PdfViewer';

// jsdom has no ResizeObserver. The viewer only needs one to exist.
vi.stubGlobal('ResizeObserver', class { observe() {} disconnect() {} });

describe('PdfViewer', () => {
    it('tells pdf.js where its decoders and font data are, so JBIG2 graphs do not render blank', () => {
        render(<PdfViewer url="/api/report/4" />);

        expect(documentProps.current?.file).toBe('/api/report/4');
        expect(documentProps.current?.options).toEqual({
            wasmUrl: '/pdfjs/wasm/',
            cMapUrl: '/pdfjs/cmaps/',
            standardFontDataUrl: '/pdfjs/standard_fonts/',
            iccUrl: '/pdfjs/iccs/',
        });
    });

    it('points at folders that pdfjs-dist ships, so the copy script has something to copy', () => {
        const pdfjs = join(process.cwd(), 'node_modules', 'pdfjs-dist');
        for (const file of ['wasm/jbig2.wasm', 'wasm/jbig2_nowasm_fallback.js', 'cmaps', 'standard_fonts', 'iccs'])
            expect(existsSync(join(pdfjs, file)), file).toBe(true);
    });
});
