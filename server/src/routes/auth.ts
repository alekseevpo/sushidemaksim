import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDb } from '../db/database.js';
import { config } from '../config.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { validate, emailRule, passwordRule } from '../middleware/validate.js';

const router = Router();

// POST /api/auth/register
router.post(
    '/register',
    validate({
        name: { required: true, type: 'string', minLength: 2, maxLength: 80 },
        email: emailRule,
        password: passwordRule,
        phone: { type: 'string', maxLength: 30 },
    }),
    asyncHandler(async (req, res: Response) => {
        const { name, email, phone, password } = req.body;

        const db = getDb();
        const existing = db.prepare('SELECT id FROM users WHERE LOWER(email) = LOWER(?)').get(email);

        if (existing) {
            return res.status(409).json({ error: 'Ya existe una cuenta con este email' });
        }

        const passwordHash = await bcrypt.hash(password, config.bcryptRounds);

        const result = db.prepare(
            'INSERT INTO users (name, email, phone, password_hash) VALUES (?, ?, ?, ?)'
        ).run(name.trim(), email.toLowerCase().trim(), phone?.trim() || '', passwordHash);

        const token = jwt.sign({ userId: result.lastInsertRowid }, config.jwtSecret, {
            expiresIn: config.jwtExpiresIn,
        });
        const user = db.prepare('SELECT id, name, email, phone, avatar, role, is_superadmin, created_at AS createdAt FROM users WHERE id = ?').get(result.lastInsertRowid);

        res.status(201).json({ token, user });
    })
);

// POST /api/auth/login
router.post(
    '/login',
    validate({
        email: { ...emailRule, message: 'Email inválido' },
        password: { required: true, type: 'string' },
    }),
    asyncHandler(async (req, res: Response) => {
        const { email, password } = req.body;

        const db = getDb();
        const user = db.prepare('SELECT * FROM users WHERE LOWER(email) = LOWER(?)').get(email) as any;

        if (!user) {
            // Use same message to avoid user enumeration
            return res.status(401).json({ error: 'Email o contraseña incorrectos' });
        }

        const passwordMatch = await bcrypt.compare(password, user.password_hash);
        if (!passwordMatch) {
            return res.status(401).json({ error: 'Email o contraseña incorrectos' });
        }

        const token = jwt.sign({ userId: user.id }, config.jwtSecret, {
            expiresIn: config.jwtExpiresIn,
        });

        const { password_hash, ...userWithoutPassword } = user;
        res.json({ token, user: userWithoutPassword });
    })
);

// GET /api/auth/me
router.get('/me', authMiddleware, asyncHandler(async (req: AuthRequest, res: Response) => {
    const db = getDb();
    const user = db.prepare('SELECT id, name, email, phone, avatar, role, is_superadmin, created_at AS createdAt FROM users WHERE id = ?').get(req.userId) as any;

    if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const addresses = db.prepare('SELECT id, label, street, city, postal_code AS postalCode, phone, is_default AS isDefault FROM user_addresses WHERE user_id = ? ORDER BY is_default DESC').all(req.userId);
    user.addresses = addresses;

    res.json({ user });
}));

// POST /api/auth/forgot-password
router.post(
    '/forgot-password',
    validate({ email: emailRule }),
    asyncHandler(async (req, res: Response) => {
        const { email } = req.body;
        const db = getDb();

        const user = db.prepare('SELECT id, email FROM users WHERE LOWER(email) = LOWER(?)').get(email) as any;

        // Return error if user doesn't exist
        if (!user) {
            return res.status(404).json({ error: 'No existe una cuenta con este email' });
        }

        // Cooldown: don't allow another code within 60 seconds
        const recentCode = db.prepare(
            `SELECT created_at FROM password_resets 
             WHERE user_id = ? AND created_at > datetime('now', '-60 seconds')
             ORDER BY created_at DESC LIMIT 1`
        ).get(user.id) as any;

        if (recentCode) {
            return res.status(429).json({ error: 'Ya enviamos un código. Espera 1 minuto antes de intentarlo de nuevo.' });
        }

        // Generate 6-digit code
        const code = Math.floor(100000 + Math.random() * 900000).toString();

        // Expire in 15 minutes
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

        // Invalidate any previous unused codes for this user
        db.prepare('UPDATE password_resets SET used = 1 WHERE user_id = ? AND used = 0').run(user.id);

        // Store new code (attempts starts at 0)
        db.prepare('INSERT INTO password_resets (user_id, code, expires_at) VALUES (?, ?, ?)').run(user.id, code, expiresAt);

        // Send email
        try {
            const { sendResetCodeEmail } = await import('../utils/email.js');
            await sendResetCodeEmail(user.email, code);
            console.log(`📧 Reset code sent to ${user.email}`);
        } catch (err) {
            console.error('❌ Failed to send reset email:', err);
            return res.status(500).json({ error: 'Error al enviar el email. Inténtalo de nuevo.' });
        }

        res.json({ success: true, message: 'Código enviado a tu email.' });
    })
);

// POST /api/auth/reset-password
router.post(
    '/reset-password',
    validate({
        email: emailRule,
        code: { required: true, type: 'string', minLength: 6, maxLength: 6 },
        newPassword: passwordRule,
    }),
    asyncHandler(async (req, res: Response) => {
        const { email, code, newPassword } = req.body;
        const db = getDb();

        const user = db.prepare('SELECT id FROM users WHERE LOWER(email) = LOWER(?)').get(email) as any;
        if (!user) {
            return res.status(400).json({ error: 'Código inválido o expirado' });
        }

        // Find latest unused, non-expired code for this user
        const resetRecord = db.prepare(
            `SELECT * FROM password_resets 
             WHERE user_id = ? AND used = 0 AND expires_at > datetime('now')
             ORDER BY created_at DESC LIMIT 1`
        ).get(user.id) as any;

        if (!resetRecord) {
            return res.status(400).json({ error: 'Código inválido o expirado' });
        }

        // Check if max attempts exceeded (5 wrong tries)
        if (resetRecord.attempts >= 5) {
            db.prepare('UPDATE password_resets SET used = 1 WHERE id = ?').run(resetRecord.id);
            return res.status(400).json({ error: 'Demasiados intentos fallidos. Solicita un nuevo código.' });
        }

        // Check if code matches
        if (resetRecord.code !== code) {
            db.prepare('UPDATE password_resets SET attempts = attempts + 1 WHERE id = ?').run(resetRecord.id);
            const remaining = 4 - resetRecord.attempts;
            return res.status(400).json({
                error: `Código incorrecto. ${remaining > 0 ? `Te quedan ${remaining} intento${remaining > 1 ? 's' : ''}.` : 'Solicita un nuevo código.'}`
            });
        }

        // Mark code as used
        db.prepare('UPDATE password_resets SET used = 1 WHERE id = ?').run(resetRecord.id);

        // Update password
        const passwordHash = await bcrypt.hash(newPassword, config.bcryptRounds);
        db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(passwordHash, user.id);

        console.log(`🔑 Password reset for user ${user.id}`);

        res.json({ success: true, message: '¡Contraseña actualizada con éxito!' });
    })
);

export default router;
