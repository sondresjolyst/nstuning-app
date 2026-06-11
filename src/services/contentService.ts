import axios from 'axios';
import axiosInstance from './axiosInstance';
import { formatApiError } from '@/lib/errors';
import { Section } from '@/types/content';

const publicClient = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_URL });

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
        try {
            const response = await axiosInstance.put<Section[]>('/content/home', sections);
            return response.data;
        } catch (error: unknown) {
            throw new Error(formatApiError(error, 'Failed to save content'));
        }
    },
};

export default ContentService;
