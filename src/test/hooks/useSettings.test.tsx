import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useSettings } from '../../hooks/queries/useSettings';
import { api } from '../../utils/api';

// Mock the API client
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

describe('useSettings', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('fetches and formats settings successfully', async () => {
        const mockResponse = {
            contactPhone: '+34 123 456 789',
            contactEmail: 'test@example.com',
            ratingTheFork: 9.5,
        };

        vi.mocked(api.get).mockResolvedValueOnce(mockResponse);

        const { result } = renderHook(() => useSettings(), {
            wrapper: createWrapper(),
        });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(api.get).toHaveBeenCalledWith('/settings');
        expect(result.current.data?.contactPhone).toBe('+34 123 456 789');
        expect(result.current.data?.contactEmail).toBe('test@example.com');
        expect(result.current.data?.ratingTheFork).toBe(9.5);
        // Defaults should be applied
        expect(result.current.data?.estDeliveryTime).toBe('30-60 min');
        expect(result.current.data?.contactSchedule).toEqual([]);
    });

    it('handles api error correctly', async () => {
        vi.mocked(api.get).mockRejectedValueOnce(new Error('Network Error'));

        const { result } = renderHook(() => useSettings(), {
            wrapper: createWrapper(),
        });

        await waitFor(() => expect(result.current.isError).toBe(true));

        expect(result.current.error).toBeDefined();
    });
});
