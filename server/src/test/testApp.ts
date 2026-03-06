import express from 'express';
import cors from 'cors';
import { getDb } from '../db/database.js';
import { seedDatabase } from '../db/seed.js';
import { errorHandler } from '../middleware/errorHandler.js';
import authRoutes from '../routes/auth.js';
import menuRoutes from '../routes/menu.js';
import cartRoutes from '../routes/cart.js';
import orderRoutes from '../routes/orders.js';
import userRoutes from '../routes/user.js';
import adminRoutes from '../routes/admin.js';

/**
 * Creates an Express app instance for testing.
 * Uses an in-memory SQLite database to isolate tests.
 */
export function createTestApp() {
    // Override DB path to in-memory for tests
    process.env.DB_PATH = ':memory:';

    const app = express();
    app.use(cors());
    app.use(express.json());

    getDb();
    seedDatabase();

    app.use('/api/auth', authRoutes);
    app.use('/api/menu', menuRoutes);
    app.use('/api/cart', cartRoutes);
    app.use('/api/orders', orderRoutes);
    app.use('/api/user', userRoutes);
    app.use('/api/admin', adminRoutes);

    app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
    app.use((_req, res) => res.status(404).json({ error: 'Not found' }));
    app.use(errorHandler);

    return app;
}
