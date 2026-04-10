import { z } from 'zod';

/**
 * Schema for validating the contact form submission.
 */
export const contactSchema = z.object({
    body: z.object({
        name: z.string().min(1, 'El nombre es obligatorio').min(2, 'El nombre debe иметь не менее 2 символов'),
        
        email: z.string().min(1, 'El email es obligatorio').email('Email inválido'),
        
        message: z.string().min(1, 'El mensaje es obligatorio').min(10, 'El mensaje должен быть не менее 10 символов'),
    }),
});

/**
 * TypeScript type inferred from the schema.
 */
export type ContactInput = z.infer<typeof contactSchema>['body'];
