import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { supabase } from '../db/supabase.js';
import { authMiddleware } from '../middleware/auth.js';
import { adminMiddleware } from '../middleware/admin.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { validate } from '../middleware/validate.js';
import { AuthRequest } from '../middleware/auth.js';
import { formatMenuItem } from '../utils/helpers.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, '..', '..', 'public', 'uploads');

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Use memory storage for Multer (Vercel has read-only filesystem)
const upload = multer({ storage: multer.memoryStorage() });

const router = Router();

// All admin routes require auth + admin role
router.use(authMiddleware, adminMiddleware);

// POST /api/admin/menu/upload-image (to Supabase Storage)
router.post(
    '/menu/upload-image',
    upload.single('image'),
    asyncHandler(async (req: AuthRequest, res: Response) => {
        if (!req.file) {
            return res.status(400).json({ error: 'No se subió ninguna imagen' });
        }

        const file = req.file;
        const fileExt = file.originalname.split('.').pop();
        const fileName = `${Date.now()}-${Math.floor(Math.random() * 1000)}.${fileExt}`;
        const filePath = `menu/${fileName}`;

        // Upload to Supabase Storage 'images' bucket
        const { error } = await supabase.storage.from('images').upload(filePath, file.buffer, {
            contentType: file.mimetype,
            upsert: true,
        });

        if (error) {
            console.error('❌ Supabase storage error:', error);
            return res.status(500).json({ error: 'Error al subir la imagen a Supabase Storage' });
        }

        // Get Public URL
        const {
            data: { publicUrl },
        } = supabase.storage.from('images').getPublicUrl(filePath);

        res.json({ url: publicUrl });
    })
);

// ─── MENU MANAGEMENT ──────────────────────────────────────────────────────────

// GET /api/admin/menu
router.get(
    '/menu',
    asyncHandler(async (_req: Request, res: Response) => {
        const { data: items, error } = await supabase
            .from('menu_items')
            .select('*')
            .order('category')
            .order('id');

        if (error) throw error;
        const formatted = (items || []).map(formatMenuItem);
        res.json({ items: formatted, total: formatted.length });
    })
);

// POST /api/admin/menu
router.post(
    '/menu',
    validate({
        name: { required: true, type: 'string', minLength: 2, maxLength: 200 },
        price: { required: true, type: 'number', min: 0.01 },
        category: {
            required: true,
            enum: [
                'entrantes',
                'rollos-grandes',
                'rollos-clasicos',
                'rollos-fritos',
                'sopas',
                'menus',
                'extras',
                'postre',
            ],
        },
        description: { type: 'string', maxLength: 500 },
        image: { type: 'string', maxLength: 500 },
        pieces: { type: 'number', min: 1, max: 999 },
    }),
    asyncHandler(async (req: Request, res: Response) => {
        const {
            name,
            description,
            price,
            image,
            category,
            weight,
            pieces,
            spicy,
            vegetarian,
            is_promo,
        } = req.body;

        const { data: item, error } = await supabase
            .from('menu_items')
            .insert({
                name: name.trim(),
                description: description?.trim() || '',
                price,
                image: image?.trim() || '',
                category,
                weight: weight?.trim() || null,
                pieces: pieces || null,
                spicy: !!spicy,
                vegetarian: !!vegetarian,
                is_promo: !!is_promo,
            })
            .select()
            .single();

        if (error) throw error;
        res.status(201).json({ item: formatMenuItem(item) });
    })
);

