import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import { supabase } from '../db/supabase.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { validate, passwordRule } from '../middleware/validate.js';
import { strictLimiter } from '../middleware/rateLimiters.js';
import { formatUser } from '../utils/helpers.js';

const upload = multer({ storage: multer.memoryStorage() });

const router = Router();
router.use(authMiddleware);

// GET /api/user/profile
router.get(
    '/profile',
    asyncHandler(async (req: AuthRequest, res: Response) => {
        const { data: user, error: userError } = await supabase
            .from('users')
            .select(
                'id, name, email, phone, avatar, role, created_at, birth_date, birth_date_verified, last_seen_at, is_superadmin'
            )
            .eq('id', req.userId)
            .single();

        if (userError || !user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        const { data: addresses } = await supabase
            .from('user_addresses')
            .select(
                'id, label, street, house, apartment, city, postal_code, phone, is_default, lat, lon'
            )
            .eq('user_id', req.userId)
            .order('is_default', { ascending: false });

        const { count: orderCount } = await supabase
            .from('orders')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', req.userId);

        res.json({ user: formatUser(user, orderCount || 0, addresses || []) });
    })
);

// PUT /api/user/profile
router.put(
    '/profile',
    strictLimiter,
    validate({
        name: { type: 'string', minLength: 2, maxLength: 80 },
        email: { type: 'string', match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Email inválido' },
        phone: { type: 'string', maxLength: 30 },
        avatar: { type: 'string' },
        birthDate: { type: 'string' },
    }),
    asyncHandler(async (req: AuthRequest, res: Response) => {
        const { name, phone, avatar, birthDate } = req.body;

        const { data: currentUser, error: fetchError } = await supabase
            .from('users')
            .select(
                'email, email_last_changed_at, name, phone, birth_date, profile_last_changed_at'
            )
            .eq('id', req.userId)
            .single();

        if (fetchError || !currentUser) throw new Error('Usuario no encontrado');

        const updateData: any = {};

        // 1. Name, Phone, BirthDate Change Cooldown (Shared 30-day limit)
        const isNameChanging = name && name.trim() !== (currentUser.name || '');
        const isPhoneChanging = phone !== undefined && phone?.trim() !== (currentUser.phone || '');
        const isBirthDateChanging = birthDate !== undefined && birthDate !== currentUser.birth_date;

        if (isNameChanging || isPhoneChanging || isBirthDateChanging) {
            if (currentUser.profile_last_changed_at) {
                const lastChanged = new Date(currentUser.profile_last_changed_at);
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

                if (lastChanged > thirtyDaysAgo) {
                    const nextAllowed = new Date(lastChanged);
                    nextAllowed.setDate(nextAllowed.getDate() + 30);
                    return res.status(429).json({
                        error: `Solo puedes modificar tu nombre, teléfono o cumpleaños una vez cada 30 días. Disponible: ${nextAllowed.toLocaleDateString('es-ES')}`,
                    });
                }
            }
            updateData.profile_last_changed_at = new Date().toISOString();
        }

        if (name) updateData.name = name.trim();
        if (phone !== undefined) updateData.phone = phone?.trim() || '';
        if (avatar !== undefined) updateData.avatar = avatar?.trim() || '';
        if (birthDate !== undefined) {
            if (birthDate) {
                const birthYear = new Date(birthDate).getFullYear();
                if (birthYear < 1945) {
                    return res
                        .status(400)
                        .json({ error: 'El año de nacimiento no puede ser inferior a 1945' });
                }
                const tomorrow = new Date();
                tomorrow.setHours(23, 59, 59, 999);
                if (new Date(birthDate) > tomorrow) {
                    return res
                        .status(400)
                        .json({ error: 'La fecha de nacimiento no puede ser en el futuro' });
                }
            }
            updateData.birth_date = birthDate || null;
        }

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ error: 'No hay datos para actualizar' });
        }

        const { data: user, error } = await supabase
            .from('users')
            .update(updateData)
            .eq('id', req.userId)
            .select(
                'id, name, email, phone, avatar, role, created_at, birth_date, birth_date_verified, last_seen_at, is_superadmin'
            )
            .single();

        if (error) throw error;
        res.json({
            user: {
                ...user,
                createdAt: user.created_at,
                birthDate: user.birth_date,
                isBirthDateVerified: user.birth_date_verified,
                lastSeenAt: user.last_seen_at,
            },
            message: 'Perfil actualizado correctamente',
        });
    })
);

