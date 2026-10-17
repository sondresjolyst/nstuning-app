import { describe, it, expect } from 'vitest';
import { coverImageSrc, coverImageSrcSet, DynoRun } from '@/services/dynoRunService';

const base: DynoRun = {
    id: 1, slug: 'volvo-242-turbo', title: 'Volvo 242 Turbo', published: true, sortOrder: 0, hasReport: false,
    createdAt: '', updatedAt: '',
};

describe('coverImageSrc', () => {
    it('builds a content-image URL when cover image present', () => {
        const src = coverImageSrc({ ...base, coverImageId: 'abc123' });
        expect(src).toContain('/content-images/abc123');
    });

    it('returns null when no cover image', () => {
        expect(coverImageSrc(base)).toBeNull();
    });
});

describe('coverImageSrcSet', () => {
    it('offers the cover at each width the API serves, as before the move to app-kit', () => {
        const url = 'http://api.test/api/content-images/abc';
        expect(coverImageSrcSet({ ...base, coverImageId: 'abc' })).toBe(
            [384, 640, 768, 1024, 1366, 1600].map(w => `${url}?w=${w} ${w}w`).join(', '),
        );
    });

    it('has no srcset without a cover image', () => {
        expect(coverImageSrcSet(base)).toBeUndefined();
    });
});
