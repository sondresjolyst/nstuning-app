import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('@/components/BrandingProvider', () => ({
    useBranding: () => ({ logoUrl: null }),
}));

import Footer from '@/app/footer';

describe('Footer', () => {
    it('credits the maker by registered legal name', () => {
        render(<Footer />);
        expect(screen.getByText('Sjølyst Innovation AS')).toBeInTheDocument();
    });
});
