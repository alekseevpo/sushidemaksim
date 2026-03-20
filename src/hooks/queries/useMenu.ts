import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../utils/api';

export interface MenuItem {
    id: number;
    name: string;
    description: string;
    price: number;
    image: string;
    category: string;
    pieces?: number;
    spicy?: boolean;
    vegetarian?: boolean;
    is_promo?: boolean;
    is_popular?: boolean;
    is_chef_choice?: boolean;
    is_new?: boolean;
    allergens?: string[];
}

export const useMenu = (category: string, search: string) => {
    return useQuery({
        queryKey: ['menu', category, search],
        queryFn: async () => {
            const qs = new URLSearchParams();
            if (category && category !== 'all') {
                qs.append('category', category);
            }
            if (search) {
                qs.append('search', search);
            }
            const data = await api.get(`/menu?${qs.toString()}`);
            return data.items as MenuItem[];
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};

export const useFavorites = (user: any) => {
    return useQuery({
        queryKey: ['favorites'],
        queryFn: async () => {
            if (!user) return new Set<number>();
            const favData = await api.get('/user/favorites');
            return new Set<number>(favData.favorites.map((f: any) => Number(f.id)));
        },
        enabled: !!user,
        initialData: new Set<number>(),
    });
};

export const useToggleFavorite = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (itemId: number) => {
            const data = await api.post('/user/favorites', { menuItemId: itemId });
            return { itemId, isFavorite: data.isFavorite };
        },
        onMutate: async itemId => {
            await queryClient.cancelQueries({ queryKey: ['favorites'] });
            const previousFavorites = queryClient.getQueryData<Set<number>>(['favorites']);

            queryClient.setQueryData<Set<number>>(['favorites'], old => {
                const next = new Set(old);
                if (next.has(itemId)) {
                    next.delete(itemId);
                } else {
                    next.add(itemId);
                }
                return next;
            });

            return { previousFavorites };
        },
        onError: (_err, _itemId, context: any) => {
            if (context?.previousFavorites) {
                queryClient.setQueryData(['favorites'], context.previousFavorites);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['favorites'] });
        },
    });
};
export const useCategories = () => {
    return useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            const data = await api.get('/menu/info/categories');
            return data.categories || [];
        },
        staleTime: 60 * 60 * 1000, // 1 hour
    });
};
