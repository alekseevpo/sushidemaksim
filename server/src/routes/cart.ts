import { Router, Response } from 'express';
import { supabase } from '../db/supabase.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { validate } from '../middleware/validate.js';

const router = Router();
router.use(authMiddleware);

// GET /api/cart
router.get(
    '/',
    asyncHandler(async (req: AuthRequest, res: Response) => {
        const { data: items, error } = await supabase
            .from('cart_items')
            .select(
                `
            id, quantity, menu_item_id,
            menu_items(name, price, image, description, category)
        `
            )
            .eq('user_id', req.userId)
            .order('id');

        if (error) throw error;

        const formattedItems = (items || []).map((item: any) => ({
            id: item.id,
            quantity: item.quantity,
            menu_item_id: item.menu_item_id,
            ...item.menu_items,
        }));

        const total = formattedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
        res.json({ items: formattedItems, total: Math.round(total * 100) / 100 });
    })
);

// POST /api/cart — add item
router.post(
    '/',
    validate({
        menuItemId: { required: true, type: 'number', min: 1 },
        quantity: { type: 'number', min: 1, max: 99 },
    }),
    asyncHandler(async (req: AuthRequest, res: Response) => {
        const { menuItemId, quantity = 1 } = req.body;

        const { data: existing, error: findError } = await supabase
            .from('cart_items')
            .select('id, quantity')
            .eq('user_id', req.userId)
            .eq('menu_item_id', menuItemId)
            .maybeSingle();

        if (findError) throw findError;

        if (existing) {
            await supabase
                .from('cart_items')
                .update({ quantity: existing.quantity + quantity })
                .eq('id', existing.id);
        } else {
            await supabase
                .from('cart_items')
                .insert({ user_id: req.userId, menu_item_id: menuItemId, quantity });
        }

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
        const itemId = req.params.itemId;

        if (quantity === 0) {
            await supabase.from('cart_items').delete().eq('id', itemId).eq('user_id', req.userId);
        } else {
            const { error } = await supabase
                .from('cart_items')
                .update({ quantity })
                .eq('id', itemId)
                .eq('user_id', req.userId);

            if (error) return res.status(404).json({ error: 'Item no encontrado en la cesta' });
        }

        res.json({ success: true });
    })
);

// DELETE /api/cart/:itemId — remove single item
router.delete(
    '/:itemId',
    asyncHandler(async (req: AuthRequest, res: Response) => {
        const { error } = await supabase
            .from('cart_items')
            .delete()
            .eq('id', req.params.itemId)
            .eq('user_id', req.userId);

        if (error) return res.status(404).json({ error: 'Item no encontrado en la cesta' });
        res.json({ success: true });
    })
);

// DELETE /api/cart — clear entire cart
router.delete(
    '/',
    asyncHandler(async (req: AuthRequest, res: Response) => {
        await supabase.from('cart_items').delete().eq('user_id', req.userId);
        res.json({ success: true, message: 'Cesta vaciada' });
    })
);

export default router;
