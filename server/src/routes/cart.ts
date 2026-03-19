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

// POST /api/cart/bulk — sync multiple items (merges with existing)
router.post(
    '/bulk',
    validate({
        items: { required: true, type: 'array' },
    }),
    asyncHandler(async (req: AuthRequest, res: Response) => {
        const { items: incomingItems } = req.body;

        if (!Array.isArray(incomingItems) || incomingItems.length === 0) {
            return res.json({ success: true, message: 'Nada que sincronizar' });
        }

        // 1. Fetch existing cart
        const { data: existing, error: fetchError } = await supabase
            .from('cart_items')
            .select('*')
            .eq('user_id', req.userId);

        if (fetchError) throw fetchError;

        // 2. Merge logic
        const cartMap = new Map();
        // Pack existing into map
        (existing || []).forEach(item => {
            cartMap.set(item.menu_item_id, item.quantity);
        });

        // Add incoming
        incomingItems.forEach((item: any) => {
            const mid = parseInt(item.menuItemId || item.id);
            const qty = parseInt(item.quantity || 1);
            if (!isNaN(mid)) {
                cartMap.set(mid, (cartMap.get(mid) || 0) + qty);
            }
        });

        // 3. Re-sync (Delete all and re-insert is the safest way to "merge" without complex upserts)
        await supabase.from('cart_items').delete().eq('user_id', req.userId);

        const toInsert = Array.from(cartMap.entries()).map(([menu_item_id, quantity]) => ({
            user_id: req.userId,
            menu_item_id,
            quantity,
        }));

        if (toInsert.length > 0) {
            const { error: insertError } = await supabase.from('cart_items').insert(toInsert);
            if (insertError) throw insertError;
        }

        res.json({ success: true, message: 'Cesta sincronizada' });
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
