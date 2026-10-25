import { describe, it, expect, vi, afterEach } from 'vitest';
import { isValidElement, type ReactElement, type ReactNode } from 'react';

vi.mock('next/script', () => ({ default: () => null }));
vi.mock('@/app/providers', () => ({ default: ({ children }: { children: ReactNode }) => children }));
vi.mock('@/app/navbar', () => ({ default: () => null }));
const Footer = vi.hoisted(() => () => null);
vi.mock('@/app/footer', () => ({ default: Footer }));

import RootLayout from '@/app/layout';

// Finds the elements of a type in a tree that has not been rendered yet.
function findAll(node: ReactNode, type: unknown): ReactElement[] {
    if (Array.isArray(node)) return node.flatMap(child => findAll(child, type));
    if (!isValidElement(node)) return [];
    const props = node.props as { children?: ReactNode };
    return [...(node.type === type ? [node] : []), ...findAll(props.children, type)];
}

afterEach(() => vi.restoreAllMocks());

describe('RootLayout', () => {
    it('hands the footer the company details from the API', async () => {
        vi.spyOn(globalThis, 'fetch').mockImplementation(async input => {
            const body = String(input).endsWith('/company') ? { name: 'NS Tuning', legalName: 'Nordmark Service AS', orgNumber: '923 202 374', vatRegistered: true, email: 'post@nstuning.no' } : {};
            return new Response(JSON.stringify(body), { status: 200, headers: { 'Content-Type': 'application/json' } });
        });
        const footers = findAll(await RootLayout({ children: null }), Footer);
        expect(footers).toHaveLength(1);
        expect((footers[0].props as { company: object }).company).toMatchObject({ legalName: 'Nordmark Service AS', email: 'post@nstuning.no', vatRegistered: true });
    });

    it('hands the footer the built-in details when the API is down', async () => {
        vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('ECONNREFUSED'));
        const [footer] = findAll(await RootLayout({ children: null }), Footer);
        expect((footer.props as { company: object }).company).toMatchObject({ legalName: 'Nordmark Service AS', orgNumber: '923 202 374', address: 'Håbakken 7, 4355 Kvernaland' });
    });
});
