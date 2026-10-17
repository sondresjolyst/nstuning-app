import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import TermsPage, { metadata as termsMetadata } from '@/app/terms/page';
import PrivacyPage from '@/app/privacy/page';
import CookiesPage from '@/app/cookies/page';

function mockPage(page: unknown, status = 200) {
    return vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response(JSON.stringify(page), { status, headers: { 'content-type': 'application/json' } }));
}

afterEach(() => vi.restoreAllMocks());

describe('legal pages', () => {
    it('renders the page the admin wrote, fetched in English under the legal tag', async () => {
        const fetchMock = mockPage({ key: 'terms', locale: 'en', title: 'Terms of Service', bodyMarkdown: '## 1. About us\n\nRun by [us](/contact).', updatedAt: '2026-06-01T00:00:00Z' });

        render(await TermsPage());

        expect(screen.getByRole('heading', { level: 1, name: 'Terms of Service' })).toBeInTheDocument();
        expect(screen.getByRole('heading', { level: 2, name: '1. About us' })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'us' })).toHaveAttribute('href', '/contact');
        expect(screen.getByText(/Last updated: 1 June 2026/)).toBeInTheDocument();
        const [url, init] = fetchMock.mock.calls[0]!;
        expect(String(url)).toBe('http://api.test/api/content/legal/terms?locale=en');
        expect((init as { next?: { tags?: string[] } }).next?.tags).toEqual(['legal']);
    });

    it.each([
        ['privacy', PrivacyPage, 'Privacy Policy'],
        ['cookies', CookiesPage, 'Cookie Policy'],
    ] as const)('shows the %s title while the page has not been written', async (_key, Page, title) => {
        mockPage(null, 404);

        render(await Page());

        expect(screen.getByRole('heading', { level: 1, name: title })).toBeInTheDocument();
        expect(screen.getByText('This content has not been written yet.')).toBeInTheDocument();
    });

    it('keeps the page metadata', () => {
        expect(termsMetadata.title).toBe('Terms of Service');
        expect(termsMetadata.alternates?.canonical).toBe('/terms');
    });
});
