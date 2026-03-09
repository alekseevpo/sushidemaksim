import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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
        user: { id: 1, name: 'SuperAdmin', is_superadmin: true },
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
        created_at: '2023-01-01',
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
        render(<AdminUsers />);

        await waitFor(() => {
            expect(screen.getByText('Customer A')).toBeInTheDocument();
            expect(screen.getByText('#10')).toBeInTheDocument();
            expect(screen.getByText('Hacer Admin')).toBeInTheDocument();
        });
    });

    it('toggles admin role', async () => {
        vi.spyOn(window, 'confirm').mockReturnValue(true);
        render(<AdminUsers />);

        await waitFor(() => expect(screen.getByText('Customer A')).toBeInTheDocument());

        const toggleBtn = screen.getByText('Hacer Admin');
        fireEvent.click(toggleBtn);

        await waitFor(() => {
            expect(api.patch).toHaveBeenCalledWith('/admin/users/10/role', { role: 'admin' });
        });
    });

    it('sorts users by clicking header', async () => {
        render(<AdminUsers />);

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
