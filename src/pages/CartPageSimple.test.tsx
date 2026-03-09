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

// Mock useCart
vi.mock('../hooks/useCart', () => ({
    useCart: () => ({
        items: [
            {
                id: '1',
                name: 'Sushi A',
                price: 10,
                quantity: 1,
                category: 'rollos-grandes',
                image: '',
                description: '',
            },
        ],
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
        expect(screen.getByRole('heading', { name: /Tu cesta/i })).toBeInTheDocument();
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
        await waitFor(() => expect(api.get).toHaveBeenCalledWith('/settings'));

        fireEvent.change(screen.getByPlaceholderText(/Nombre de tu calle/i), {
            target: { value: 'Calle Real' },
        });
        fireEvent.change(screen.getByPlaceholderText(/Ej: 15/i), { target: { value: '10' } });
        fireEvent.change(screen.getByPlaceholderText(/Ej: 3ºB/i), { target: { value: 'B' } });
        fireEvent.change(screen.getByPlaceholderText(/\+34 600 000 000/i), {
            target: { value: '600000000' },
        });

        // Find the button and click it
        const orderButton = screen.getAllByRole('button', { name: /Realizar pedido/i })[0];
        fireEvent.click(orderButton);

        await waitFor(() => {
            expect(screen.getByText(/El pedido mínimo es de 20,00/i)).toBeInTheDocument();
        });
    });
});
