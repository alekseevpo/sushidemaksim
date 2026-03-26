import { Router, Response, Request } from 'express';
import { config } from '../config.js';
import { supabase } from '../db/supabase.js';
import { authMiddleware, optionalAuthMiddleware, AuthRequest } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { validate } from '../middleware/validate.js';
import { UAParser } from 'ua-parser-js';
import { sendOrderReceiptEmail } from '../utils/email.js';
import { orderLimiter } from '../middleware/rateLimiters.js';
import { isStoreOpen, isTimeWithinBusinessHours } from '../utils/storeStatus.js';
import { formatOrder } from '../utils/helpers.js';

const router = Router();

// POST /api/orders — create order from current cart (supports Guests and Users)
router.post(
    '/',
    orderLimiter,
    optionalAuthMiddleware,
    validate({
        deliveryAddress: { type: 'string', required: true, maxLength: 400 },
        phoneNumber: { type: 'string', required: true, maxLength: 30 },
        postalCode: { type: 'string', required: false, maxLength: 10 },
        email: { type: 'string', required: false, maxLength: 100 },
        customerName: { type: 'string', required: false, maxLength: 100 },
    }),
    asyncHandler(async (req: AuthRequest, res: Response) => {
        const {
            deliveryAddress,
            phoneNumber,
            notes,
            promoCode,
            guestItems,
            postalCode,
            email,
            customerName,
        } = req.body;

        // 0. Business Hour Validation
        const { data: globalSettings } = await supabase.from('site_settings').select('*');
        const manualClosed =
            globalSettings?.find(s => s.key === 'is_store_closed')?.value === 'true';
        const isOpenNow = isStoreOpen();
        const isStoreClosed = manualClosed || !isOpenNow;

        let serverEstimatedTime = '30-60 min';
        if (isStoreClosed) {
            const scheduledMatch = notes?.match(
                /\[PROGRAMADO:\s*(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2})\]/
            );
            if (!scheduledMatch) {
                return res.status(400).json({
                    error: 'Nuestra cocina está descansando ahora. ¡Pero estaremos encantados de preparar tu pedido anticipado! Por favor, selecciona una "Entrega programada".',
                });
            }
            const [, dateStr, timeStr] = scheduledMatch;
            const scheduledDate = new Date(dateStr);
            if (!isTimeWithinBusinessHours(scheduledDate, timeStr)) {
                return res.status(400).json({
                    error: 'Esa hora está fuera de nuestro horario de servicio. ¡Por favor, elige un momento en el que nuestros chefs estén en la cocina!',
                });
            }
            serverEstimatedTime = `${dateStr} ${timeStr}`;
        } else {
            // Also check if it's scheduled even if store is open
            const scheduledMatch = notes?.match(
                /\[PROGRAMADO:\s*(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2})\]/
            );
            if (scheduledMatch) {
                serverEstimatedTime = `${scheduledMatch[1]} ${scheduledMatch[2]}`;
            }
        }

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
        }

        // Fallback to guest items if DB cart is empty or the user is not authenticated
        if (
            cartItems.length === 0 &&
            guestItems &&
            Array.isArray(guestItems) &&
            guestItems.length > 0
        ) {
            const itemIds = guestItems.map((i: any) => i.menuItemId);
            const { data: menuData, error: menuErr } = await supabase
                .from('menu_items')
                .select('id, name, price, image')
                .in('id', itemIds);

            if (menuErr) throw menuErr;

            cartItems = guestItems
                .map((gi: any) => {
                    const menuItem = menuData?.find((m: any) => m.id === gi.menuItemId);
                    if (!menuItem) return null;
                    return {
                        quantity: gi.quantity,
                        menu_item_id: gi.menuItemId,
                        menu_items: menuItem,
                    };
                })
                .filter((i: any) => i !== null);
        }

        if (cartItems.length === 0) {
            return res
                .status(400)
                .json({ error: 'La cesta está vacía o artículos no encontrados' });
        }

        // 2. Calculate subtotal
        const subtotal = cartItems.reduce(
            (sum, item: any) => sum + item.menu_items.price * item.quantity,
            0
        );
        let finalTotal = subtotal;
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
                    // Check if NEW user promo (NUEVO*)
                    if (promo.code.startsWith('NUEVO')) {
                        // 1. Expiry Check (24h)
                        const createdAt = new Date(promo.created_at);
                        const expiredAt = new Date(createdAt.getTime() + 24 * 60 * 60 * 1000);
                        if (new Date() > expiredAt) {
                            return res
                                .status(400)
                                .json({ error: 'El código de bienvenida ha expirado' });
                        }

                        // 2. Min Order Check (70€)
                        if (subtotal < 70) {
                            return res.status(400).json({
                                error: 'El pedido mínimo para el código de bienvenida es de 70,00€',
                            });
                        }
                    }

                    finalTotal = finalTotal * (1 - promo.discount_percentage / 100);
                    usedPromoId = promo.id;
                }
            }
        }

        // 2.5 Dynamic Delivery Fee from Zones
        let deliveryFee = 0;
        if (notes?.includes('[TIPO: DOMICILIO]')) {
            const { deliveryZoneId } = req.body;

            // Get delivery zones directly from the table
            const { data: zones } = await supabase
                .from('delivery_zones')
                .select('*')
                .eq('is_active', true);

            // Site-wide fallbacks
            let defaultFee = 3.5;
            let defaultFreeThreshold = 60;
            let defaultMinOrder = 15;

            // Load global settings for fallbacks if needed
            const { data: settings } = await supabase.from('site_settings').select('*');
            if (settings) {
                const feeSet = settings.find(s => s.key === 'delivery_fee');
                const threshSet = settings.find(s => s.key === 'free_delivery_threshold');
                const minSet = settings.find(s => s.key === 'min_order');

                if (feeSet)
                    defaultFee = parseFloat(
                        typeof feeSet.value === 'string' ? JSON.parse(feeSet.value) : feeSet.value
                    );
                if (threshSet)
                    defaultFreeThreshold = parseFloat(
                        typeof threshSet.value === 'string'
                            ? JSON.parse(threshSet.value)
                            : threshSet.value
                    );
                if (minSet)
                    defaultMinOrder = parseFloat(
                        typeof minSet.value === 'string' ? JSON.parse(minSet.value) : minSet.value
                    );
            }

            let matchedZone = null;
            if (deliveryZoneId && zones) {
                matchedZone = zones.find(
                    z => z.id === deliveryZoneId || z.id === String(deliveryZoneId)
                );
            }

            if (!matchedZone && postalCode && zones) {
                matchedZone = zones.find(
                    z => Array.isArray(z.postal_codes) && z.postal_codes.includes(postalCode)
                );
            }

            const currentFee =
                matchedZone && matchedZone.cost !== null ? Number(matchedZone.cost) : defaultFee;
            const currentFreeThreshold =
                matchedZone && matchedZone.free_threshold !== null
                    ? Number(matchedZone.free_threshold)
                    : defaultFreeThreshold;
            const currentMinOrder =
                matchedZone && matchedZone.min_order !== null
                    ? Number(matchedZone.min_order)
                    : defaultMinOrder;

            // Enforce Min Order on Server
            if (subtotal < currentMinOrder) {
                return res.status(400).json({
                    error: `El pedido mínimo para su zona es de ${currentMinOrder.toFixed(2).replace('.', ',')}€`,
                });
            }

            if (subtotal < currentFreeThreshold) {
                deliveryFee = currentFee;
                finalTotal += deliveryFee;
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
                estimated_delivery_time: serverEstimatedTime,
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

        // ADD DELIVERY FEE AS A PRODUCT ITEM (So it appears in the check/receipt)
        if (deliveryFee > 0) {
            orderItemsToInsert.push({
                order_id: order.id,
                menu_item_id: null, // Virtual ID for delivery
                name: 'Gastos de Envío',
                quantity: 1,
                price_at_time: deliveryFee,
                image: 'https://cdn-icons-png.flaticon.com/512/709/709790.png', // Delivery truck icon
            });
        }

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

        // 6. Send Receipts
        // Admin always gets a copy
        try {
            await sendOrderReceiptEmail(
                'info@sushidemaksim.com',
                {
                    orderId: order.id,
                    customerName: (fullOrder as any).users?.name || customerName || 'Cliente',
                    items: orderItemsToInsert,
                    total: finalTotal,
                    deliveryAddress,
                    phoneNumber,
                    notes,
                },
                true
            );
        } catch (adminEmailErr) {
            console.error('Failed to send admin notification email:', adminEmailErr);
        }

        // Customer gets receipt if email is available (Auth or Guest)
        const targetEmail = (fullOrder as any).users?.email || email;
        if (targetEmail) {
            try {
                await sendOrderReceiptEmail(targetEmail, {
                    orderId: order.id,
                    customerName: (fullOrder as any).users?.name || customerName || 'Cliente',
                    items: orderItemsToInsert,
                    total: finalTotal,
                    deliveryAddress,
                    phoneNumber,
                    notes,
                });
            } catch (customerEmailErr) {
                console.error('Failed to send customer receipt email:', customerEmailErr);
            }
        }

        // 7. Generate WhatsApp Link for return (Pointing to Store WhatsApp: +34 641 51 83 90)
        const isCard = notes?.includes('TARJETA');
        const paymentMethodText = isCard ? 'Tarjeta' : 'Efectivo';

        const itemsSummary = cartItems
            .map(item => `- ${item.menu_items.name} x${item.quantity}`)
            .join('\n');

        const waTextParts = [
            `¡Hola Sushi de Maksim! Mi pedido #${String(order.id).padStart(5, '0')} ha sido realizado con éxito.`,
            `PRODUCTOS:\n${itemsSummary}`,
            `Direccion: ${deliveryAddress}`,
            `Metodo de Pago: ${paymentMethodText}`,
        ];

        if (deliveryFee > 0) {
            waTextParts.push(`Gastos de Envío: ${deliveryFee.toFixed(2)}€`);
        }

        waTextParts.push(`Total: ${finalTotal.toFixed(2)}€`);
        waTextParts.push(`Muchas gracias.`);

        const waText = encodeURIComponent(waTextParts.join('\n\n'));
        const whatsappUrl = `https://wa.me/34641518390?text=${waText}`;

        res.status(201).json({
            order: formatOrder(fullOrder),
            whatsappUrl,
        });
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

        const formattedOrders = (orders || []).map(o => formatOrder(o));

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

        res.json({ order: formatOrder(order) });
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

        // Realtime Broadcast
        if (updated) {
            // User-specific channel
            if (updated.user_id) {
                const userChannel = supabase.channel(`user_orders:${updated.user_id}`);
                userChannel.subscribe(status => {
                    if (status === 'SUBSCRIBED') {
                        userChannel.send({
                            type: 'broadcast',
                            event: 'order_status_updated',
                            payload: { orderId: updated.id, status: updated.status },
                        });
                    }
                });
            }

            // Public Tracking channel (Order-specific)
            const orderChannel = supabase.channel(`order_tracking:${updated.id}`);
            orderChannel.subscribe(status => {
                if (status === 'SUBSCRIBED') {
                    orderChannel.send({
                        type: 'broadcast',
                        event: 'order_status_updated',
                        payload: { orderId: updated.id, status: updated.status },
                    });
                }
            });
        }

        res.json({ order: updated });
    })
);

