import axiosInstance from './axiosInstance';
import publicClient from './publicClient';
import { request } from '@sjolystinnovation/app-kit/api';
import { REVALIDATE_TARGETS, revalidateTarget } from '@/lib/cacheTags';
import { Section } from '@/types/content';

const ContentService = {
    async getHome(): Promise<Section[]> {
        try {
            const response = await publicClient.get<Section[]>('/content/home');
            return Array.isArray(response.data) ? response.data : [];
        } catch {
            return [];
        }
    },

    async updateHome(sections: Section[]): Promise<Section[]> {
        const saved = await request(() => axiosInstance.put<Section[]>('/content/home', sections), 'Failed to save content');
        await revalidateTarget(REVALIDATE_TARGETS.home);
        return saved;
    },
};

export default ContentService;
