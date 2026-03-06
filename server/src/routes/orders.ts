import { Router, Response } from 'express';
import { getDb } from '../db/database.js';
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

        const db = getDb();

        const cartItems = db.prepare(`
            SELECT ci.quantity, ci.menu_item_id,
                   mi.name, mi.price, mi.image
            FROM cart_items ci
            JOIN menu_items mi ON ci.menu_item_id = mi.id
            WHERE ci.user_id = ?
        `).all(req.userId) as any[];

        if (cartItems.length === 0) {
            return res.status(400).json({ error: 'La cesta está vacía' });
        }

        let finalTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
        let usedPromoId = null;

        if (promoCode) {
            const promo = db.prepare('SELECT * FROM promo_codes WHERE code = ? AND is_used = 0 AND user_id = ?').get(promoCode, req.userId) as any;
            if (promo) {
                finalTotal = finalTotal * (1 - promo.discount_percentage / 100);
                usedPromoId = promo.id;
            }
        }

        const createOrder = db.transaction(() => {
            const orderResult = db.prepare(`
                INSERT INTO orders (user_id, total, delivery_address, phone_number, status, estimated_delivery_time, notes)
                VALUES (?, ?, ?, ?, 'pending', ?, ?)
            `).run(
                req.userId,
                Math.round(finalTotal * 100) / 100,
                deliveryAddress?.trim() || '',
                phoneNumber?.trim() || '',
                '30-60 min',
                notes?.trim() || ''
            );

            const orderId = orderResult.lastInsertRowid;

            const insertItem = db.prepare(`
                INSERT INTO order_items (order_id, menu_item_id, name, quantity, price_at_time, image)
                VALUES (?, ?, ?, ?, ?, ?)
            `);

            for (const item of cartItems) {
                insertItem.run(orderId, item.menu_item_id, item.name, item.quantity, item.price, item.image);
            }

            if (usedPromoId) {
                db.prepare('UPDATE promo_codes SET is_used = 1 WHERE id = ?').run(usedPromoId);
            }

            db.prepare('DELETE FROM cart_items WHERE user_id = ?').run(req.userId);

            return orderId;
        });

        const orderId = createOrder();

        const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId) as any;
        const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(orderId);

        res.status(201).json({ order: { ...order, items } });
    })
);

// GET /api/orders — order history with pagination
router.get('/', asyncHandler(async (req: AuthRequest, res: Response) => {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 10));
    const offset = (page - 1) * limit;

    const db = getDb();

    const { total } = db.prepare(
        'SELECT COUNT(*) as total FROM orders WHERE user_id = ?'
    ).get(req.userId) as { total: number };

    const orders = db.prepare(
        'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?'
    ).all(req.userId, limit, offset) as any[];

    const getItems = db.prepare('SELECT * FROM order_items WHERE order_id = ?');

    const ordersWithItems = orders.map(order => ({
        ...order,
        items: getItems.all(order.id),
    }));

    res.json({
        orders: ordersWithItems,
        pagination: {
            total,
            page,
            limit,
            pages: Math.ceil(total / limit),
            hasNext: page * limit < total,
            hasPrev: page > 1,
        },
    });
}));


// GET /api/orders/:id — single order
router.get('/:id', asyncHandler(async (req: AuthRequest, res: Response) => {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
        return res.status(400).json({ error: 'ID de pedido inválido' });
    }

    const db = getDb();
    const order = db.prepare('SELECT * FROM orders WHERE id = ? AND user_id = ?').get(id, req.userId) as any;

    if (!order) {
        return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    order.items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);
    res.json({ order });
}));

// PATCH /api/orders/:id/cancel — user can only cancel their own pending orders
router.patch(
    '/:id/cancel',
    asyncHandler(async (req: AuthRequest, res: Response) => {
        const id = parseInt(req.params.id);

        if (isNaN(id)) {
            return res.status(400).json({ error: 'ID de pedido inválido' });
        }

        const db = getDb();

        // Only allow cancelling orders that are still 'pending'
        const order = db.prepare(
            'SELECT * FROM orders WHERE id = ? AND user_id = ?'
        ).get(id, req.userId) as any;

        if (!order) {
            return res.status(404).json({ error: 'Pedido no encontrado' });
        }

        if (order.status !== 'pending') {
            return res.status(400).json({
                error: 'Solo se pueden cancelar pedidos pendientes. Contacta con nosotros si necesitas ayuda.',
            });
        }

        db.prepare('UPDATE orders SET status = ? WHERE id = ?').run('cancelled', id);

        const updated = db.prepare('SELECT * FROM orders WHERE id = ?').get(id);
        res.json({ order: updated });
    })
);

// PATCH /api/orders/:id/deliver — mark order as delivered (to stop the timer)
router.patch(
    '/:id/deliver',
    asyncHandler(async (req: AuthRequest, res: Response) => {
        const id = parseInt(req.params.id);

        if (isNaN(id)) {
            return res.status(400).json({ error: 'ID de pedido inválido' });
        }

        const db = getDb();

        const order = db.prepare(
            'SELECT * FROM orders WHERE id = ? AND user_id = ?'
        ).get(id, req.userId) as any;

        if (!order) {
            return res.status(404).json({ error: 'Pedido no encontrado' });
        }

        if (order.status === 'delivered') {
            return res.status(400).json({ error: 'El pedido ya fue entregado' });
        }

        db.prepare('UPDATE orders SET status = ? WHERE id = ?').run('delivered', id);

        const updated = db.prepare('SELECT * FROM orders WHERE id = ?').get(id);
        res.json({ order: updated });
    })
);

export default router;
