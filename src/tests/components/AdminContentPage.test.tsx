import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import AdminContentPage from '@/app/(protected)/admin/content/page';
import type { Section } from '@/types/content';

const content = vi.hoisted(() => ({ getHome: vi.fn(), updateHome: vi.fn() }));
const upload = vi.hoisted(() => vi.fn());
vi.mock('@/services/contentService', () => ({ default: content }));
vi.mock('@/services/imageService', () => ({ default: { upload }, imageUrl: (id: string) => `http://api.test/api/content-images/${id}` }));

const base = { id: 's1', visible: true };
const image: Section = { ...base, type: 'image', imageId: null, alt: '', caption: '', layout: 'standard', text: '' };
const stats: Section = { ...base, id: 's2', type: 'stats', heading: '', items: [{ source: 'dynoRuns', value: '', label: 'Runs' }] };
const leaderboard: Section = {
    ...base, id: 's3', type: 'leaderboard', heading: 'Leader Board',
    boards: [
        { title: 'Max measured whp', metric: 'hubPowerWhp', limit: 5 },
        { title: 'Per litre', metric: 'hubPowerPerLitre', limit: 5 },
    ],
};

const savedSections = async () => {
    fireEvent.click(screen.getAllByRole('button', { name: 'Save' })[0]);
    await waitFor(() => expect(content.updateHome).toHaveBeenCalled());
    return content.updateHome.mock.calls[0][0] as Section[];
};

const boardsOf = (sections: Section[]) => {
    const section = sections.find(s => s.type === 'leaderboard');
    return section && section.type === 'leaderboard' ? section.boards : [];
};

