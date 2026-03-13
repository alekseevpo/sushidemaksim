import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
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
    syncGuestItems: () => Promise<void>;
    itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [total, setTotal] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useAuth();
    const prevAuthRef = useRef(false);
    const isSyncingRef = useRef(false);

    useEffect(() => {
        const isAuth = !!user;
        const checkAndSync = async () => {
            // If just logged in (transition from false to true)
            if (!prevAuthRef.current && isAuth) {
                // Delay slightly to ensure token is available in all contexts
                setTimeout(() => {
                    const event = new CustomEvent('auth:login_success');
                    window.dispatchEvent(event);
                }, 100);
            }
            prevAuthRef.current = isAuth;
        };
        checkAndSync();
    }, [user]);

    const prevUserRef = useRef(user);

    useEffect(() => {
        // Transition from user -> null (logout)
        if (prevUserRef.current && !user) {
            localStorage.setItem('guest_cart', JSON.stringify(items));
        }
        // Transition from null -> user (login)
        if (!prevUserRef.current && user) {
            // We just logged in, the next 'items' update will be from server
            // We don't want to save that server state back to guest_cart immediately
        }
        prevUserRef.current = user;
    }, [user, items]);

    const loadCart = useCallback(
        async (silent = false) => {
            if (!user) {
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
                if (!silent) setIsLoading(true);
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
        },
        [user]
    );

    useEffect(() => {
        loadCart();
        
        const handleSync = () => {
            syncGuestItems();
        };
        window.addEventListener('auth:login_success', handleSync);
        return () => window.removeEventListener('auth:login_success', handleSync);
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

        if (!user) {
            localStorage.setItem('guest_cart', JSON.stringify(newItems));
            return;
        }

        try {
            await api.post('/cart', { menuItemId: parseInt(item.id), quantity: 1 });
            await loadCart(true); // sync with server
        } catch (e) {
            await loadCart(true); // revert on failure
            throw e;
        }
    };

    const removeItem = async (id: string) => {
        const item = items.find(i => i.id === id);
        if (!item) return;

        const newItems = items.filter(i => i.id !== id);
        setItems(newItems);
        setTotal(prev => prev - item.price * item.quantity);

        if (!user) {
            localStorage.setItem('guest_cart', JSON.stringify(newItems));
            return;
        }

        try {
            const data = await api.get('/cart');
            const realCartItem = data.items.find((i: any) => i.menu_item_id.toString() === id);

            if (realCartItem) {
                await api.delete(`/cart/${realCartItem.id}`);
            }
            await loadCart(true);
        } catch (e) {
            await loadCart(true);
        }
    };

    const updateQuantity = async (id: string, quantity: number) => {
        const item = items.find(i => i.id === id);
        if (!item) return;

        const diff = quantity - item.quantity;
        const newItems = items.map(i => (i.id === id ? { ...i, quantity } : i));

        setItems(newItems);
        setTotal(prev => prev + item.price * diff);

        if (!user) {
            localStorage.setItem('guest_cart', JSON.stringify(newItems));
            return;
        }

        try {
            const data = await api.get('/cart');
            const realCartItem = data.items.find((i: any) => i.menu_item_id.toString() === id);

            if (realCartItem) {
                await api.put(`/cart/${realCartItem.id}`, { quantity });
            }
            await loadCart(true);
        } catch (e) {
            await loadCart(true);
        }
    };

    const clearCart = async () => {
        setItems([]);
        setTotal(0);

        if (!user) {
            localStorage.removeItem('guest_cart');
            return;
        }

        try {
            await api.delete('/cart');
            await loadCart(true);
        } catch (e) {
            await loadCart(true);
        }
    };

    const syncGuestItems = async () => {
        const localCart = localStorage.getItem('guest_cart');
        if (!localCart || isSyncingRef.current) return;

        try {
            isSyncingRef.current = true;
            const guestItems = JSON.parse(localCart);
            
            // Clear localStorage immediately to prevent multiple sync triggers
            localStorage.removeItem('guest_cart');
            
            // Sync each items to server
            for (const item of guestItems) {
                await api.post('/cart', {
                    menuItemId: parseInt(item.id),
                    quantity: item.quantity,
                });
            }
            await loadCart(true);
        } catch (e) {
            console.error('Failed to sync guest cart', e);
        } finally {
            isSyncingRef.current = false;
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
                syncGuestItems,
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
