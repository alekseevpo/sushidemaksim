import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { CartProvider, useCart } from './useCart';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock the API to avoid real network calls
vi.mock('../utils/api', () => ({
    api: {
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
    },
}));

// Mock useAuth to control authentication state
vi.mock('./useAuth', () => ({
    useAuth: () => ({
        isAuthenticated: false, // Default to guest for simple logic tests
        user: null,
    }),
    AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: false,
        },
    },
});

// Helper to wrap with Provider
const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
        <CartProvider>{children}</CartProvider>
    </QueryClientProvider>
);

describe('useCart Hook (Integration)', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.clearAllMocks();
        queryClient.clear();
    });

    it('should start with an empty cart', () => {
        const { result } = renderHook(() => useCart(), { wrapper });
        expect(result.current.items).toEqual([]);
        expect(result.current.total).toBe(0);
        expect(result.current.itemCount).toBe(0);
    });

    it('should add an item successfully', async () => {
        const { result } = renderHook(() => useCart(), { wrapper });

        const testItem = {
            id: '1',
            name: 'Salmon Roll',
            price: 10,
            category: 'rolls' as any,
            image: '',
            description: '',
        };

        await act(async () => {
            await result.current.addItem(testItem);
        });

        await waitFor(() => {
            expect(result.current.items).toHaveLength(1);
        });
        expect(result.current.items[0].name).toBe('Salmon Roll');
        expect(result.current.total).toBe(10);
        expect(result.current.itemCount).toBe(1);
    });

    it('should increment quantity when adding same item twice', async () => {
        const { result } = renderHook(() => useCart(), { wrapper });
        const testItem = {
            id: '1',
            name: 'Sushi',
            price: 5,
            category: 'sushi' as any,
            image: '',
            description: '',
        };

        await act(async () => {
            await result.current.addItem(testItem);
        });
        await act(async () => {
            await result.current.addItem(testItem);
        });

        await waitFor(() => {
            expect(result.current.items).toHaveLength(1);
            expect(result.current.items[0].quantity).toBe(2);
        });
        expect(result.current.total).toBe(10);
    });

    it('should update quantity manually', async () => {
        const { result } = renderHook(() => useCart(), { wrapper });
        const testItem = {
            id: '1',
            name: 'Sushi',
            price: 5,
            category: 'sushi' as any,
            image: '',
            description: '',
        };

        await act(async () => {
            await result.current.addItem(testItem);
        });

        await act(async () => {
            await result.current.updateQuantity('1', 5);
        });

        await waitFor(() => {
            expect(result.current.items[0].quantity).toBe(5);
        });
        expect(result.current.total).toBe(25);
    });

    it('should remove an item', async () => {
        const { result } = renderHook(() => useCart(), { wrapper });
        const testItem = {
            id: '1',
            name: 'Sushi',
            price: 5,
            category: 'sushi' as any,
            image: '',
            description: '',
        };

        await act(async () => {
            await result.current.addItem(testItem);
        });

        await act(async () => {
            await result.current.removeItem('1');
        });

        await waitFor(() => {
            expect(result.current.items).toHaveLength(0);
        });
        expect(result.current.total).toBe(0);
    });

    it('should clear the cart', async () => {
        const { result } = renderHook(() => useCart(), { wrapper });
        await act(async () => {
            await result.current.addItem({
                id: '1',
                name: 'A',
                price: 1,
                category: 'sushi' as any,
                image: '',
                description: '',
            });
            await result.current.addItem({
                id: '2',
                name: 'B',
                price: 2,
                category: 'sushi' as any,
                image: '',
                description: '',
            });
            await result.current.clearCart();
        });

        await waitFor(() => {
            expect(result.current.items).toHaveLength(0);
            expect(result.current.itemCount).toBe(0);
        });
    });
});
