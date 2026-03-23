import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CartPageSimple from './CartPageSimple';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { api } from '../utils/api';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CartProvider } from '../hooks/useCart';
import { AuthProvider } from '../hooks/useAuth';

// Mock API
vi.mock('../utils/api', () => ({
    api: {
        get: vi.fn(),
        post: vi.fn(),
    },
}));

const mockCartItems = [
    {
        id: '1',
        name: 'Sushi A',
        price: 10,
        quantity: 1,
        category: 'rollos-grandes' as any,
        image: '',
        description: '',
    },
];

// Mock useCartQuery
vi.mock('../hooks/queries/useCartQuery', () => ({
    useCartQuery: vi.fn(() => ({
        data: { items: mockCartItems, total: 10 },
        isLoading: false,
    })),
    useAddToCartMutation: vi.fn(() => ({ mutateAsync: vi.fn() })),
    useUpdateQuantityMutation: vi.fn(() => ({ mutateAsync: vi.fn() })),
    useRemoveItemMutation: vi.fn(() => ({ mutateAsync: vi.fn() })),
    useClearCartMutation: vi.fn(() => ({ mutateAsync: vi.fn() })),
    CART_QUERY_KEY: ['cart'],
}));

// Mock useCartQuery
vi.mock('../hooks/queries/useCartQuery', () => ({
    useCartQuery: vi.fn(() => ({
        data: { items: mockCartItems, total: 10 },
        isLoading: false,
    })),
    useAddToCartMutation: vi.fn(() => ({ mutateAsync: vi.fn() })),
    useUpdateQuantityMutation: vi.fn(() => ({ mutateAsync: vi.fn() })),
    useRemoveItemMutation: vi.fn(() => ({ mutateAsync: vi.fn() })),
    useClearCartMutation: vi.fn(() => ({ mutateAsync: vi.fn() })),
    CART_QUERY_KEY: ['cart'],
}));

// Mock useAuth
vi.mock('../hooks/useAuth', async importOriginal => {
    const actual = (await importOriginal()) as any;
    return {
        ...actual,
        useAuth: () => ({
            isAuthenticated: false,
            user: null,
        }),
    };
});

// Mock @tanstack/react-query
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
    }),
}));

describe('CartPageSimple (Integration)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
        (api.get as any).mockImplementation((url: string) => {
            if (url === '/settings')
                return Promise.resolve({
                    minOrder: 20,
                    delivery_fee: 3.5,
                    free_delivery_threshold: 25,
                    is_store_closed: false,
                });
            return Promise.resolve({ items: [] });
        });
    });

    const renderCart = () => {
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

    it('renders the cart content', async () => {
        renderCart();
        await waitFor(() => expect(screen.queryByText(/Cargando/i)).not.toBeInTheDocument());
        // Use heading role for the title
        expect(screen.getByText('Sushi A')).toBeInTheDocument();
    });

    it('calculates the summary correctly', async () => {
        renderCart();
        await waitFor(() => expect(screen.queryByText(/Cargando/i)).not.toBeInTheDocument());

        expect(screen.getAllByText(/10,00/).length).toBeGreaterThanOrEqual(1);
        expect(screen.getAllByText(/3,50/).length).toBeGreaterThanOrEqual(1);
        expect(screen.getAllByText(/13,50/).length).toBeGreaterThanOrEqual(1);
    });

    it('shows minimum order error after filling address', async () => {
        renderCart();
        await waitFor(() =>
            expect(screen.queryByTestId('house-input-desktop')).toBeInTheDocument()
        );

        fireEvent.change(screen.getByTestId('address-input'), {
            target: { value: 'Calle Real' },
        });
        fireEvent.change(screen.getByTestId('house-input-desktop'), { target: { value: '10' } });
        fireEvent.change(screen.getByTestId('apartment-input-desktop'), { target: { value: 'B' } });
        fireEvent.change(screen.getByPlaceholderText(/28001/i), { target: { value: '28001' } });
        fireEvent.change(screen.getByPlaceholderText(/\+34 600 000 000/i), {
            target: { value: '600000000' },
        });

        // Select payment method
        const cashOption = screen.getByText(/Efectivo/i);
        fireEvent.click(cashOption);

        // Find the button and click it
        const orderButtons = screen.getAllByRole('button', { name: /Realizar pedido/i });
        // Click the first visible one (e.g. desktop)
        fireEvent.click(orderButtons[0]);

        await waitFor(() => {
            expect(mockError).toHaveBeenCalledWith(
                expect.stringMatching(/El pedido mínimo .* (20,00|20\.00)/i)
            );
        });
    });
});
