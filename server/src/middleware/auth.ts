import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { isValidUUID } from '../utils/helpers.js';

export interface AuthRequest extends Request {
    userId?: string;
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Token de acceso requerido' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const payload = jwt.verify(token, config.jwtSecret) as { userId: string };

        // 🚨 CRITICAL FIX: Validate UUID format to prevent "556" / integer ID syntax errors in Supabase
        if (!payload.userId || !isValidUUID(payload.userId)) {
            console.warn(`⚠️ Blocked request with invalid userId format: "${payload.userId}"`);
            return res.status(401).json({
                error: 'Sesión inválida (ID corrupto). Por favor, vuelve a iniciar sesión.',
            });
        }

        req.userId = payload.userId;
        next();
    } catch {
        return res.status(401).json({ error: 'Token inválido o expirado' });
    }
}
export function optionalAuthMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next();
    }

    const token = authHeader.split(' ')[1];

    try {
        const payload = jwt.verify(token, config.jwtSecret) as { userId: string };
        if (payload.userId && isValidUUID(payload.userId)) {
            req.userId = payload.userId;
        }
    } catch {
        return res
            .status(401)
            .json({ error: 'Sesión expirada. Por favor, vuelve a iniciar sesión.' });
    }

    next();
}
