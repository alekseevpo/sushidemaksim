import { Response, NextFunction } from 'express';
import { supabase } from '../db/supabase.js';
import { AuthRequest } from './auth.js';

/**
 * Middleware that requires the authenticated user to have the 'admin' role.
 * Must be used AFTER authMiddleware.
 */
export async function adminMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
    if (!req.userId) {
        return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    const { data: user, error } = await supabase
        .from('users')
        .select('role, is_superadmin')
        .eq('id', req.userId)
        .single();

    if (error || !user || (user.role !== 'admin' && !user.is_superadmin)) {
        return res
            .status(403)
            .json({ error: 'Acceso denegado: se requieren privilegios de administrador' });
    }

    next();
}
