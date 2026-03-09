import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PayForFriendPage from './PayForFriendPage';
import { api, ApiError } from '../utils/api';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

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

const mockOrder = {
    id: 123,
    total: 45.5,
    status: 'waiting_payment',
    delivery_address: 'Calle Mayor 10, Madrid',
    notes: '[De parte de: Maksim] Por favor extra jengibre',
    items: [
        { id: 1, name: 'Dragon Roll', quantity: 2, price_at_time: 15.0, image: '/dragon.jpg' },
        { id: 2, name: 'Miso Soup', quantity: 1, price_at_time: 5.5, image: '/miso.jpg' },
    ],
};

describe('PayForFriendPage (Integration)', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        // Mock window.scrollTo to avoid potential errors in JSDOM
        window.scrollTo = vi.fn();

        // Mock navigator.vibrate
        if (typeof navigator !== 'undefined') {
            (navigator as any).vibrate = vi.fn();
        }
    });

    const renderWithRouter = (id: string) =>
        render(
            <HelmetProvider>
                <MemoryRouter initialEntries={[`/pay-for-friend/${id}`]}>
                    <Routes>
                        <Route path="/pay-for-friend/:id" element={<PayForFriendPage />} />
                    </Routes>
                </MemoryRouter>
            </HelmetProvider>
        );

    it('loads and displays order details', async () => {
        vi.mocked(api.get).mockResolvedValue({ order: mockOrder });

        renderWithRouter('123');

        expect(screen.getByText(/Cargando sorpresa.../i)).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.getByText(/Maksim/i)).toBeInTheDocument();
            expect(screen.getByText(/Dragon Roll/i)).toBeInTheDocument();
            expect(screen.getByText(/45,50 €/i)).toBeInTheDocument();
            expect(screen.getByText(/Calle Mayor 10, Madrid/i)).toBeInTheDocument();
        });
    });

    it('handles payment confirmation', async () => {
        vi.mocked(api.get).mockResolvedValue({ order: mockOrder });
        vi.mocked(api.post).mockResolvedValue({
            success: true,
            order: { ...mockOrder, status: 'pending' },
        });

        renderWithRouter('123');

        const payBtn = await screen.findByText(/Confirmar y Pagar/i);
        fireEvent.click(payBtn);

        // Increased timeout because of framer-motion animations
        await waitFor(
            () => {
                expect(api.post).toHaveBeenCalledWith('/orders/123/confirm-payment');
                expect(screen.getByText(/¡Eres Genial!/i)).toBeInTheDocument();
            },
            { timeout: 3000 }
        );
    });

    it('shows error if order not found or already paid', async () => {
        vi.mocked(api.get).mockRejectedValue(
            new ApiError('Invitación no encontrada o ya ha sido pagada.')
        );

        renderWithRouter('999');

        await waitFor(() => {
            expect(screen.getByText(/¡Vaya! Algo salió mal/i)).toBeInTheDocument();
            expect(screen.getByText(/Invitación no encontrada/i)).toBeInTheDocument();
        });
    });
});
