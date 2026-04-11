import { z } from 'zod';

/**
 * Common event tracking schema
 */
export const trackEventSchema = z.object({
    body: z.object({
        eventName: z.string().min(1),
        sessionId: z.string().min(1),
        userId: z.string().optional().nullable(),
        path: z.string().optional().nullable(),
        metadata: z.record(z.any()).optional().default({}),
    }),
});

/**
 * Schema for waiter-placed orders (venue events)
 */
export const waiterOrderSchema = z.object({
    body: z.object({
        items: z
            .array(
                z.object({
                    id: z.number(),
                    name: z.string(),
                    quantity: z.number().min(1),
                    price: z.number(),
                    image: z.string().optional().nullable(),
                })
            )
            .min(1, 'La orden debe tener al menos un producto'),
        totalValue: z.number().min(0),
        itemsCount: z.number().min(1),
        waiterId: z.string().optional().nullable(),
        metadata: z
            .object({
                table: z.string().optional().nullable(),
            })
            .optional()
            .default({}),
    }),
});

/**
 * Legacy funnel event schema
 */
export const funnelEventSchema = z.object({
    body: z.object({
        sessionId: z.string().min(1),
        step: z.string().min(1),
        totalValue: z.number().optional().default(0),
        itemsCount: z.number().optional().default(0),
        metadata: z.record(z.any()).optional().default({}),
        userId: z.string().uuid().optional().nullable(),
    }),
});
