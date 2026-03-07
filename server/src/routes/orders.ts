import { Router, Response, Request } from 'express';
import { config } from '../config.js';
import { supabase } from '../db/supabase.js';
import { authMiddleware, optionalAuthMiddleware, AuthRequest } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { validate } from '../middleware/validate.js';
import { UAParser } from 'ua-parser-js';
import { sendOrderReceiptEmail } from '../utils/email.js';

const router = Router();

// POST /api/orders — create order from current cart (supports Guests and Users)
router.post(
    '/',
    optionalAuthMiddleware,
    validate({
        deliveryAddress: { type: 'string', required: true, maxLength: 300 },
        phoneNumber: { type: 'string', required: true, maxLength: 30 },
    }),
    asyncHandler(async (req: AuthRequest, res: Response) => {
        const { deliveryAddress, phoneNumber, notes, promoCode, guestItems } = req.body;

        const parser = new UAParser(req.headers['user-agent'] || '');
        const deviceType = parser.getDevice().type || 'desktop';
        const osName = parser.getOS().name || 'Unknown';
        const browserName = parser.getBrowser().name || 'Unknown';

        // 1. Get cart items
        let cartItems: any[] = [];

        if (req.userId) {
            const { data: dbCartItems, error: cartError } = await supabase
                .from('cart_items')
                .select('quantity, menu_item_id, menu_items(name, price, image)')
                .eq('user_id', req.userId);

            if (cartError) throw cartError;
            cartItems = dbCartItems || [];
        } else if (guestItems && Array.isArray(guestItems) && guestItems.length > 0) {
            const itemIds = guestItems.map((i: any) => i.menuItemId);
            const { data: menuData, error: menuErr } = await supabase
                .from('menu_items')
                .select('id, name, price, image')
                .in('id', itemIds);

            if (menuErr) throw menuErr;

            cartItems = guestItems.map((gi: any) => {
                const menuItem = menuData?.find((m: any) => m.id === gi.menuItemId);
                if (!menuItem) return null;
                return {
                    quantity: gi.quantity,
                    menu_item_id: gi.menuItemId,
                    menu_items: menuItem
                };
            }).filter((i: any) => i !== null);
        }

        if (cartItems.length === 0) {
            return res.status(400).json({ error: 'La cesta está vacía o artículos no encontrados' });
        }

        // 2. Calculate total
        let finalTotal = cartItems.reduce(
            (sum, item: any) => sum + item.menu_items.price * item.quantity,
            0
        );
        let usedPromoId = null;

        if (promoCode) {
            if (promoCode === 'TEST10') {
                finalTotal = finalTotal * 0.9; // 10% discount
            } else {
                const query = supabase
                    .from('promo_codes')
                    .select('*')
                    .eq('code', promoCode)
                    .eq('is_used', false);

                if (req.userId) {
                    query.or(`user_id.is.null,user_id.eq.${req.userId}`);
                } else {
                    query.is('user_id', null);
                }

                const { data: promo } = await query.maybeSingle();

                if (promo) {
                    finalTotal = finalTotal * (1 - promo.discount_percentage / 100);
                    usedPromoId = promo.id;
                }
            }
        }

        // 3. Create Order
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert({
                user_id: req.userId || null,
                total: Math.round(finalTotal * 100) / 100,
                delivery_address: deliveryAddress?.trim() || '',
                phone_number: phoneNumber?.trim() || '',
                status: 'pending',
                estimated_delivery_time: '30-60 min',
                notes: notes?.trim() || '',
                device_type: deviceType,
                os_name: osName,
                browser_name: browserName,
            })
            .select()
            .single();

        if (orderError) throw orderError;

        // 4. Create Order Items
        const orderItemsToInsert = cartItems.map((item: any) => ({
            order_id: order.id,
            menu_item_id: item.menu_item_id,
            name: item.menu_items.name,
            quantity: item.quantity,
            price_at_time: item.menu_items.price,
            image: item.menu_items.image,
        }));

        const { error: itemsError } = await supabase.from('order_items').insert(orderItemsToInsert);
        if (itemsError) throw itemsError;

        // 5. Cleanup (Promo and Cart)
        if (usedPromoId) {
            await supabase.from('promo_codes').update({ is_used: true }).eq('id', usedPromoId);
        }
        if (req.userId) {
            await supabase.from('cart_items').delete().eq('user_id', req.userId);
        }

        // Return order with items
        const { data: fullOrder } = await supabase
            .from('orders')
            .select('*, order_items(*)')
            .eq('id', order.id)
            .single();

        // 6. Send Receipt Email if user is authenticated
        if (req.userId) {
            try {
                const { data: userData } = await supabase
                    .from('users')
                    .select('email, name')
                    .eq('id', req.userId)
                    .single();

                if (userData && userData.email) {
                    await sendOrderReceiptEmail(userData.email, {
                        orderId: order.id,
                        customerName: userData.name || 'Cliente',
                        items: orderItemsToInsert,
                        total: finalTotal,
                        deliveryAddress,
                        phoneNumber,
                        notes,
                    });
                }
            } catch (emailErr) {
                console.error('Failed to send receipt email:', emailErr);
            }
        }

        res.status(201).json({ order: { ...fullOrder, items: fullOrder.order_items } });
    })
);

