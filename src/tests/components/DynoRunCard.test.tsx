import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import DynoRunCard from '@/components/DynoRunCard';
import { DynoRun } from '@/services/dynoRunService';

const run: DynoRun = {
    id: 1, slug: 'golf-r', title: 'Golf R Stage 2', carMake: 'VW', carModel: 'Golf R', year: 2019,
    powerBeforeHp: 300, powerAfterHp: 360, published: true, sortOrder: 0, hasReport: true,
    createdAt: '', updatedAt: '',
};

describe('DynoRunCard', () => {
    it('renders title, car line and power gain', () => {
        render(<DynoRunCard run={run} />);
        expect(screen.getByText('Golf R Stage 2')).toBeInTheDocument();
        expect(screen.getByText('VW Golf R 2019')).toBeInTheDocument();
        expect(screen.getByText('+60 hp')).toBeInTheDocument();
    });

    it('marks drafts', () => {
        render(<DynoRunCard run={{ ...run, published: false }} />);
        expect(screen.getByText('Draft')).toBeInTheDocument();
    });
});
