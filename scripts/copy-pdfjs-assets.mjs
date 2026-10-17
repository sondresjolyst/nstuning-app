// Copies the files pdf.js loads at runtime into public/pdfjs, so the viewer can decode JBIG2 and
// JPEG 2000 images, CJK fonts and ICC colours. They are build output and are not committed.
import { cpSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const source = dirname(require.resolve('pdfjs-dist/package.json'));
const target = join(process.cwd(), 'public', 'pdfjs');

rmSync(target, { recursive: true, force: true });
for (const folder of ['wasm', 'cmaps', 'standard_fonts', 'iccs'])
    cpSync(join(source, folder), join(target, folder), { recursive: true });
