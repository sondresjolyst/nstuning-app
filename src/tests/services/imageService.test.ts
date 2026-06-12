import { describe, it, expect } from 'vitest';
import { imageUrl } from '@/services/imageService';

describe('imageUrl', () => {
    it('builds a content-image URL from an id', () => {
        expect(imageUrl('abc123')).toContain('/content-images/abc123');
    });
});
