import { z } from 'zod';

/**
 * Schema for validating the contact form submission on the frontend.
 */
export const contactSchema = z.object({
    name: z
        .string()
        .min(1, 'El nombre es obligatorio')
        .min(2, 'El nombre debe tener al menos 2 caracteres'),

    email: z.string().min(1, 'El email es obligatorio').email('Email inválido'),

    message: z
        .string()
        .min(1, 'El mensaje es obligatorio')
        .min(10, 'El mensaje debe tener al menos 10 caracteres'),
});

export type ContactInput = z.infer<typeof contactSchema>;