// POST /api/orders/invite — create a draft order for someone else to pay (Auth Users Only)
router.post(
    '/invite',
    orderLimiter,
    authMiddleware,
    validate({
        deliveryAddress: { type: 'string', required: true, maxLength: 400 },
        phoneNumber: { type: 'string', required: true, maxLength: 30 },
        postalCode: { type: 'string', required: false, maxLength: 10 },
        senderName: { type: 'string', required: false, maxLength: 100 },
    }),
    asyncHandler(async (req: AuthRequest, res: Response) => {
        const { deliveryAddress, phoneNumber, notes, promoCode, senderName, postalCode } = req.body;

        const parser = new UAParser(req.headers['user-agent'] || '');
        const deviceType = parser.getDevice().type || 'desktop';
        const osName = parser.getOS().name || 'Unknown';

        // 1. Get items from user's cart in DB
        const { data: dbItems } = await supabase
            .from('cart_items')
            .select('quantity, menu_item_id, menu_items(name, price, image)')
            .eq('user_id', req.userId);

        const cartItems = dbItems || [];

        if (cartItems.length === 0) {
            return res
                .status(400)
                .json({ error: 'La cesta está vacía. Añade algo antes de invitar.' });
        }

        // 2. Calculate total
        const subtotal = cartItems.reduce(
            (sum, item: any) => sum + item.menu_items.price * item.quantity,
            0
        );
        let finalTotal = subtotal;
        let deliveryFee = 0;

        // Dynamic Delivery Fee / Min Order for Invitations
        if (notes?.includes('[TIPO: DOMICILIO]')) {
            const { deliveryZoneId } = req.body;
            const { data: zones } = await supabase
                .from('delivery_zones')
                .select('*')
                .eq('is_active', true);
            let defFee = 3.5;
            let defThresh = 60;
            const defMin = 15;

            const { data: settings } = await supabase.from('site_settings').select('*');
            if (settings) {
                const f = settings.find(s => s.key === 'delivery_fee');
                const t = settings.find(s => s.key === 'free_delivery_threshold');
                if (f)
                    defFee = parseFloat(
                        typeof f.value === 'string' ? JSON.parse(f.value) : f.value
                    );
                if (t)
                    defThresh = parseFloat(
                        typeof t.value === 'string' ? JSON.parse(t.value) : t.value
                    );
            }

            let matchedZone = null;
            if (deliveryZoneId && zones) {
                matchedZone = zones.find(
                    z => z.id === deliveryZoneId || z.id === String(deliveryZoneId)
                );
            }
            if (!matchedZone && postalCode && zones) {
                matchedZone = zones.find(
                    z => Array.isArray(z.postal_codes) && z.postal_codes.includes(postalCode)
                );
            }

            const currentFee = matchedZone ? (Number(matchedZone.cost) ?? defFee) : defFee;
            const currentThresh = matchedZone
                ? (Number(matchedZone.free_threshold) ?? defThresh)
                : defThresh;
            const currentMin = matchedZone ? (Number(matchedZone.min_order) ?? defMin) : defMin;

            if (subtotal < currentMin) {
                return res.status(400).json({
                    error: `El pedido mínimo para su zona es de ${currentMin.toFixed(2).replace('.', ',')}€`,
                });
            }
            if (subtotal < currentThresh) {
                deliveryFee = currentFee;
                finalTotal += deliveryFee;
            }
        }

        // Simple 10% for testing if needed
        if (promoCode === 'TEST10') finalTotal *= 0.9;

        let serverEstimatedTime = '30-60 min';
        const scheduledMatch = notes?.match(
            /\[PROGRAMADO:\s*(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2})\]/
        );
        if (scheduledMatch) {
            serverEstimatedTime = `${scheduledMatch[1]} ${scheduledMatch[2]}`;
        }

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
                estimated_delivery_time: serverEstimatedTime,
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

        if (deliveryFee > 0) {
            itemsToInsert.push({
                order_id: order.id,
                menu_item_id: null,
                name: 'Gastos de Envío',
                quantity: 1,
                price_at_time: deliveryFee,
                image: 'https://cdn-icons-png.flaticon.com/512/709/709790.png',
            });
        }
        await supabase.from('order_items').insert(itemsToInsert);

        const origin =
            (req.headers.origin as string) ||
            (config.isDev ? 'http://localhost:3000' : 'https://sushidemaksim.com');
        res.status(201).json({
            orderId: order.id,
            shareUrl: `${origin}/invitacion/${order.id}`,
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

        const host = req.get('host');

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
            .select('*, users(name, avatar), order_items(*)')
            .eq('id', req.params.id)
            .eq('status', 'waiting_payment')
            .single();

        if (error || !order) {
            return res.status(404).json({ error: 'Invitación no encontrada o ya ha sido pagada.' });
        }

        res.json({ order: formatOrder(order) });
    })
);

// GET /api/orders/track/:id — public tracking (requires phone match for security)
router.get(
    '/track/:id',
    asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        const phone = req.query.phone as string;

        if (!phone) {
            return res.status(400).json({ error: 'Se requiere el teléfono para el seguimiento.' });
        }

        const { data: order, error } = await supabase
            .from('orders')
            .select('*, users(name, email, avatar), items:order_items(*)')
            .eq('id', id)
            .single();

        if (error || !order) {
            return res.status(404).json({ error: 'Pedido no encontrado' });
        }

        // Basic security: match last 4 digits or full phone (clean common chars)
        const cleanOrderPhone = order.phone_number.replace(/\D/g, '');
        const cleanProvidedPhone = phone.replace(/\D/g, '');

        if (
            !cleanOrderPhone.endsWith(cleanProvidedPhone) &&
            !cleanProvidedPhone.endsWith(cleanOrderPhone)
        ) {
            return res.status(403).json({ error: 'El teléfono no coincide con el pedido.' });
        }

        res.json({ order: formatOrder(order) });
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
        if (order.status !== 'waiting_payment')
            return res.status(400).json({ error: 'El pedido ya no está esperando pago' });

        const { data: updated, error: updateErr } = await supabase
            .from('orders')
            .update({ status: 'pending' }) // Moves to kitchen
            .eq('id', req.params.id)
            .select()
            .single();

        if (updateErr) throw updateErr;
        res.json({ success: true, order: formatOrder(updated) });
    })
);

// Note: /deliver and other status updates (except cancel) should be in admin.ts
export default router;
