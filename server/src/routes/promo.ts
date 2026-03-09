import { Router, Response } from 'express';
import { supabase } from '../db/supabase.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { validate } from '../middleware/validate.js';

const router = Router();
router.use(authMiddleware);

router.post(
    '/validate',
    validate({ code: { required: true, type: 'string' } }),
    asyncHandler(async (req: AuthRequest, res: Response) => {
        const { code } = req.body;

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

        // ─── 24h Expiry Check for Welcome Promos ───
        if (promo.code.startsWith('NUEVO5')) {
            const createdAt = new Date(promo.created_at);
            const expiredAt = new Date(createdAt.getTime() + 24 * 60 * 60 * 1000);
            if (new Date() > expiredAt) {
                return res
                    .status(400)
                    .json({ error: 'Este código de bienvenida ha expirado (válido 24h)' });
            }
        }

        res.json({ percentage: promo.discount_percentage });
    })
);

export default router;
