import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AdminOrders from './AdminOrders';
import { api } from '../../utils/api';

// Mock API
vi.mock('../../utils/api', () => ({
    api: {
        get: vi.fn(),
        patch: vi.fn(),
    },
    ApiError: class extends Error {
        constructor(public message: string) {
            super(message);
        }
    },
}));

const mockOrders = [
    {
        id: 123,
        total: 25.5,
        status: 'pending',
        created_at: '2023-01-01 10:00:00',
        users: {
            name: 'John Doe',
            email: 'john@example.com',
        },
        delivery_address: 'Calle Falsa 123',
        phone_number: '123456789',
        items: [{ id: 1, name: 'Sushi Set', quantity: 1, price_at_time: 25.5 }],
    },
];

describe('AdminOrders (Integration)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(api.get).mockResolvedValue({
            orders: mockOrders,
            pagination: { page: 1, limit: 10, total: 1, pages: 1 },
        });
    });

    it('renders the orders list', async () => {
        render(
            <AdminOrders
                isGlobalSoundEnabled={false}
                setIsGlobalSoundEnabled={() => {}}
                globalPendingCount={0}
            />
        );

        await waitFor(
            () => {
                // Check for order ID and user name separately
                expect(screen.getByText(/00123/)).toBeInTheDocument();
                expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
            },
            { timeout: 2000 }
        );
    });

    it('updates order status', async () => {
        render(
            <AdminOrders
                isGlobalSoundEnabled={false}
                setIsGlobalSoundEnabled={() => {}}
                globalPendingCount={0}
            />
        );

        await waitFor(() => expect(screen.getByText(/00123/)).toBeInTheDocument());

        const statusSelect = screen.getByRole('combobox');
        fireEvent.change(statusSelect, { target: { value: 'preparing' } });

        await waitFor(() => {
            expect(api.patch).toHaveBeenCalledWith('/admin/orders/123/status', {
                status: 'preparing',
            });
        });
    });

    it('filters by search ID', async () => {
        render(
            <AdminOrders
                isGlobalSoundEnabled={false}
                setIsGlobalSoundEnabled={() => {}}
                globalPendingCount={0}
            />
        );

        const searchInput = await screen.findByPlaceholderText(/Buscar ID, Teléfono, Promo/i);
        await waitFor(() => expect(screen.getByText(/00123/)).toBeInTheDocument());

        vi.useFakeTimers();

        // Test search matches
        fireEvent.change(searchInput, { target: { value: '123' } });
        
        // Wait for debounce and state update
        await vi.advanceTimersByTimeAsync(600);
        
        expect(api.get).toHaveBeenCalledWith(expect.stringContaining('search=123'));
        expect(screen.getByText(/00123/)).toBeInTheDocument();

        // Prepare next mock
        vi.mocked(api.get).mockResolvedValue({
            orders: [],
            pagination: { page: 1, limit: 10, total: 0, pages: 0 },
        });

        fireEvent.change(searchInput, { target: { value: '999' } });
        await vi.advanceTimersByTimeAsync(600);

        expect(api.get).toHaveBeenCalledWith(expect.stringContaining('search=999'));
        expect(screen.queryByText(/00123/)).not.toBeInTheDocument();
        
        vi.useRealTimers();
    });
});
