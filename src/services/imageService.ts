import axiosInstance from './axiosInstance';
import { request } from '@sjolystinnovation/app-kit/api';

export interface UploadedImage {
    id: string;
    url: string;
}

/** Where the API serves the uploaded images. */
export const contentImagesUrl = (): string => `${process.env.NEXT_PUBLIC_API_URL}/content-images`;

export const imageUrl = (id: string): string => `${contentImagesUrl()}/${id}`;

const ImageService = {
    upload(file: File): Promise<UploadedImage> {
        const form = new FormData();
        form.append('file', file);
        return request(() => axiosInstance.post<UploadedImage>('/content-images', form), 'Failed to upload image');
    },

    remove: (id: string) =>
        request(() => axiosInstance.delete(`/content-images/${id}`), 'Failed to delete image'),
};

export default ImageService;
