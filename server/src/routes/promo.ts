import { Router, Response } from 'express';
import { getDb } from '../db/database.js';
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
        const db = getDb();

        const promo = db.prepare('SELECT * FROM promo_codes WHERE code = ? AND is_used = 0 AND user_id = ?').get(code, req.userId) as any;

        if (!promo) {
            return res.status(400).json({ error: 'Código inválido o ya utilizado' });
        }

        res.json({ percentage: promo.discount_percentage });
    })
);

export default router;
