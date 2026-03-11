export class ApiError extends Error {
    constructor(
        public message: string,
        public status?: number
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

export const api = {
    async get(endpoint: string) {
        return fetchApi(endpoint, { method: 'GET' });
    },

    async post(endpoint: string, body?: any) {
        return fetchApi(endpoint, {
            method: 'POST',
            body: JSON.stringify(body),
        });
    },

    async put(endpoint: string, body?: any) {
        return fetchApi(endpoint, {
            method: 'PUT',
            body: JSON.stringify(body),
        });
    },

    async patch(endpoint: string, body?: any) {
        return fetchApi(endpoint, {
            method: 'PATCH',
            body: JSON.stringify(body),
        });
    },

    async delete(endpoint: string) {
        return fetchApi(endpoint, { method: 'DELETE' });
    },
};

async function fetchApi(endpoint: string, options: RequestInit = {}) {
    const token = localStorage.getItem('sushi_token');

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...((options.headers as Record<string, string>) || {}),
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
        const response = await fetch(`/api${endpoint}`, {
            ...options,
            headers,
            signal: controller.signal,
        });

        const data = await response.json().catch(() => null);

        if (response.status === 401) {
            // Token expired or invalid — clear session
            localStorage.removeItem('sushi_token');

            // Don't reload the page if the user is trying to login or we just get a bad login / wrong password
            if (
                endpoint !== '/auth/login' &&
                endpoint !== '/auth/register' &&
                window.location.pathname !== '/'
            ) {
                window.location.href = '/';
            }

            throw new ApiError(data?.error || 'No autorizado', 401);
        }

        if (!response.ok) {
            throw new ApiError(
                data?.error || `Error ${response.status}: Ha ocurrido un problema con el servidor.`,
                response.status
            );
        }

        return data;
    } catch (error: any) {
        if (error.name === 'AbortError') {
            throw new ApiError(
                'La solicitud ha tardado demasiado tiempo. Reintenta de nuevo.',
                408
            );
        }
        throw error;
    } finally {
        clearTimeout(timeoutId);
    }
}
