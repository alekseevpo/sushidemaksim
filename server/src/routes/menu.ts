import { Router, Request, Response } from 'express';
import { getDb } from '../db/database.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { validate } from '../middleware/validate.js';
import { formatMenuItem } from '../utils/helpers.js';

const router = Router();

// GET /api/menu — all items, optional ?category= and ?search= filter
router.get('/', asyncHandler(async (req: Request, res: Response) => {
    const db = getDb();
    const { category, search } = req.query;

    let items: any[];

    if (search && typeof search === 'string' && search.trim().length > 0) {
        const term = `%${search.trim()}%`;
        if (category) {
            items = db.prepare(
                'SELECT * FROM menu_items WHERE category = ? AND (name LIKE ? OR description LIKE ?) ORDER BY id'
            ).all(category, term, term) as any[];
        } else {
            items = db.prepare(
                'SELECT * FROM menu_items WHERE name LIKE ? OR description LIKE ? ORDER BY category, id'
            ).all(term, term) as any[];
        }
    } else if (category) {
        items = db.prepare('SELECT * FROM menu_items WHERE category = ? ORDER BY id').all(category) as any[];
    } else {
        items = db.prepare('SELECT * FROM menu_items ORDER BY category, id').all() as any[];
    }

    const formatted = items.map(formatMenuItem);
    res.json({ items: formatted, total: formatted.length });
}));

// GET /api/menu/info/categories — category list with counts
router.get('/info/categories', asyncHandler(async (_req: Request, res: Response) => {
    const db = getDb();
    const categories = db.prepare(
        'SELECT category, COUNT(*) as count FROM menu_items GROUP BY category ORDER BY category'
    ).all();

    const categoryMap: Record<string, { name: string; icon: string }> = {
        'entrantes': { name: 'Entrantes', icon: '🥟' },
        'rollos-grandes': { name: 'Rollos Grandes', icon: '🍣' },
        'rollos-clasicos': { name: 'Rollos Clásicos', icon: '🥢' },
        'rollos-fritos': { name: 'Rollos Fritos/Horneados', icon: '🔥' },
        'sopas': { name: 'Sopas', icon: '🍜' },
        'menus': { name: 'Menús', icon: '🎁' },
        'extras': { name: 'Extras', icon: '🧴' },
        'postre': { name: 'Postre', icon: '🍰' },
    };

    const result = (categories as any[]).map(c => ({
        id: c.category,
        ...categoryMap[c.category] || { name: c.category, icon: '📋' },
        count: c.count,
    }));

    res.json({ categories: result });
}));

// GET /api/menu/:id — single item (must come AFTER /info/categories)
router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);

    if (isNaN(id) || id <= 0) {
        return res.status(400).json({ error: 'ID de producto inválido' });
    }

    const db = getDb();
    const item = db.prepare('SELECT * FROM menu_items WHERE id = ?').get(id) as any;

    if (!item) {
        return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json({ item: formatMenuItem(item) });
}));



export default router;
