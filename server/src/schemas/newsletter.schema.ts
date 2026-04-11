import { z } from 'zod';

/**
 * Schema for newsletter subscription
 */
export const subscribeSchema = z.object({
    body: z.object({
        email: z.string().trim().toLowerCase().email('Email inválido'),
    }),
});
