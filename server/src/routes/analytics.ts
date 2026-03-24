import { Router, Request, Response } from 'express';
import { supabase } from '../db/supabase.js';

const router = Router();

/**
 * Endpoint to record generic site events for analytics.
 * Supports different types of events stored in 'site_events' table.
 */
router.post('/track', async (req: Request, res: Response) => {
    try {
        const { eventName, sessionId, userId, path, metadata } = req.body;

        if (!eventName || !sessionId) {
            return res.status(400).json({ error: 'Missing required eventName or sessionId' });
        }

        // 1. Record in generic site_events table
        const { error: siteError } = await supabase.from('site_events').insert({
            event_name: eventName,
            session_id: sessionId,
            user_id: userId || null,
            path: path || null,
            metadata: metadata || {},
        });

        if (siteError) {
            console.error('❌ Supabase Generic Analytics Error:', siteError.message);
        }

        // 2. Compatibility: If it's a funnel event, also potentially write to legacy funnel_events table
        // But only if it has the required fields
        const funnelSteps = ['cart_view', 'checkout_start', 'delivery_info_filled', 'order_placed'];
        if (funnelSteps.includes(eventName)) {
            await supabase.from('funnel_events').insert({
                session_id: sessionId,
                step: eventName,
                total_value: Number(metadata?.totalValue) || 0,
                items_count: Number(metadata?.itemsCount) || 0,
                metadata: metadata || {},
                user_id: userId || null,
            });
        }

        res.status(201).json({ success: true });
    } catch (err: any) {
        console.error('❌ Analytics API Error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// Deprecated old endpoint for compatibility during migration
router.post('/funnel', async (req, res) => {
    const { sessionId, step, totalValue, itemsCount, metadata, userId } = req.body;
    try {
        await supabase.from('funnel_events').insert({
            session_id: sessionId,
            step,
            total_value: Number(totalValue) || 0,
            items_count: Number(itemsCount) || 0,
            metadata: metadata || {},
            user_id: userId || null,
        });
        res.status(201).json({ success: true });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

export default router;
