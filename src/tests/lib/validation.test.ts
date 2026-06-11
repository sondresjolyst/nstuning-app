import { describe, it, expect } from 'vitest';
import { registerSchema, contactSchema } from '@/lib/validation';

describe('registerSchema', () => {
    it('accepts a valid registration', () => {
        const result = registerSchema.safeParse({
            userName: 'sondre', firstName: 'Sondre', lastName: 'S', email: 'a@b.no', password: 'Password1',
        });
        expect(result.success).toBe(true);
    });

    it('rejects a weak password', () => {
        const result = registerSchema.safeParse({
            userName: 'sondre', firstName: 'Sondre', lastName: 'S', email: 'a@b.no', password: 'weak',
        });
        expect(result.success).toBe(false);
    });

    it('rejects an invalid email', () => {
        const result = registerSchema.safeParse({
            userName: 'sondre', firstName: 'Sondre', lastName: 'S', email: 'not-an-email', password: 'Password1',
        });
        expect(result.success).toBe(false);
    });
});

describe('contactSchema', () => {
    it('accepts a minimal enquiry', () => {
        const result = contactSchema.safeParse({ name: 'Ola', email: 'ola@kunde.no', message: 'Hei' });
        expect(result.success).toBe(true);
    });

    it('requires a message', () => {
        const result = contactSchema.safeParse({ name: 'Ola', email: 'ola@kunde.no', message: '' });
        expect(result.success).toBe(false);
    });
});
