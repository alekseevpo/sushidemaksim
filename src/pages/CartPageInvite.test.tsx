import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CartPageSimple from './CartPageSimple';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { api } from '../utils/api';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

// Mock hooks
vi.mock('../hooks/useCart', () => ({
    useCart: vi.fn(),
}));

vi.mock('../hooks/useAuth', () => ({
    useAuth: vi.fn(),
}));

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

        // Default mock implementations
        vi.mocked(useCart).mockReturnValue({
            items: mockCartItems,
            total: 20,
            itemCount: 2,
            updateQuantity: vi.fn(),
            removeItem: vi.fn(),
            clearCart: vi.fn(),
            isLoading: false,
            addItem: vi.fn(),
            syncGuestItems: vi.fn().mockResolvedValue(undefined),
        });

        vi.mocked(api.get).mockImplementation((url: string) => {
            if (url === '/settings')
                return Promise.resolve({
                    min_order: 15,
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

    const renderPage = () =>
        render(
            <HelmetProvider>
                <BrowserRouter>
                    <CartPageSimple />
                </BrowserRouter>
            </HelmetProvider>
        );

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

        // Wait for page to load
        const streetInput = await screen.findByPlaceholderText(/Nombre de tu calle/i);
        const houseInput = screen.getByPlaceholderText(/Ej: 20/i);
        const aptInput = screen.getByPlaceholderText(/3ºB/i);

        fireEvent.change(streetInput, { target: { value: 'Calle Principal' } });
        fireEvent.change(houseInput, { target: { value: '1' } });
        fireEvent.change(aptInput, { target: { value: 'A' } });

        // Select payment method (as it's now mandatory)
        const cardBtn = screen.getByText(/Tarjeta/i);
        fireEvent.click(cardBtn);

        const inviteBtn = screen.getByText(/¡Que me inviten!/i);
        fireEvent.click(inviteBtn);

        await waitFor(() => {
            expect(api.post).toHaveBeenCalledWith(
                '/orders/invite',
                expect.objectContaining({
                    deliveryAddress: expect.stringMatching(/Calle Principal.*Portal: 1.*Piso: A/i),
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
