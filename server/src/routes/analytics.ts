import { Router } from 'express';
import { supabase } from '../db/supabase.js';

const router = Router();

/**
 * Endpoint to record funnel steps for analytics.
 * Tracks events like 'view_cart', 'checkout_start', 'delivery_info_filled', 'order_placed'.
 */
router.post('/funnel', async (req, res) => {
    try {
        const { sessionId, step, totalValue, itemsCount, metadata, userId } = req.body;

        if (!sessionId || !step) {
            return res.status(400).json({ error: 'Missing required sessionId or step' });
        }

        // Record the event in Supabase
        const { error } = await supabase.from('funnel_events').insert({
            session_id: sessionId,
            step,
            total_value: Number(totalValue) || 0,
            items_count: Number(itemsCount) || 0,
            metadata: metadata || {},
            user_id: userId || null,
        });

        if (error) {
            console.error('❌ Supabase Analytics Error:', error.message);
            return res.status(500).json({ error: error.message });
        }

        res.status(201).json({ success: true });
    } catch (err: any) {
        console.error('❌ Analytics API Error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

export default router;
