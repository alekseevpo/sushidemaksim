import { z } from 'zod';

/**
 * Schema for validating the contact form submission.
 */
export const contactSchema = z.object({
    body: z.object({
        name: z
            .string()
            .min(1, 'El nombre es obligatorio')
            .min(2, 'El nombre debe tener al menos 2 caracteres'),

        email: z.string().min(1, 'El email es obligatorio').email('Email inválido'),

        message: z
            .string()
            .min(1, 'El mensaje es obligatorio')
            .min(10, 'El mensaje debe tener al menos 10 caracteres'),
        website: z.string().optional(),
    }),
});

/**
 * TypeScript type inferred from the schema.
 */
export type ContactInput = z.infer<typeof contactSchema>['body'];
