import {
    createContext,
    useContext,
    ReactNode,
    useCallback,
    useMemo,
} from 'react';
import { CartItem, SushiItem } from '../types';
import { api } from '../utils/api';
import { useAuth } from './useAuth';
import { useQueryClient } from '@tanstack/react-query';
import {
    useCartQuery,
    useAddToCartMutation,
    useUpdateQuantityMutation,
    useRemoveItemMutation,
    useClearCartMutation,
    CART_QUERY_KEY,
} from './queries/useCartQuery';

interface CartContextType {
    items: CartItem[];
    total: number;
    isLoading: boolean;
    addItem: (item: SushiItem) => Promise<void>;
    removeItem: (id: string, cartItemId?: number) => Promise<void>;
    updateQuantity: (id: string, quantity: number, cartItemId?: number) => Promise<void>;
    clearCart: () => Promise<void>;
    syncGuestItems: () => Promise<void>;
    itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    // Use Query
    const { data, isLoading } = useCartQuery(user);
    const { mutateAsync: addToCart } = useAddToCartMutation(user);
    const { mutateAsync: updateQty } = useUpdateQuantityMutation(user);
    const { mutateAsync: removeCartItem } = useRemoveItemMutation(user);
    const { mutateAsync: clearCartQuery } = useClearCartMutation(user);

    const items = data?.items || [];
    const total = data?.total || 0;

    const syncGuestItems = useCallback(async () => {
        const localCart = localStorage.getItem('guest_cart');
        if (!localCart || !user) return;

        try {
            const guestItems = JSON.parse(localCart);
            localStorage.removeItem('guest_cart');

            const itemsToSync = guestItems.map((item: any) => ({
                menuItemId: parseInt(item.id),
                quantity: item.quantity,
            }));

            await api.post('/cart/bulk', { items: itemsToSync });
            // Re-fetch and clear guest key
            queryClient.invalidateQueries({ queryKey: [...CART_QUERY_KEY, user.id] });
            queryClient.invalidateQueries({ queryKey: [...CART_QUERY_KEY, 'guest'] });
        } catch (e) {
            console.error('Failed to sync guest cart', e);
        }
    }, [user, queryClient]);

    const addItem = async (item: SushiItem) => {
        if ('vibrate' in navigator) navigator.vibrate(50);
        await addToCart(item);
    };

    const removeItem = async (id: string, cartItemId?: number) => {
        await removeCartItem({ id, cartItemId });
    };

    const updateQuantity = async (id: string, quantity: number, cartItemId?: number) => {
        await updateQty({ id, quantity, cartItemId });
    };

    const clearCart = async () => {
        await clearCartQuery();
    };

    const itemCount = useMemo(
        () => items.reduce((count: number, item: CartItem) => count + item.quantity, 0),
        [items]
    );

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
