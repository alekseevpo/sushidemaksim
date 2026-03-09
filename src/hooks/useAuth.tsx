import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserAddress, Order } from '../types';
import { api } from '../utils/api';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    register: (
        name: string,
        email: string,
        phone: string,
        password: string
    ) => Promise<{ success: boolean; error?: string }>;
    logout: () => void;
    updateProfile: (
        data: Partial<Pick<User, 'name' | 'email' | 'phone' | 'avatar' | 'birthDate'>>
    ) => Promise<void>;
    addAddress: (address: Omit<UserAddress, 'id'>) => Promise<void>;
    editAddress: (id: string, address: Partial<Omit<UserAddress, 'id'>>) => Promise<void>;
    removeAddress: (id: string) => Promise<void>;
    setDefaultAddress: (id: string) => Promise<void>;
    addOrder: (order: Order) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const loadUser = async () => {
        const token = localStorage.getItem('sushi_token');
        if (!token) {
            setIsLoading(false);
            return;
        }

        try {
            const data = await api.get('/auth/me');
            setUser(data.user);
        } catch (error) {
            localStorage.removeItem('sushi_token');
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadUser();
    }, []);

    // ─── Activity Heartbeat ───────────────────────────────────────────────────────
    useEffect(() => {
        if (!user) return;

        const sendHeartbeat = async () => {
            try {
                await api.put('/user/active');
            } catch (error) {
                // Silently ignore heartbeat failures
            }
        };

        // Initial call
        sendHeartbeat();

        // Repeat every 30 seconds
        const interval = setInterval(sendHeartbeat, 30000);
        return () => clearInterval(interval);
    }, [user]);

    const login = async (email: string, password: string) => {
        try {
            const data = await api.post('/auth/login', { email, password });
            localStorage.setItem('sushi_token', data.token);
            setUser(data.user);
            await loadUser(); // load addresses and full profile
            return { success: true };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    };

    const register = async (name: string, email: string, phone: string, password: string) => {
        try {
            await api.post('/auth/register', { name, email, phone, password });
            // Since activation is required, we don't log in here.
            // The LoginModal will show the success message.
            return { success: true };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    };

    const logout = () => {
        localStorage.removeItem('sushi_token');
        setUser(null);
        window.location.href = '/';
    };

    const updateProfile = async (
        data: Partial<Pick<User, 'name' | 'email' | 'phone' | 'avatar' | 'birthDate'>>
    ) => {
        try {
            await api.put('/user/profile', data);
            await loadUser(); // refresh
        } catch (error) {
            console.error('Failed to update profile', error);
            throw error;
        }
    };

    const addAddress = async (address: Omit<UserAddress, 'id'>) => {
        try {
            await api.post('/user/addresses', address);
            await loadUser();
        } catch (error) {
            console.error('Failed to add address', error);
            throw error;
        }
    };

    const removeAddress = async (id: string) => {
        try {
            await api.delete(`/user/addresses/${id}`);
            await loadUser();
        } catch (error) {
            console.error('Failed to remove address', error);
            throw error;
        }
    };

    const editAddress = async (id: string, data: Partial<Omit<UserAddress, 'id'>>) => {
        try {
            await api.put(`/user/addresses/${id}`, data);
            await loadUser();
        } catch (error) {
            console.error('Failed to edit address', error);
            throw error;
        }
    };

    const setDefaultAddress = async (id: string) => {
        try {
            await api.put(`/user/addresses/${id}/default`);
            await loadUser();
        } catch (error) {
            console.error('Failed to set default address', error);
            throw error;
        }
    };

    const addOrder = (order: Order) => {
        setUser(prev => (prev ? { ...prev, orders: [order, ...prev.orders] } : null));
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                isLoading,
                login,
                register,
                logout,
                updateProfile,
                addAddress,
                editAddress,
                removeAddress,
                setDefaultAddress,
                addOrder,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
