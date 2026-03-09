import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase } from '../db/supabase.js';
import { config } from '../config.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { validate, passwordRule } from '../middleware/validate.js';
import { sendEmailChangeVerificationEmail } from '../utils/email.js';

const router = Router();
router.use(authMiddleware);

// GET /api/user/profile
router.get(
    '/profile',
    asyncHandler(async (req: AuthRequest, res: Response) => {
        const { data: user, error: userError } = await supabase
            .from('users')
            .select(
                'id, name, email, phone, avatar, role, created_at, birth_date, birth_date_verified, last_seen_at'
            )
            .eq('id', req.userId)
            .single();

        if (userError || !user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        const { data: addresses } = await supabase
            .from('user_addresses')
            .select('id, label, street, house, apartment, city, postal_code, phone, is_default')
            .eq('user_id', req.userId)
            .order('is_default', { ascending: false });

        const { count: orderCount } = await supabase
            .from('orders')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', req.userId);

        const formattedUser = {
            ...user,
            createdAt: user.created_at,
            birthDate: user.birth_date,
            birthDateVerified: user.birth_date_verified,
            lastSeenAt: user.last_seen_at,
            addresses: addresses?.map(a => ({
                ...a,
                postalCode: a.postal_code,
                isDefault: a.is_default,
            })),
            orderCount: orderCount || 0,
        };

        res.json({ user: formattedUser });
    })
);

// PUT /api/user/profile
router.put(
    '/profile',
    validate({
        name: { type: 'string', minLength: 2, maxLength: 80 },
        email: { type: 'string', match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Email inválido' },
        phone: { type: 'string', maxLength: 30 },
        avatar: { type: 'string' },
        birthDate: { type: 'string' },
    }),
    asyncHandler(async (req: AuthRequest, res: Response) => {
        const { name, email, phone, avatar, birthDate } = req.body;

        const { data: currentUser, error: fetchError } = await supabase
            .from('users')
            .select('email, email_last_changed_at, name')
            .eq('id', req.userId)
            .single();

        if (fetchError || !currentUser) throw new Error('Usuario no encontrado');

        const updateData: any = {};
        let emailChangePending = false;

        if (email && email.toLowerCase().trim() !== currentUser.email.toLowerCase()) {
            const newEmail = email.toLowerCase().trim();

            // Check 30-day limit
            if (currentUser.email_last_changed_at) {
                const lastChanged = new Date(currentUser.email_last_changed_at);
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

                if (lastChanged > thirtyDaysAgo) {
                    const nextAllowed = new Date(lastChanged);
                    nextAllowed.setDate(nextAllowed.getDate() + 30);
                    return res.status(429).json({
                        error: `Solo puedes cambiar tu email una vez cada 30 días. Próximo cambio disponible: ${nextAllowed.toLocaleDateString('es-ES')}`,
                    });
                }
            }

            // Check if email already exists
            const { data: existing } = await supabase
                .from('users')
                .select('id')
                .ilike('email', newEmail)
                .neq('id', req.userId)
                .maybeSingle();

            if (existing) {
                return res.status(409).json({ error: 'Ya existe una cuenta con este email' });
            }

            // Start verification flow
            const verificationToken = jwt.sign(
                { userId: req.userId, purpose: 'email_change', newEmail },
                config.jwtSecret,
                { expiresIn: '24h' }
            );

            try {
                await sendEmailChangeVerificationEmail(
                    newEmail,
                    currentUser.name,
                    verificationToken
                );
                updateData.pending_email = newEmail;
                emailChangePending = true;
            } catch (err) {
                console.error('Failed to send verification email', err);
                return res.status(500).json({ error: 'Error al enviar el email de verificación' });
            }
        }

        if (name) updateData.name = name.trim();
        if (phone !== undefined) updateData.phone = phone?.trim() || '';
        if (avatar !== undefined) updateData.avatar = avatar?.trim() || '';
        if (birthDate !== undefined) updateData.birth_date = birthDate || null;

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ error: 'No hay datos para actualizar' });
        }

        const { data: user, error } = await supabase
            .from('users')
            .update(updateData)
            .eq('id', req.userId)
            .select(
                'id, name, email, phone, avatar, role, created_at, birth_date, birth_date_verified, last_seen_at'
            )
            .single();

        if (error) throw error;
        res.json({
            user: {
                ...user,
                createdAt: user.created_at,
                birthDate: user.birth_date,
                birthDateVerified: user.birth_date_verified,
                lastSeenAt: user.last_seen_at,
            },
            emailChangePending,
            message: emailChangePending
                ? 'Perfil actualizado. Por favor, verifica tu nuevo email.'
                : 'Perfil actualizado correctamente',
        });
    })
);

