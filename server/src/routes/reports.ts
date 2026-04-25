import { Router, Request, Response } from 'express';
import { supabase } from '../db/supabase.js';
import { authMiddleware } from '../middleware/auth.js';
import { adminMiddleware } from '../middleware/admin.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = Router();

router.use(authMiddleware, adminMiddleware);

// GET /api/admin/reports - Get list of all reports
router.get(
    '/',
    asyncHandler(async (_req: Request, res: Response) => {
        const { data, error } = await supabase
            .from('monthly_reports')
            .select('*')
            .order('year', { ascending: false })
            .order('month', { ascending: false });

        if (error) throw error;
        res.json(data);
    })
);

// GET /api/admin/reports/:id - Get specific report details
router.get(
    '/:id',
    asyncHandler(async (req: Request, res: Response) => {
        const { data, error } = await supabase
            .from('monthly_reports')
            .select('*')
            .eq('id', req.params.id)
            .single();

        if (error) throw error;
        res.json(data);
    })
);

// POST /api/admin/reports/generate - Archive old data and generate report
router.post(
    '/generate',
    asyncHandler(async (req: Request, res: Response) => {
        const now = new Date();
        const year = req.body.year || now.getFullYear();
        const month = req.body.month || now.getMonth() + 1;

        console.log(`📊 Generating report for ${month}/${year}...`);

        // 1. Fetch ALL non-archived orders
        const { data: orders, error: ordersErr } = await supabase
            .from('orders')
            .select('*, order_items(*), users(name, email)')
            .eq('is_archived', false);

        if (ordersErr) throw ordersErr;

        // 2. Fetch ALL non-archived reservations
        const { data: reservations, error: resErr } = await supabase
            .from('reservations')
            .select('*')
            .eq('is_archived', false);

        if (resErr) throw resErr;

        // 3. Fetch analytics events (if any)
        const { data: events } = await supabase
            .from('site_events')
            .select('*')
            .gte('created_at', new Date(year, month - 1, 1).toISOString())
            .lt('created_at', new Date(year, month, 1).toISOString());

        // --- CALCULATE STATS ---
        const totalOrders = orders?.length || 0;
        const totalRevenue = orders?.reduce((sum, o) => sum + Number(o.total), 0) || 0;
        const totalReservations = reservations?.length || 0;
        // Items Stats
        const itemMap: Record<string, { name: string; qty: number; revenue: number }> = {};
        orders?.forEach(o => {
            o.order_items?.forEach((item: any) => {
                if (!itemMap[item.name]) {
                    itemMap[item.name] = { name: item.name, qty: 0, revenue: 0 };
                }
                itemMap[item.name].qty += item.quantity;
                itemMap[item.name].revenue += item.quantity * item.price_at_time;
            });
        });
        const topItems = Object.values(itemMap)
            .sort((a, b) => b.qty - a.qty)
            .slice(0, 10);

        // Client Stats
        const clientMap: Record<
            string,
            { name: string; email: string; orders: number; total: number }
        > = {};
        orders?.forEach(o => {
            const key = o.user_id || o.phone_number;
            if (!clientMap[key]) {
                clientMap[key] = {
                    name: o.users?.name || o.customer_name || 'Invitado',
                    email: o.users?.email || '',
                    orders: 0,
                    total: 0,
                };
            }
            clientMap[key].orders++;
            clientMap[key].total += Number(o.total);
        });
        const topClients = Object.values(clientMap)
            .sort((a, b) => b.total - a.total)
            .slice(0, 10);

        // Discounts
        let totalDiscounts = 0;
        orders?.forEach(o => {
            const subtotal =
                o.order_items?.reduce((s: number, i: any) => s + i.price_at_time * i.quantity, 0) ||
                0;
            if (subtotal > Number(o.total)) {
                totalDiscounts += subtotal - Number(o.total);
            }
        });

        const reportData = {
            summary: {
                year,
                month,
                totalOrders,
                totalRevenue: Math.round(totalRevenue * 100) / 100,
                totalReservations,
                avgTicket:
                    totalOrders > 0 ? Math.round((totalRevenue / totalOrders) * 100) / 100 : 0,
                totalDiscounts: Math.round(totalDiscounts * 100) / 100,
                registrations: events?.filter(e => e.event_name === 'user_registered').length || 0,
            },
            topItems,
            topClients,
            stats: {
                paymentMethods: orders?.reduce((acc: any, o) => {
                    acc[o.payment_method] = (acc[o.payment_method] || 0) + 1;
                    return acc;
                }, {}),
                deliveryTypes: orders?.reduce((acc: any, o) => {
                    acc[o.delivery_type || 'delivery'] =
                        (acc[o.delivery_type || 'delivery'] || 0) + 1;
                    return acc;
                }, {}),
            },
        };

        // 4. Save report
        const { error: saveErr } = await supabase.from('monthly_reports').upsert(
            {
                year,
                month,
                report_data: reportData,
            },
            { onConflict: 'year,month' }
        );

        if (saveErr) throw saveErr;

        const { error: archOrderErr } = await supabase
            .from('orders')
            .update({ is_archived: true })
            .neq('id', 513)
            .eq('is_archived', false);

        if (archOrderErr) throw archOrderErr;
        
        // 6. CLEAR DAILY REPORTS for that period (Archiving)
        const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
        const endDate = new Date(year, month, 0).toISOString().split('T')[0];
        
        const { error: archDailyErr } = await supabase
            .from('daily_reports')
            .delete()
            .gte('date', startDate)
            .lte('date', endDate);

        if (archDailyErr) {
            console.error('📊 Error clearing daily reports during archival:', archDailyErr.message);
        }

        res.json({ success: true, report: reportData });
    })
);

export default router;
