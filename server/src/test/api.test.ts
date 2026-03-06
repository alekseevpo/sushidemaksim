import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import express from 'express';

// Import routes AFTER setup.ts sets DB_PATH=:memory:
import { getDb } from '../db/database.js';
import { seedDatabase } from '../db/seed.js';
import { errorHandler } from '../middleware/errorHandler.js';
import authRoutes from '../routes/auth.js';
import menuRoutes from '../routes/menu.js';
import cartRoutes from '../routes/cart.js';
import orderRoutes from '../routes/orders.js';
import userRoutes from '../routes/user.js';
import adminRoutes from '../routes/admin.js';

// Build the test app
const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.use((_req, res) => res.status(404).json({ error: 'Not found' }));
app.use(errorHandler);

// Init DB and seed (runs once — in-memory singleton)
getDb();
seedDatabase();

// ─── Helper ───────────────────────────────────────────────────────────────────
async function register(email: string, password = 'secret123', name = 'Test User') {
    const res = await request(app)
        .post('/api/auth/register')
        .send({ name, email, password });
    return res.body as { token: string; user: { id: number; email: string; name: string } };
}

// =============================================================================
// TESTS
// =============================================================================

describe('GET /api/health', () => {
    it('returns ok', async () => {
        const res = await request(app).get('/api/health');
        expect(res.status).toBe(200);
        expect(res.body.status).toBe('ok');
    });
});

// ─── AUTH ─────────────────────────────────────────────────────────────────────

describe('Auth — Register', () => {
    it('registers new user and returns token', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({ name: 'Alice', email: 'alice@t.com', password: 'password123' });
        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('token');
        expect(res.body.user.email).toBe('alice@t.com');
        expect(res.body.user).not.toHaveProperty('password_hash');
    });

    it('rejects duplicate email → 409', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({ name: 'Alice2', email: 'alice@t.com', password: 'password123' });
        expect(res.status).toBe(409);
    });

    it('rejects password < 6 chars → 400', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({ name: 'Bob', email: 'bob@t.com', password: '123' });
        expect(res.status).toBe(400);
    });

    it('rejects invalid email → 400', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({ name: 'Bob', email: 'not-email', password: 'password123' });
        expect(res.status).toBe(400);
    });

    it('rejects missing name → 400', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({ email: 'x@t.com', password: 'password123' });
        expect(res.status).toBe(400);
    });
});

describe('Auth — Login', () => {
    it('logs in with correct credentials', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'alice@t.com', password: 'password123' });
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('token');
    });

    it('rejects wrong password → 401', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'alice@t.com', password: 'wrongpass' });
        expect(res.status).toBe(401);
    });

    it('no user enumeration — same error for unknown email and wrong password', async () => {
        const r1 = await request(app).post('/api/auth/login').send({ email: 'noexist@t.com', password: 'password123' });
        const r2 = await request(app).post('/api/auth/login').send({ email: 'alice@t.com', password: 'wrongpass' });
        expect(r1.body.error).toBe(r2.body.error);
    });
});

describe('Auth — /me', () => {
    let token: string;
    beforeAll(async () => { token = (await register('me@t.com')).token; });

    it('returns user with valid token', async () => {
        const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);
        expect(res.status).toBe(200);
        expect(res.body.user.email).toBe('me@t.com');
        expect(Array.isArray(res.body.user.addresses)).toBe(true);
    });

    it('returns 401 without token', async () => {
        expect((await request(app).get('/api/auth/me')).status).toBe(401);
    });

    it('returns 401 with bad token', async () => {
        const res = await request(app).get('/api/auth/me').set('Authorization', 'Bearer bad.token');
        expect(res.status).toBe(401);
    });
});

// ─── MENU ─────────────────────────────────────────────────────────────────────

