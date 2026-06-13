import axios from 'axios';
import axiosInstance from './axiosInstance';
import { formatApiError } from '@/lib/errors';
import { imageUrl } from './imageService';

export interface DynoRun {
    id: number;
    slug: string;
    title: string;
    carMake?: string | null;
    carModel?: string | null;
    trim?: string | null;
    year?: number | null;
    engine?: string | null;
    fuelType?: string | null;
    powerBeforeHp?: number | null;
    powerAfterHp?: number | null;
    torqueBeforeNm?: number | null;
    torqueAfterNm?: number | null;
    description?: string | null;
    coverImageId?: string | null;
    published: boolean;
    sortOrder: number;
    hasReport: boolean;
    createdAt: string;
    updatedAt: string;
}

const publicClient = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_URL });

export const reportUrl = (id: number) =>
    `${process.env.NEXT_PUBLIC_API_URL}/dyno-runs/${id}/report`;

export const reportProxyUrl = (id: number) => `/api/report/${id}`;

export const coverImageSrc = (run: DynoRun): string | null =>
    run.coverImageId != null ? imageUrl(run.coverImageId) : null;

const DynoRunService = {
    async list(all = false): Promise<DynoRun[]> {
        const client = all ? axiosInstance : publicClient;
        try {
            const response = await client.get<DynoRun[]>('/dyno-runs', { params: all ? { all: true } : {} });
            return response.data;
        } catch (error: unknown) {
            throw new Error(formatApiError(error, 'Failed to load dyno runs'));
        }
    },

    async getBySlug(slug: string): Promise<DynoRun> {
        try {
            const response = await publicClient.get<DynoRun>(`/dyno-runs/${slug}`);
            return response.data;
        } catch (error: unknown) {
            throw new Error(formatApiError(error, 'Failed to load dyno run'));
        }
    },

    async create(form: FormData): Promise<DynoRun> {
        try {
            const response = await axiosInstance.post<DynoRun>('/dyno-runs', form);
            return response.data;
        } catch (error: unknown) {
            throw new Error(formatApiError(error, 'Failed to create dyno run'));
        }
    },

    async update(id: number, form: FormData): Promise<DynoRun> {
        try {
            const response = await axiosInstance.put<DynoRun>(`/dyno-runs/${id}`, form);
            return response.data;
        } catch (error: unknown) {
            throw new Error(formatApiError(error, 'Failed to update dyno run'));
        }
    },

    async remove(id: number): Promise<void> {
        try {
            await axiosInstance.delete(`/dyno-runs/${id}`);
        } catch (error: unknown) {
            throw new Error(formatApiError(error, 'Failed to delete dyno run'));
        }
    },
};

export default DynoRunService;
