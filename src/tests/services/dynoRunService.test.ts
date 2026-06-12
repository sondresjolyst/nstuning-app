import { describe, it, expect } from 'vitest';
import { coverImageSrc, DynoRun } from '@/services/dynoRunService';

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
