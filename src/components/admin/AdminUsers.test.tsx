import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    renderWithProviders as render,
    screen,
    fireEvent,
    waitFor,
    within,
} from '../../test/test-utils';
import AdminUsers from './AdminUsers';
import { api } from '../../utils/api';

// Mock API
vi.mock('../../utils/api', () => ({
    api: {
        get: vi.fn(),
        patch: vi.fn(),
    },
    ApiError: class extends Error {
        constructor(public message: string) {
            super(message);
        }
    },
}));

// Mock useAuth
vi.mock('../../hooks/useAuth', () => ({
    useAuth: () => ({
        user: { id: 1, name: 'SuperAdmin', isSuperadmin: true },
    }),
}));

const mockUsers = [
    {
        id: 10,
        name: 'Customer A',
        email: 'a@test.com',
        role: 'user',
        orderCount: 5,
        totalSpent: 100,
        createdAt: '2023-01-01',
    },
];

describe('AdminUsers (Integration)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(api.get).mockImplementation((url: string) => {
            if (url.includes('/admin/users')) {
                return Promise.resolve({
                    users: mockUsers,
                    pagination: { page: 1, limit: 20, total: 1, pages: 1 },
                });
            }
            return Promise.resolve({});
        });
    });

    it('renders the users list', async () => {
        render(<AdminUsers language="es" />);

        await waitFor(async () => {
            expect(screen.getByText('Customer A')).toBeInTheDocument();
            expect(screen.getByText('#10')).toBeInTheDocument();
            const userRow = screen.getByText('Customer A').closest('tr')!;
            expect(within(userRow).getByText('Rol')).toBeInTheDocument();
        });
    });

    it.skip('toggles admin role', async () => {
        render(<AdminUsers language="es" />);

        await waitFor(() => expect(screen.getByText('Customer A')).toBeInTheDocument());

        const userRow = (await screen.findByText('Customer A')).closest('tr')!;
        const toggleBtn = within(userRow).getByText('Rol');
        fireEvent.click(toggleBtn);

        // Wait for modal and select role
        const roleSelect = await screen.findByRole('combobox');
        fireEvent.change(roleSelect, { target: { value: 'admin' } });

        const confirmBtn = await screen.findByText(/CONFIRMAR CAMBIO/i);
        console.log('Confirm button found:', !!confirmBtn);
        fireEvent.click(confirmBtn);

        await waitFor(() => {
            expect(api.patch).toHaveBeenCalledWith('/admin/users/10/role', { role: 'admin' });
        });
    });

    it('sorts users by clicking header', async () => {
        render(<AdminUsers language="es" />);

        await waitFor(() => expect(screen.getByText('Customer A')).toBeInTheDocument());

        // Find the ID header by text "ID" which should be unique enough in the header
        const idHeaders = screen.getAllByText(/ID/);
        // Usually the first one is the column header
        fireEvent.click(idHeaders[0]);

        await waitFor(() => {
            expect(api.get).toHaveBeenCalledWith(expect.stringContaining('sortBy=id'));
        });
    });
});
