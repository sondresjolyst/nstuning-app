import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import DynoRunDetail from '@/app/dyno-runs/[slug]/page';

vi.mock('@/components/ReportViewer', () => ({ default: () => null }));

const volvo = {
    id: 2,
    slug: 'volvo-242',
    title: 'Volvo 242',
    displacementCc: 3430,
    absolutePressureKpa: 176,
    hubPowerBeforeWhp: 200,
    hubPowerAfterWhp: 265,
    hubTorqueAfterWnm: 417,
    enginePowerAfterHp: 315,
    engineTorqueAfterNm: 480,
    published: true,
    sortOrder: 0,
    hasReport: false,
    createdAt: '2026-06-16T12:15:03Z',
    updatedAt: '2026-06-16T12:15:03Z',
};

const renderRun = async (run: object) => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify(run), { status: 200, headers: { 'Content-Type': 'application/json' } }));
    render(await DynoRunDetail({ params: Promise.resolve({ slug: 'volvo-242' }) }));
};

afterEach(() => vi.restoreAllMocks());

const groupLabels = ['Measured at hub', 'Per litre at 100 kPa', 'Calculated engine'];

describe('dyno run detail', () => {
    it('shows hub, then per litre, then calculated engine', async () => {
        await renderRun(volvo);
        const labels = screen.getAllByText(text => groupLabels.includes(text)).map(el => el.textContent);
        expect(labels).toEqual(groupLabels);
    });

    it('works out per litre figures from the wheel figures at 100 kPa', async () => {
        await renderRun(volvo);
        const perLitre = screen.getByText('Per litre at 100 kPa').nextElementSibling!;
        expect(perLitre.textContent).toBe('Power43.9 whp/LTorque69.1 wNm/L');
    });

    it('treats a missing pressure as 100 kPa', async () => {
        await renderRun({ ...volvo, absolutePressureKpa: null });
        expect(screen.getByText('Per litre at 100 kPa').nextElementSibling!.textContent).toBe('Power77.3 whp/LTorque121.6 wNm/L');
    });

    it('hides per litre figures without a displacement', async () => {
        await renderRun({ ...volvo, displacementCc: null });
        expect(screen.queryByText('Per litre at 100 kPa')).not.toBeInTheDocument();
        expect(screen.getByText('Calculated engine')).toBeInTheDocument();
    });
});
