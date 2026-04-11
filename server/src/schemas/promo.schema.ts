import { z } from 'zod';

/**
 * Schema for validating a promo code during checkout
 */
export const validatePromoSchema = z.object({
    body: z.object({
        code: z.string().min(1, 'El código es obligatorio').trim().toUpperCase(),
        subtotal: z.number().min(0).optional(),
    }),
});

/**
 * Base schema for a promo/campaign (the banners on home/catalog)
 */
const promoBase = {
    title: z.string().min(1, 'El título es obligatorio'),
    description: z.string().min(1, 'La descripción es obligatoria'),
    discount: z.number().min(0).max(100, 'El descuento no может superar el 100%'),
    valid_until: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido')
        .nullable()
        .optional(),
    is_active: z.boolean().optional().default(true),
    icon: z.string().optional(),
    color: z.string().optional(),
    bg: z.string().optional(),
};

export const createPromoSchema = z.object({
    body: z.object(promoBase),
});

export const updatePromoSchema = z.object({
    params: z.object({
        id: z.string().transform(val => parseInt(val, 10)),
    }),
    body: z.object(promoBase).partial(),
});

export const promoIdParamSchema = z.object({
    params: z.object({
        id: z.string().transform(val => parseInt(val, 10)),
    }),
});
