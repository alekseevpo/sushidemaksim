import { z } from 'zod';

/**
 * Common schema for a single cart item input
 */
const cartItemInput = z.object({
    menuItemId: z.number().min(1, 'ID de producto inválido'),
    quantity: z
        .number()
        .min(1, 'La cantidad debe ser al menos 1')
        .max(99, 'Cantidad máxima excedida (99)'),
});

/**
 * Schema for adding an item to the cart
 */
export const addToCartSchema = z.object({
    body: cartItemInput,
});

/**
 * Schema for updating an item quantity
 */
export const updateCartItemSchema = z.object({
    params: z.object({
        itemId: z.string().transform(val => parseInt(val, 10)),
    }),
    body: z.object({
        quantity: z.number().min(0, 'La cantidad не может быть отрицательной').max(99),
    }),
});

/**
 * Schema for deleting a single item
 */
export const cartItemIdParamSchema = z.object({
    params: z.object({
        itemId: z.string().transform(val => parseInt(val, 10)),
    }),
});

/**
 * Schema for bulk cart synchronization
 */
export const bulkCartSchema = z.object({
    body: z.object({
        items: z
            .array(
                z.object({
                    id: z.union([z.number(), z.string()]).optional(),
                    menuItemId: z.union([z.number(), z.string()]).optional(),
                    quantity: z.union([z.number(), z.string()]).optional().default(1),
                })
            )
            .min(1, 'El carrito no может быть пустым при синхронизации'),
    }),
});
