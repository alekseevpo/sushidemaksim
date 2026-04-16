import { Request, Response, NextFunction } from 'express';

type Rule = {
    required?: boolean;
    type?: 'string' | 'number' | 'boolean' | 'array';
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    match?: RegExp;
    enum?: any[];
    message?: string;
};

type Schema = Record<string, Rule>;

/**
 * Lightweight input validation middleware factory.
 * Usage: router.post('/path', validate({ field: { required: true, minLength: 2 } }), handler)
 */
export function validate(schema: Schema, source: 'body' | 'query' | 'params' = 'body') {
    return (req: Request, res: Response, next: NextFunction) => {
        const data = req[source];
        const errors: string[] = [];

        for (const [field, rules] of Object.entries(schema)) {
            const value = data[field];
            const isEmpty = value === undefined || value === null || value === '';

            if (rules.required && isEmpty) {
                errors.push(rules.message || `El campo '${field}' es obligatorio`);
                continue;
            }

            if (isEmpty) continue;

            if (rules.type && rules.type !== 'array' && typeof value !== rules.type) {
                errors.push(`El campo '${field}' debe ser de tipo ${rules.type}`);
                continue;
            }

            if (rules.type === 'array' && !Array.isArray(value)) {
                errors.push(`El campo '${field}' debe ser un array`);
                continue;
            }

            if (rules.type === 'number' || typeof value === 'number') {
                const num = Number(value);
                if (isNaN(num)) {
                    errors.push(`El campo '${field}' debe ser un número`);
                    continue;
                }
                if (rules.min !== undefined && num < rules.min) {
                    errors.push(`El campo '${field}' debe ser al menos ${rules.min}`);
                }
                if (rules.max !== undefined && num > rules.max) {
                    errors.push(`El campo '${field}' debe ser como máximo ${rules.max}`);
                }
            }

            if (typeof value === 'string') {
                if (rules.minLength !== undefined && value.length < rules.minLength) {
                    errors.push(
                        `El campo '${field}' debe tener al menos ${rules.minLength} caracteres`
                    );
                }
                if (rules.maxLength !== undefined && value.length > rules.maxLength) {
                    errors.push(
                        `El campo '${field}' no puede superar los ${rules.maxLength} caracteres`
                    );
                }
                if (rules.match && !rules.match.test(value)) {
                    errors.push(rules.message || `El campo '${field}' tiene un formato inválido`);
                }
            }

            if (rules.enum && !rules.enum.includes(value)) {
                errors.push(`El campo '${field}' debe ser uno de: ${rules.enum.join(', ')}`);
            }
        }

        if (errors.length > 0) {
            return res.status(400).json({ error: errors[0], errors });
        }

        next();
    };
}

// Common reusable validators
export const emailRule: Rule = {
    required: true,
    type: 'string',
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Email inválido',
};

export const passwordRule: Rule = {
    required: true,
    type: 'string',
    minLength: 9,
    maxLength: 100,
    match: /^(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>_+-])/,
    message: 'La contraseña debe tener al menos 9 caracteres y contener un número y un símbolo especial',
};
