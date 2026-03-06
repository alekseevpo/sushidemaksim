import { Router } from 'express';
import { supabase } from '../db/supabase.js';

const router = Router();

// This route will be called by a CRON job (e.g. Vercel Cron or GitHub Action)
// It should be protected by an API key or a secret header
router.post('/check-late-orders', async (req, res) => {
    const cronSecret = req.headers['x-cron-secret'];

    if (process.env.CRON_SECRET && cronSecret !== process.env.CRON_SECRET) {
        return res.status(403).json({ error: 'Unauthorized' });
    }

    try {
        const sixtyMinsAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

        const { data: lateOrders } = await supabase
            .from('orders')
            .select('id, user_id, users(email)')
            .not('status', 'in', '("delivered", "cancelled")')
            .eq('discount_sent', false)
            .lt('created_at', sixtyMinsAgo);

        const results = [];

        if (lateOrders && lateOrders.length > 0) {
            for (const order of lateOrders) {
                const code = `LATE-20-${order.id}-${Math.floor(Math.random() * 1000)}`;

                await Promise.all([
                    supabase.from('promo_codes').insert({ code, discount_percentage: 20, user_id: order.user_id }),
                    supabase.from('orders').update({ discount_sent: true }).eq('id', order.id)
                ]);

                results.push({ orderId: order.id, code });
                console.log(`📧 CRON: Simulated email to ${(order.users as any)?.email}: Your order #${order.id} is late! Code: ${code}`);
            }
        }

        res.json({ success: true, processed: results.length, orders: results });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

export default router;
