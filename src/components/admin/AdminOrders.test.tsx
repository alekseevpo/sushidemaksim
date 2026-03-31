import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders as render, screen, fireEvent, waitFor } from '../../test/test-utils';
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
        id: '550e8400-e29b-41d4-a716-446655440000',
        total: 25.5,
        status: 'pending',
        createdAt: '2023-01-01 10:00:00',
        users: {
            name: 'John Doe',
            email: 'john@example.com',
        },
        deliveryAddress: 'Calle Falsa 123',
        phoneNumber: '123456789',
        items: [{ id: 1, name: 'Sushi Set', quantity: 1, priceAtTime: 25.5 }],
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
                expect(screen.getByText(/550E8400/)).toBeInTheDocument();
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

        await waitFor(() => expect(screen.getByText(/550E8400/)).toBeInTheDocument());

        const statusSelect = screen.getByRole('combobox');
        fireEvent.change(statusSelect, { target: { value: 'preparing' } });

        await waitFor(() => {
            expect(api.patch).toHaveBeenCalledWith(
                '/admin/orders/550e8400-e29b-41d4-a716-446655440000/status',
                {
                    status: 'preparing',
                }
            );
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
        await waitFor(() => expect(screen.getByText(/550E8400/)).toBeInTheDocument());

        // Test search matches
        fireEvent.change(searchInput, { target: { value: '550E8400' } });

        // Wait for debounce and state update using waitFor
        await waitFor(
            () => {
                expect(api.get).toHaveBeenCalledWith(expect.stringContaining('search=550E8400'));
            },
            { timeout: 2000 }
        );

        await waitFor(() => {
            expect(screen.getByText(/550E8400/)).toBeInTheDocument();
        });

        // Prepare next mock
        vi.mocked(api.get).mockResolvedValue({
            orders: [],
            pagination: { page: 1, limit: 10, total: 0, pages: 0 },
        });

        fireEvent.change(searchInput, { target: { value: '999' } });

        await waitFor(
            () => {
                expect(api.get).toHaveBeenCalledWith(expect.stringContaining('search=999'));
            },
            { timeout: 2000 }
        );

        await waitFor(() => {
            expect(screen.queryByText(/550E8400/)).not.toBeInTheDocument();
        });
    });
});
