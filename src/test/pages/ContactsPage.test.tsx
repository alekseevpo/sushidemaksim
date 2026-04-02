import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ContactsPage from '../../pages/ContactsPage';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { api } from '../../utils/api';

// Mock API
vi.mock('../../utils/api', () => ({
    api: {
        post: vi.fn(),
        get: vi.fn().mockResolvedValue({}),
    },
    ApiError: class extends Error {
        constructor(
            public message: string,
            public status?: number
        ) {
            super(message);
        }
    },
}));

// Mock useGoogleReCaptcha is now handled globally in setup.ts

// Mock useToast
const mockSuccess = vi.fn();
const mockError = vi.fn();
vi.mock('../../context/ToastContext', () => ({
    useToast: () => ({
        success: mockSuccess,
        error: mockError,
    }),
}));

describe('ContactsPage (Security)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
                staleTime: 0,
            },
        },
    });

    const renderPage = () =>
        render(
            <QueryClientProvider client={queryClient}>
                <HelmetProvider>
                    <BrowserRouter>
                        <ContactsPage />
                    </BrowserRouter>
                </HelmetProvider>
            </QueryClientProvider>
        );

    it('submits contact form', async () => {
        renderPage();

        fireEvent.change(screen.getByPlaceholderText(/Nombre completo/i), {
            target: { value: 'John Doe' },
        });
        fireEvent.change(screen.getByPlaceholderText(/tu@email\.com/i), {
            target: { value: 'john@example.com' },
        });
        fireEvent.change(screen.getByPlaceholderText(/¿En qué podemos ayudarte\?/i), {
            target: { value: 'Hello from test' },
        });

        (api.post as any).mockResolvedValue({ success: true });

        const submitButton = screen.getByRole('button', { name: /ENVIAR MENSAJE/i });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(api.post).toHaveBeenCalledWith(
                '/contact',
                expect.objectContaining({
                    name: 'John Doe',
                    email: 'john@example.com',
                    message: 'Hello from test',
                })
            );
            expect(mockSuccess).toHaveBeenCalledWith(
                expect.stringMatching(/Mensaje enviado con éxito/i)
            );
        });
    });
});