describe('AdminContentPage', () => {
    beforeEach(() => {
        content.getHome.mockReset();
        content.updateHome.mockReset();
        upload.mockReset();
    });

    it('starts the add list on the feature type', async () => {
        content.getHome.mockResolvedValue([stats]);
        render(<AdminContentPage />);
        const select = await screen.findByDisplayValue('Feature');
        expect(select.tagName).toBe('SELECT');
    });

    it('names the delete button of each section "Delete section"', async () => {
        content.getHome.mockResolvedValue([stats, image]);
        render(<AdminContentPage />);
        expect(await screen.findAllByRole('button', { name: 'Delete section' })).toHaveLength(2);
    });

    it('offers the live dyno run and brand counts as stat sources', async () => {
        content.getHome.mockResolvedValue([stats]);
        render(<AdminContentPage />);
        expect(await screen.findByRole('option', { name: 'Published dyno runs (live)' })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: 'Brands tuned (live)' })).toBeInTheDocument();
    });

    it('uploads an image, previews it from the API and saves it', async () => {
        content.getHome.mockResolvedValue([image]);
        content.updateHome.mockResolvedValue(undefined);
        upload.mockResolvedValue({ id: 'up-1', url: '' });
        const { container } = render(<AdminContentPage />);
        await screen.findByText('Home page');
        const file = new File(['x'], 'a.png', { type: 'image/png' });
        fireEvent.change(container.querySelector('input[type="file"]')!, { target: { files: [file] } });
        await waitFor(() => expect(container.querySelector('img')).toHaveAttribute('src', 'http://api.test/api/content-images/up-1'));
        expect(upload).toHaveBeenCalledWith(file);
        fireEvent.click(screen.getAllByRole('button', { name: 'Save' })[0]);
        await waitFor(() => expect(content.updateHome).toHaveBeenCalled());
        expect(content.updateHome.mock.calls[0][0][0]).toMatchObject({ type: 'image', imageId: 'up-1' });
    });

    it('lays the cards out directly in the page column', async () => {
        content.getHome.mockResolvedValue([stats]);
        const { container } = render(<AdminContentPage />);
        await screen.findByText('Home page');
        const column = container.firstElementChild!;
        expect(column).toHaveClass('space-y-4');
        expect(column.querySelectorAll(':scope > .space-y-4')).toHaveLength(0);
    });

    it('adds a leader board section with the two default boards', async () => {
        content.getHome.mockResolvedValue([stats]);
        content.updateHome.mockResolvedValue(undefined);
        render(<AdminContentPage />);
        const addList = await screen.findByDisplayValue('Feature');
        expect(within(addList).getByRole('option', { name: 'Leader Board' })).toBeInTheDocument();
        fireEvent.change(addList, { target: { value: 'leaderboard' } });
        fireEvent.click(screen.getByRole('button', { name: /Add section/i }));
        expect(await screen.findByRole('group', { name: 'Board 2' })).toBeInTheDocument();

        const saved = await savedSections();
        expect(saved[1]).toMatchObject({ type: 'leaderboard', heading: 'Leader Board', visible: true });
        expect(boardsOf(saved)).toEqual([
            { title: 'Max measured whp', metric: 'hubPowerWhp', limit: 5 },
            { title: 'whp per litre calculated for 100 kPa', metric: 'hubPowerPerLitre', limit: 5 },
        ]);
    });

    it('edits a board title, metric and limit', async () => {
        content.getHome.mockResolvedValue([leaderboard]);
        content.updateHome.mockResolvedValue(undefined);
        render(<AdminContentPage />);
        const first = await screen.findByRole('group', { name: 'Board 1' });
        fireEvent.change(within(first).getByLabelText('Title'), { target: { value: 'Torque kings' } });
        fireEvent.change(within(first).getByLabelText('Metric'), { target: { value: 'hubTorqueWnm' } });
        fireEvent.change(within(first).getByLabelText('Runs shown'), { target: { value: '3' } });

        expect(boardsOf(await savedSections())[0]).toEqual({ title: 'Torque kings', metric: 'hubTorqueWnm', limit: 3 });
    });

    it('offers every metric in the metric list', async () => {
        content.getHome.mockResolvedValue([leaderboard]);
        render(<AdminContentPage />);
        const first = await screen.findByRole('group', { name: 'Board 1' });
        const options = within(within(first).getByLabelText('Metric')).getAllByRole('option').map(o => (o as HTMLOptionElement).value);
        expect(options).toEqual(['hubPowerWhp', 'hubPowerPerLitre', 'hubTorqueWnm', 'hubTorquePerLitre', 'enginePowerHp', 'engineTorqueNm']);
    });

    it('lets the runs shown field be cleared and retyped, and clamps it on blur', async () => {
        content.getHome.mockResolvedValue([leaderboard]);
        content.updateHome.mockResolvedValue(undefined);
        render(<AdminContentPage />);
        const first = await screen.findByRole('group', { name: 'Board 1' });
        const limit = within(first).getByLabelText('Runs shown');
        fireEvent.change(limit, { target: { value: '' } });
        expect(limit).toHaveValue(null);
        fireEvent.change(limit, { target: { value: '12' } });
        expect(limit).toHaveValue(12);
        fireEvent.change(limit, { target: { value: '99' } });
        fireEvent.blur(limit);
        expect(limit).toHaveValue(20);

        const second = within(screen.getByRole('group', { name: 'Board 2' })).getByLabelText('Runs shown');
        fireEvent.change(second, { target: { value: '' } });
        fireEvent.blur(second);
        expect(second).toHaveValue(5);

        expect(boardsOf(await savedSections()).map(b => b.limit)).toEqual([20, 5]);
    });

    it('opens stored boards that are null or not objects without crashing', async () => {
        const stored = { ...leaderboard, boards: [null, 'x', { title: 'Kept', metric: 'hubPowerWhp', limit: 2 }] } as unknown as Section;
        content.getHome.mockResolvedValue([stored]);
        content.updateHome.mockResolvedValue(undefined);
        render(<AdminContentPage />);
        const first = await screen.findByRole('group', { name: 'Board 1' });
        expect(within(first).getByLabelText('Title')).toHaveValue('Kept');
        expect(screen.queryByRole('group', { name: 'Board 2' })).not.toBeInTheDocument();
        fireEvent.change(within(first).getByLabelText('Title'), { target: { value: 'Kept too' } });
        expect(boardsOf(await savedSections())).toEqual([{ title: 'Kept too', metric: 'hubPowerWhp', limit: 2 }]);
    });

    it('adds, reorders and removes boards', async () => {
        content.getHome.mockResolvedValue([leaderboard]);
        content.updateHome.mockResolvedValue(undefined);
        render(<AdminContentPage />);
        const first = await screen.findByRole('group', { name: 'Board 1' });
        expect(within(first).getByRole('button', { name: 'Move board up' })).toBeDisabled();
        fireEvent.click(within(first).getByRole('button', { name: 'Move board down' }));
        fireEvent.click(screen.getByRole('button', { name: 'Add board' }));
        const third = screen.getByRole('group', { name: 'Board 3' });
        expect(within(third).getByRole('button', { name: 'Move board down' })).toBeDisabled();
        fireEvent.click(within(screen.getByRole('group', { name: 'Board 2' })).getByRole('button', { name: 'Remove board' }));

        expect(boardsOf(await savedSections())).toEqual([
            { title: 'Per litre', metric: 'hubPowerPerLitre', limit: 5 },
            { title: '', metric: 'hubPowerWhp', limit: 5 },
        ]);
    });

    it('keeps an unknown stored metric visible instead of switching it silently', async () => {
        const stored = { ...leaderboard, boards: [{ title: 'Old', metric: 'quarterMile', limit: 5 }] } as unknown as Section;
        content.getHome.mockResolvedValue([stored]);
        render(<AdminContentPage />);
        const first = await screen.findByRole('group', { name: 'Board 1' });
        expect(within(first).getByLabelText('Metric')).toHaveDisplayValue('Unknown metric');
    });
});
