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

        const { data: promo, error } = await supabase
            .from('promo_codes')
            .select('*')
            .eq('code', code)
            .eq('is_used', false)
            .eq('user_id', req.userId)
            .single();

        if (error || !promo) {
            return res.status(400).json({ error: 'Código inválido o ya utilizado' });
        }

        res.json({ percentage: promo.discount_percentage });
    })
);

export default router;
