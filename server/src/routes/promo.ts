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
        const { code: rawCode, subtotal } = req.body;
        const code = String(rawCode).trim().toUpperCase();

        // ─── Hardcoded Test Promos ───
        if (code === 'TEST10') {
            return res.json({ percentage: 10 });
        }

        // ─── DB Lookup for Promo Codes ───
        console.log(`[PROMO] Validating "${code}" for user ${req.userId}...`);
        const { data: promo, error } = await supabase
            .from('promo_codes')
            .select('*')
            .eq('code', code)
            // Allow checking existing codes even if used, so we can give better errors
            .or(`user_id.is.null,user_id.eq.${req.userId}`)
            .maybeSingle();

        if (error) {
            console.error('[PROMO] DB Error:', error);
            return res.status(500).json({ error: 'Error del servidor al validar el código' });
        }

        if (!promo) {
            console.warn(`[PROMO] Code "${code}" not found for user ${req.userId}`);
            return res.status(400).json({ error: 'Código inválido' });
        }

        if (promo.is_used) {
            return res.status(400).json({ error: 'Este código ya ha sido utilizado' });
        }

        // ─── Requirements Check for Registration Promos ───
        // Support both "NUEVO" (default) and "NEW" (old/fallback or from newsletter)
        if (promo.code.startsWith('NUEVO') || promo.code.startsWith('NEW')) {
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
