import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';

/**
 * Middleware for validating request data using Zod schemas.
 *
 * Usage:
 * router.post('/path', validateResource(mySchema), handler)
 */
export const validateResource =
    (schema: z.ZodTypeAny) => async (req: Request, res: Response, next: NextFunction) => {
        try {
            await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params,
            });
            next();
        } catch (e: any) {
            if (e instanceof ZodError) {
                const errors = e.issues.map((err: any) => ({
                    path: err.path.join('.'),
                    message: err.message,
                }));

                return res.status(400).json({
                    error: errors[0].message,
                    errors: errors,
                });
            }
            return res.status(500).json({ error: 'Internal validation error' });
        }
    };