describe('Menu', () => {
    it('GET /api/menu returns items + total', async () => {
        const res = await request(app).get('/api/menu');
        expect(res.status).toBe(200);
        expect(res.body.items.length).toBeGreaterThan(0);
        expect(typeof res.body.total).toBe('number');
    });

    it('filters by category', async () => {
        const res = await request(app).get('/api/menu?category=entrantes');
        expect(res.status).toBe(200);
        expect(res.body.items.every((i: any) => i.category === 'entrantes')).toBe(true);
    });

    it('searches by name', async () => {
        const res = await request(app).get('/api/menu?search=Gyoza');
        expect(res.status).toBe(200);
        expect(res.body.items.length).toBeGreaterThan(0);
    });

    it('returns booleans for flags', async () => {
        const res = await request(app).get('/api/menu');
        const item = res.body.items[0];
        expect(typeof item.spicy).toBe('boolean');
        expect(typeof item.vegetarian).toBe('boolean');
        expect(typeof item.is_promo).toBe('boolean');
    });

    it('GET /api/menu/info/categories returns categories', async () => {
        const res = await request(app).get('/api/menu/info/categories');
        expect(res.status).toBe(200);
        expect(res.body.categories.length).toBeGreaterThan(0);
        expect(res.body.categories[0]).toHaveProperty('count');
        expect(res.body.categories[0]).toHaveProperty('icon');
    });

    it('GET /api/menu/7 returns item', async () => {
        const res = await request(app).get('/api/menu/7');
        expect(res.status).toBe(200);
        expect(res.body.item.id).toBe(7);
    });

    it('GET /api/menu/9999 → 404', async () => {
        expect((await request(app).get('/api/menu/9999')).status).toBe(404);
    });

    it('GET /api/menu/abc → 400', async () => {
        expect((await request(app).get('/api/menu/abc')).status).toBe(400);
    });
});

// ─── CART ─────────────────────────────────────────────────────────────────────

