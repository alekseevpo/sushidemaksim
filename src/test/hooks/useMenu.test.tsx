import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useMenu, usePopularItems } from '../../hooks/queries/useMenu';
import { api } from '../../utils/api';

vi.mock('../../utils/api', () => ({
    api: {
        get: vi.fn(),
    },
}));

const createWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
            },
        },
    });
    return ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
};

describe('useMenu', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('fetches menu items without filters', async () => {
        const mockItems = [{ id: 1, name: 'Sake Maki', price: 5 }];
        vi.mocked(api.get).mockResolvedValueOnce({ items: mockItems });

        const { result } = renderHook(() => useMenu('all', ''), {
            wrapper: createWrapper(),
        });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(api.get).toHaveBeenCalledWith('/menu?');
        expect(result.current.data).toEqual(mockItems);
    });

    it('fetches menu items with category and search', async () => {
        const mockItems = [{ id: 2, name: 'Spicy Tuna', price: 6 }];
        vi.mocked(api.get).mockResolvedValueOnce({ items: mockItems });

        const { result } = renderHook(() => useMenu('rollos', 'tuna'), {
            wrapper: createWrapper(),
        });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(api.get).toHaveBeenCalledWith('/menu?category=rollos&search=tuna');
        expect(result.current.data).toEqual(mockItems);
    });
});

describe('usePopularItems', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('fetches popular items with limit', async () => {
        const mockItems = [{ id: 1, name: 'Popular Roll', isPopular: true }];
        vi.mocked(api.get).mockResolvedValueOnce({ items: mockItems });

        const { result } = renderHook(() => usePopularItems(4), {
            wrapper: createWrapper(),
        });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(api.get).toHaveBeenCalledWith('/menu?is_popular=true&limit=4');
        expect(result.current.data).toEqual(mockItems);
    });
});
