import axios from 'axios';

export function formatApiError(error: unknown, fallback: string): string {
    if (axios.isAxiosError(error)) {
        const data = error.response?.data as { message?: string; errors?: Record<string, string[]> } | undefined;
        if (data?.message) return data.message;
        if (data?.errors) {
            const first = Object.values(data.errors)[0];
            if (first && first.length) return first[0];
        }
    }
    if (error instanceof Error) return error.message;
    return fallback;
}
