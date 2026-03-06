import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { getDb } from '../db/database.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { validate, emailRule, passwordRule } from '../middleware/validate.js';

const router = Router();
router.use(authMiddleware);

// GET /api/user/profile
router.get('/profile', asyncHandler(async (req: AuthRequest, res: Response) => {
    const db = getDb();
    const user = db.prepare('SELECT id, name, email, phone, avatar, role, created_at AS createdAt FROM users WHERE id = ?').get(req.userId) as any;

    if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const addresses = db.prepare('SELECT id, label, street, city, postal_code AS postalCode, phone, is_default AS isDefault FROM user_addresses WHERE user_id = ? ORDER BY is_default DESC').all(req.userId);
    const orderCount = db.prepare('SELECT COUNT(*) as count FROM orders WHERE user_id = ?').get(req.userId) as any;

    res.json({ user: { ...user, addresses, orderCount: orderCount.count } });
}));

// PUT /api/user/profile — update name, email, phone, avatar
router.put(
    '/profile',
    validate({
        name: { type: 'string', minLength: 2, maxLength: 80 },
        email: { type: 'string', match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Email inválido' },
        phone: { type: 'string', maxLength: 30 },
        avatar: { type: 'string' },
    }),
    asyncHandler(async (req: AuthRequest, res: Response) => {
        const { name, email, phone, avatar } = req.body;

        const db = getDb();

        if (email) {
            const existing = db.prepare('SELECT id FROM users WHERE LOWER(email) = LOWER(?) AND id != ?').get(email, req.userId);
            if (existing) {
                return res.status(409).json({ error: 'Ya existe una cuenta con este email' });
            }
        }

        const updates: string[] = [];
        const values: any[] = [];

        if (name) { updates.push('name = ?'); values.push(name.trim()); }
        if (email) { updates.push('email = ?'); values.push(email.toLowerCase().trim()); }
        if (phone !== undefined) { updates.push('phone = ?'); values.push(phone?.trim() || ''); }
        if (avatar !== undefined) { updates.push('avatar = ?'); values.push(avatar?.trim() || ''); }

        if (updates.length === 0) {
            return res.status(400).json({ error: 'No hay datos para actualizar' });
        }

        values.push(req.userId);
        db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`).run(...values);

        const user = db.prepare('SELECT id, name, email, phone, avatar, role, created_at AS createdAt FROM users WHERE id = ?').get(req.userId);
        res.json({ user });
    })
);

// PUT /api/user/change-password — change password (requires current password)
router.put(
    '/change-password',
    validate({
        currentPassword: { required: true, type: 'string' },
        newPassword: { ...passwordRule, required: true },
    }),
    asyncHandler(async (req: AuthRequest, res: Response) => {
        const { currentPassword, newPassword } = req.body;

        const db = getDb();
        const user = db.prepare('SELECT password_hash FROM users WHERE id = ?').get(req.userId) as any;

        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        const isValid = await bcrypt.compare(currentPassword, user.password_hash);
        if (!isValid) {
            return res.status(401).json({ error: 'La contraseña actual es incorrecta' });
        }

        const newHash = await bcrypt.hash(newPassword, 10);
        db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(newHash, req.userId);

        res.json({ success: true, message: 'Contraseña actualizada correctamente' });
    })
);

// GET /api/user/addresses
router.get('/addresses', asyncHandler(async (req: AuthRequest, res: Response) => {
    const db = getDb();
    const addresses = db.prepare('SELECT id, label, street, city, postal_code AS postalCode, phone, is_default AS isDefault FROM user_addresses WHERE user_id = ? ORDER BY is_default DESC').all(req.userId);
    res.json({ addresses });
}));

// POST /api/user/addresses
router.post(
    '/addresses',
    validate({
        street: { required: true, type: 'string', minLength: 3, maxLength: 200 },
        label: { type: 'string', maxLength: 50 },
        city: { type: 'string', maxLength: 100 },
        postalCode: { type: 'string', maxLength: 20 },
        phone: { type: 'string', maxLength: 30 },
    }),
    asyncHandler(async (req: AuthRequest, res: Response) => {
        const { label, street, city, postalCode, phone, isDefault } = req.body;

        const db = getDb();

        if (isDefault) {
            db.prepare('UPDATE user_addresses SET is_default = 0 WHERE user_id = ?').run(req.userId);
        }

        const result = db.prepare(`
            INSERT INTO user_addresses (user_id, label, street, city, postal_code, phone, is_default)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(req.userId, label?.trim() || '', street.trim(), city?.trim() || '', postalCode?.trim() || '', phone?.trim() || '', isDefault ? 1 : 0);

        const address = db.prepare('SELECT id, label, street, city, postal_code AS postalCode, phone, is_default AS isDefault FROM user_addresses WHERE id = ?').get(result.lastInsertRowid);
        res.status(201).json({ address });
    })
);

// PUT /api/user/addresses/:id — edit address
router.put(
    '/addresses/:id',
    validate({
        street: { type: 'string', minLength: 3, maxLength: 200 },
        label: { type: 'string', maxLength: 50 },
        city: { type: 'string', maxLength: 100 },
        postalCode: { type: 'string', maxLength: 20 },
        phone: { type: 'string', maxLength: 30 },
    }),
    asyncHandler(async (req: AuthRequest, res: Response) => {
        const id = parseInt(req.params.id);

        if (isNaN(id)) {
            return res.status(400).json({ error: 'ID de dirección inválido' });
        }

        const { label, street, city, postalCode, phone, isDefault } = req.body;
        const db = getDb();

        // Check ownership
        const existing = db.prepare('SELECT id FROM user_addresses WHERE id = ? AND user_id = ?').get(id, req.userId);
        if (!existing) {
            return res.status(404).json({ error: 'Dirección no encontrada' });
        }

        if (isDefault) {
            db.prepare('UPDATE user_addresses SET is_default = 0 WHERE user_id = ?').run(req.userId);
        }

        const updates: string[] = [];
        const values: any[] = [];

        if (label !== undefined) { updates.push('label = ?'); values.push(label?.trim() || ''); }
        if (street !== undefined) { updates.push('street = ?'); values.push(street.trim()); }
        if (city !== undefined) { updates.push('city = ?'); values.push(city?.trim() || ''); }
        if (postalCode !== undefined) { updates.push('postal_code = ?'); values.push(postalCode?.trim() || ''); }
        if (phone !== undefined) { updates.push('phone = ?'); values.push(phone?.trim() || ''); }
        if (isDefault !== undefined) { updates.push('is_default = ?'); values.push(isDefault ? 1 : 0); }

        if (updates.length === 0) {
            return res.status(400).json({ error: 'No hay datos para actualizar' });
        }

        values.push(id);
        db.prepare(`UPDATE user_addresses SET ${updates.join(', ')} WHERE id = ?`).run(...values);

        const address = db.prepare('SELECT id, label, street, city, postal_code AS postalCode, phone, is_default AS isDefault FROM user_addresses WHERE id = ?').get(id);
        res.json({ address });
    })
);

// DELETE /api/user/addresses/:id
router.delete('/addresses/:id', asyncHandler(async (req: AuthRequest, res: Response) => {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
        return res.status(400).json({ error: 'ID de dirección inválido' });
    }

    const db = getDb();
    const result = db.prepare('DELETE FROM user_addresses WHERE id = ? AND user_id = ?').run(id, req.userId);

    if (result.changes === 0) {
        return res.status(404).json({ error: 'Dirección no encontrada' });
    }

    res.json({ success: true });
}));

