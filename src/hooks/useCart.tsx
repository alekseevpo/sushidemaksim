import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { CartItem, SushiItem } from '../types';
import { api } from '../utils/api';
import { useAuth } from './useAuth';

interface CartContextType {
    items: CartItem[];
    total: number;
    isLoading: boolean;
    addItem: (item: SushiItem) => Promise<void>;
    removeItem: (id: string) => Promise<void>;
    updateQuantity: (id: string, quantity: number) => Promise<void>;
    clearCart: () => Promise<void>;
    itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [total, setTotal] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const { isAuthenticated } = useAuth();

    const loadCart = useCallback(async () => {
        if (!isAuthenticated) {
            const localCart = localStorage.getItem('guest_cart');
            if (localCart) {
                try {
                    const parsed = JSON.parse(localCart);
                    setItems(parsed);
                    const localTotal = parsed.reduce(
                        (sum: number, item: any) => sum + item.price * item.quantity,
                        0
                    );
                    setTotal(localTotal);
                } catch (e) {
                    setItems([]);
                    setTotal(0);
                }
            } else {
                setItems([]);
                setTotal(0);
            }
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            const data = await api.get('/cart');

            // Map API response to our local CartItem type
            const mappedItems = data.items.map((item: any) => ({
                id: item.menu_item_id.toString(), // Keep string IDs for frontend compatibility
                name: item.name,
                description: item.description,
                price: item.price,
                image: item.image,
                category: item.category,
                quantity: item.quantity,
            }));

            setItems(mappedItems);
            setTotal(data.total);
        } catch (error) {
            console.error('Error loading cart', error);
            setItems([]);
            setTotal(0);
        } finally {
            setIsLoading(false);
        }
    }, [isAuthenticated]);

    useEffect(() => {
        loadCart();
    }, [loadCart]);

    const addItem = async (item: SushiItem) => {
        // Haptic feedback
        if ('vibrate' in navigator) {
            navigator.vibrate(50);
        }

        const existing = items.find(i => i.id === item.id);
        const newItems = existing
            ? items.map(i => (i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i))
            : [...items, { ...item, quantity: 1 }];

        setItems(newItems);
        setTotal(prev => prev + item.price);

        if (!isAuthenticated) {
            localStorage.setItem('guest_cart', JSON.stringify(newItems));
            return;
        }

        try {
            await api.post('/cart', { menuItemId: parseInt(item.id), quantity: 1 });
            await loadCart(); // sync with server
        } catch (e) {
            await loadCart(); // revert on failure
            throw e;
        }
    };

    const removeItem = async (id: string) => {
        const item = items.find(i => i.id === id);
        if (!item) return;

        const newItems = items.filter(i => i.id !== id);
        setItems(newItems);
        setTotal(prev => prev - item.price * item.quantity);

        if (!isAuthenticated) {
            localStorage.setItem('guest_cart', JSON.stringify(newItems));
            return;
        }

        try {
            const data = await api.get('/cart');
            const realCartItem = data.items.find((i: any) => i.menu_item_id.toString() === id);

            if (realCartItem) {
                await api.delete(`/cart/${realCartItem.id}`);
            }
            await loadCart();
        } catch (e) {
            await loadCart();
        }
    };

    const updateQuantity = async (id: string, quantity: number) => {
        const item = items.find(i => i.id === id);
        if (!item) return;

        const diff = quantity - item.quantity;
        const newItems = items.map(i => (i.id === id ? { ...i, quantity } : i));

        setItems(newItems);
        setTotal(prev => prev + item.price * diff);

        if (!isAuthenticated) {
            localStorage.setItem('guest_cart', JSON.stringify(newItems));
            return;
        }

        try {
            const data = await api.get('/cart');
            const realCartItem = data.items.find((i: any) => i.menu_item_id.toString() === id);

            if (realCartItem) {
                await api.put(`/cart/${realCartItem.id}`, { quantity });
            }
            await loadCart();
        } catch (e) {
            await loadCart();
        }
    };

    const clearCart = async () => {
        setItems([]);
        setTotal(0);

        if (!isAuthenticated) {
            localStorage.removeItem('guest_cart');
            return;
        }

        try {
            await api.delete('/cart');
            await loadCart();
        } catch (e) {
            await loadCart();
        }
    };

    const itemCount = items.reduce((count, item) => count + item.quantity, 0);

    return (
        <CartContext.Provider
            value={{
                items,
                total,
                isLoading,
                addItem,
                removeItem,
                updateQuantity,
                clearCart,
                itemCount,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
