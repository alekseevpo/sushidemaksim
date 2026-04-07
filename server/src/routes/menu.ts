import { Router, Request, Response } from 'express';
import { supabase } from '../db/supabase.js';
import { config } from '../config.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { formatMenuItem } from '../utils/helpers.js';

const router = Router();

// ─── In-memory cache for menu data (TTL: 5 min) ────────────────────────────────
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
interface CacheEntry {
    data: any;
    expiry: number;
}
const menuCache = new Map<string, CacheEntry>();

function getCached(key: string): any | null {
    const entry = menuCache.get(key);
    if (entry && entry.expiry > Date.now()) return entry.data;
    if (entry) menuCache.delete(key);
    return null;
}

function setCache(key: string, data: any, ttl: number = CACHE_TTL): void {
    menuCache.set(key, { data, expiry: Date.now() + ttl });
}

/** Clear menu cache — called from admin when menu items are updated */
export function invalidateMenuCache(): void {
    menuCache.clear();
}

// GET /api/menu — all items, optional ?category= and ?search= filter
router.get(
    '/',
    asyncHandler(async (req: Request, res: Response) => {
        const { category, search, is_promo, is_popular, is_chef_choice, limit } = req.query;

        // Build cache key from query params (skip caching search queries)
        const hasSearch = search && typeof search === 'string' && search.trim().length > 0;
        const cacheKey = hasSearch
            ? null
            : `menu:${category || 'all'}:${is_promo || ''}:${is_popular || ''}:${is_chef_choice || ''}:${limit || ''}`;

        // Try cache first (skip for search queries, they're too dynamic)
        if (cacheKey) {
            const cached = getCached(cacheKey);
            if (cached) {
                res.set('Cache-Control', 'public, max-age=300, s-maxage=600');
                return res.json(cached);
            }
        }

        let query = supabase.from('menu_items').select('*');

        if (category) {
            query = query.eq('category', category);
        }

        if (is_promo === 'true') {
            query = query.eq('is_promo', true);
        }

        if (is_popular === 'true') {
            query = query.eq('is_popular', true);
        }

        if (is_chef_choice === 'true') {
            query = query.eq('is_chef_choice', true);
        }

        if (limit) {
            query = query.limit(parseInt(limit as string));
        }

        if (hasSearch) {
            const term = (search as string).trim();
            query = query.or(`name.ilike.%${term}%,description.ilike.%${term}%`);
        }

        const { data: items, error } = await query.order('category').order('id');

        if (error) throw error;

        const formatted = (items || []).map(formatMenuItem);
        const result = { items: formatted, total: formatted.length };

        // Cache non-search results
        if (cacheKey) {
            setCache(cacheKey, result);
        }

        res.set(
            'Cache-Control',
            hasSearch ? 'private, no-cache' : 'public, max-age=300, s-maxage=600'
        );
        res.json(result);
    })
);

// GET /api/menu/info/categories — category list with counts and representative images
router.get(
    '/info/categories',
    asyncHandler(async (_req: Request, res: Response) => {
        // Try cache first
        const cached = getCached('menu:categories');
        if (cached) {
            res.set('Cache-Control', 'public, max-age=3600, s-maxage=3600');
            return res.json(cached);
        }

        const { data, error } = await supabase
            .from('menu_items')
            .select('category, image')
            .order('id');

        if (error) throw error;

        const counts: Record<string, number> = {};
        const images: Record<string, string | null> = {};

        const STORAGE_BASE = `${config.supabase.url}/storage/v1/object/public/images/menu`;

        data?.forEach(item => {
            counts[item.category] = (counts[item.category] || 0) + 1;
            if (!images[item.category] && item.image) {
                // If it's just a filename, prepend the full Supabase storage URL
                if (!item.image.startsWith('http')) {
                    images[item.category] = `${STORAGE_BASE}/${item.image}`;
                } else {
                    images[item.category] = item.image;
                }
            }
        });

        const categoryMap: Record<string, { name: string; icon: string }> = {
            entrantes: { name: 'Entrantes', icon: '🥟' },
            'rollos-grandes': { name: 'Rollos Grandes', icon: '🍣' },
            'rollos-clasicos': { name: 'Rollos Clásicos', icon: '🥢' },
            'rollos-fritos': { name: 'Rollos Fritos/Horneados', icon: '🔥' },
            sopas: { name: 'Sopas', icon: '🍜' },
            menus: { name: 'Menús', icon: '🎁' },
            extras: { name: 'Extras', icon: '🧴' },
            postre: { name: 'Postre', icon: '🍰' },
        };

        const categories = Object.entries(counts).map(([cat, count]) => ({
            id: cat,
            ...(categoryMap[cat] || { name: cat, icon: '📋' }),
            count,
            image: images[cat] || null,
        }));

        const result = { categories };

        // Cache for 1 hour — categories rarely change
        setCache('menu:categories', result, 60 * 60 * 1000);

        res.set('Cache-Control', 'public, max-age=3600, s-maxage=3600');
        res.json(result);
    })
);

// GET /api/menu/:id — single item
router.get(
    '/:id',
    asyncHandler(async (req: Request, res: Response) => {
        const id = parseInt(req.params.id);

        if (isNaN(id) || id <= 0) {
            return res.status(400).json({ error: 'ID de producto inválido' });
        }

        const { data: item, error } = await supabase
            .from('menu_items')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !item) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        res.set('Cache-Control', 'public, max-age=300, s-maxage=600');
        res.json({ item: formatMenuItem(item) });
    })
);

// POST /api/menu/:id/share — track share events
router.post(
    '/:id/share',
    asyncHandler(async (req: Request, res: Response) => {
        const id = parseInt(req.params.id);
        if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });

        // We use a generic analytics table. If it doesn't exist, we just log and continue
        // as the user might need to run the migration first.
        const { error } = await supabase.from('menu_item_analytics').insert({
            menu_item_id: id,
            event_type: 'share',
        });

        if (error) {
            console.error('📊 Analytics Error (Share):', error.message);
            // Don't fail the request if analytics fails
            return res.json({ success: false, note: 'Migration might be needed' });
        }

        res.json({ success: true });
    })
);

export default router;
