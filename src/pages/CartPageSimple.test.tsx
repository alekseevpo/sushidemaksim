import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CartPageSimple from './CartPageSimple';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

// Mock Hooks
vi.mock('../hooks/useAuth', () => ({
    useAuth: vi.fn(),
}));

vi.mock('../hooks/useCart', () => ({
    useCart: vi.fn(),
}));

// Mock storeStatus
vi.mock('../utils/storeStatus', () => ({
    isStoreOpen: vi.fn(() => true),
    isTimeWithinBusinessHours: vi.fn(() => true),
    BUSINESS_HOURS: {},
}));

// Mock API
vi.mock('../utils/api', () => ({
    api: {
        get: vi.fn(() => Promise.resolve({ items: [] })),
        post: vi.fn(() => Promise.resolve({})),
    },
}));

describe('CartPageSimple (Mocked Hooks)', () => {
    const mockItems = [
        {
            id: '1',
            name: 'Sushi Deluxe',
            price: 15.5,
            quantity: 1,
            image: '',
            category: 'rollos-grandes',
        },
    ];

    const mockDeliveryDetails = {
        address: 'Calle Falsa 123',
        house: '1',
        apartment: 'A',
        phone: '600000000',
        postalCode: '28001',
        customerName: 'Test User',
        guestEmail: 'test@example.com',
        paymentMethod: 'card' as const,
        deliveryType: 'delivery' as const,
        selectedZone: { id: 1, name: 'Centro', cost: 2.5, minOrder: 10, freeThreshold: 30 },
        noCall: false,
        noBuzzer: false,
        isScheduled: false,
        scheduledDate: '2026-03-30',
        scheduledTime: '20:00',
        customNote: '',
        saveAddress: true,
        guestsCount: 2,
        chopsticksCount: 0,
    };

    beforeEach(() => {
        vi.clearAllMocks();

        vi.mocked(useAuth).mockReturnValue({
            user: null,
            isAuthenticated: false,
            isLoading: false,
        } as any);

        vi.mocked(useCart).mockReturnValue({
            items: mockItems,
            total: 15.5,
            isLoading: false,
            addItem: vi.fn(),
            removeItem: vi.fn(),
            updateQuantity: vi.fn(),
            clearCart: vi.fn(),
            deliveryDetails: mockDeliveryDetails,
            updateDeliveryDetails: vi.fn(),
        } as any);
    });

    const renderPage = () => {
        return render(
            <HelmetProvider>
                <BrowserRouter>
                    <CartPageSimple />
                </BrowserRouter>
            </HelmetProvider>
        );
    };

    it('renders the cart items from mocked hook', async () => {
        renderPage();
        expect(await screen.findByText('Sushi Deluxe')).toBeInTheDocument();
        expect(screen.getAllByText(/15,50/).length).toBeGreaterThan(0);
    });

    it('toggles scheduled order visibility via mock update', async () => {
        const updateMock = vi.fn();
        vi.mocked(useCart).mockReturnValue({
            items: mockItems,
            total: 15.5,
            isLoading: false,
            deliveryDetails: { ...mockDeliveryDetails, isScheduled: false },
            updateDeliveryDetails: updateMock,
        } as any);

        renderPage();

        const toggle = await screen.findByText(/Entrega programada/i);
        fireEvent.click(toggle);

        expect(updateMock).toHaveBeenCalledWith({ isScheduled: true });
    });
});
