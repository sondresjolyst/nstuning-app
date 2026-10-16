import { createUserService, request } from '@sjolystinnovation/app-kit/api';
import axiosInstance from './axiosInstance';
import publicClient from './publicClient';

export type { UserProfile } from '@sjolystinnovation/app-kit/api';

export interface RegisterData {
    userName: string;
    email: string;
    firstName: string;
    lastName: string;
    password: string;
}

const UserService = {
    ...createUserService(axiosInstance, publicClient),

    register: async (data: RegisterData): Promise<void> => {
        await request(() => publicClient.post('/auth/register', data), 'Failed to register');
    },
};

export default UserService;
