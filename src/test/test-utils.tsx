import React, { ReactNode } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

import { ToastProvider } from '../context/ToastContext';
import { AuthProvider } from '../hooks/useAuth';
import { CartProvider } from '../hooks/useCart';

const createTestQueryClient = () =>
    new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
                staleTime: 0,
            },
        },
    });

export function renderWithProviders(
    ui: React.ReactElement,
    options?: Omit<RenderOptions, 'wrapper'>
) {
    const queryClient = createTestQueryClient();

    function Wrapper({ children }: { children: ReactNode }) {
        return (
            <QueryClientProvider client={queryClient}>
                <HelmetProvider>
                    <ToastProvider>
                        <AuthProvider>
                            <CartProvider>
                                <BrowserRouter>{children}</BrowserRouter>
                            </CartProvider>
                        </AuthProvider>
                    </ToastProvider>
                </HelmetProvider>
            </QueryClientProvider>
        );
    }

    return render(ui, { wrapper: Wrapper, ...options });
}

export * from '@testing-library/react';
