import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { CartItem, SushiItem } from '../types';
import { api } from '../utils/api';

interface TablePromo {
    code: string;
    discount: number;
}

interface TableOrderContextType {
    items: CartItem[];
    addItem: (item: SushiItem, quantity?: number, selectedOption?: string) => void;
    removeItem: (id: string | number, selectedOption?: string) => void;
    updateQuantity: (id: string | number, quantity: number, selectedOption?: string) => void;
    clearCart: () => void;
    total: number;
    finalTotal: number;
    itemCount: number;
    tableNumber: number | null;
    isOrderConfirmed: boolean;
    lastOrderId: string | number | null;
    setOrderConfirmed: (val: boolean) => void;
    submitOrder: (paymentMethod: 'EFECTIVO' | 'TARJETA') => Promise<void>;
    appliedPromo: TablePromo | null;
}

const TableOrderContext = createContext<TableOrderContextType | undefined>(undefined);

const STORAGE_KEY = 'table_cart';

export const TableOrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [items, setItems] = useState<CartItem[]>(() => {
        if (typeof window === 'undefined') return [];
        const saved = localStorage.getItem(STORAGE_KEY);
        try {
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            console.error('Failed to parse table cart', e);
            return [];
        }
    });
    const [tableNumber, setTableNumber] = useState<number | null>(null);
    const [isOrderConfirmed, setOrderConfirmed] = useState(false);
    const [lastOrderId, setLastOrderId] = useState<string | number | null>(null);
    const [appliedPromo, setAppliedPromo] = useState<TablePromo | null>(null);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }, [items]);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const tableParam = params.get('table') || params.get('n');
        if (tableParam) {
            setTableNumber(parseInt(tableParam, 10));
        }
    }, []);

    // Auto-apply welcome promo when user logs in at a table
    useEffect(() => {
        const handleLogin = () => {
            const token = localStorage.getItem('sushi_token');
            if (!token) return;

            // Fetch user data to check for available promo codes
            api.get('/auth/me')
                .then(
                    (data: {
                        user?: {
                            promoCodes?: Array<{
                                code: string;
                                discount_percentage: number;
                                is_used: boolean;
                            }>;
                        };
                    }) => {
                        const promos = data?.user?.promoCodes;
                        if (!promos || promos.length === 0) return;

                        // Find the first unused welcome promo
                        const welcomePromo = promos.find(
                            (p: { code: string; is_used: boolean }) =>
                                !p.is_used &&
                                (p.code.startsWith('NUEVO') || p.code.startsWith('NEW'))
                        );

                        if (welcomePromo) {
                            setAppliedPromo({
                                code: welcomePromo.code,
                                discount: welcomePromo.discount_percentage,
                            });
                        }
                    }
                )
                .catch(() => {
                    // Silently fail — promo auto-apply is a nice-to-have
                });
        };

        // Listen for auth events
        window.addEventListener('auth:login_success', handleLogin);

        // Also check on mount in case user is already logged in
        const token = localStorage.getItem('sushi_token');
        if (token) {
            handleLogin();
        }

        return () => {
            window.removeEventListener('auth:login_success', handleLogin);
        };
    }, []);

    const addItem = useCallback(
        (item: SushiItem, quantity: number = 1, selectedOption: string = '') => {
            setItems(prev => {
                const existingId = String(item.id);
                const existingIndex = prev.findIndex(
                    i => String(i.id) === existingId && (i.selectedOption || '') === selectedOption
                );

                if (existingIndex > -1) {
                    const updated = [...prev];
                    updated[existingIndex] = {
                        ...updated[existingIndex],
                        quantity: updated[existingIndex].quantity + quantity,
                    };
                    return updated;
                }

                return [...prev, { ...item, quantity, selectedOption }];
            });

            // Haptic feedback
            if ('vibrate' in navigator) navigator.vibrate(10);
        },
        []
    );

    const removeItem = useCallback((id: string | number, selectedOption: string = '') => {
        const stringId = String(id);
        setItems(prev =>
            prev.filter(
                item =>
                    String(item.id) !== stringId ||
                    (item.selectedOption || '') !== (selectedOption || '')
            )
        );
    }, []);

    const updateQuantity = useCallback(
        (id: string | number, quantity: number, selectedOption: string = '') => {
            const stringId = String(id);
            if (quantity <= 0) {
                removeItem(id, selectedOption);
                return;
            }
            setItems(prev =>
                prev.map(item =>
                    String(item.id) === stringId && (item.selectedOption || '') === selectedOption
                        ? { ...item, quantity }
                        : item
                )
            );
        },
        [removeItem]
    );

    const submitOrder = async (paymentMethod: 'EFECTIVO' | 'TARJETA') => {
        if (!tableNumber || items.length === 0) return;

        try {
            const token = localStorage.getItem('sushi_token');
            const headers: Record<string, string> = { 'Content-Type': 'application/json' };
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch('/api/orders', {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    deliveryType: 'table',
                    mesaNumber: tableNumber,
                    paymentMethod,
                    promoCode: appliedPromo?.code || undefined,
                    guestItems: items.map(item => ({
                        menuItemId: Number(item.id),
                        quantity: item.quantity,
                        selectedOption: item.selectedOption,
                    })),
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || 'Order failed');
            }

            const data = await response.json();
            const orderId = data.order?.id;

            setLastOrderId(orderId || null);
            setOrderConfirmed(true);
            setItems([]);
            setAppliedPromo(null);
        } catch (error) {
            console.error('Submit order error:', error);
            throw error;
        }
    };

    const clearCart = useCallback(() => {
        setItems([]);
    }, []);

    const total = useMemo(
        () => items.reduce((acc, item) => acc + item.price * item.quantity, 0),
        [items]
    );

    const finalTotal = useMemo(() => {
        if (appliedPromo) {
            return total - (total * appliedPromo.discount) / 100;
        }
        return total;
    }, [total, appliedPromo]);

    const itemCount = useMemo(() => items.reduce((acc, item) => acc + item.quantity, 0), [items]);

    return (
        <TableOrderContext.Provider
            value={{
                items,
                addItem,
                removeItem,
                updateQuantity,
                clearCart,
                total,
                finalTotal,
                itemCount,
                tableNumber,
                isOrderConfirmed,
                lastOrderId,
                setOrderConfirmed,
                submitOrder,
                appliedPromo,
            }}
        >
            {children}
        </TableOrderContext.Provider>
    );
};

export const useTableOrder = () => {
    const context = useContext(TableOrderContext);
    if (!context) {
        throw new Error('useTableOrder must be used within a TableOrderProvider');
    }
    return context;
};
