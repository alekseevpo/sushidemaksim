import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../utils/api';
import { CartItem, SushiItem } from '../../types';

export const CART_QUERY_KEY = ['cart'];

export function useCartQuery(user: any) {
    return useQuery({
        queryKey: [...CART_QUERY_KEY, user?.id || 'guest'],
        queryFn: async () => {
            if (!user) {
                const localCart = localStorage.getItem('guest_cart');
                if (!localCart) return { items: [], total: 0 };
                try {
                    const items = JSON.parse(localCart);
                    const total = items.reduce(
                        (sum: number, item: any) => sum + item.price * item.quantity,
                        0
                    );
                    return { items, total };
                } catch (e) {
                    return { items: [], total: 0 };
                }
            }

            const data = await api.get('/cart');
            const mappedItems = data.items.map((item: any) => ({
                id: item.menu_item_id.toString(),
                name: item.name,
                description: item.description,
                price: item.price,
                image: item.image,
                category: item.category,
                quantity: item.quantity,
                cartItemId: item.id, // ID from the cart join table
            }));

            return { items: mappedItems, total: data.total };
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}

export function useAddToCartMutation(user: any) {
    const queryClient = useQueryClient();
    const queryKey = [...CART_QUERY_KEY, user?.id || 'guest'];

    return useMutation({
        mutationFn: async (item: SushiItem) => {
            if (!user) {
                // Logic already handled in onMutate for guest, but we repeat for safety
                const localCart = localStorage.getItem('guest_cart');
                const items = localCart ? JSON.parse(localCart) : [];
                const existing = items.find((i: any) => i.id === item.id);
                const newItems = existing
                    ? items.map((i: any) =>
                          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
                      )
                    : [...items, { ...item, quantity: 1 }];
                localStorage.setItem('guest_cart', JSON.stringify(newItems));
                return { items: newItems };
            }

            return api.post('/cart', { menuItemId: parseInt(item.id), quantity: 1 });
        },
        onMutate: async newItem => {
            await queryClient.cancelQueries({ queryKey });
            const previousCart = queryClient.getQueryData<{ items: CartItem[]; total: number }>(
                queryKey
            );

            if (previousCart) {
                const existing = previousCart.items.find(i => i.id === newItem.id);
                const updatedItems = existing
                    ? previousCart.items.map(i =>
                          i.id === newItem.id ? { ...i, quantity: i.quantity + 1 } : i
                      )
                    : [...previousCart.items, { ...newItem, quantity: 1 } as CartItem];

                const updatedTotal = updatedItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

                queryClient.setQueryData(queryKey, { items: updatedItems, total: updatedTotal });
            }

            return { previousCart };
        },
        onError: (_err, _newItem, context) => {
            if (context?.previousCart) {
                queryClient.setQueryData(queryKey, context.previousCart);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey });
        },
    });
}

export function useUpdateQuantityMutation(user: any) {
    const queryClient = useQueryClient();
    const queryKey = [...CART_QUERY_KEY, user?.id || 'guest'];

    return useMutation({
        mutationFn: async ({
            id,
            quantity,
            cartItemId,
        }: {
            id: string;
            quantity: number;
            cartItemId?: number;
        }) => {
            if (!user) {
                const localCart = localStorage.getItem('guest_cart');
                const items = localCart ? JSON.parse(localCart) : [];
                const newItems = items.map((i: any) => (i.id === id ? { ...i, quantity } : i));
                localStorage.setItem('guest_cart', JSON.stringify(newItems));
                return;
            }

            if (!cartItemId) {
                const data = await api.get('/cart');
                const realItem = data.items.find((i: any) => i.menu_item_id.toString() === id);
                if (realItem) return api.put(`/cart/${realItem.id}`, { quantity });
                return;
            }
            return api.put(`/cart/${cartItemId}`, { quantity });
        },
        onMutate: async ({ id, quantity }) => {
            await queryClient.cancelQueries({ queryKey });
            const previousCart = queryClient.getQueryData<{ items: CartItem[]; total: number }>(
                queryKey
            );

            if (previousCart) {
                const updatedItems = previousCart.items.map(i =>
                    i.id === id ? { ...i, quantity } : i
                );
                const updatedTotal = updatedItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
                queryClient.setQueryData(queryKey, { items: updatedItems, total: updatedTotal });
            }

            return { previousCart };
        },
        onError: (_err, _variables, context) => {
            if (context?.previousCart) {
                queryClient.setQueryData(queryKey, context.previousCart);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey });
        },
    });
}

export function useRemoveItemMutation(user: any) {
    const queryClient = useQueryClient();
    const queryKey = [...CART_QUERY_KEY, user?.id || 'guest'];

    return useMutation({
        mutationFn: async ({ id, cartItemId }: { id: string; cartItemId?: number }) => {
            if (!user) {
                const localCart = localStorage.getItem('guest_cart');
                const items = localCart ? JSON.parse(localCart) : [];
                const newItems = items.filter((i: any) => i.id !== id);
                localStorage.setItem('guest_cart', JSON.stringify(newItems));
                return;
            }

            if (!cartItemId) {
                const data = await api.get('/cart');
                const realItem = data.items.find((i: any) => i.menu_item_id.toString() === id);
                if (realItem) return api.delete(`/cart/${realItem.id}`);
                return;
            }
            return api.delete(`/cart/${cartItemId}`);
        },
        onMutate: async ({ id }) => {
            await queryClient.cancelQueries({ queryKey });
            const previousCart = queryClient.getQueryData<{ items: CartItem[]; total: number }>(
                queryKey
            );

            if (previousCart) {
                const updatedItems = previousCart.items.filter(i => i.id !== id);
                const updatedTotal = updatedItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
                queryClient.setQueryData(queryKey, { items: updatedItems, total: updatedTotal });
            }

            return { previousCart };
        },
        onError: (_err, _variables, context) => {
            if (context?.previousCart) {
                queryClient.setQueryData(queryKey, context.previousCart);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey });
        },
    });
}

export function useClearCartMutation(user: any) {
    const queryClient = useQueryClient();
    const queryKey = [...CART_QUERY_KEY, user?.id || 'guest'];

    return useMutation({
        mutationFn: async () => {
            if (!user) {
                localStorage.removeItem('guest_cart');
                return;
            }
            return api.delete('/cart');
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey });
        },
    });
}