describe('Cart', () => {
    let token: string;
    let itemId: number;

    beforeAll(async () => { token = (await register('cart@t.com')).token; });

    it('GET → empty cart initially', async () => {
        const res = await request(app).get('/api/cart').set('Authorization', `Bearer ${token}`);
        expect(res.status).toBe(200);
        expect(res.body.items).toHaveLength(0);
        expect(res.body.total).toBe(0);
    });

    it('POST → adds item', async () => {
        const res = await request(app)
            .post('/api/cart')
            .set('Authorization', `Bearer ${token}`)
            .send({ menuItemId: 7, quantity: 2 });
        expect(res.status).toBe(201);
    });

    it('GET → shows added item', async () => {
        const res = await request(app).get('/api/cart').set('Authorization', `Bearer ${token}`);
        expect(res.body.items).toHaveLength(1);
        expect(res.body.items[0].quantity).toBe(2);
        expect(res.body.total).toBeGreaterThan(0);
        itemId = res.body.items[0].id;
    });

    it('PUT /:itemId → update quantity', async () => {
        const res = await request(app)
            .put(`/api/cart/${itemId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ quantity: 5 });
        expect(res.status).toBe(200);
    });

    it('POST → rejects quantity > 99', async () => {
        const res = await request(app)
            .post('/api/cart')
            .set('Authorization', `Bearer ${token}`)
            .send({ menuItemId: 7, quantity: 100 });
        expect(res.status).toBe(400);
    });

    it('POST → 404 for non-existent menu item', async () => {
        const res = await request(app)
            .post('/api/cart')
            .set('Authorization', `Bearer ${token}`)
            .send({ menuItemId: 99999 });
        expect(res.status).toBe(404);
    });

    it('DELETE /api/cart → clears cart', async () => {
        await request(app).delete('/api/cart').set('Authorization', `Bearer ${token}`);
        const res = await request(app).get('/api/cart').set('Authorization', `Bearer ${token}`);
        expect(res.body.items).toHaveLength(0);
    });
});

// ─── ORDERS ───────────────────────────────────────────────────────────────────

describe('Orders', () => {
    let token: string;
    let orderId: number;

    beforeAll(async () => {
        token = (await register('orders@t.com')).token;
        await request(app)
            .post('/api/cart')
            .set('Authorization', `Bearer ${token}`)
            .send({ menuItemId: 7, quantity: 1 });
    });

    it('POST /api/orders creates order from cart', async () => {
        const res = await request(app)
            .post('/api/orders')
            .set('Authorization', `Bearer ${token}`)
            .send({ deliveryAddress: 'Calle Test 1', phoneNumber: '+34600000000' });
        expect(res.status).toBe(201);
        expect(res.body.order.status).toBe('pending');
        expect(res.body.order.items.length).toBeGreaterThan(0);
        orderId = res.body.order.id;
    });

    it('Cart is emptied after order', async () => {
        const res = await request(app).get('/api/cart').set('Authorization', `Bearer ${token}`);
        expect(res.body.items).toHaveLength(0);
    });

    it('POST with empty cart → 400', async () => {
        const res = await request(app)
            .post('/api/orders')
            .set('Authorization', `Bearer ${token}`)
            .send({});
        expect(res.status).toBe(400);
    });

    it('GET /api/orders → paginated list with metadata', async () => {
        const res = await request(app).get('/api/orders').set('Authorization', `Bearer ${token}`);
        expect(res.status).toBe(200);
        expect(res.body.orders.length).toBeGreaterThan(0);
        expect(res.body.pagination).toMatchObject({ page: 1, limit: 10 });
        expect(typeof res.body.pagination.total).toBe('number');
        expect(typeof res.body.pagination.hasNext).toBe('boolean');
        expect(typeof res.body.pagination.hasPrev).toBe('boolean');
    });

    it('GET /api/orders?limit=1 respects limit', async () => {
        const res = await request(app).get('/api/orders?page=1&limit=1').set('Authorization', `Bearer ${token}`);
        expect(res.body.pagination.limit).toBe(1);
    });

    it('GET /api/orders/:id returns single order', async () => {
        const res = await request(app).get(`/api/orders/${orderId}`).set('Authorization', `Bearer ${token}`);
        expect(res.status).toBe(200);
        expect(res.body.order.id).toBe(orderId);
    });

    it('PATCH /api/orders/:id/status updates status', async () => {
        const res = await request(app)
            .patch(`/api/orders/${orderId}/status`)
            .set('Authorization', `Bearer ${token}`)
            .send({ status: 'confirmed' });
        expect(res.status).toBe(200);
        expect(res.body.order.status).toBe('confirmed');
    });

    it('PATCH with invalid status → 400', async () => {
        const res = await request(app)
            .patch(`/api/orders/${orderId}/status`)
            .set('Authorization', `Bearer ${token}`)
            .send({ status: 'flying' });
        expect(res.status).toBe(400);
    });
});

// ─── USER ─────────────────────────────────────────────────────────────────────

describe('User Profile', () => {
    let token: string;

    beforeAll(async () => { token = (await register('profile@t.com')).token; });

    it('GET /api/user/profile returns stats', async () => {
        const res = await request(app).get('/api/user/profile').set('Authorization', `Bearer ${token}`);
        expect(res.status).toBe(200);
        expect(res.body.user).toHaveProperty('orderCount');
        expect(Array.isArray(res.body.user.addresses)).toBe(true);
    });

    it('PUT /api/user/profile updates name', async () => {
        const res = await request(app)
            .put('/api/user/profile')
            .set('Authorization', `Bearer ${token}`)
            .send({ name: 'Updated Name' });
        expect(res.status).toBe(200);
        expect(res.body.user.name).toBe('Updated Name');
    });

    it('PUT /change-password with wrong current → 401', async () => {
        const res = await request(app)
            .put('/api/user/change-password')
            .set('Authorization', `Bearer ${token}`)
            .send({ currentPassword: 'wrongpass', newPassword: 'newpass123' });
        expect(res.status).toBe(401);
    });

    it('PUT /change-password with correct current → 200', async () => {
        const res = await request(app)
            .put('/api/user/change-password')
            .set('Authorization', `Bearer ${token}`)
            .send({ currentPassword: 'secret123', newPassword: 'newpass456' });
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
    });

    it('POST /api/user/addresses creates address', async () => {
        const res = await request(app)
            .post('/api/user/addresses')
            .set('Authorization', `Bearer ${token}`)
            .send({ street: 'Calle Mayor 1', city: 'Madrid', postalCode: '28001' });
        expect(res.status).toBe(201);
        expect(res.body.address.street).toBe('Calle Mayor 1');
    });

    it('PUT /api/user/addresses/:id edits address', async () => {
        // First get addresses
        const listRes = await request(app)
            .get('/api/user/addresses')
            .set('Authorization', `Bearer ${token}`);
        const addr = listRes.body.addresses[0];

        const res = await request(app)
            .put(`/api/user/addresses/${addr.id}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ city: 'Barcelona' });
        expect(res.status).toBe(200);
        expect(res.body.address.city).toBe('Barcelona');
    });
});

