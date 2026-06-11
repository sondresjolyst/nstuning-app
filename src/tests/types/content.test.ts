import { describe, it, expect } from 'vitest';
import { createSection, SECTION_LABELS } from '@/types/content';

describe('createSection', () => {
    it('creates a hero with default CTAs and a unique id', () => {
        const a = createSection('hero');
        const b = createSection('hero');
        expect(a.type).toBe('hero');
        expect(a.visible).toBe(true);
        expect(a.id).not.toBe(b.id);
        if (a.type === 'hero') {
            expect(a.primaryLabel).toBeTruthy();
        }
    });

    it('creates a feature with one empty bullet', () => {
        const section = createSection('feature');
        if (section.type === 'feature') {
            expect(section.bullets).toEqual(['']);
        }
    });

    it('has a label for every section type', () => {
        for (const type of ['hero', 'feature', 'text', 'dynoRuns', 'contact'] as const) {
            expect(SECTION_LABELS[type]).toBeTruthy();
        }
    });
});
