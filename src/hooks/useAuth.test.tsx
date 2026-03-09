import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { AuthProvider, useAuth } from './useAuth';
import { api } from '../utils/api';
import { ReactNode } from 'react';

// Mock API
vi.mock('../utils/api', () => ({
    api: {
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
    }
}));

describe('useAuth hook', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    const wrapper = ({ children }: { children: ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
    );

    it('should be unauthenticated by default', async () => {
        const { result } = renderHook(() => useAuth(), { wrapper });

        // Wait for loading to finish
        await act(async () => {
            // useEffect runs handleUser
        });

        expect(result.current.user).toBeNull();
        expect(result.current.isAuthenticated).toBe(false);
    });

    it('should login and set user state', async () => {
        const mockUser = { id: 1, name: 'Test User', email: 'test@test.com' };
        vi.mocked(api.post).mockResolvedValue({ token: 'mock-token', user: mockUser });
        vi.mocked(api.get).mockResolvedValue({ user: mockUser });

        const { result } = renderHook(() => useAuth(), { wrapper });

        await act(async () => {
            const loginResult = await result.current.login('test@test.com', 'password');
            expect(loginResult.success).toBe(true);
        });

        expect(result.current.isAuthenticated).toBe(true);
        expect(result.current.user?.name).toBe('Test User');
        expect(localStorage.getItem('sushi_token')).toBe('mock-token');
    });

    it('should handle registration', async () => {
        const mockUser = { id: 2, name: 'New User' };
        vi.mocked(api.post).mockResolvedValue({ token: 'new-token', user: mockUser });
        vi.mocked(api.get).mockResolvedValue({ user: mockUser });

        const { result } = renderHook(() => useAuth(), { wrapper });

        await act(async () => {
            await result.current.register('New User', 'new@test.com', '123456', 'pass');
        });

        expect(result.current.user?.name).toBe('New User');
        expect(localStorage.getItem('sushi_token')).toBe('new-token');
    });

    it('should logout and clear state', async () => {
        // Mock window.location.href
        const locationMock = { assign: vi.fn() };
        vi.stubGlobal('location', locationMock);

        const { result } = renderHook(() => useAuth(), { wrapper });

        act(() => {
            result.current.logout();
        });

        expect(result.current.user).toBeNull();
        expect(localStorage.getItem('sushi_token')).toBeNull();

        vi.unstubAllGlobals();
    });
});
