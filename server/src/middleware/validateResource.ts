import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

/**
 * Middleware for validating request data using Zod schemas.
 *
 * Usage:
 * router.post('/path', validateResource(mySchema), handler)
 */
export const validateResource =
    (schema: z.ZodTypeAny) => async (req: Request, res: Response, next: NextFunction) => {
        const result = await schema.safeParseAsync({
            body: req.body,
            query: req.query,
            params: req.params,
        });

        if (result.success) {
            return next();
        }

        const errors = result.error.issues.map((err: any) => ({
            path: err.path.join('.'),
            message: err.message,
        }));

        // Log validation failures for diagnostics (Best Practice)
        console.warn('⚠️ Validation Error for %s:', req.originalUrl, {
            errors,
            body: req.body,
        });

        return res.status(400).json({
            error: errors[0].message,
            errors: errors,
        });
    };
