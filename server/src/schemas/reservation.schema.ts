import { z } from 'zod';

/**
 * Valid statuses for a reservation
 */
export const reservationStatusSchema = z.enum(['pending', 'confirmed', 'cancelled', 'completed']);

/**
 * Common ID parameter schema for reservations
 */
export const reservationIdParamSchema = z.object({
    params: z.object({
        id: z.string().transform(val => parseInt(val, 10)),
    }),
});

/**
 * Schema for creating a new reservation
 */
export const createReservationSchema = z.object({
    body: z.object({
        name: z.string().min(2, 'El nombre debe иметь al menos 2 caracteres').max(100),
        email: z.string().email('Email inválido'),
        phone: z.string().min(9, 'Teléfono inválido').max(20),
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (YYYY-MM-DD)'),
        time: z.string().regex(/^\d{2}:\d{2}$/, 'Formato de hora inválido (HH:mm)'),
        guests: z
            .union([z.number(), z.string()])
            .transform(val => {
                const parsed = typeof val === 'string' ? parseInt(val, 10) : val;
                return parsed;
            })
            .refine(val => !isNaN(val) && val >= 1 && val <= 50, {
                message: 'El número de personas debe estar entre 1 y 50',
            }),
        notes: z.string().max(500).optional().default(''),
        user_id: z.string().optional().nullable(),
    }),
});

/**
 * Schema for updating a reservation status or notes (Admin)
 */
export const updateReservationSchema = z.object({
    params: z.object({
        id: z.string().transform(val => parseInt(val, 10)),
    }),
    body: z
        .object({
            status: reservationStatusSchema.optional(),
            notes: z.string().max(500).optional(),
        })
        .refine(data => data.status !== undefined || data.notes !== undefined, {
            message: 'Debe proporcionar un estado o notas para actualizar',
        }),
});

/**
 * Schema for filtering reservations in admin
 */
export const getReservationsQuerySchema = z.object({
    query: z.object({
        status: reservationStatusSchema.optional(),
        date: z
            .string()
            .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido')
            .optional(),
    }),
});
