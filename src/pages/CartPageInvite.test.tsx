import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CartPageSimple from './CartPageSimple';
import { useAuth } from '../hooks/useAuth';
import { api } from '../utils/api';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

import { CartProvider } from '../hooks/useCart';
import { AuthProvider } from '../hooks/useAuth';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock useCartQuery
vi.mock('../hooks/queries/useCartQuery', () => ({
    useCartQuery: vi.fn(() => ({
        data: { items: mockCartItems, total: 20 },
        isLoading: false,
    })),
    useAddToCartMutation: vi.fn(() => ({ mutateAsync: vi.fn() })),
    useUpdateQuantityMutation: vi.fn(() => ({ mutateAsync: vi.fn() })),
    useRemoveItemMutation: vi.fn(() => ({ mutateAsync: vi.fn() })),
    useClearCartMutation: vi.fn(() => ({ mutateAsync: vi.fn() })),
    CART_QUERY_KEY: ['cart'],
}));

vi.mock('../hooks/useAuth', async importOriginal => {
    const actual = (await importOriginal()) as any;
    return {
        ...actual,
        useAuth: vi.fn(),
    };
});

vi.mock('@tanstack/react-query', async importOriginal => {
    const actual = (await importOriginal()) as any;
    return {
        ...actual,
        useQueryClient: () => ({
            invalidateQueries: vi.fn(),
        }),
    };
});

// Mock useToast - we'll capture the functions to assert on them later
const mockError = vi.fn();
vi.mock('../context/ToastContext', () => ({
    useToast: () => ({
        success: vi.fn(),
        error: mockError,
        info: vi.fn(),
        warning: vi.fn(),
        showToast: vi.fn(),
    }),
}));

// Mock API
vi.mock('../utils/api', () => ({
    api: {
        get: vi.fn(),
        post: vi.fn(),
    },
    ApiError: class extends Error {
        constructor(public message: string) {
            super(message);
        }
    },
}));

vi.mock('../utils/storeStatus', () => ({
    isStoreOpen: vi.fn(() => true),
    isTimeWithinBusinessHours: vi.fn(() => true),
    getNextOpeningTime: vi.fn(() => null),
    formatTimeLeft: vi.fn(() => ''),
    BUSINESS_HOURS: {
        1: [],
        2: [],
        3: [{ start: '20:00', end: '23:00' }],
        4: [{ start: '20:00', end: '23:00' }],
        5: [{ start: '20:00', end: '23:00' }],
        6: [
            { start: '14:00', end: '17:00' },
            { start: '20:00', end: '23:00' },
        ],
        0: [{ start: '14:00', end: '17:00' }],
    },
}));

const mockCartItems = [
    {
        id: '1',
        name: 'Sushi Roll',
        price: 10,
        quantity: 2,
        image: '',
        category: 'rollos-grandes' as const,
        description: '',
    },
];

describe('CartPageSimple - Invitations (Integration)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();

        // Reset mock implementation if needed
        vi.mocked(api.get).mockImplementation((url: string) => {
            if (url === '/settings')
                return Promise.resolve({
                    minOrder: 15,
                    free_delivery_threshold: 25,
                    delivery_fee: 3.5,
                });
            if (url.includes('/menu')) return Promise.resolve({ items: [] });
            return Promise.resolve({});
        });

        // Mock navigator.share
        if (typeof navigator !== 'undefined') {
            (navigator as any).share = vi.fn().mockResolvedValue(undefined);
            (navigator as any).clipboard = {
                writeText: vi.fn().mockResolvedValue(undefined),
            };
        }
    });

    const renderPage = () => {
        const queryClient = new QueryClient({
            defaultOptions: {
                queries: { retry: false, staleTime: Infinity },
            },
        });
        return render(
            <QueryClientProvider client={queryClient}>
                <AuthProvider>
                    <CartProvider>
                        <HelmetProvider>
                            <BrowserRouter>
                                <CartPageSimple />
                            </BrowserRouter>
                        </HelmetProvider>
                    </CartProvider>
                </AuthProvider>
            </QueryClientProvider>
        );
    };

    it('shows invitation button even for guests', async () => {
        vi.mocked(useAuth).mockReturnValue({
            isAuthenticated: false,
            user: null,
            loading: false,
        } as any);

        renderPage();

        await waitFor(() => {
            expect(screen.getByText(/¡Que me inviten!/i)).toBeInTheDocument();
        });
    });

    it('allows authenticated users to generate an invitation link', async () => {
        vi.mocked(useAuth).mockReturnValue({
            isAuthenticated: true,
            user: { name: 'Test User', phone: '123456789' },
            loading: false,
        } as any);

        vi.mocked(api.post).mockResolvedValue({ shareUrl: 'http://localhost/pay-for-friend/123' });

        renderPage();

        // Wait for page to load and skeleton to clear
        const pickupBtn = await screen.findByText(/Recogida/i);
        fireEvent.click(pickupBtn);

        // We'll select payment method
        const cardBtn = screen.getByText(/Tarjeta/i);
        fireEvent.click(cardBtn);

        const inviteBtn = screen.getByText(/Que me inviten!/i);
        fireEvent.click(inviteBtn);

        await waitFor(() => {
            expect(api.post).toHaveBeenCalledWith(
                '/orders/invite',
                expect.objectContaining({
                    senderName: 'Test User',
                    notes: expect.stringContaining('[MÉTODO DE PAGO: TARJETA]'),
                })
            );
            expect(navigator.share).toHaveBeenCalled();
        });
    });

    it('shows error if inviting without address', async () => {
        vi.mocked(useAuth).mockReturnValue({
            isAuthenticated: true,
            user: { name: 'Test User' },
            loading: false,
        } as any);

        renderPage();

        const inviteBtn = await screen.findByText(/¡Que me inviten!/i);
        fireEvent.click(inviteBtn);

        await waitFor(() => {
            expect(mockError).toHaveBeenCalledWith(
                expect.stringMatching(/Por favor, indica tu calle para el envío/i)
            );
        });
    });
});
