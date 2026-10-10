import { z } from 'zod';
import { passwordSchema } from '@sjolystinnovation/app-kit/validation';

export const registerSchema = z.object({
    userName: z.string().min(3, 'Username must be at least 3 characters').max(50),
    firstName: z.string().min(1, 'First name is required').max(50),
    lastName: z.string().min(1, 'Last name is required').max(50),
    email: z.string().email('Enter a valid email'),
    password: passwordSchema(),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const contactSchema = z.object({
    name: z.string().min(1, 'Name is required').max(120),
    email: z.string().email('Enter a valid email'),
    phone: z.string().max(30).optional().or(z.literal('')),
    car: z.string().max(160).optional().or(z.literal('')),
    message: z.string().min(1, 'Message is required').max(4000),
});

export type ContactInput = z.infer<typeof contactSchema>;
