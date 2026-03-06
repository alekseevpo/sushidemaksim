import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { rateLimit } from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config.js';
import { getDb, closeDb } from './db/database.js';
import { seedDatabase } from './db/seed.js';
import { errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/auth.js';
import menuRoutes from './routes/menu.js';
import cartRoutes from './routes/cart.js';
import orderRoutes from './routes/orders.js';
import userRoutes from './routes/user.js';
import adminRoutes from './routes/admin.js';
import promoRoutes from './routes/promo.js';
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── Static Files for Uploads ──────────────────────────────────────────────────
app.use('/api/uploads', express.static(path.join(__dirname, '..', 'public', 'uploads')));

// ─── Security ─────────────────────────────────────────────────────────────────
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            ...helmet.contentSecurityPolicy.getDefaultDirectives(),
            "img-src": ["'self'", "data:", "https://sushidemaksim.com", "http://localhost:3000", "http://localhost:3001"],
            "connect-src": ["'self'", "http://localhost:3000", "http://localhost:3001"],
        },
    },
}));

app.use(cors({
    origin: config.corsOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ─── Rate Limiting ─────────────────────────────────────────────────────────────
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20,                   // max 20 requests per window
    message: { error: 'Demasiados intentos. Inténtalo de nuevo en 15 minutos.' },
    standardHeaders: true,
    legacyHeaders: false,
});

// Strict limiter for password reset — prevents email spam and brute-force
const resetLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 3,                    // max 3 reset attempts per 15 min
    message: { error: 'Demasiados intentos de recuperación. Espera 15 minutos.' },
    standardHeaders: true,
    legacyHeaders: false,
});

const generalLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 120,             // max 120 requests per minute
    message: { error: 'Demasiadas solicitudes. Inténtalo más tarde.' },
    standardHeaders: true,
    legacyHeaders: false,
});

app.use('/api/auth/forgot-password', resetLimiter);
app.use('/api/auth/reset-password', resetLimiter);
app.use('/api/auth', authLimiter);
app.use('/api', generalLimiter);

// ─── Logging ───────────────────────────────────────────────────────────────────
app.use(morgan(config.isDev ? 'dev' : 'combined'));

// ─── Body Parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// ─── Database ──────────────────────────────────────────────────────────────────
getDb();
seedDatabase();

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/promo', promoRoutes);

// ─── Health Check ──────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: config.nodeEnv,
    });
});

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((_req, res) => {
    res.status(404).json({ error: 'Ruta no encontrada' });
});

// ─── Error Handler ─────────────────────────────────────────────────────────────
app.use(errorHandler);

// ─── Start Server ──────────────────────────────────────────────────────────────
app.listen(config.port, () => {
    console.log(`\n🍣 Sushi de Maksim API [${config.nodeEnv}]`);
    console.log(`   Server:  http://localhost:${config.port}`);
    console.log(`   Health:  http://localhost:${config.port}/api/health`);
    console.log(`   CORS:    ${config.corsOrigin}\n`);
});

// ─── Background Jobs ───────────────────────────────────────────────────────────
setInterval(() => {
    try {
        const db = getDb();
        const lateOrders = db.prepare(`
            SELECT o.id, o.user_id, u.email 
            FROM orders o
            JOIN users u ON o.user_id = u.id
            WHERE o.status != 'delivered' AND o.status != 'cancelled' 
              AND o.discount_sent = 0 
              AND datetime('now') > datetime(o.created_at, '+60 minutes')
        `).all() as any[];

        for (const order of lateOrders) {
            const code = `LATE-20-${order.id}-${Math.floor(Math.random() * 1000)}`;
            db.prepare('INSERT INTO promo_codes (code, discount_percentage, user_id) VALUES (?, ?, ?)').run(code, 20, order.user_id);
            db.prepare('UPDATE orders SET discount_sent = 1 WHERE id = ?').run(order.id);
            console.log(`📧 Simulated email to ${order.email}: Your order #${order.id} is late! Here is a 20% discount code for your next order: ${code}`);
        }
    } catch (e) {
        console.error('Error checking late orders:', e);
    }
}, 60 * 1000); // limit 1 min

// ─── Graceful Shutdown ─────────────────────────────────────────────────────────
function shutdown(signal: string) {
    console.log(`\n⚡ Received ${signal}. Shutting down gracefully...`);
    closeDb();
    process.exit(0);
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
