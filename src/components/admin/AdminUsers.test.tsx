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
        delete: vi.fn(),
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
    AuthProvider: ({ children }: any) => <>{children}</>,
}));

// Mock useCart
vi.mock('../../hooks/useCart', () => ({
    useCart: () => ({
        items: [],
        total: 0,
    }),
    CartProvider: ({ children }: any) => <>{children}</>,
}));

// Mock Lucide icons for stable targeting
vi.mock('lucide-react', () => ({
    Shield: () => <div data-testid="shield-icon" />,
    Users: () => <div data-testid="users-icon" />,
    RefreshCw: () => <div data-testid="refresh-icon" />,
    Crown: () => <div data-testid="crown-icon" />,
    Calendar: () => <div data-testid="calendar-icon" />,
    CheckCircle: () => <div data-testid="check-circle-icon" />,
    AlertCircle: () => <div data-testid="alert-circle-icon" />,
    Clock: () => <div data-testid="clock-icon" />,
    ArrowUpDown: () => <div data-testid="arrow-up-down-icon" />,
    ChevronUp: () => <div data-testid="chevron-up-icon" />,
    ChevronDown: () => <div data-testid="chevron-down-icon" />,
    Trash2: () => <div data-testid="trash-icon" />,
    Search: () => <div data-testid="search-icon" />,
    X: () => <div data-testid="x-icon" />,
    RotateCcw: () => <div data-testid="rotate-ccw-icon" />,
    Clock3: () => <div data-testid="clock-3-icon" />,
    Users2: () => <div data-testid="users-2-icon" />,
    Eye: () => <div data-testid="eye-icon" />,
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
        isVerified: false,
    },
];

describe('AdminUsers (Integration)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(api.get).mockResolvedValue({
            users: mockUsers,
            pagination: { page: 1, limit: 20, total: 1, pages: 1 },
        });
        vi.mocked(api.patch).mockResolvedValue({});
    });

    it('renders the users list and handles sorting', async () => {
        render(<AdminUsers language="es" />);
        await waitFor(() => {
            expect(screen.getByText('Customer A')).toBeInTheDocument();
        });

        const idHeader = screen.getAllByText(/ID/i).find(el => el.closest('th'))!;
        fireEvent.click(idHeader);
        await waitFor(() =>
            expect(api.get).toHaveBeenCalledWith(expect.stringContaining('sortBy=id'))
        );
    });

    it('toggles admin role', async () => {
        render(<AdminUsers language="es" />);
        await waitFor(() => expect(screen.getByText('Customer A')).toBeInTheDocument());

        const userRow = screen.getByText('Customer A').closest('tr')!;
        // Click role button in row
        const toggleBtn = within(userRow)
            .getAllByRole('button')
            .find(btn => btn.textContent?.includes('Rol'))!;
        fireEvent.click(toggleBtn);

        // Wait for modal components
        const confirmBtn = await screen.findByText(/CONFIRMAR CAMBIO/i);

        // Find Shield icon which represents Admin role button in modal
        const shieldIcons = await screen.findAllByTestId('shield-icon');
        const adminRoleBtn = shieldIcons.find(icon => icon.closest('button'))?.closest('button');
        if (!adminRoleBtn) throw new Error('Admin role button not found');
        fireEvent.click(adminRoleBtn);

        fireEvent.click(confirmBtn);

        await waitFor(() => {
            expect(api.patch).toHaveBeenCalledWith(
                expect.stringContaining('/role'),
                expect.objectContaining({ role: 'admin' })
            );
        });
    });

    it('manually verifies email', async () => {
        render(<AdminUsers language="es" />);
        await waitFor(() => expect(screen.getByText('Customer A')).toBeInTheDocument());

        const verifyBtn = screen.getByTitle(/Verificar email manualmente/i);
        fireEvent.click(verifyBtn);

        const confirmBtn = await screen.findByText(/CONFIRMAR/i);
        fireEvent.click(confirmBtn);

        await waitFor(() => {
            expect(api.patch).toHaveBeenCalledWith('/admin/users/10/verify-email', {
                isVerified: true,
            });
        });
    });

    it('deletes and restores users', async () => {
        // Mock archived user for restoration check
        const archivedUser = { ...mockUsers[0], id: 11, name: 'Old User', deletedAt: '2023-01-01' };
        vi.mocked(api.get).mockResolvedValue({
            users: [mockUsers[0], archivedUser],
            pagination: { page: 1, limit: 20, total: 2, pages: 1 },
        });

        render(<AdminUsers language="es" />);
        await waitFor(() => expect(screen.getByText('Old User')).toBeInTheDocument());

        // Test Delete
        const deleteBtn = screen.getAllByTestId('trash-icon')[0].closest('button')!;
        fireEvent.click(deleteBtn);
        const confirmDelete = await screen.findByText(/SÍ, ELIMINAR AHORA/i);
        fireEvent.click(confirmDelete);
        await waitFor(() => expect(api.delete).toHaveBeenCalledWith('/admin/users/10'));

        // Test Restore
        const restoreBtn = screen.getByText(/Restaurar/i);
        fireEvent.click(restoreBtn);
        await waitFor(() => expect(api.patch).toHaveBeenCalledWith('/admin/users/11/restore'));
    });
});
