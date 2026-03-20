import { useQuery } from '@tanstack/react-query';
import { api } from '../../utils/api';

export const ORDERS_QUERY_KEY = ['orders'];

export function useOrdersQuery(page: number = 1, limit: number = 10) {
    return useQuery({
        queryKey: [...ORDERS_QUERY_KEY, page, limit],
        queryFn: async () => {
            const data = await api.get(`/orders?page=${page}&limit=${limit}`);
            return data;
        },
        staleTime: 1000 * 30, // 30 seconds
        refetchInterval: 1000 * 30, // Poll every 30s
    });
}
