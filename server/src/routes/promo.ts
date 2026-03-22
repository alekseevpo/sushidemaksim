import { Router, Response } from 'express';
import { supabase } from '../db/supabase.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { validate } from '../middleware/validate.js';
import { promoLimiter } from '../middleware/rateLimiters.js';

const router = Router();
router.use(authMiddleware);

router.post(
    '/validate',
    promoLimiter,
    validate({
        code: { required: true, type: 'string' },
        subtotal: { type: 'number', required: false },
    }),
    asyncHandler(async (req: AuthRequest, res: Response) => {
        const { code, subtotal } = req.body;

        // ─── Hardcoded Test Promo ───
        if (code === 'TEST10') {
            return res.json({ percentage: 10 });
        }

        // ─── DB Lookup for Promo Codes ───
        const { data: promo, error } = await supabase
            .from('promo_codes')
            .select('*')
            .eq('code', code)
            .eq('is_used', false)
            // Allow global promos (where user_id is null) or specific to the user
            .or(`user_id.is.null,user_id.eq.${req.userId}`)
            .maybeSingle();

        if (error || !promo) {
            return res.status(400).json({ error: 'Código inválido o ya utilizado' });
        }

        // ─── Requirements Check for Welcome Promos ───
        if (promo.code.startsWith('NUEVO')) {
            // 1. Expiry Check (24h)
            const createdAt = new Date(promo.created_at);
            const expiredAt = new Date(createdAt.getTime() + 24 * 60 * 60 * 1000);
            if (new Date() > expiredAt) {
                return res
                    .status(400)
                    .json({ error: 'Este código de bienvenida ha expirado (válido 24h)' });
            }

            // 2. Min Order Check (70€)
            if (subtotal !== undefined && subtotal < 70) {
                return res.status(400).json({
                    error: 'El pedido mínimo para este código es de 70,00€',
                    minOrder: 70,
                });
            }
        }

        res.json({ percentage: promo.discount_percentage });
    })
);

export default router;
