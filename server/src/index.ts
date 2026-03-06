import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { rateLimit } from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config.js';
import { supabase } from './db/supabase.js';
import { errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/auth.js';
import menuRoutes from './routes/menu.js';
import cartRoutes from './routes/cart.js';
import orderRoutes from './routes/orders.js';
import userRoutes from './routes/user.js';
import adminRoutes from './routes/admin.js';
import promoRoutes from './routes/promo.js';
import cronRoutes from './routes/cron.js';
import blogRoutes from './routes/blog.js';
import settingsRoutes from './routes/settings.js';

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
            "connect-src": ["'self'", "http://localhost:3000", "http://localhost:3001", "*.supabase.co"],
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
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: { error: 'Demasiados intentos. Inténtalo de nuevo en 15 minutos.' },
    standardHeaders: true,
    legacyHeaders: false,
});

const resetLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 3,
    message: { error: 'Demasiados intentos de recuperación. Espera 15 minutos.' },
    standardHeaders: true,
    legacyHeaders: false,
});

const generalLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 120,
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

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/promo', promoRoutes);
app.use('/api/cron', cronRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/settings', settingsRoutes);

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
if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
    app.listen(config.port, () => {
        console.log(`\n🍣 Sushi de Maksim API [${config.nodeEnv}]`);
        console.log(`   Server:  http://localhost:${config.port}`);
        console.log(`   Health:  http://localhost:${config.port}/api/health`);
        console.log(`   CORS:    ${config.corsOrigin}\n`);
    });
}

export default app;

// ─── Background Jobs ───────────────────────────────────────────────────────────
if (!process.env.VERCEL) {
    setInterval(async () => {
        try {
            const sixtyMinsAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

            const { data: lateOrders } = await supabase
                .from('orders')
                .select('id, user_id, users(email)')
                .not('status', 'in', '("delivered", "cancelled")')
                .eq('discount_sent', false)
                .lt('created_at', sixtyMinsAgo);

            if (lateOrders && lateOrders.length > 0) {
                for (const order of lateOrders) {
                    const code = `LATE-20-${order.id}-${Math.floor(Math.random() * 1000)}`;

                    await Promise.all([
                        supabase.from('promo_codes').insert({ code, discount_percentage: 20, user_id: order.user_id }),
                        supabase.from('orders').update({ discount_sent: true }).eq('id', order.id)
                    ]);

                    console.log(`📧 Simulated email to ${(order.users as any)?.email}: Your order #${order.id} is late! Here is a 20% discount code for your next order: ${code}`);
                }
            }
        } catch (e) {
            console.error('Error checking late orders:', e);
        }
    }, 60 * 1000);
}

// ─── Graceful Shutdown ─────────────────────────────────────────────────────────
function shutdown(signal: string) {
    console.log(`\n⚡ Received ${signal}. Shutting down gracefully...`);
    process.exit(0);
}

if (!process.env.VERCEL) {
    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
}