// GET /api/orders — order history with pagination
router.get(
    '/',
    authMiddleware,
    asyncHandler(async (req: AuthRequest, res: Response) => {
        const page = Math.max(1, parseInt(req.query.page as string) || 1);
        const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 10));
        const offset = (page - 1) * limit;

        const {
            data: orders,
            count,
            error,
        } = await supabase
            .from('orders')
            .select('*, order_items(*)', { count: 'exact' })
            .eq('user_id', req.userId)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) throw error;

        const formattedOrders = (orders || []).map((o: any) => ({
            ...o,
            items: o.order_items,
        }));

        res.json({
            orders: formattedOrders || [],
            pagination: {
                total: count || 0,
                page,
                limit,
                pages: Math.ceil((count || 0) / limit),
                hasNext: page * limit < (count || 0),
                hasPrev: page > 1,
            },
        });
    })
);

// GET /api/orders/:id — single order
router.get(
    '/:id',
    authMiddleware,
    asyncHandler(async (req: AuthRequest, res: Response) => {
        const { data: order, error } = await supabase
            .from('orders')
            .select('*, order_items(*)')
            .eq('id', req.params.id)
            .eq('user_id', req.userId)
            .single();

        if (error || !order) {
            return res.status(404).json({ error: 'Pedido no encontrado' });
        }

        res.json({ order: { ...order, items: order.order_items } });
    })
);

// PATCH /api/orders/:id/cancel
router.patch(
    '/:id/cancel',
    authMiddleware,
    asyncHandler(async (req: AuthRequest, res: Response) => {
        const { data: order, error: fetchError } = await supabase
            .from('orders')
            .select('status')
            .eq('id', req.params.id)
            .eq('user_id', req.userId)
            .single();

        if (fetchError || !order) {
            return res.status(404).json({ error: 'Pedido no encontrado' });
        }

        if (order.status !== 'pending' && order.status !== 'waiting_payment') {
            return res.status(400).json({
                error: 'Solo se pueden cancelar pedidos pendientes o en espera de pago.',
            });
        }

        const { data: updated, error: updateError } = await supabase
            .from('orders')
            .update({ status: 'cancelled' })
            .eq('id', req.params.id)
            .select()
            .single();

        if (updateError) throw updateError;
        res.json({ order: updated });
    })
);

// POST /api/orders/invite — create a draft order for someone else to pay (Auth Users Only)
router.post(
    '/invite',
    authMiddleware,
    validate({
        deliveryAddress: { type: 'string', required: true, maxLength: 300 },
        phoneNumber: { type: 'string', required: true, maxLength: 30 },
        senderName: { type: 'string', required: false, maxLength: 100 },
    }),
    asyncHandler(async (req: AuthRequest, res: Response) => {
        const { deliveryAddress, phoneNumber, notes, promoCode, senderName } = req.body;

        const parser = new UAParser(req.headers['user-agent'] || '');
        const deviceType = parser.getDevice().type || 'desktop';
        const osName = parser.getOS().name || 'Unknown';

        // 1. Get items from user's cart in DB
        const { data: dbItems, error: cartError } = await supabase
            .from('cart_items')
            .select('quantity, menu_item_id, menu_items(name, price, image)')
            .eq('user_id', req.userId);

        const cartItems = dbItems || [];

        if (cartItems.length === 0) {
            return res.status(400).json({ error: 'La cesta está vacía. Añade algo antes de invitar.' });
        }

        // 2. Calculate total
        const subtotal = cartItems.reduce((sum, item: any) => sum + item.menu_items.price * item.quantity, 0);
        let finalTotal = subtotal;
        // Simple 10% for testing if needed, or proper promo logic
        if (promoCode === 'TEST10') finalTotal *= 0.9;

        // 3. Create Draft Order
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert({
                user_id: req.userId || null,
                total: Math.round(finalTotal * 100) / 100,
                delivery_address: deliveryAddress?.trim() || '',
                phone_number: phoneNumber?.trim() || '',
                status: 'waiting_payment',
                notes: `${notes || ''}${senderName ? ` [De parte de: ${senderName}]` : ''}`.trim(),
                device_type: deviceType,
                os_name: osName,
                estimated_delivery_time: '30-60 min'
            })
            .select()
            .single();

        if (orderError) throw orderError;

        // 4. Create Items
        const itemsToInsert = cartItems.map((item: any) => ({
            order_id: order.id,
            menu_item_id: item.menu_item_id,
            name: item.menu_items.name,
            quantity: item.quantity,
            price_at_time: item.menu_items.price,
            image: item.menu_items.image,
        }));
        await supabase.from('order_items').insert(itemsToInsert);

        const origin = (req.headers.origin as string) || (config.isDev ? 'http://localhost:3000' : 'https://sushidemaksim.com');
        res.status(201).json({
            orderId: order.id,
            shareUrl: `${origin}/invitacion/${order.id}`
        });
    })
);