// PUT /api/user/addresses/:id/default — set as default
router.put('/addresses/:id/default', asyncHandler(async (req: AuthRequest, res: Response) => {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
        return res.status(400).json({ error: 'ID de dirección inválido' });
    }

    const db = getDb();
    db.prepare('UPDATE user_addresses SET is_default = 0 WHERE user_id = ?').run(req.userId);
    const result = db.prepare('UPDATE user_addresses SET is_default = 1 WHERE id = ? AND user_id = ?').run(id, req.userId);

    if (result.changes === 0) {
        return res.status(404).json({ error: 'Dirección no encontrada' });
    }

    res.json({ success: true });
}));

// GET /api/user/favorites
router.get('/favorites', asyncHandler(async (req: AuthRequest, res: Response) => {
    const db = getDb();
    const favorites = db.prepare(`
        SELECT mi.* 
        FROM user_favorites uf
        JOIN menu_items mi ON uf.menu_item_id = mi.id
        WHERE uf.user_id = ?
    `).all(req.userId);
    res.json({ favorites });
}));

// POST /api/user/favorites — toggle favorite
router.post(
    '/favorites',
    validate({ menuItemId: { required: true, type: 'number' } }),
    asyncHandler(async (req: AuthRequest, res: Response) => {
        const { menuItemId } = req.body;
        const db = getDb();

        const exists = db.prepare('SELECT id FROM user_favorites WHERE user_id = ? AND menu_item_id = ?').get(req.userId, menuItemId);

        if (exists) {
            db.prepare('DELETE FROM user_favorites WHERE user_id = ? AND menu_item_id = ?').run(req.userId, menuItemId);
            res.json({ isFavorite: false });
        } else {
            db.prepare('INSERT INTO user_favorites (user_id, menu_item_id) VALUES (?, ?)').run(req.userId, menuItemId);
            res.json({ isFavorite: true });
        }
    })
);

export default router;
