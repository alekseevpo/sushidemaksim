import { Router, Response, Request } from 'express';
import { supabase } from '../db/supabase.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = Router();

// GET /api/settings
router.get(
    '/',
    asyncHandler(async (_req: Request, res: Response) => {
        const { data: settings, error } = await supabase.from('site_settings').select('*');

        if (error) throw error;

        // Convert array of rows to a single object map
        const settingsMap = settings.reduce((acc: any, curr: any) => {
            try {
                acc[curr.key] = JSON.parse(curr.value);
            } catch {
                acc[curr.key] = curr.value;
            }
            return acc;
        }, {});

        res.json(settingsMap);
    })
);

export default router;