// GET /api/orders/share/:id — Social preview redirector (enhances Telegram/WhatsApp previews)
router.get(
    '/share/:id',
    asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        const { data: order } = await supabase
            .from('orders')
            .select('notes, total')
            .eq('id', id)
            .single();

        const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'https';
        const host = req.get('host');
        const fullOrigin = `${protocol}://${host}`;

        // Extract sender name from notes [De parte de: Name]
        const senderMatch = order?.notes?.match(/\[De parte de: (.*?)\]/);
        const senderName = senderMatch ? senderMatch[1] : 'Tu amigo(a)';

        // Ensure image URL is absolute and uses HTTPS for Telegram
        const pandaImg = `https://${host}/hungry-panda.png`;
        const finalDest = `https://${host}/pay-for-friend/${id}`;

        const html = `
<!DOCTYPE html>
<html lang="es" prefix="og: http://ogp.me/ns#">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <!-- PRIMARY PREVIEW TAGS (Telegram/WhatsApp priority) -->
    <title>¡Invita a ${senderName}! 🎁 — Sushi de Maksim</title>
    <meta name="description" content="¿Te animas a invitar a ${senderName}? Su pedido favorito de Sushi de Maksim te espera. 🍣✨">
    <meta property="og:title" content="¡Invita a ${senderName}! 🎁">
    <meta property="og:description" content="¿Te animas a invitar a ${senderName}? Su pedido favorito de Sushi de Maksim te espera. 🍣✨">
    <meta property="og:image" content="${pandaImg}">
    <meta property="og:image:secure_url" content="${pandaImg}">
    <meta property="og:image:type" content="image/png">
    <meta property="og:image:width" content="600">
    <meta property="og:image:height" content="600">
    <meta property="og:type" content="website">
    <meta property="og:url" content="${finalDest}">
    
    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:image" content="${pandaImg}">
    <meta name="twitter:title" content="¡Invita a ${senderName}! 🎁">
    <meta name="twitter:description" content="Sorprende a tu amigo(a) con su sushi favorito.">
    
    <meta property="og:site_name" content="Sushi de Maksim">
    
    <!-- Redirection -->
    <meta http-equiv="refresh" content="0; url=${finalDest}">
    <script>window.location.href = "${finalDest}";</script>
    <style>
        body { font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #fdfbf7; color: #666; }
        .loader { text-align: center; }
    </style>
</head>
<body>
    <div class="loader">
        <h1 style="font-size: 40px; margin-bottom: 10px;">🍣</h1>
        <p>Redirigiendo a la sorpresa...</p>
    </div>
</body>
</html>`;

        res.set('Content-Type', 'text/html');
        res.send(html);
    })
);

// GET /api/orders/public/:id — get order details for payment link (no auth)
router.get(
    '/public/:id',
    asyncHandler(async (req: Request, res: Response) => {
        const { data: order, error } = await supabase
            .from('orders')
            .select('*, order_items(*)')
            .eq('id', req.params.id)
            .eq('status', 'waiting_payment')
            .single();

        if (error || !order) {
            return res.status(404).json({ error: 'Invitación no encontrada или ya ha sido pagada.' });
        }

        res.json({ order: { ...order, items: order.order_items } });
    })
);

// POST /api/orders/:id/confirm-payment — finalize invitation order
router.post(
    '/:id/confirm-payment',
    asyncHandler(async (req: Request, res: Response) => {
        const { data: order, error: fetchErr } = await supabase
            .from('orders')
            .select('status')
            .eq('id', req.params.id)
            .single();

        if (fetchErr || !order) return res.status(404).json({ error: 'Pedido no encontrado' });
        if (order.status !== 'waiting_payment') return res.status(400).json({ error: 'El pedido ya no está esperando pago' });

        const { data: updated, error: updateErr } = await supabase
            .from('orders')
            .update({ status: 'pending' }) // Moves to kitchen
            .eq('id', req.params.id)
            .select()
            .single();

        if (updateErr) throw updateErr;
        res.json({ success: true, order: updated });
    })
);

// Note: /deliver and other status updates (except cancel) should be in admin.ts
export default router;
