import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import AdminContentPage from '@/app/(protected)/admin/content/page';
import type { Section } from '@/types/content';

const content = vi.hoisted(() => ({ getHome: vi.fn(), updateHome: vi.fn() }));
const upload = vi.hoisted(() => vi.fn());
vi.mock('@/services/contentService', () => ({ default: content }));
vi.mock('@/services/imageService', () => ({ default: { upload }, imageUrl: (id: string) => `http://api.test/api/content-images/${id}` }));

const base = { id: 's1', visible: true };
const image: Section = { ...base, type: 'image', imageId: null, alt: '', caption: '', layout: 'standard', text: '' };
const stats: Section = { ...base, id: 's2', type: 'stats', heading: '', items: [{ source: 'dynoRuns', value: '', label: 'Runs' }] };

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
});
