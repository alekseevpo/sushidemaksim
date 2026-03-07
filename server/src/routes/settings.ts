import { Router, Response, Request } from 'express';
import { supabase } from '../db/supabase.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = Router();

// GET /api/settings
router.get(
    '/',
    asyncHandler(async (_req: Request, res: Response) => {
        try {
            const { data: settings, error } = await supabase.from('site_settings').select('*');

            if (error) {
                console.warn('site_settings table may be missing, returning empty config');
                return res.json({});
            }

            if (!settings || settings.length === 0) {
                return res.json({});
            }

            // Convert array of rows to a single object map
            const settingsMap = settings.reduce((acc: any, curr: any) => {
                try {
                    acc[curr.key] = typeof curr.value === 'string' ? JSON.parse(curr.value) : curr.value;
                } catch {
                    acc[curr.key] = curr.value;
                }
                return acc;
            }, {});

            res.json(settingsMap);
        } catch (e) {
            console.error('Settings fetch error:', e);
            res.json({}); // Silently fail with empty config to avoid frontend 500
        }
    })
);

export default router;