// ─── ADMIN ────────────────────────────────────────────────────────────────────

describe('Admin', () => {
    let adminToken: string;
    let userToken: string;

    beforeAll(async () => {
        const userData = await register('regular@t.com');
        userToken = userData.token;

        const adminData = await register('admin@t.com');
        adminToken = adminData.token;

        // Promote to admin via direct DB access
        getDb().prepare("UPDATE users SET role = 'admin' WHERE email = 'admin@t.com'").run();
    });

    it('GET /api/admin/stats returns dashboard', async () => {
        const res = await request(app).get('/api/admin/stats').set('Authorization', `Bearer ${adminToken}`);
        expect(res.status).toBe(200);
        expect(res.body.stats).toHaveProperty('totalUsers');
        expect(res.body.stats).toHaveProperty('revenue');
        expect(res.body).toHaveProperty('ordersByStatus');
        expect(res.body).toHaveProperty('topItems');
        expect(res.body).toHaveProperty('recentOrders');
    });

    it('GET /api/admin/stats → 403 for regular user', async () => {
        const res = await request(app).get('/api/admin/stats').set('Authorization', `Bearer ${userToken}`);
        expect(res.status).toBe(403);
    });

    it('POST /api/admin/menu creates item', async () => {
        const res = await request(app)
            .post('/api/admin/menu')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ id: 8888, name: 'Test Roll', price: 12.50, category: 'rollos-grandes' });
        expect(res.status).toBe(201);
        expect(res.body.item.name).toBe('Test Roll');
        expect(typeof res.body.item.spicy).toBe('boolean');
    });

    it('POST /api/admin/menu → 409 on duplicate id', async () => {
        const res = await request(app)
            .post('/api/admin/menu')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ id: 8888, name: 'Dup', price: 5, category: 'extras' });
        expect(res.status).toBe(409);
    });

    it('PUT /api/admin/menu/:id updates item', async () => {
        const res = await request(app)
            .put('/api/admin/menu/8888')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ price: 15.00, spicy: true });
        expect(res.status).toBe(200);
        expect(res.body.item.price).toBe(15.00);
        expect(res.body.item.spicy).toBe(true);
    });

    it('DELETE /api/admin/menu/:id removes item', async () => {
        await request(app).delete('/api/admin/menu/8888').set('Authorization', `Bearer ${adminToken}`);
        expect((await request(app).get('/api/menu/8888')).status).toBe(404);
    });

    it('GET /api/admin/users returns user list', async () => {
        const res = await request(app).get('/api/admin/users').set('Authorization', `Bearer ${adminToken}`);
        expect(res.status).toBe(200);
        expect(res.body.users[0]).not.toHaveProperty('password_hash');
        expect(res.body.users[0]).toHaveProperty('orderCount');
        expect(res.body).toHaveProperty('pagination');
    });

    it('GET /api/admin/orders returns all orders', async () => {
        const res = await request(app).get('/api/admin/orders').set('Authorization', `Bearer ${adminToken}`);
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('pagination');
    });

    it('GET /api/admin/orders?status=pending filters by status', async () => {
        const res = await request(app)
            .get('/api/admin/orders?status=pending')
            .set('Authorization', `Bearer ${adminToken}`);
        expect(res.status).toBe(200);
    });
});

// ─── 404 ──────────────────────────────────────────────────────────────────────

describe('404', () => {
    it('unknown route → 404', async () => {
        expect((await request(app).get('/api/nonexistent')).status).toBe(404);
    });
});
