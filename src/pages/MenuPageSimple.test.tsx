import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders, screen, fireEvent, waitFor } from '../test/test-utils';
import MenuPageSimple from './MenuPageSimple';
import { api } from '../utils/api';
import React from 'react';

// Mock API
vi.mock('../utils/api', () => ({
    api: {
        get: vi.fn(),
        post: vi.fn(),
    },
}));

// Mock useCart hook
const mockAddItem = vi.fn();
vi.mock('../hooks/useCart', () => ({
    useCart: () => ({
        addItem: mockAddItem,
    }),
    CartProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Mock useAuth hook
vi.mock('../hooks/useAuth', () => ({
    useAuth: () => ({
        user: null,
    }),
    AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

const mockItems = [
    {
        id: 1,
        name: 'Salmon Roll',
        description: 'Delicious',
        price: 10,
        category: 'rollos-grandes',
        image: '',
    },
    {
        id: 2,
        name: 'Tuna Roll',
        description: 'Fresh',
        price: 12,
        category: 'rollos-grandes',
        image: '',
    },
];

describe('MenuPageSimple (Integration)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (api.get as any).mockResolvedValue({ items: mockItems });
    });

    const renderMenu = () => renderWithProviders(<MenuPageSimple />);

    it('renders the menu items', async () => {
        renderMenu();

        await waitFor(() => {
            expect(screen.getByText('Salmon Roll')).toBeInTheDocument();
            expect(screen.getByText('Tuna Roll')).toBeInTheDocument();
        });
    });

    it('filters by category', async () => {
        renderMenu();

        const categoryBtns = await screen.findAllByText('Rollos Grandes');
        fireEvent.click(categoryBtns[0]); // First one is in the sidebar

        await waitFor(() => {
            expect(api.get).toHaveBeenCalledWith(
                expect.stringContaining('category=rollos-grandes')
            );
        });
    });

    it('searches for a dish', async () => {
        renderMenu();

        const searchInput = screen.getByPlaceholderText(/hoy/i);
        fireEvent.change(searchInput, { target: { value: 'Salmon' } });

        // Wait for debounce (350ms)
        await waitFor(
            () => {
                expect(api.get).toHaveBeenCalledWith(expect.stringContaining('search=Salmon'));
            },
            { timeout: 2000 }
        );
    });

    it('adds an item to cart when clicking the button', async () => {
        renderMenu();

        const addBtn = await screen.findAllByText(/Añadir/i);
        fireEvent.click(addBtn[0]);

        expect(mockAddItem).toHaveBeenCalledWith(
            expect.objectContaining({
                id: '1',
                name: 'Salmon Roll',
            })
        );
    });
});
