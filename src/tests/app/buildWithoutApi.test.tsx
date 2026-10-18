import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PHASE_PRODUCTION_BUILD } from 'next/constants';
import DynoRunsPage from '@/app/dyno-runs/page';
import TermsPage from '@/app/terms/page';

beforeEach(() => {
    vi.stubEnv('NEXT_PHASE', PHASE_PRODUCTION_BUILD);
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('ECONNREFUSED'));
    vi.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
});

describe('public pages built while the API is down', () => {
    it('builds the dyno runs page with its empty state', async () => {
        render(await DynoRunsPage());

        expect(screen.getByText('No dyno runs published yet.')).toBeInTheDocument();
    });

    it('builds a legal page as not written yet', async () => {
        render(await TermsPage());

        expect(screen.getByText('This content has not been written yet.')).toBeInTheDocument();
    });
});
