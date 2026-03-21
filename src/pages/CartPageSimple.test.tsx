import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CartPageSimple from './CartPageSimple';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { api } from '../utils/api';
import React from 'react';

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

// Mock useCart
vi.mock('../hooks/useCart', () => ({
    useCart: () => ({
        items: mockCartItems,
        total: 10,
        updateQuantity: vi.fn(),
        removeItem: vi.fn(),
        addItem: vi.fn(),
        clearCart: vi.fn(),
        isLoading: false,
    }),
    CartProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Mock useAuth
vi.mock('../hooks/useAuth', () => ({
    useAuth: () => ({
        isAuthenticated: false,
        user: null,
    }),
    AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

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
        (api.get as any).mockImplementation((url: string) => {
            if (url === '/settings')
                return Promise.resolve({
                    min_order: 20,
                    delivery_fee: 3.5,
                    free_delivery_threshold: 25,
                    is_store_closed: false,
                });
            return Promise.resolve({ items: [] });
        });
    });

    const renderCart = () =>
        render(
            <HelmetProvider>
                <BrowserRouter>
                    <CartPageSimple />
                </BrowserRouter>
            </HelmetProvider>
        );

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
