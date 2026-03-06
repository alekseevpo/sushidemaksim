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
                    supabase
                        .from('promo_codes')
                        .insert({ code, discount_percentage: 20, user_id: order.user_id }),
                    supabase.from('orders').update({ discount_sent: true }).eq('id', order.id),
                ]);

                results.push({ orderId: order.id, code });
                console.log(
                    `📧 CRON: Simulated email to ${(order.users as any)?.email}: Your order #${order.id} is late! Code: ${code}`
                );
            }
        }

        res.json({ success: true, processed: results.length, orders: results });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

// CRON job to check birthdays and send 10% discount codes (1 week before and day of)
router.post('/check-birthdays', async (req, res) => {
    const cronSecret = req.headers['x-cron-secret'];
    if (process.env.CRON_SECRET && cronSecret !== process.env.CRON_SECRET) {
        return res.status(403).json({ error: 'Unauthorized' });
    }

    try {
        const { data: users } = await supabase
            .from('users')
            .select('id, email, name, birth_date')
            .not('birth_date', 'is', null);

        const today = new Date();
        const nextWeek = new Date();
        nextWeek.setDate(today.getDate() + 7);

        const todayMonth = today.getMonth() + 1;
        const todayDay = today.getDate();

        const weekMonth = nextWeek.getMonth() + 1;
        const weekDay = nextWeek.getDate();

        const results = [];

        for (const user of users || []) {
            const bDate = new Date(user.birth_date);
            const bMonth = bDate.getMonth() + 1;
            const bDay = bDate.getDate();

            let type = '';
            if (bMonth === todayMonth && bDay === todayDay) type = 'day-of';
            else if (bMonth === weekMonth && bDay === weekDay) type = 'week-before';

            if (type) {
                // Generate a one-time 10% promo code
                const code = `BDAY-${user.id.substring(0, 4).toUpperCase()}-${type === 'day-of' ? 'HOY' : 'WEEK'}`;

                // Ensure duplicate code is not created accidentally (simple check)
                const { data: existing } = await supabase.from('promo_codes').select('id').eq('code', code).maybeSingle();

                if (!existing) {
                    await supabase.from('promo_codes').insert({
                        code,
                        discount_percentage: 10,
                        user_id: user.id,
                        is_used: false
                    });

                    results.push({
                        userId: user.id,
                        email: user.email,
                        code,
                        type,
                    });

                    console.log(`📧 CRON (Birthday): Send email to ${user.email} -> Feliz Cumpleaños! Tu código es ${code} (Por favor, muestra tu ID al repartidor).`);
                }
            }
        }

        res.json({ success: true, processed: results.length, notifications: results });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

export default router;