// POST /api/user/upload-avatar
router.post(
    '/upload-avatar',
    upload.single('avatar'),
    asyncHandler(async (req: AuthRequest, res: Response) => {
        if (!req.file) {
            return res.status(400).json({ error: 'No se subió ninguna imagen' });
        }

        const file = req.file;
        const fileExt = file.originalname.split('.').pop();
        const fileName = `${req.userId}-${Date.now()}.${fileExt}`;
        const filePath = `avatars/${fileName}`;

        // Upload to Supabase Storage 'images' bucket
        const { error: uploadError } = await supabase.storage
            .from('images')
            .upload(filePath, file.buffer, {
                contentType: file.mimetype,
                upsert: true,
            });

        if (uploadError) {
            console.error('❌ Supabase storage error:', uploadError);
            return res.status(500).json({
                error: 'Error al subir la imagen a Supabase Storage',
                details: uploadError.message,
            });
        }

        // Get Public URL
        const {
            data: { publicUrl },
        } = supabase.storage.from('images').getPublicUrl(filePath);

        // Update user profile with new avatar URL
        const { data: user, error: updateError } = await supabase
            .from('users')
            .update({ avatar: publicUrl })
            .eq('id', req.userId)
            .select(
                'id, name, email, phone, avatar, role, created_at, birth_date, birth_date_verified, last_seen_at, is_superadmin'
            )
            .single();

        if (updateError) throw updateError;

        res.json({
            url: publicUrl,
            user: {
                ...user,
                createdAt: user.created_at,
                birthDate: user.birth_date,
                isBirthDateVerified: user.birth_date_verified,
                lastSeenAt: user.last_seen_at,
            },
            message: 'Foto de perfil actualizada correctamente',
        });
    })
);

// PUT /api/user/change-password
router.put(
    '/change-password',
    strictLimiter,
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
            .select(
                'id, label, street, house, apartment, city, postal_code, phone, is_default, lat, lon'
            )
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
        lat: { type: 'number' },
        lon: { type: 'number' },
    }),
    asyncHandler(async (req: AuthRequest, res: Response) => {
        const { label, street, house, apartment, city, postalCode, phone, isDefault, lat, lon } =
            req.body;

        if (isDefault) {
            await supabase
                .from('user_addresses')
                .update({ is_default: false })
                .eq('user_id', req.userId);
        }

        // Check for existing duplicate with robust NULL/empty equality
        const { data: userAddresses } = await supabase
            .from('user_addresses')
            .select('id, street, house, apartment, phone, lat, lon')
            .eq('user_id', req.userId);

        const targetStreet = street.trim().toLowerCase();
        const targetHouse = (house?.trim() || '').toLowerCase();
        const targetApartment = (apartment?.trim() || '').toLowerCase();

        const existing = userAddresses?.find(addr => {
            const s = (addr.street || '').trim().toLowerCase();
            const h = (addr.house || '').trim().toLowerCase();
            const a = (addr.apartment || '').trim().toLowerCase();
            return s === targetStreet && h === targetHouse && a === targetApartment;
        });

        if (existing) {
            // Update to set as default if requested, and FILL coordinates if they are now provided
            const updateData: any = {};
            if (isDefault) updateData.is_default = true;
            if (lat !== undefined) updateData.lat = lat;
            if (lon !== undefined) updateData.lon = lon;
            if (phone && !existing.phone) updateData.phone = phone;

            if (Object.keys(updateData).length > 0) {
                await supabase.from('user_addresses').update(updateData).eq('id', existing.id);
            }

            return res.json({
                address: {
                    id: existing.id,
                    street: street.trim(),
                    house: house?.trim() || '',
                    apartment: apartment?.trim() || '',
                    postalCode: postalCode?.trim() || '',
                    isDefault: !!isDefault,
                    lat: lat ?? existing.lat,
                    lon: lon ?? existing.lon,
                },
                message: 'Address updated/exists',
            });
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
                lat: lat,
                lon: lon,
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
        lat: { type: 'number' },
        lon: { type: 'number' },
    }),
    asyncHandler(async (req: AuthRequest, res: Response) => {
        const id = req.params.id;
        const { label, street, house, apartment, city, postalCode, phone, isDefault, lat, lon } =
            req.body;

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
        if (lat !== undefined) updateData.lat = lat;
        if (lon !== undefined) updateData.lon = lon;

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
                lat: address.lat,
                lon: address.lon,
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
            // Track in analytics (ignore error if table not migrated yet)
            await supabase.from('menu_item_analytics').insert({
                menu_item_id: menuItemId,
                event_type: 'favorite_add',
                user_id: req.userId,
            });

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