// PUT /api/admin/menu/:id
router.put(
    '/menu/:id',
    validate({
        name: { type: 'string', minLength: 2, maxLength: 200 },
        price: { type: 'number', min: 0.01 },
        category: {
            enum: [
                'entrantes',
                'rollos-grandes',
                'rollos-clasicos',
                'rollos-fritos',
                'sopas',
                'menus',
                'extras',
                'postre',
            ],
        },
        description: { type: 'string', maxLength: 500 },
        image: { type: 'string', maxLength: 500 },
        pieces: { type: 'number', min: 1, max: 999 },
    }),
    asyncHandler(async (req: Request, res: Response) => {
        const id = parseInt(req.params.id);

        if (isNaN(id)) {
            return res.status(400).json({ error: 'ID de producto inválido' });
        }

        const {
            name,
            description,
            price,
            image,
            category,
            weight,
            pieces,
            spicy,
            vegetarian,
            is_promo,
        } = req.body;

        const updateData: any = {};
        if (name !== undefined) updateData.name = name.trim();
        if (description !== undefined) updateData.description = description.trim();
        if (price !== undefined) updateData.price = price;
        if (image !== undefined) updateData.image = image.trim();
        if (category !== undefined) updateData.category = category;
        if (weight !== undefined) updateData.weight = weight?.trim() || null;
        if (pieces !== undefined) updateData.pieces = pieces || null;

        // Ensure boolean values for Supabase
        if (spicy !== undefined) updateData.spicy = Boolean(spicy);
        if (vegetarian !== undefined) updateData.vegetarian = Boolean(vegetarian);
        if (is_promo !== undefined) updateData.is_promo = Boolean(is_promo);

        const { data: item, error } = await supabase
            .from('menu_items')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('❌ Supabase error updating item:', error);
            if (error.code === 'PGRST116')
                return res.status(404).json({ error: 'Producto no encontrado' });
            throw error;
        }

        res.json({ item: formatMenuItem(item) });
    })
);

// DELETE /api/admin/menu/:id
router.delete(
    '/menu/:id',
    asyncHandler(async (req: Request, res: Response) => {
        const { error } = await supabase.from('menu_items').delete().eq('id', req.params.id);

        if (error) throw error;
        res.json({ success: true, message: `Producto ${req.params.id} eliminado` });
    })
);

// ─── ORDER MANAGEMENT ─────────────────────────────────────────────────────────

