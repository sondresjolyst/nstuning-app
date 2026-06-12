import axiosInstance from './axiosInstance';
import { request } from '@/lib/apiRequest';

export interface VehicleItem {
    id: number;
    name: string;
}

export interface VariantNode extends VehicleItem {
    engines: VehicleItem[];
}

export interface ModelNode extends VehicleItem {
    variants: VariantNode[];
}

export interface BrandNode extends VehicleItem {
    models: ModelNode[];
}

type Level = 'brands' | 'models' | 'variants' | 'engines';

const VehicleService = {
    getTree: () =>
        request(() => axiosInstance.get<BrandNode[]>('/vehicles/tree'), 'Failed to load vehicles'),

    addBrand: (name: string) =>
        request(() => axiosInstance.post<VehicleItem>('/vehicles/brands', { name }), 'Failed to add brand'),

    removeBrand: (id: number) =>
        request(() => axiosInstance.delete(`/vehicles/brands/${id}`), 'Failed to delete brand'),

    addModel: (brandId: number, name: string) =>
        request(() => axiosInstance.post<VehicleItem>(`/vehicles/brands/${brandId}/models`, { name }), 'Failed to add model'),

    removeModel: (id: number) =>
        request(() => axiosInstance.delete(`/vehicles/models/${id}`), 'Failed to delete model'),

    addVariant: (modelId: number, name: string) =>
        request(() => axiosInstance.post<VehicleItem>(`/vehicles/models/${modelId}/variants`, { name }), 'Failed to add variant'),

    removeVariant: (id: number) =>
        request(() => axiosInstance.delete(`/vehicles/variants/${id}`), 'Failed to delete variant'),

    addEngine: (variantId: number, name: string) =>
        request(() => axiosInstance.post<VehicleItem>(`/vehicles/variants/${variantId}/engines`, { name }), 'Failed to add engine'),

    removeEngine: (id: number) =>
        request(() => axiosInstance.delete(`/vehicles/engines/${id}`), 'Failed to delete engine'),

    rename: (level: Level, id: number, name: string) =>
        request(() => axiosInstance.put(`/vehicles/${level}/${id}`, { name }), 'Failed to rename'),
};

export default VehicleService;
