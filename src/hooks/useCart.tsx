import {
    createContext,
    useContext,
    useState,
    useEffect,
    ReactNode,
    useCallback,
    useRef,
} from 'react';
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
    // This ref helps detect transition from guest to logged in for syncing
    const prevAuthRef = useRef(!!user);

    useEffect(() => {
        const isAuth = !!user;
        // If transitioning from false to true (just logged in)
        if (!prevAuthRef.current && isAuth) {
            // We don't dispatch here anymore, we listen to the one from useAuth or handle it here
            // Removing this redundant sync trigger if useAuth already does it
            // Actually, keep it simpler: useAuth should be the only one dispatching
        }
        prevAuthRef.current = isAuth;
    }, [user]);

    const prevUserRef = useRef(user);
    const isSyncingRef = useRef(false);

    useEffect(() => {
        // Transition from user -> null (logout)
        if (prevUserRef.current && !user) {
            setItems([]);
            setTotal(0);
            localStorage.removeItem('guest_cart');
        }
        prevUserRef.current = user;
    }, [user]);

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

    const syncGuestItems = useCallback(async () => {
        const localCart = localStorage.getItem('guest_cart');
        if (!localCart || isSyncingRef.current) return;

        try {
            isSyncingRef.current = true;
            const guestItems = JSON.parse(localCart);

            // Clear localStorage immediately to prevent multiple sync triggers
            localStorage.removeItem('guest_cart');

            // Use bulk endpoint for efficiency
            const itemsToSync = guestItems.map((item: any) => ({
                menuItemId: parseInt(item.id),
                quantity: item.quantity,
            }));

            await api.post('/cart/bulk', { items: itemsToSync });
            await loadCart(true);
        } catch (e) {
            console.error('Failed to sync guest cart', e);
        } finally {
            isSyncingRef.current = false;
        }
    }, [loadCart]);

    useEffect(() => {
        loadCart();

        const handleSync = () => {
            syncGuestItems();
        };
        window.addEventListener('auth:login_success', handleSync);
        return () => window.removeEventListener('auth:login_success', handleSync);
    }, [loadCart, syncGuestItems]);

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
