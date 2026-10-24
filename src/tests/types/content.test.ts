import { describe, it, expect } from 'vitest';
import { createSection, cloneSection } from '@/types/content';

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

    it('clones a section with a new id and deep-copied arrays', () => {
        const original = createSection('feature');
        const clone = cloneSection(original);
        expect(clone.id).not.toBe(original.id);
        expect(clone.type).toBe(original.type);
        if (original.type === 'feature' && clone.type === 'feature') {
            expect(clone.bullets).toEqual(original.bullets);
            expect(clone.bullets).not.toBe(original.bullets);
        }
    });

    it('creates a section of every type', () => {
        for (const type of ['hero', 'feature', 'text', 'feed', 'contact', 'cta', 'stats', 'image', 'leaderboard'] as const) {
            expect(createSection(type).type).toBe(type);
        }
        const stats = createSection('stats');
        expect(stats.type === 'stats' && stats.items[0].source).toBe('dynoRuns');
    });

    it('gives each new leader board its own copy of the default boards', () => {
        const a = createSection('leaderboard');
        const b = createSection('leaderboard');
        if (a.type !== 'leaderboard' || b.type !== 'leaderboard') throw new Error('not a leader board');
        expect(a.heading).toBe('Leader Board');
        expect(a.boards.map(board => board.metric)).toEqual(['hubPowerWhp', 'hubPowerPerLitre']);
        expect(a.boards).not.toBe(b.boards);
    });
});
