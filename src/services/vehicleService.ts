import axiosInstance from './axiosInstance';
import { request } from '@/lib/apiRequest';

export interface VehicleItem {
    id: number;
    name: string;
}

export interface EngineCatalogItem extends VehicleItem {
    brandId: number | null;
}

export interface ModelNode extends VehicleItem {
    family: string | null;
    variants: VehicleItem[];
    engineIds: number[];
}

export interface BrandNode extends VehicleItem {
    models: ModelNode[];
}

export interface VehicleTree {
    brands: BrandNode[];
    engines: EngineCatalogItem[];
}

type Level = 'brands' | 'models' | 'variants' | 'engines';

const VehicleService = {
    getTree: () =>
        request(() => axiosInstance.get<VehicleTree>('/vehicles/tree'), 'Failed to load vehicles'),

    addBrand: (name: string) =>
        request(() => axiosInstance.post<VehicleItem>('/vehicles/brands', { name }), 'Failed to add brand'),

    removeBrand: (id: number) =>
        request(() => axiosInstance.delete(`/vehicles/brands/${id}`), 'Failed to delete brand'),

    addModel: (brandId: number, name: string) =>
        request(() => axiosInstance.post<VehicleItem>(`/vehicles/brands/${brandId}/models`, { name }), 'Failed to add model'),

    removeModel: (id: number) =>
        request(() => axiosInstance.delete(`/vehicles/models/${id}`), 'Failed to delete model'),

    setModelFamily: (id: number, family: string | null) =>
        request(() => axiosInstance.put(`/vehicles/models/${id}/family`, { family }), 'Failed to set family'),

    addVariant: (modelId: number, name: string) =>
        request(() => axiosInstance.post<VehicleItem>(`/vehicles/models/${modelId}/variants`, { name }), 'Failed to add variant'),

    removeVariant: (id: number) =>
        request(() => axiosInstance.delete(`/vehicles/variants/${id}`), 'Failed to delete variant'),

    addEngine: (name: string, brandId: number | null = null) =>
        request(() => axiosInstance.post<EngineCatalogItem>('/vehicles/engines', { name, brandId }), 'Failed to add engine'),

    removeEngine: (id: number) =>
        request(() => axiosInstance.delete(`/vehicles/engines/${id}`), 'Failed to delete engine'),

    linkEngine: (modelId: number, engineId: number) =>
        request(() => axiosInstance.post(`/vehicles/models/${modelId}/engines/${engineId}`), 'Failed to link engine'),

    unlinkEngine: (modelId: number, engineId: number) =>
        request(() => axiosInstance.delete(`/vehicles/models/${modelId}/engines/${engineId}`), 'Failed to unlink engine'),

    rename: (level: Level, id: number, name: string) =>
        request(() => axiosInstance.put(`/vehicles/${level}/${id}`, { name }), 'Failed to rename'),
};

export default VehicleService;
