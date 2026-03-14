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

            // List of public pages that should NOT redirect on 401
            const publicPages = ['/', '/menu', '/cart', '/promo', '/contacts', '/blog'];
            const currentPath = window.location.pathname.replace(/\/$/, '') || '/';
            const isPublicPage =
                publicPages.includes(currentPath) ||
                window.location.pathname.startsWith('/blog/') ||
                window.location.pathname.startsWith('/track/') ||
                window.location.pathname.startsWith('/pay-for-friend/');

            // Don't reload/redirect if the user is trying to login/register
            // OR if they are already on a public page
            if (endpoint !== '/auth/login' && endpoint !== '/auth/register' && !isPublicPage) {
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
        // Network errors (server down, no internet, CORS, etc.)
        if (
            error instanceof TypeError &&
            (error.message === 'Failed to fetch' ||
                error.message === 'Load failed' ||
                error.message.includes('NetworkError'))
        ) {
            throw new ApiError(
                'No se pudo conectar con el servidor. Comprueba tu conexión a internet e inténtalo de nuevo.',
                0
            );
        }
        throw error;
    } finally {
        clearTimeout(timeoutId);
    }
}
