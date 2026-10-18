import { describe, it, expect } from 'vitest';
import { contentImagesUrl, imageUrl } from '@/services/imageService';

describe('imageUrl', () => {
    it('builds a content-image URL from an id', () => {
        expect(imageUrl('abc123')).toContain('/content-images/abc123');
    });
});

describe('contentImagesUrl', () => {
    it('is the API base followed by /content-images', () => {
        expect(contentImagesUrl()).toBe('http://api.test/api/content-images');
        expect(imageUrl('abc123')).toBe('http://api.test/api/content-images/abc123');
    });
});
