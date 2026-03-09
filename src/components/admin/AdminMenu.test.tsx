import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AdminMenu from './AdminMenu';
import { api } from '../../utils/api';

// Mock API
vi.mock('../../utils/api', () => ({
    api: {
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
    },
    ApiError: class extends Error {
        constructor(public message: string) {
            super(message);
        }
    },
}));

const mockItems = [
    { id: 1, name: 'Sake Sushi', category: 'entrantes', price: 5, description: 'Test', image: '' },
];

describe('AdminMenu (Integration)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(api.get).mockResolvedValue({ items: mockItems });
    });

    it('renders the menu list', async () => {
        render(<AdminMenu />);

        await waitFor(() => {
            expect(screen.getByText('Sake Sushi')).toBeInTheDocument();
        });
    });

    it('filters items by search', async () => {
        render(<AdminMenu />);

        const searchInput = await screen.findByPlaceholderText(/Buscar por nombre o categoría/i);
        fireEvent.change(searchInput, { target: { value: 'Sake' } });

        expect(screen.getByText('Sake Sushi')).toBeInTheDocument();

        fireEvent.change(searchInput, { target: { value: 'NonExistent' } });
        expect(screen.queryByText('Sake Sushi')).not.toBeInTheDocument();
    });

    it('opens modal to add a new item', async () => {
        render(<AdminMenu />);

        const addBtn = await screen.findByText(/Nuevo Plato/i);
        fireEvent.click(addBtn);

        expect(screen.getByText(/Añadir Plato/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Guardar Plato/i })).toBeInTheDocument();
    });

    it('submits the form to add a new item', async () => {
        vi.mocked(api.post).mockResolvedValue({
            item: { id: 2, name: 'New Roll', category: 'menus', price: 10 },
        });

        render(<AdminMenu />);

        const addBtn = await screen.findByText(/Nuevo Plato/i);
        fireEvent.click(addBtn);

        // Fill form
        fireEvent.change(screen.getByLabelText(/Nombre \*/i), { target: { value: 'New Roll' } });
        fireEvent.change(screen.getByLabelText(/Descripción \*/i), { target: { value: 'Tasty' } });
        fireEvent.change(screen.getByLabelText(/Precio \(€\) \*/i), { target: { value: '10' } });

        const saveBtn = screen.getByRole('button', { name: /Guardar Plato/i });
        fireEvent.click(saveBtn);

        await waitFor(() => {
            expect(api.post).toHaveBeenCalledWith(
                '/admin/menu',
                expect.objectContaining({
                    name: 'New Roll',
                    price: 10,
                })
            );
            expect(screen.getByText('New Roll')).toBeInTheDocument();
        });
    });
});
