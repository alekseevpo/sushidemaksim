import { z } from 'zod';

/**
 * Schema for admin login form
 */
export const loginSchema = z.object({
    email: z.string().min(1, 'El email es obligatorio').email('Email inválido'),
    password: z
        .string()
        .min(1, 'La contraseña es obligatoria')
        .min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export type LoginInput = z.infer<typeof loginSchema>;
