import { Router, Response } from 'express';
import { supabase } from '../db/supabase.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { validateResource } from '../middleware/validateResource.js';
import {
    addToCartSchema,
    updateCartItemSchema,
    cartItemIdParamSchema,
    bulkCartSchema,
} from '../schemas/cart.schema.js';

import { formatMenuItem } from '../utils/helpers.js';

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
                menu_items(*)
            `
            )
            .eq('user_id', req.userId)
            .order('id');

        if (error) throw error;

        const formattedItems = (items || [])
            .map((item: any) => {
                const sushi = formatMenuItem(item.menu_items);
                if (!sushi) return null;
                return {
                    ...sushi,
                    id: item.id, // ID of the cart record
                    menuItemId: item.menu_item_id,
                    quantity: item.quantity,
                };
            })
            .filter((i): i is any => i !== null);

        const total = formattedItems.reduce(
            (sum, item) => sum + (item.price || 0) * item.quantity,
            0
        );
        res.json({ items: formattedItems, total: Math.round(total * 100) / 100 });
    })
);

// POST /api/cart — add item
router.post(
    '/',
    validateResource(addToCartSchema),
    asyncHandler(async (req: AuthRequest, res: Response) => {
        const { menuItemId, quantity } = req.body;

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
    validateResource(updateCartItemSchema),
    asyncHandler(async (req: AuthRequest, res: Response) => {
        const { quantity } = req.body;
        const { itemId } = req.params as any;

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
    validateResource(cartItemIdParamSchema),
    asyncHandler(async (req: AuthRequest, res: Response) => {
        const { itemId } = req.params as any;
        const { error } = await supabase
            .from('cart_items')
            .delete()
            .eq('id', itemId)
            .eq('user_id', req.userId);

        if (error) return res.status(404).json({ error: 'Item no encontrado en la cesta' });
        res.json({ success: true });
    })
);

// POST /api/cart/bulk — sync multiple items (merges with existing)
router.post(
    '/bulk',
    validateResource(bulkCartSchema),
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
