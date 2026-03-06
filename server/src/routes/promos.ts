import { Router, Response, Request } from 'express';
import { supabase } from '../db/supabase.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = Router();

// GET /api/promos
router.get('/', asyncHandler(async (_req: Request, res: Response) => {
    const { data: promos, error } = await supabase
        .from('promos')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: true });

    if (error) throw error;
    res.json({ promos });
}));

export default router;
