import axios from 'axios';
import axiosInstance from './axiosInstance';
import { formatApiError } from '@/lib/errors';

export interface LoginData {
    email: string;
    password: string;
}

export interface RegisterData {
    userName: string;
    email: string;
    firstName: string;
    lastName: string;
    password: string;
}

export interface TokenResponse {
    token: string;
    refreshToken: string;
}

const apiClient = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_URL });

const UserService = {
    async login(data: LoginData): Promise<TokenResponse> {
        try {
            const response = await apiClient.post<TokenResponse>('/auth/login', data);
            return response.data;
        } catch (error: unknown) {
            throw new Error(formatApiError(error, 'Failed to login'));
        }
    },

    async register(data: RegisterData): Promise<void> {
        try {
            await apiClient.post('/auth/register', data);
        } catch (error: unknown) {
            throw new Error(formatApiError(error, 'Failed to register'));
        }
    },

    async refreshToken(data: TokenResponse): Promise<TokenResponse> {
        const response = await apiClient.post<TokenResponse>('/auth/refresh-token', data);
        return response.data;
    },
};

export { apiClient, axiosInstance };
export default UserService;
