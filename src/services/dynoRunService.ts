import axios from 'axios';
import axiosInstance from './axiosInstance';
import { formatApiError } from '@/lib/errors';
import { revalidateTarget } from '@/lib/revalidate';
import { REVALIDATE_TARGETS } from '@/lib/cacheTags';
import { imageUrl, imageSrcSet } from './imageService';

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
    dynoDate?: string | null;
    displacementCc?: number | null;
    absolutePressureKpa?: number | null;
    hubPowerBeforeWhp?: number | null;
    hubPowerAfterWhp?: number | null;
    hubTorqueBeforeWnm?: number | null;
    hubTorqueAfterWnm?: number | null;
    enginePowerBeforeHp?: number | null;
    enginePowerAfterHp?: number | null;
    engineTorqueBeforeNm?: number | null;
    engineTorqueAfterNm?: number | null;
    description?: string | null;
    coverImageId?: string | null;
    published: boolean;
    sortOrder: number;
    hasReport: boolean;
    reportFileName?: string | null;
    createdAt: string;
    updatedAt: string;
}

const publicClient = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_URL });

export const reportUrl = (id: number) =>
    `${process.env.NEXT_PUBLIC_API_URL}/dyno-runs/${id}/report`;

export const reportProxyUrl = (id: number) => `/api/report/${id}`;

export const coverImageSrc = (run: DynoRun): string | null =>
    run.coverImageId != null ? imageUrl(run.coverImageId) : null;

export const coverImageSrcSet = (run: DynoRun): string | undefined =>
    run.coverImageId != null ? imageSrcSet(run.coverImageId) : undefined;

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
            await revalidateDynoRuns();
            return response.data;
        } catch (error: unknown) {
            throw new Error(formatApiError(error, 'Failed to create dyno run'));
        }
    },

    async update(id: number, form: FormData): Promise<DynoRun> {
        try {
            const response = await axiosInstance.put<DynoRun>(`/dyno-runs/${id}`, form);
            await revalidateDynoRuns();
            return response.data;
        } catch (error: unknown) {
            throw new Error(formatApiError(error, 'Failed to update dyno run'));
        }
    },

    async remove(id: number): Promise<void> {
        try {
            await axiosInstance.delete(`/dyno-runs/${id}`);
            await revalidateDynoRuns();
        } catch (error: unknown) {
            throw new Error(formatApiError(error, 'Failed to delete dyno run'));
        }
    },
};

async function revalidateDynoRuns(): Promise<void> {
    await revalidateTarget(REVALIDATE_TARGETS.dynoRuns);
}

export default DynoRunService;
