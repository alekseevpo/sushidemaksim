import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../utils/supabase';

interface RealtimeParams {
    userId?: string;
    orderId?: string | number;
    onUpdate?: () => void;
}

/**
 * Hook to listen for order status updates via Supabase Broadcast.
 * Can listen to a specific user's orders or a single specific order.
 */
export function useOrderRealtime({ userId, orderId, onUpdate }: RealtimeParams) {
    const queryClient = useQueryClient();

    useEffect(() => {
        const channelName = orderId
            ? `order_tracking:${orderId}`
            : userId
              ? `user_orders:${userId}`
              : null;

        if (!channelName) return;

        console.log(`📡 Subscribing to: ${channelName}`);

        const channel = supabase.channel(channelName);

        channel
            .on('broadcast', { event: 'orderStatus_updated' }, ({ payload }) => {
                console.log('🔔 Received order update broadcast:', payload);

                // 1. Trigger custom callback if provided
                if (onUpdate) {
                    onUpdate();
                }

                // 2. Invalidate TanStack Query if relevant
                queryClient.invalidateQueries({ queryKey: ['orders'] });
                if (orderId) {
                    queryClient.invalidateQueries({ queryKey: ['order', String(orderId)] });
                }
            })
            .subscribe(status => {
                console.log(`🔌 Channel status (${channelName}): ${status}`);
            });

        return () => {
            console.log(`📴 Unsubscribing from: ${channelName}`);
            supabase.removeChannel(channel);
        };
    }, [userId, orderId, queryClient, onUpdate]);
}
