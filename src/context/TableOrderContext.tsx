import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { CartItem, SushiItem } from '../types';

interface TableOrderContextType {
    items: CartItem[];
    addItem: (item: SushiItem, quantity?: number) => void;
    removeItem: (id: string | number) => void;
    updateQuantity: (id: string | number, quantity: number) => void;
    clearCart: () => void;
    total: number;
    itemCount: number;
    tableNumber: number | null;
    isOrderConfirmed: boolean;
    setOrderConfirmed: (val: boolean) => void;
    submitOrder: (paymentMethod: 'EFECTIVO' | 'TARJETA') => Promise<void>;
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

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }, [items]);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const tableParam = params.get('table');
        if (tableParam) {
            setTableNumber(parseInt(tableParam, 10));
        }
    }, []);

    const addItem = useCallback((item: SushiItem, quantity: number = 1) => {
        setItems(prev => {
            const existingId = String(item.id);
            const existingIndex = prev.findIndex(i => String(i.id) === existingId);

            if (existingIndex > -1) {
                const updated = [...prev];
                updated[existingIndex] = {
                    ...updated[existingIndex],
                    quantity: updated[existingIndex].quantity + quantity,
                };
                return updated;
            }

            return [...prev, { ...item, quantity }];
        });

        // Haptic feedback
        if ('vibrate' in navigator) navigator.vibrate(10);
    }, []);

    const removeItem = useCallback((id: string | number) => {
        const stringId = String(id);
        setItems(prev => prev.filter(item => String(item.id) !== stringId));
    }, []);

    const updateQuantity = useCallback(
        (id: string | number, quantity: number) => {
            const stringId = String(id);
            if (quantity <= 0) {
                removeItem(id);
                return;
            }
            setItems(prev =>
                prev.map(item => (String(item.id) === stringId ? { ...item, quantity } : item))
            );
        },
        [removeItem]
    );

    const submitOrder = async (paymentMethod: 'EFECTIVO' | 'TARJETA') => {
        if (!tableNumber || items.length === 0) return;

        try {
            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    deliveryType: 'table',
                    mesaNumber: tableNumber,
                    paymentMethod,
                    guestItems: items.map(item => ({
                        menuItemId: item.id,
                        quantity: item.quantity,
                    })),
                }),
            });

            if (!response.ok) throw new Error('Order failed');

            setOrderConfirmed(true);
            setItems([]);
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
                itemCount,
                tableNumber,
                isOrderConfirmed,
                setOrderConfirmed,
                submitOrder,
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
