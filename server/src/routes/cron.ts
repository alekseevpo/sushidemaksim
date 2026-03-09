import { Router } from 'express';
import { supabase } from '../db/supabase.js';
import { getMadridStartOfDay, getMadridYesterdayStartOfDay } from '../utils/helpers.js';
import { sendBirthdayGiftEmail } from '../utils/email.js';

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
                const { data: existing } = await supabase
                    .from('promo_codes')
                    .select('id')
                    .eq('code', code)
                    .maybeSingle();

                if (!existing) {
                    await supabase.from('promo_codes').insert({
                        code,
                        discount_percentage: 10,
                        user_id: user.id,
                        is_used: false,
                    });

                    results.push({
                        userId: user.id,
                        email: user.email,
                        code,
                        type,
                    });

                    try {
                        await sendBirthdayGiftEmail(user.email, user.name, code);
                        console.log(
                            `📧 CRON (Birthday): Send email to ${user.email} -> Feliz Cumpleaños! Tu código es ${code}.`
                        );
                    } catch (emailErr) {
                        console.error(
                            `❌ CRON (Birthday): Failed to send email to ${user.email}:`,
                            emailErr
                        );
                    }
                }
            }
        }

        res.json({ success: true, processed: results.length, notifications: results });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

// Daily report generation (to be called at ~0:05 AM)
router.post('/generate-daily-report', async (req, res) => {
    const cronSecret = req.headers['x-cron-secret'];
    if (process.env.CRON_SECRET && cronSecret !== process.env.CRON_SECRET) {
        return res.status(403).json({ error: 'Unauthorized' });
    }

    try {
        const startOfToday = getMadridStartOfDay();
        const startOfYesterday = getMadridYesterdayStartOfDay();

        const yesterdayISO = startOfYesterday.toISOString();
        const todayISO = startOfToday.toISOString();

        // 1. Fetch yesterday's metrics
        const [
            { data: revenueData },
            { count: totalOrders },
            { count: newUsers },
            { count: cancelledCount },
            { count: lateCount },
            { data: invitationData },
        ] = await Promise.all([
            supabase
                .from('orders')
                .select('total')
                .neq('status', 'cancelled')
                .gte('created_at', yesterdayISO)
                .lt('created_at', todayISO),
            supabase
                .from('orders')
                .select('*', { count: 'exact', head: true })
                .neq('status', 'cancelled')
                .gte('created_at', yesterdayISO)
                .lt('created_at', todayISO),
            supabase
                .from('users')
                .select('*', { count: 'exact', head: true })
                .gte('created_at', yesterdayISO)
                .lt('created_at', todayISO),
            supabase
                .from('orders')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'cancelled')
                .gte('created_at', yesterdayISO)
                .lt('created_at', todayISO),
            supabase
                .from('orders')
                .select('*', { count: 'exact', head: true })
                .eq('discount_sent', true)
                .gte('created_at', yesterdayISO)
                .lt('created_at', todayISO),
            supabase
                .from('orders')
                .select('notes')
                .gte('created_at', yesterdayISO)
                .lt('created_at', todayISO),
        ]);

        const invitationsCount =
            invitationData?.filter(o => o.notes && o.notes.includes('[De parte de:')).length || 0;

        const revenue = revenueData?.reduce((sum, o) => sum + Number(o.total), 0) || 0;
        const avg = totalOrders ? revenue / (totalOrders || 1) : 0;

        // 2. Insert Report
        const reportDate = startOfYesterday.toLocaleDateString('en-CA', {
            timeZone: 'Europe/Madrid',
        });
        const { error: reportError } = await supabase.from('daily_reports').upsert(
            {
                date: reportDate,
                total_revenue: Math.round(revenue * 100) / 100,
                orders_count: totalOrders || 0,
                new_users_count: newUsers || 0,
                avg_ticket: Math.round(avg * 100) / 100,
                cancelled_count: cancelledCount || 0,
                late_count: lateCount || 0,
                invitations_count: invitationsCount || 0,
            },
            { onConflict: 'date' }
        );

        if (reportError) {
            // If table doesn't exist yet, we catch it but don't crash
            console.warn('⚠️ Could not save daily report - check if table "daily_reports" exists.');
        }

        res.json({ success: true, date: reportDate, revenue, orders: totalOrders });
    } catch (e: any) {
        console.error('❌ Daily report cron error:', e);
        res.status(500).json({ error: e.message });
    }
});

// CRON job to permanently delete accounts marked for deletion > 30 days ago
router.post('/cleanup-deleted-users', async (req, res) => {
    const cronSecret = req.headers['x-cron-secret'];
    if (process.env.CRON_SECRET && cronSecret !== process.env.CRON_SECRET) {
        return res.status(403).json({ error: 'Unauthorized' });
    }

    try {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

        // 1. Find users to delete
        const { data: usersToDelete, error: findError } = await supabase
            .from('users')
            .select('id')
            .lt('deleted_at', thirtyDaysAgo);

        if (findError) throw findError;

        const results = [];
        if (usersToDelete && usersToDelete.length > 0) {
            for (const user of usersToDelete) {
                // Delete related
                const tables = ['user_addresses', 'user_favorites', 'orders', 'promo_codes'];
                for (const table of tables) {
                    await supabase.from(table).delete().eq('user_id', user.id);
                }

                // Delete user
                const { error: delError } = await supabase.from('users').delete().eq('id', user.id);

                if (!delError) results.push(user.id);
            }
        }

        res.json({ success: true, permanentlyDeleted: results.length, ids: results });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

export default router;
