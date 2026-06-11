import { describe, it, expect } from 'vitest';
import { coverImageSrc, DynoRun } from '@/services/dynoRunService';

const base: DynoRun = {
    id: 1, slug: 'volvo-242-turbo', title: 'Volvo 242 Turbo', published: true, sortOrder: 0, hasReport: false,
    createdAt: '', updatedAt: '',
};

describe('coverImageSrc', () => {
    it('builds a data URL when cover image present', () => {
        const src = coverImageSrc({ ...base, coverImageData: 'AAAA', coverImageContentType: 'image/png' });
        expect(src).toBe('data:image/png;base64,AAAA');
    });

    it('returns null when no cover image', () => {
        expect(coverImageSrc(base)).toBeNull();
    });
});
