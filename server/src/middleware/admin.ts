import { Response, NextFunction } from 'express';
import { getDb } from '../db/database.js';
import { AuthRequest } from './auth.js';

/**
 * Middleware that requires the authenticated user to have the 'admin' role.
 * Must be used AFTER authMiddleware.
 */
export function adminMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
    const db = getDb();
    const user = db.prepare('SELECT role FROM users WHERE id = ?').get(req.userId) as { role: string } | undefined;

    if (!user || user.role !== 'admin') {
        return res.status(403).json({ error: 'Acceso denegado: se requieren privilegios de administrador' });
    }

    next();
}
