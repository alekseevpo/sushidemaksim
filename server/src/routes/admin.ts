import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { getDb } from '../db/database.js';
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

const storage = multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});
const upload = multer({ storage });

const router = Router();

// All admin routes require auth + admin role
router.use(authMiddleware, adminMiddleware);

// POST /api/admin/menu/upload-image
router.post('/menu/upload-image', upload.single('image'), asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No se subió ninguna imagen' });
    }
    const publicUrl = `/api/uploads/${req.file.filename}`;
    res.json({ url: publicUrl });
}));

// ─── MENU MANAGEMENT ──────────────────────────────────────────────────────────

// GET /api/admin/menu — all items (same as public but no cache concerns)
router.get('/menu', asyncHandler(async (_req: Request, res: Response) => {
    const db = getDb();
    const items = db.prepare('SELECT * FROM menu_items ORDER BY category, id').all() as any[];
    const formatted = items.map(formatMenuItem);
    res.json({ items: formatted, total: formatted.length });
}));

// POST /api/admin/menu — create new menu item
router.post(
    '/menu',
    validate({
        name: { required: true, type: 'string', minLength: 2, maxLength: 200 },
        price: { required: true, type: 'number', min: 0.01 },
        category: {
            required: true,
            enum: ['entrantes', 'rollos-grandes', 'rollos-clasicos', 'rollos-fritos', 'sopas', 'menus', 'extras', 'postre'],
        },
        description: { type: 'string', maxLength: 500 },
        image: { type: 'string', maxLength: 500 },
        pieces: { type: 'number', min: 1, max: 999 },
    }),
    asyncHandler(async (req: Request, res: Response) => {
        const { name, description, price, image, category, weight, pieces, spicy, vegetarian, is_promo } = req.body;

        const db = getDb();

        const result = db.prepare(`
            INSERT INTO menu_items (name, description, price, image, category, weight, pieces, spicy, vegetarian, is_promo)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
            name.trim(),
            description?.trim() || '',
            price,
            image?.trim() || '',
            category,
            weight?.trim() || null,
            pieces || null,
            spicy ? 1 : 0,
            vegetarian ? 1 : 0,
            is_promo ? 1 : 0,
        );

        const newItemId = result.lastInsertRowid;
        const item = db.prepare('SELECT * FROM menu_items WHERE id = ?').get(newItemId) as any;
        res.status(201).json({ item: formatMenuItem(item) });
    })
);

// PUT /api/admin/menu/:id — update menu item
router.put(
    '/menu/:id',
    validate({
        name: { type: 'string', minLength: 2, maxLength: 200 },
        price: { type: 'number', min: 0.01 },
        category: {
            enum: ['entrantes', 'rollos-grandes', 'rollos-clasicos', 'rollos-fritos', 'sopas', 'menus', 'extras', 'postre'],
        },
        description: { type: 'string', maxLength: 500 },
        image: { type: 'string', maxLength: 500 },
        pieces: { type: 'number', min: 1, max: 999 },
    }),
    asyncHandler(async (req: Request, res: Response) => {
        const id = parseInt(req.params.id);
        if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });

        const db = getDb();
        const existing = db.prepare('SELECT id FROM menu_items WHERE id = ?').get(id);
        if (!existing) return res.status(404).json({ error: 'Producto no encontrado' });

        const { name, description, price, image, category, weight, pieces, spicy, vegetarian, is_promo } = req.body;

        const updates: string[] = [];
        const values: any[] = [];

        if (name !== undefined) { updates.push('name = ?'); values.push(name.trim()); }
        if (description !== undefined) { updates.push('description = ?'); values.push(description.trim()); }
        if (price !== undefined) { updates.push('price = ?'); values.push(price); }
        if (image !== undefined) { updates.push('image = ?'); values.push(image.trim()); }
        if (category !== undefined) { updates.push('category = ?'); values.push(category); }
        if (weight !== undefined) { updates.push('weight = ?'); values.push(weight?.trim() || null); }
        if (pieces !== undefined) { updates.push('pieces = ?'); values.push(pieces || null); }
        if (spicy !== undefined) { updates.push('spicy = ?'); values.push(spicy ? 1 : 0); }
        if (vegetarian !== undefined) { updates.push('vegetarian = ?'); values.push(vegetarian ? 1 : 0); }
        if (is_promo !== undefined) { updates.push('is_promo = ?'); values.push(is_promo ? 1 : 0); }

        if (updates.length === 0) {
            return res.status(400).json({ error: 'No hay campos para actualizar' });
        }

        values.push(id);
        db.prepare(`UPDATE menu_items SET ${updates.join(', ')} WHERE id = ?`).run(...values);

        const item = db.prepare('SELECT * FROM menu_items WHERE id = ?').get(id) as any;
        res.json({ item: formatMenuItem(item) });
    })
);

// DELETE /api/admin/menu/:id — delete menu item
router.delete('/menu/:id', asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });

    const db = getDb();
    const result = db.prepare('DELETE FROM menu_items WHERE id = ?').run(id);

    if (result.changes === 0) {
        return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json({ success: true, message: `Producto ${id} eliminado` });
}));

// ─── ORDER MANAGEMENT ─────────────────────────────────────────────────────────

// GET /api/admin/orders — all orders with pagination and filters
router.get('/orders', asyncHandler(async (req: Request, res: Response) => {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const offset = (page - 1) * limit;
    const status = req.query.status as string | undefined;
    const userId = req.query.userId as string | undefined;

    const db = getDb();

    // Build dynamic WHERE clause
    const conditions: string[] = [];
    const params: any[] = [];

    if (status) { conditions.push('o.status = ?'); params.push(status); }
    if (userId) { conditions.push('o.user_id = ?'); params.push(parseInt(userId)); }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const { total } = db.prepare(
        `SELECT COUNT(*) as total FROM orders o ${where}`
    ).get(...params) as { total: number };

    const orders = db.prepare(`
        SELECT o.*, u.name as user_name, u.email as user_email
        FROM orders o
        JOIN users u ON o.user_id = u.id
        ${where}
        ORDER BY o.created_at DESC
        LIMIT ? OFFSET ?
    `).all(...params, limit, offset) as any[];

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

// PATCH /api/admin/orders/:id/status — update any order status
router.patch(
    '/orders/:id/status',
    validate({
        status: {
            required: true,
            enum: ['pending', 'confirmed', 'preparing', 'on_the_way', 'delivered', 'cancelled'],
        },
    }),
    asyncHandler(async (req: Request, res: Response) => {
        const id = parseInt(req.params.id);
        if (isNaN(id)) return res.status(400).json({ error: 'ID de pedido inválido' });

        const { status } = req.body;
        const db = getDb();

        const result = db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, id);

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Pedido no encontrado' });
        }

        const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(id) as any;
        order.items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(id);

        res.json({ order });
    })
);

// ─── USER MANAGEMENT ──────────────────────────────────────────────────────────

// GET /api/admin/users — all users (no passwords)
router.get('/users', asyncHandler(async (req: Request, res: Response) => {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const offset = (page - 1) * limit;

    const db = getDb();

    const { total } = db.prepare('SELECT COUNT(*) as total FROM users').get() as { total: number };

    const users = db.prepare(
        'SELECT id, name, email, phone, role, created_at, is_superadmin FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?'
    ).all(limit, offset) as any[];

    // Attach order count per user
    const getOrderCount = db.prepare('SELECT COUNT(*) as count FROM orders WHERE user_id = ?');
    const usersWithStats = users.map(u => ({
        ...u,
        orderCount: (getOrderCount.get(u.id) as any).count,
    }));

    res.json({
        users: usersWithStats,
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

// PATCH /api/admin/users/:id/role — change user role (only for superadmin)
router.patch(
    '/users/:id/role',
    validate({
        role: { required: true, enum: ['user', 'admin'] },
    }),
    asyncHandler(async (req: AuthRequest, res: Response) => {
        const id = parseInt(req.params.id);
        if (isNaN(id)) return res.status(400).json({ error: 'ID de usuario inválido' });

        const db = getDb();
        const currentUser = db.prepare('SELECT is_superadmin FROM users WHERE id = ?').get(req.userId) as any;

        if (!currentUser || currentUser.is_superadmin !== 1) {
            return res.status(403).json({ error: 'Solo el propietario (super administrador) puede cambiar los roles de otros usuarios' });
        }

        // Prevent self-demotion
        if (id === req.userId) {
            return res.status(400).json({ error: 'No puedes cambiar tu propio rol' });
        }

        const { role } = req.body;
        const result = db.prepare('UPDATE users SET role = ? WHERE id = ?').run(role, id);

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        const user = db.prepare('SELECT id, name, email, role, is_superadmin FROM users WHERE id = ?').get(id);
        res.json({ user });
    })
);


// ─── STATS ────────────────────────────────────────────────────────────────────

// GET /api/admin/stats — dashboard overview
router.get('/stats', asyncHandler(async (_req: Request, res: Response) => {
    const db = getDb();

    // ── Totals ──
    const { totalUsers } = db.prepare("SELECT COUNT(*) as totalUsers FROM users WHERE role = 'user'").get() as any;
    const { totalOrders } = db.prepare('SELECT COUNT(*) as totalOrders FROM orders').get() as any;
    const { revenue } = db.prepare("SELECT COALESCE(SUM(total), 0) as revenue FROM orders WHERE status != 'cancelled'").get() as any;
    const { menuItems } = db.prepare('SELECT COUNT(*) as menuItems FROM menu_items').get() as any;

    // ── Today metrics (what the dashboard cards expect) ──
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayISO = todayStart.toISOString();

    const { revenueToday } = db.prepare(
        "SELECT COALESCE(SUM(total), 0) as revenueToday FROM orders WHERE status != 'cancelled' AND created_at >= ?"
    ).get(todayISO) as any;

    const { ordersToday } = db.prepare(
        'SELECT COUNT(*) as ordersToday FROM orders WHERE created_at >= ?'
    ).get(todayISO) as any;

    const { pendingOrders } = db.prepare(
        "SELECT COUNT(*) as pendingOrders FROM orders WHERE status = 'pending'"
    ).get() as any;

    const { usersToday } = db.prepare(
        'SELECT COUNT(*) as usersToday FROM users WHERE created_at >= ?'
    ).get(todayISO) as any;

    // ── Breakdown ──
    const ordersByStatus = db.prepare(
        'SELECT status, COUNT(*) as count FROM orders GROUP BY status'
    ).all() as any[];

    const recentOrders = db.prepare(`
        SELECT o.id, o.total, o.status, o.created_at, u.name as user_name
        FROM orders o
        JOIN users u ON o.user_id = u.id
        ORDER BY o.created_at DESC
        LIMIT 5
    `).all();

    const topItems = db.prepare(`
        SELECT oi.name, SUM(oi.quantity) as sold, SUM(oi.quantity * oi.price_at_time) as revenue
        FROM order_items oi
        GROUP BY oi.menu_item_id, oi.name
        ORDER BY sold DESC
        LIMIT 5
    `).all();

    res.json({
        // Today metrics — used by dashboard stat cards
        revenueToday: Math.round(revenueToday * 100) / 100,
        ordersToday,
        pendingOrders,
        usersToday,
        // Totals
        stats: {
            totalUsers,
            totalOrders,
            revenue: Math.round(revenue * 100) / 100,
            menuItems,
        },
        ordersByStatus: Object.fromEntries(ordersByStatus.map(r => [r.status, r.count])),
        recentOrders,
        topItems,
    });
}));


export default router;
