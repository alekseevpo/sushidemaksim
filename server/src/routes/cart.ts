import { Router, Response } from 'express';
import { getDb } from '../db/database.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { validate } from '../middleware/validate.js';

const router = Router();
router.use(authMiddleware);

// GET /api/cart
router.get('/', asyncHandler(async (req: AuthRequest, res: Response) => {
    const db = getDb();
    const items = db.prepare(`
        SELECT ci.id, ci.quantity, ci.menu_item_id,
               mi.name, mi.price, mi.image, mi.description, mi.category
        FROM cart_items ci
        JOIN menu_items mi ON ci.menu_item_id = mi.id
        WHERE ci.user_id = ?
        ORDER BY ci.id
    `).all(req.userId);

    const total = (items as any[]).reduce((sum, item) => sum + item.price * item.quantity, 0);
    res.json({ items, total: Math.round(total * 100) / 100 });
}));

// POST /api/cart — add item
router.post(
    '/',
    validate({
        menuItemId: { required: true, type: 'number', min: 1 },
        quantity: { type: 'number', min: 1, max: 99 },
    }),
    asyncHandler(async (req: AuthRequest, res: Response) => {
        const { menuItemId, quantity = 1 } = req.body;

        const db = getDb();
        const menuItem = db.prepare('SELECT id FROM menu_items WHERE id = ?').get(menuItemId);

        if (!menuItem) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        db.prepare(`
            INSERT INTO cart_items (user_id, menu_item_id, quantity)
            VALUES (?, ?, ?)
            ON CONFLICT(user_id, menu_item_id)
            DO UPDATE SET quantity = quantity + excluded.quantity
        `).run(req.userId, menuItemId, quantity);

        res.status(201).json({ success: true, message: 'Producto añadido a la cesta' });
    })
);

// PUT /api/cart/:itemId — set quantity (0 = remove)
router.put(
    '/:itemId',
    validate({
        quantity: { required: true, type: 'number', min: 0, max: 99 },
    }),
    asyncHandler(async (req: AuthRequest, res: Response) => {
        const { quantity } = req.body;
        const itemId = parseInt(req.params.itemId);

        if (isNaN(itemId)) {
            return res.status(400).json({ error: 'ID de item inválido' });
        }

        const db = getDb();

        if (quantity === 0) {
            db.prepare('DELETE FROM cart_items WHERE id = ? AND user_id = ?').run(itemId, req.userId);
        } else {
            const result = db.prepare('UPDATE cart_items SET quantity = ? WHERE id = ? AND user_id = ?').run(quantity, itemId, req.userId);
            if (result.changes === 0) {
                return res.status(404).json({ error: 'Item no encontrado en la cesta' });
            }
        }

        res.json({ success: true });
    })
);

// DELETE /api/cart/:itemId — remove single item
router.delete('/:itemId', asyncHandler(async (req: AuthRequest, res: Response) => {
    const itemId = parseInt(req.params.itemId);

    if (isNaN(itemId)) {
        return res.status(400).json({ error: 'ID de item inválido' });
    }

    const db = getDb();
    const result = db.prepare('DELETE FROM cart_items WHERE id = ? AND user_id = ?').run(itemId, req.userId);

    if (result.changes === 0) {
        return res.status(404).json({ error: 'Item no encontrado en la cesta' });
    }

    res.json({ success: true });
}));

// DELETE /api/cart — clear entire cart
router.delete('/', asyncHandler(async (req: AuthRequest, res: Response) => {
    const db = getDb();
    db.prepare('DELETE FROM cart_items WHERE user_id = ?').run(req.userId);
    res.json({ success: true, message: 'Cesta vaciada' });
}));

export default router;