// GET /api/admin/orders
router.get(
    '/orders',
    asyncHandler(async (req: Request, res: Response) => {
        const page = Math.max(1, parseInt(req.query.page as string) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
        const offset = (page - 1) * limit;
        const status = req.query.status as string | undefined;
        const userId = req.query.userId as string | undefined;

        let query = supabase
            .from('orders')
            .select('*, users(name, email), order_items(*)', { count: 'exact' });

        if (status) query = query.eq('status', status);
        if (userId) query = query.eq('user_id', userId);

        const {
            data: orders,
            count,
            error,
        } = await query.order('created_at', { ascending: false }).range(offset, offset + limit - 1);

        if (error) throw error;

        const formattedOrders = (orders || []).map((o: any) => ({
            ...o,
            user_name: o.users?.name,
            user_email: o.users?.email,
            items: o.order_items,
        }));

        res.json({
            orders: formattedOrders,
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

// PATCH /api/admin/orders/:id/status
router.patch(
    '/orders/:id/status',
    validate({
        status: {
            required: true,
            enum: ['pending', 'confirmed', 'preparing', 'on_the_way', 'delivered', 'cancelled'],
        },
    }),
    asyncHandler(async (req: Request, res: Response) => {
        const { status } = req.body;
        const { data: order, error } = await supabase
            .from('orders')
            .update({ status })
            .eq('id', req.params.id)
            .select('*, order_items(*)')
            .single();

        if (error) {
            if (error.code === 'PGRST116')
                return res.status(404).json({ error: 'Pedido no encontrado' });
            throw error;
        }

        res.json({ order: { ...order, items: order.order_items } });
    })
);

// ─── USER MANAGEMENT ──────────────────────────────────────────────────────────

// GET /api/admin/users
router.get(
    '/users',
    asyncHandler(async (req: Request, res: Response) => {
        const page = Math.max(1, parseInt(req.query.page as string) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
        const offset = (page - 1) * limit;

        const {
            data: users,
            count,
            error,
        } = await supabase
            .from('users')
            .select('*, orders(count)', { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) throw error;

        const usersWithStats = (users || []).map((u: any) => ({
            ...u,
            orderCount: u.orders[0]?.count || 0,
        }));

        res.json({
            users: usersWithStats,
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

// PATCH /api/admin/users/:id/role
router.patch(
    '/users/:id/role',
    validate({
        role: { required: true, enum: ['user', 'admin'] },
    }),
    asyncHandler(async (req: AuthRequest, res: Response) => {
        const id = parseInt(req.params.id);

        const { data: currentUser } = await supabase
            .from('users')
            .select('is_superadmin')
            .eq('id', req.userId)
            .single();

        if (!currentUser || !currentUser.is_superadmin) {
            return res.status(403).json({ error: 'Solo el propietario can change roles' });
        }

        if (id === req.userId) {
            return res.status(400).json({ error: 'No puedes cambiar tu propio rol' });
        }

        const { role } = req.body;
        const { data: user, error } = await supabase
            .from('users')
            .update({ role })
            .eq('id', id)
            .select('id, name, email, role, is_superadmin')
            .single();

        if (error) throw error;
        res.json({ user });
    })
);

// PATCH /api/admin/users/:id/verify-birthday
router.patch(
    '/users/:id/verify-birthday',
    validate({
        verified: { required: true, type: 'boolean' },
    }),
    asyncHandler(async (req: AuthRequest, res: Response) => {
        const id = parseInt(req.params.id);
        const { verified } = req.body;

        const { data: user, error } = await supabase
            .from('users')
            .update({ birth_date_verified: verified })
            .eq('id', id)
            .select('id, name, email, birth_date, birth_date_verified')
            .single();

        if (error) throw error;
        res.json({ user });
    })
);

// ─── STATS ────────────────────────────────────────────────────────────────────

router.get(
    '/stats',
    asyncHandler(async (_req: Request, res: Response) => {
        // 1. Basic counts
        const [
            { count: totalUsers },
            { count: totalOrders },
            { data: revenueData },
            { count: menuItems },
        ] = await Promise.all([
            supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'user'),
            supabase.from('orders').select('*', { count: 'exact', head: true }),
            supabase.from('orders').select('total').neq('status', 'cancelled'),
            supabase.from('menu_items').select('*', { count: 'exact', head: true }),
        ]);

        const revenue = revenueData?.reduce((sum, o) => sum + Number(o.total), 0) || 0;

        // 2. Today metrics
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayISO = todayStart.toISOString();

        const [
            { data: revTodayData },
            { count: ordersToday },
            { count: pendingOrders },
            { count: usersToday },
        ] = await Promise.all([
            supabase
                .from('orders')
                .select('total')
                .neq('status', 'cancelled')
                .gte('created_at', todayISO),
            supabase
                .from('orders')
                .select('*', { count: 'exact', head: true })
                .gte('created_at', todayISO),
            supabase
                .from('orders')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'pending'),
            supabase
                .from('users')
                .select('*', { count: 'exact', head: true })
                .gte('created_at', todayISO),
        ]);

        const revenueToday = revTodayData?.reduce((sum, o) => sum + Number(o.total), 0) || 0;

        // 3. Status breakdown
        const { data: statusData } = await supabase.from('orders').select('status');
        const ordersByStatus: Record<string, number> = {};
        statusData?.forEach(o => {
            ordersByStatus[o.status] = (ordersByStatus[o.status] || 0) + 1;
        });

        // 4. Recent orders
        const { data: recentOrders } = await supabase
            .from('orders')
            .select('id, total, status, created_at, users(name)')
            .order('created_at', { ascending: false })
            .limit(5);

        const formattedRecent = (recentOrders || []).map((o: any) => ({
            ...o,
            user_name: o.users?.name,
        }));

        // 5. Top Items (using order_items)
        const { data: topItemsRaw } = await supabase
            .from('order_items')
            .select('name, quantity, price_at_time');

        const itemMap: Record<string, { name: string; sold: number; revenue: number }> = {};
        topItemsRaw?.forEach(item => {
            if (!itemMap[item.name]) itemMap[item.name] = { name: item.name, sold: 0, revenue: 0 };
            itemMap[item.name].sold += item.quantity;
            itemMap[item.name].revenue += item.quantity * item.price_at_time;
        });

        const topItems = Object.values(itemMap)
            .sort((a, b) => b.sold - a.sold)
            .slice(0, 5);

        // 6. Device/OS breakdown
        const { data: devicesData } = await supabase.from('orders').select('device_type, os_name, browser_name');

        const analytics = {
            devices: {} as Record<string, number>,
            os: {} as Record<string, number>,
            browsers: {} as Record<string, number>,
        };

        devicesData?.forEach(o => {
            const dt = o.device_type || 'Unknown';
            const os = o.os_name || 'Unknown';
            const b = o.browser_name || 'Unknown';
            analytics.devices[dt] = (analytics.devices[dt] || 0) + 1;
            analytics.os[os] = (analytics.os[os] || 0) + 1;
            analytics.browsers[b] = (analytics.browsers[b] || 0) + 1;
        });

        res.json({
            revenueToday: Math.round(revenueToday * 100) / 100,
            ordersToday,
            pendingOrders,
            usersToday,
            stats: {
                totalUsers,
                totalOrders,
                revenue: Math.round(revenue * 100) / 100,
                menuItems,
            },
            ordersByStatus,
            recentOrders: formattedRecent,
            topItems,
            analytics,
        });
    })
);

// ─── PROMOS MANAGEMENT ────────────────────────────────────────────────────────
router.get(
    '/promos',
    asyncHandler(async (_req: Request, res: Response) => {
        const { data: promos, error } = await supabase
            .from('promos')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) throw error;
        res.json(promos);
    })
);

router.post(
    '/promos',
    asyncHandler(async (req: Request, res: Response) => {
        const { title, description, discount, valid_until, icon, color, bg, is_active } = req.body;
        const { data: promo, error } = await supabase
            .from('promos')
            .insert({ title, description, discount, valid_until, icon, color, bg, is_active })
            .select()
            .single();
        if (error) throw error;
        res.json(promo);
    })
);

router.put(
    '/promos/:id',
    asyncHandler(async (req: Request, res: Response) => {
        const { title, description, discount, valid_until, icon, color, bg, is_active } = req.body;
        const { data: promo, error } = await supabase
            .from('promos')
            .update({ title, description, discount, valid_until, icon, color, bg, is_active })
            .eq('id', req.params.id)
            .select()
            .single();
        if (error) throw error;
        res.json(promo);
    })
);

router.delete(
    '/promos/:id',
    asyncHandler(async (req: Request, res: Response) => {
        const { error } = await supabase.from('promos').delete().eq('id', req.params.id);
        if (error) throw error;
        res.json({ success: true });
    })
);

// ─── BLOG POSTS MANAGEMENT ────────────────────────────────────────────────────
router.get(
    '/blog_posts',
    asyncHandler(async (_req: Request, res: Response) => {
        const { data: posts, error } = await supabase
            .from('blog_posts')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) throw error;
        res.json(posts);
    })
);

router.post(
    '/blog_posts',
    asyncHandler(async (req: Request, res: Response) => {
        const { title, slug, excerpt, content, image_url, author, category, read_time, published } =
            req.body;
        const { data: post, error } = await supabase
            .from('blog_posts')
            .insert({
                title,
                slug,
                excerpt,
                content,
                image_url,
                author,
                category,
                read_time,
                published,
            })
            .select()
            .single();
        if (error) throw error;
        res.json(post);
    })
);

router.put(
    '/blog_posts/:id',
    asyncHandler(async (req: Request, res: Response) => {
        const { title, slug, excerpt, content, image_url, author, category, read_time, published } =
            req.body;
        const { data: post, error } = await supabase
            .from('blog_posts')
            .update({
                title,
                slug,
                excerpt,
                content,
                image_url,
                author,
                category,
                read_time,
                published,
            })
            .eq('id', req.params.id)
            .select()
            .single();
        if (error) throw error;
        res.json(post);
    })
);

router.delete(
    '/blog_posts/:id',
    asyncHandler(async (req: Request, res: Response) => {
        const { error } = await supabase.from('blog_posts').delete().eq('id', req.params.id);
        if (error) throw error;
        res.json({ success: true });
    })
);

// ─── SITE SETTINGS MANAGEMENT ─────────────────────────────────────────────────
router.get(
    '/settings',
    asyncHandler(async (_req: Request, res: Response) => {
        const { data: settings, error } = await supabase.from('site_settings').select('*');
        if (error) throw error;

        const settingsMap = settings.reduce((acc: any, curr: any) => {
            try {
                acc[curr.key] = JSON.parse(curr.value);
            } catch {
                acc[curr.key] = curr.value;
            }
            return acc;
        }, {});

        res.json(settingsMap);
    })
);

router.put(
    '/settings',
    asyncHandler(async (req: Request, res: Response) => {
        const updates = Object.keys(req.body).map(key => ({
            key,
            value:
                typeof req.body[key] === 'object' ? JSON.stringify(req.body[key]) : req.body[key],
        }));

        const { error } = await supabase
            .from('site_settings')
            .upsert(updates, { onConflict: 'key' });
        if (error) throw error;

        res.json({ success: true });
    })
);

export default router;
