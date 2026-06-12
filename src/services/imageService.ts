import axiosInstance from './axiosInstance';
import { request } from '@/lib/apiRequest';

export interface UploadedImage {
    id: string;
    url: string;
}

export const imageUrl = (id: string): string =>
    `${process.env.NEXT_PUBLIC_API_URL}/content-images/${id}`;

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
