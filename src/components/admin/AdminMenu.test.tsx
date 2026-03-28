import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    renderWithProviders as render,
    screen,
    fireEvent,
    waitFor,
    within,
} from '../../test/test-utils';
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
        expect(
            screen.getByRole('button', { name: /Crear Plato|Guardar Cambios/i })
        ).toBeInTheDocument();
    });

    it('submits the form to add a new item', async () => {
        const newItem = { id: 2, name: 'New Roll', category: 'menus', price: 10 };
        vi.mocked(api.post).mockResolvedValue({
            item: newItem,
        });

        // Initial load
        vi.mocked(api.get).mockResolvedValueOnce({ items: mockItems });
        // Refresh load
        vi.mocked(api.get).mockResolvedValue({ items: [...mockItems, newItem] });

        render(<AdminMenu />);

        const addBtn = await screen.findByText(/Nuevo Plato/i);
        fireEvent.click(addBtn);

        // Fill form
        fireEvent.change(await screen.findByLabelText(/Nombre \*/i), {
            target: { value: 'New Roll' },
        });
        fireEvent.change(screen.getByLabelText(/Descripción \*/i), { target: { value: 'Tasty' } });
        fireEvent.change(screen.getByLabelText(/Precio \(€\) \*/i), { target: { value: '10' } });
        fireEvent.change(screen.getByLabelText(/Categoría \*/i), { target: { value: 'menus' } });

        const form = (await screen.findByLabelText(/Nombre \*/i)).closest('form')!;
        fireEvent.submit(form);

        await waitFor(() => {
            expect(api.post).toHaveBeenCalled();
            expect(screen.getByText('New Roll')).toBeInTheDocument();
        });
    });

    it.skip('deletes an item', async () => {
        let items = [...mockItems];
        vi.mocked(api.get).mockImplementation(() => Promise.resolve({ items }));
        vi.mocked(api.delete).mockImplementation(() => {
            items = [];
            return Promise.resolve({});
        });

        render(<AdminMenu />);

        await waitFor(() => expect(screen.getByText('Sake Sushi')).toBeInTheDocument());

        // Click delete button
        const itemRow = screen.getByText('Sake Sushi').closest('tr')!;
        const deleteBtn = within(itemRow).getByTitle(/Eliminar este plato/i);
        fireEvent.click(deleteBtn);

        // Modal should be visible
        const confirmBtn = await screen.findByText(/SÍ, ELIMINAR AHORA/i);
        fireEvent.click(confirmBtn);

        await waitFor(() => {
            expect(api.delete).toHaveBeenCalledWith('/admin/menu/1');
            expect(screen.queryByText('Sake Sushi')).not.toBeInTheDocument();
        });
    });
});
