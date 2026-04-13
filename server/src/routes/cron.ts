import { Router } from 'express';
import { supabase } from '../db/supabase.js';
import { getMadridStartOfDay, getMadridYesterdayStartOfDay } from '../utils/helpers.js';
import { sendBirthdayGiftEmail, sendAbandonedCartEmail } from '../utils/email.js';

const router = Router();

// This route will be called by a CRON job (e.g. Vercel Cron or GitHub Action)
// It should be protected by an API key or a secret header

// CRON job to check birthdays and send 10% discount codes (1 week before and day of)
router.post('/check-birthdays', async (req, res) => {
    const cronSecret = req.headers['x-cron-secret'];
    const authHeader = req.headers['authorization'];
    const isVercelCron = authHeader === `Bearer ${process.env.CRON_SECRET}`;

    if (process.env.CRON_SECRET && cronSecret !== process.env.CRON_SECRET && !isVercelCron) {
        return res.status(200).json({ success: false, error: 'Unauthorized (Silent)' });
    }

    try {
        // Fetch birthday settings
        const { data: settingsData } = await supabase
            .from('site_settings')
            .select('key, value')
            .in('key', ['loyalty_birthday_bonus_enabled', 'loyalty_birthday_bonus_percent']);

        const settings: Record<string, string> = {};
        settingsData?.forEach(s => (settings[s.key] = s.value));

        const bdayEnabled = settings['loyalty_birthday_bonus_enabled'] === 'true';
        const bdayPercent = parseInt(settings['loyalty_birthday_bonus_percent']) || 10;

        if (!bdayEnabled) {
            return res.json({ success: true, message: 'Birthday rewards are disabled' });
        }

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
                // Generate a one-time promo code
                const code = `BDAY${bdayPercent}-${user.id.substring(0, 4).toUpperCase()}-${type === 'day-of' ? 'HOY' : 'WEEK'}`;

                // Ensure duplicate code is not created accidentally (simple check)
                const { data: existing } = await supabase
                    .from('promo_codes')
                    .select('id')
                    .eq('code', code)
                    .maybeSingle();

                if (!existing) {
                    await supabase.from('promo_codes').insert({
                        code,
                        discount_percentage: bdayPercent,
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
                        await sendBirthdayGiftEmail(user.email, user.name, code, bdayPercent);
                        console.log(
                            `📧 CRON (Birthday): Send email to ${user.email} -> Feliz Cumpleaños! Tu código es ${code} (${bdayPercent}%).`
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
    const authHeader = req.headers['authorization'];
    const isVercelCron = authHeader === `Bearer ${process.env.CRON_SECRET}`;

    if (process.env.CRON_SECRET && cronSecret !== process.env.CRON_SECRET && !isVercelCron) {
        return res.status(200).json({ success: false, error: 'Unauthorized (Silent)' });
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
    const authHeader = req.headers['authorization'];
    const isVercelCron = authHeader === `Bearer ${process.env.CRON_SECRET}`;

    if (process.env.CRON_SECRET && cronSecret !== process.env.CRON_SECRET && !isVercelCron) {
        return res.status(200).json({ success: false, error: 'Unauthorized (Silent)' });
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

// CRON job to check for abandoned carts (> 24h) and send reminders
router.post('/check-abandoned-carts', async (req, res) => {
    const cronSecret = req.headers['x-cron-secret'];
    const authHeader = req.headers['authorization'];
    const isVercelCron = authHeader === `Bearer ${process.env.CRON_SECRET}`;

    if (process.env.CRON_SECRET && cronSecret !== process.env.CRON_SECRET && !isVercelCron) {
        return res.status(200).json({ success: false, error: 'Unauthorized (Silent)' });
    }

    // Abandoned cart reminders are temporarily disabled by owner request
    return res.json({
        success: true,
        message: 'Abandoned cart reminders are currently disabled',
    });

    try {
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

        // 1. Get users who were active > 24h ago and have cart items
        // We join cart_items with users to get email
        const { data: abandonedCarts, error: fetchError } = await supabase
            .from('cart_items')
            .select(
                `
                user_id,
                users!inner(name, email, last_seen_at, abandoned_cart_reminder_sent_at),
                menu_items(name, price)
            `
            )
            .lt('users.last_seen_at', twentyFourHoursAgo);

        if (fetchError) throw fetchError;

        // 2. Group items by user
        const userCarts = new Map<
            string,
            { name: string; email: string; items: any[]; lastReminder: string | null }
        >();

        (abandonedCarts || []).forEach((row: any) => {
            if (!userCarts.has(row.user_id)) {
                userCarts.set(row.user_id, {
                    name: row.users.name,
                    email: row.users.email,
                    items: [],
                    lastReminder: row.users.abandoned_cart_reminder_sent_at,
                });
            }
            userCarts.get(row.user_id)?.items.push(row);
        });

        const results = [];
        const now = new Date().toISOString();

        // 3. Filter and send
        for (const [userId, data] of userCarts.entries()) {
            // Only send if never sent or sent > 7 days ago (to avoid spamming)
            const lastReminderDate = data.lastReminder
                ? new Date(data.lastReminder as string)
                : null;
            const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).getTime();

            const lastReminderTime = lastReminderDate?.getTime() ?? 0;
            if (lastReminderTime < sevenDaysAgo) {
                try {
                    await sendAbandonedCartEmail(data.email, data.name, data.items);

                    // Update reminder timestamp
                    await supabase
                        .from('users')
                        .update({ abandoned_cart_reminder_sent_at: now })
                        .eq('id', userId);

                    results.push({ userId, email: data.email });
                } catch (err) {
                    console.error(`❌ Failed to send abandoned cart email to ${data.email}:`, err);
                }
            }
        }

        res.json({ success: true, remindersSent: results.length, processed: results });
    } catch (e: any) {
        console.error('❌ Abandoned cart cron error:', e);
        res.status(500).json({ error: e.message });
    }
});

// CRON job to check for late orders (> 60m from creation and still not delivered)
router.post('/check-late-orders', async (req, res) => {
    const cronSecret = req.headers['x-cron-secret'];
    const authHeader = req.headers['authorization'];
    const isVercelCron = authHeader === `Bearer ${process.env.CRON_SECRET}`;

    if (process.env.CRON_SECRET && cronSecret !== process.env.CRON_SECRET && !isVercelCron) {
        return res.status(200).json({ success: false, error: 'Unauthorized (Silent)' });
    }

    try {
        const sixtyMinutesAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

        // 1. Get orders that are still active but were created > 60m ago
        const { data: lateOrders, error: fetchError } = await supabase
            .from('orders')
            .select('id, status, created_at, phone_number, delivery_address')
            .in('status', ['pending', 'confirmed', 'preparing', 'on_the_way'])
            .lt('created_at', sixtyMinutesAgo);

        if (fetchError) throw fetchError;

        const results = (lateOrders || []).map(order => {
            const created = new Date(order.created_at);
            const diffMins = Math.round((Date.now() - created.getTime()) / 60000);
            return {
                id: order.id,
                status: order.status,
                minsLate: diffMins,
                phone: order.phone_number,
                address: order.delivery_address,
            };
        });

        if (results.length > 0) {
            console.warn(`🕒 CRON (Late Orders): Found ${results.length} orders that are LATE!`);
            // Here we could send a notification to Admin via Telegram/Email
        }

        res.json({ success: true, lateOrdersCount: results.length, detections: results });
    } catch (e: any) {
        console.error('❌ Late orders cron error:', e);
        res.status(500).json({ error: e.message });
    }
});

export default router;
