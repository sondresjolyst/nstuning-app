import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import DynoRunCard from '@/components/DynoRunCard';
import { DynoRun } from '@/services/dynoRunService';
import { uppercaseUnitText } from '@/tests/unitCasing';

const run: DynoRun = {
    id: 1, slug: 'volvo-242-turbo', title: 'Volvo 242 Turbo Stage 2', carMake: 'Volvo', carModel: '242 Turbo', year: 2019,
    enginePowerBeforeHp: 300, enginePowerAfterHp: 360, published: true, sortOrder: 0, hasReport: true,
    createdAt: '', updatedAt: '',
};

describe('DynoRunCard', () => {
    it('renders title, car line and power gain', () => {
        render(<DynoRunCard run={run} />);
        expect(screen.getByText('Volvo 242 Turbo Stage 2')).toBeInTheDocument();
        expect(screen.getByText('Volvo 242 Turbo 2019')).toBeInTheDocument();
        expect(screen.getByText('+60 hp')).toBeInTheDocument();
    });

    it('keeps units out of uppercase styling', () => {
        const { container } = render(<DynoRunCard run={{ ...run, engineTorqueAfterNm: 450 }} />);
        expect(screen.getByText('Nm')).toBeInTheDocument();
        expect(uppercaseUnitText(container)).toEqual([]);
    });

    it('marks drafts', () => {
        render(<DynoRunCard run={{ ...run, published: false }} />);
        expect(screen.getByText('Draft')).toBeInTheDocument();
    });
});
