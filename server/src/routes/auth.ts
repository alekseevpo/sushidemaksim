import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase } from '../db/supabase.js';
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

        const { data: existing } = await supabase
            .from('users')
            .select('id')
            .ilike('email', email)
            .single();

        if (existing) {
            return res.status(409).json({ error: 'Ya existe una cuenta con este email' });
        }

        const passwordHash = await bcrypt.hash(password, config.bcryptRounds);

        const { data: newUser, error: insertError } = await supabase
            .from('users')
            .insert({
                name: name.trim(),
                email: email.toLowerCase().trim(),
                phone: phone?.trim() || '',
                password_hash: passwordHash,
            })
            .select()
            .single();

        if (insertError) throw insertError;

        const token = jwt.sign({ userId: newUser.id }, config.jwtSecret, {
            expiresIn: config.jwtExpiresIn,
        });

        const user = {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            phone: newUser.phone,
            avatar: newUser.avatar,
            role: newUser.role,
            is_superadmin: newUser.is_superadmin,
            createdAt: newUser.created_at,
            birthDate: newUser.birth_date,
            birthDateVerified: newUser.birth_date_verified,
        };

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

        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .ilike('email', email.trim())
            .single();

        if (error || !user) {
            return res.status(401).json({ error: 'Email o contraseña incorrectos' });
        }

        const passwordMatch = await bcrypt.compare(password, user.password_hash);
        if (!passwordMatch) {
            return res.status(401).json({ error: 'Email o contraseña incorrectos' });
        }

        const token = jwt.sign({ userId: user.id }, config.jwtSecret, {
            expiresIn: config.jwtExpiresIn,
        });

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password_hash, created_at, birth_date, birth_date_verified, ...userRest } = user;
        res.json({
            token,
            user: {
                ...userRest,
                createdAt: created_at,
                birthDate: birth_date,
                birthDateVerified: birth_date_verified,
            },
        });
    })
);

// GET /api/auth/me
router.get(
    '/me',
    authMiddleware,
    asyncHandler(async (req: AuthRequest, res: Response) => {
        const { data: user, error } = await supabase
            .from('users')
            .select(
                'id, name, email, phone, avatar, role, is_superadmin, created_at, birth_date, birth_date_verified'
            )
            .eq('id', req.userId)
            .single();

        if (error || !user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        const { data: addresses, error: addrError } = await supabase
            .from('user_addresses')
            .select('id, label, street, house, apartment, city, postal_code, phone, is_default')
            .eq('user_id', req.userId)
            .order('is_default', { ascending: false });

        if (addrError) throw addrError;

        const formattedUser = {
            ...user,
            createdAt: user.created_at,
            birthDate: user.birth_date,
            birthDateVerified: user.birth_date_verified,
            addresses: addresses?.map(a => ({
                ...a,
                postalCode: a.postal_code,
                isDefault: a.is_default,
            })),
        };

        res.json({ user: formattedUser });
    })
);

// POST /api/auth/forgot-password
router.post(
    '/forgot-password',
    validate({ email: emailRule }),
    asyncHandler(async (req, res: Response) => {
        const { email } = req.body;

        const { data: user, error: userError } = await supabase
            .from('users')
            .select('id, email')
            .ilike('email', email.trim())
            .single();

        if (userError || !user) {
            // Security: Don't leak if email exists. Return 200 in both cases.
            return res.json({
                success: true,
                message: 'Si tu email está registrado, recibirás un código pronto.',
            });
        }

        // Cooldown: 60 seconds
        const sixtySecondsAgo = new Date(Date.now() - 60 * 1000).toISOString();
        const { data: recentCode } = await supabase
            .from('password_resets')
            .select('created_at')
            .eq('user_id', user.id)
            .gt('created_at', sixtySecondsAgo)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (recentCode) {
            return res.status(429).json({
                error: 'Ya enviamos un código. Espera 1 minuto antes de intentarlo de nuevo.',
            });
        }

        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

        // Invalidate previous
        await supabase
            .from('password_resets')
            .update({ used: true })
            .eq('user_id', user.id)
            .eq('used', false);

        // Store new
        await supabase
            .from('password_resets')
            .insert({ user_id: user.id, code, expires_at: expiresAt });

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

        const { data: user } = await supabase
            .from('users')
            .select('id')
            .ilike('email', email.trim())
            .single();

        if (!user) {
            return res.status(400).json({ error: 'Código inválido o expirado' });
        }

        const { data: resetRecord, error } = await supabase
            .from('password_resets')
            .select('*')
            .eq('user_id', user.id)
            .eq('used', false)
            .gt('expires_at', new Date().toISOString())
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (error || !resetRecord) {
            return res.status(400).json({ error: 'Código inválido o expirado' });
        }

        if (resetRecord.attempts >= 5) {
            await supabase.from('password_resets').update({ used: true }).eq('id', resetRecord.id);
            return res
                .status(400)
                .json({ error: 'Demasiados intentos fallidos. Solicita un nuevo código.' });
        }

        if (resetRecord.code !== code) {
            await supabase
                .from('password_resets')
                .update({ attempts: resetRecord.attempts + 1 })
                .eq('id', resetRecord.id);
            const remaining = 4 - resetRecord.attempts;
            return res.status(400).json({
                error: `Código incorrecto. ${remaining > 0 ? `Te quedan ${remaining} intento${remaining > 1 ? 's' : ''}.` : 'Solicita un nuevo código.'}`,
            });
        }

        // Success
        const passwordHash = await bcrypt.hash(newPassword, config.bcryptRounds);
        await Promise.all([
            supabase.from('password_resets').update({ used: true }).eq('id', resetRecord.id),
            supabase.from('users').update({ password_hash: passwordHash }).eq('id', user.id),
        ]);

        console.log(`🔑 Password reset for user ${user.id}`);

        res.json({ success: true, message: '¡Contraseña actualizada con éxito!' });
    })
);

export default router;
