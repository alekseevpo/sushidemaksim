import { Router, Response } from 'express';
import { supabase } from '../db/supabase.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { validate } from '../middleware/validate.js';

const router = Router();
router.use(authMiddleware);

// POST /api/orders — create order from current cart
router.post(
    '/',
    validate({
        deliveryAddress: { type: 'string', maxLength: 300 },
        phoneNumber: { type: 'string', maxLength: 30 },
    }),
    asyncHandler(async (req: AuthRequest, res: Response) => {
        const { deliveryAddress, phoneNumber, notes, promoCode } = req.body;

        // 1. Get cart items with product details
        const { data: cartItems, error: cartError } = await supabase
            .from('cart_items')
            .select('quantity, menu_item_id, menu_items(name, price, image)')
            .eq('user_id', req.userId);

        if (cartError) throw cartError;
        if (!cartItems || cartItems.length === 0) {
            return res.status(400).json({ error: 'La cesta está vacía' });
        }

        // 2. Calculate total
        let finalTotal = cartItems.reduce((sum, item: any) => sum + item.menu_items.price * item.quantity, 0);
        let usedPromoId = null;

        if (promoCode) {
            const { data: promo } = await supabase
                .from('promo_codes')
                .select('*')
                .eq('code', promoCode)
                .eq('is_used', false)
                .eq('user_id', req.userId)
                .single();

            if (promo) {
                finalTotal = finalTotal * (1 - promo.discount_percentage / 100);
                usedPromoId = promo.id;
            }
        }

        // 3. Create Order
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert({
                user_id: req.userId,
                total: Math.round(finalTotal * 100) / 100,
                delivery_address: deliveryAddress?.trim() || '',
                phone_number: phoneNumber?.trim() || '',
                status: 'pending',
                estimated_delivery_time: '30-60 min',
                notes: notes?.trim() || ''
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
            image: item.menu_items.image
        }));

        const { error: itemsError } = await supabase.from('order_items').insert(orderItemsToInsert);
        if (itemsError) throw itemsError;

        // 5. Cleanup (Promo and Cart)
        if (usedPromoId) {
            await supabase.from('promo_codes').update({ is_used: true }).eq('id', usedPromoId);
        }
        await supabase.from('cart_items').delete().eq('user_id', req.userId);

        // Return order with items
        const { data: fullOrder } = await supabase
            .from('orders')
            .select('*, order_items(*)')
            .eq('id', order.id)
            .single();

        res.status(201).json({ order: fullOrder });
    })
);

// GET /api/orders — order history with pagination
router.get('/', asyncHandler(async (req: AuthRequest, res: Response) => {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 10));
    const offset = (page - 1) * limit;

    const { data: orders, count, error } = await supabase
        .from('orders')
        .select('*, order_items(*)', { count: 'exact' })
        .eq('user_id', req.userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

    if (error) throw error;

    res.json({
        orders: orders || [],
        pagination: {
            total: count || 0,
            page,
            limit,
            pages: Math.ceil((count || 0) / limit),
            hasNext: page * limit < (count || 0),
            hasPrev: page > 1,
        },
    });
}));

// GET /api/orders/:id — single order
router.get('/:id', asyncHandler(async (req: AuthRequest, res: Response) => {
    const { data: order, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('id', req.params.id)
        .eq('user_id', req.userId)
        .single();

    if (error || !order) {
        return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    res.json({ order });
}));

// PATCH /api/orders/:id/cancel
router.patch(
    '/:id/cancel',
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

        if (order.status !== 'pending') {
            return res.status(400).json({
                error: 'Solo se pueden cancelar pedidos pendientes. Contacta con nosotros si necesitas ayuda.',
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

// PATCH /api/orders/:id/deliver
router.patch(
    '/:id/deliver',
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

        if (order.status === 'delivered') {
            return res.status(400).json({ error: 'El pedido ya fue entregado' });
        }

        const { data: updated, error: updateError } = await supabase
            .from('orders')
            .update({ status: 'delivered' })
            .eq('id', req.params.id)
            .select()
            .single();

        if (updateError) throw updateError;
        res.json({ order: updated });
    })
);

export default router;
