import { describe, it, expect } from 'vitest';
import { perLitreAt100kPa } from '@/lib/perLitre';

describe('perLitreAt100kPa', () => {
    it('divides by litres and by absolute pressure over 100 kPa', () => {
        // 265 whp from 3.43 L at 176 kPa absolute (76 kPa boost)
        expect(perLitreAt100kPa(265, 3430, 176)).toBe(43.9);
    });

    it('counts a missing pressure as 100 kPa', () => {
        expect(perLitreAt100kPa(200, 2000, null)).toBe(100);
        expect(perLitreAt100kPa(200, 2000, undefined)).toBe(100);
    });

    it('counts 0 or a negative pressure as 100 kPa', () => {
        expect(perLitreAt100kPa(200, 2000, 0)).toBe(100);
        expect(perLitreAt100kPa(200, 2000, -50)).toBe(100);
    });

    it('halves the figure at 200 kPa absolute', () => {
        expect(perLitreAt100kPa(200, 2000, 200)).toBe(50);
    });

    it('rounds to one decimal', () => {
        expect(perLitreAt100kPa(215, 2979, 100)).toBe(72.2);
        expect(perLitreAt100kPa(193, 3600, 100)).toBe(53.6);
        expect(perLitreAt100kPa(100, 3000, 100)).toBe(33.3);
    });

    it('gives null without a value or a displacement', () => {
        expect(perLitreAt100kPa(null, 2000, 100)).toBeNull();
        expect(perLitreAt100kPa(200, null, 100)).toBeNull();
        expect(perLitreAt100kPa(200, 0, 100)).toBeNull();
    });

    it('keeps a zero value', () => {
        expect(perLitreAt100kPa(0, 2000, 100)).toBe(0);
    });
});
