import React, { ReactNode } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

const createTestQueryClient = () =>
    new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
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
                    <BrowserRouter>{children}</BrowserRouter>
                </HelmetProvider>
            </QueryClientProvider>
        );
    }

    return render(ui, { wrapper: Wrapper, ...options });
}

export * from '@testing-library/react';