// PUT /api/user/change-password
router.put(
    '/change-password',
    validate({
        currentPassword: { required: true, type: 'string' },
        newPassword: { ...passwordRule, required: true },
    }),
    asyncHandler(async (req: AuthRequest, res: Response) => {
        const { currentPassword, newPassword } = req.body;

        const { data: user, error } = await supabase
            .from('users')
            .select('password_hash')
            .eq('id', req.userId)
            .single();

        if (error || !user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        const isValid = await bcrypt.compare(currentPassword, user.password_hash);
        if (!isValid) {
            return res.status(401).json({ error: 'La contraseña actual es incorrecta' });
        }

        const newHash = await bcrypt.hash(newPassword, 10);
        await supabase.from('users').update({ password_hash: newHash }).eq('id', req.userId);

        res.json({ success: true, message: 'Contraseña actualizada correctamente' });
    })
);

// GET /api/user/addresses
router.get(
    '/addresses',
    asyncHandler(async (req: AuthRequest, res: Response) => {
        const { data: addresses, error } = await supabase
            .from('user_addresses')
            .select('id, label, street, house, apartment, city, postal_code, phone, is_default')
            .eq('user_id', req.userId)
            .order('is_default', { ascending: false });

        if (error) throw error;

        const formatted = addresses?.map(a => ({
            ...a,
            postalCode: a.postal_code,
            isDefault: a.is_default,
        }));

        res.json({ addresses: formatted });
    })
);

// POST /api/user/addresses
router.post(
    '/addresses',
    validate({
        street: { required: true, type: 'string', minLength: 3, maxLength: 200 },
        label: { type: 'string', maxLength: 50 },
        house: { type: 'string', maxLength: 50 },
        apartment: { type: 'string', maxLength: 100 },
        city: { type: 'string', maxLength: 100 },
        postalCode: { type: 'string', maxLength: 20 },
        phone: { type: 'string', maxLength: 30 },
    }),
    asyncHandler(async (req: AuthRequest, res: Response) => {
        const { label, street, house, apartment, city, postalCode, phone, isDefault } = req.body;

        if (isDefault) {
            await supabase
                .from('user_addresses')
                .update({ is_default: false })
                .eq('user_id', req.userId);
        }

        const { data: address, error } = await supabase
            .from('user_addresses')
            .insert({
                user_id: req.userId,
                label: label?.trim() || '',
                street: street.trim(),
                house: house?.trim() || '',
                apartment: apartment?.trim() || '',
                city: city?.trim() || '',
                postal_code: postalCode?.trim() || '',
                phone: phone?.trim() || '',
                is_default: !!isDefault,
            })
            .select()
            .single();

        if (error) throw error;

        res.status(201).json({
            address: {
                ...address,
                postalCode: address.postal_code,
                isDefault: address.is_default,
            },
        });
    })
);

// PUT /api/user/addresses/:id
router.put(
    '/addresses/:id',
    validate({
        street: { type: 'string', minLength: 3, maxLength: 200 },
        label: { type: 'string', maxLength: 50 },
        house: { type: 'string', maxLength: 50 },
        apartment: { type: 'string', maxLength: 100 },
        city: { type: 'string', maxLength: 100 },
        postalCode: { type: 'string', maxLength: 20 },
        phone: { type: 'string', maxLength: 30 },
    }),
    asyncHandler(async (req: AuthRequest, res: Response) => {
        const id = req.params.id;
        const { label, street, house, apartment, city, postalCode, phone, isDefault } = req.body;

        if (isDefault) {
            await supabase
                .from('user_addresses')
                .update({ is_default: false })
                .eq('user_id', req.userId);
        }

        const updateData: any = {};
        if (label !== undefined) updateData.label = label?.trim() || '';
        if (street !== undefined) updateData.street = street.trim();
        if (house !== undefined) updateData.house = house?.trim() || '';
        if (apartment !== undefined) updateData.apartment = apartment?.trim() || '';
        if (city !== undefined) updateData.city = city?.trim() || '';
        if (postalCode !== undefined) updateData.postal_code = postalCode?.trim() || '';
        if (phone !== undefined) updateData.phone = phone?.trim() || '';
        if (isDefault !== undefined) updateData.is_default = !!isDefault;

        const { data: address, error } = await supabase
            .from('user_addresses')
            .update(updateData)
            .eq('id', id)
            .eq('user_id', req.userId)
            .select()
            .single();

        if (error) return res.status(404).json({ error: 'Dirección no encontrada' });

        res.json({
            address: {
                ...address,
                postalCode: address.postal_code,
                isDefault: address.is_default,
            },
        });
    })
);

// DELETE /api/user/addresses/:id
router.delete(
    '/addresses/:id',
    asyncHandler(async (req: AuthRequest, res: Response) => {
        const { error } = await supabase
            .from('user_addresses')
            .delete()
            .eq('id', req.params.id)
            .eq('user_id', req.userId);

        if (error) return res.status(404).json({ error: 'Dirección no encontrada' });
        res.json({ success: true });
    })
);

// PUT /api/user/addresses/:id/default
router.put(
    '/addresses/:id/default',
    asyncHandler(async (req: AuthRequest, res: Response) => {
        const id = req.params.id;
        await supabase
            .from('user_addresses')
            .update({ is_default: false })
            .eq('user_id', req.userId);
        const { error } = await supabase
            .from('user_addresses')
            .update({ is_default: true })
            .eq('id', id)
            .eq('user_id', req.userId);

        if (error) return res.status(404).json({ error: 'Dirección no encontrada' });
        res.json({ success: true });
    })
);

// GET /api/user/favorites
router.get(
    '/favorites',
    asyncHandler(async (req: AuthRequest, res: Response) => {
        const { data: favorites, error } = await supabase
            .from('user_favorites')
            .select('menu_items(*)')
            .eq('user_id', req.userId);

        if (error) throw error;
        res.json({ favorites: favorites?.map(f => f.menu_items) || [] });
    })
);

// POST /api/user/favorites
router.post(
    '/favorites',
    validate({ menuItemId: { required: true, type: 'number' } }),
    asyncHandler(async (req: AuthRequest, res: Response) => {
        const { menuItemId } = req.body;

        const { data: exists } = await supabase
            .from('user_favorites')
            .select('id')
            .eq('user_id', req.userId)
            .eq('menu_item_id', menuItemId)
            .maybeSingle();

        if (exists) {
            await supabase.from('user_favorites').delete().eq('id', exists.id);
            res.json({ isFavorite: false });
        } else {
            await supabase
                .from('user_favorites')
                .insert({ user_id: req.userId, menu_item_id: menuItemId });
            res.json({ isFavorite: true });
        }
    })
);

// DELETE /api/user/profile — request account deletion (soft delete)
router.delete(
    '/profile',
    asyncHandler(async (req: AuthRequest, res: Response) => {
        const { error } = await supabase
            .from('users')
            .update({ deleted_at: new Date().toISOString() })
            .eq('id', req.userId);

        if (error) throw error;
        res.json({ success: true, message: 'Su cuenta ha sido marcada para eliminación.' });
    })
);

export default router;

// PUT /api/user/active — update last seen timestamp
router.put(
    '/active',
    asyncHandler(async (req: AuthRequest, res: Response) => {
        const { error } = await supabase
            .from('users')
            .update({ last_seen_at: new Date().toISOString() })
            .eq('id', req.userId);

        if (error) {
            // If column doesn't exist yet, we catch it gracefully on backend
            // but log it once for dev tracking
            if (error.code === '42703') {
                return res.status(200).json({ status: 'waiting_migration' });
            }
            throw error;
        }

        res.json({ success: true });
    })
);
