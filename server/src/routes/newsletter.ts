import { Router, Response } from 'express';
import { supabase } from '../db/supabase.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { validate, emailRule } from '../middleware/validate.js';
import { strictLimiter } from '../middleware/rateLimiters.js';
import { sendNewsletterWelcomeEmail } from '../utils/email.js';

const router = Router();

// POST /api/newsletter/subscribe
router.post(
    '/subscribe',
    strictLimiter,
    validate({ email: emailRule }),
    asyncHandler(async (req, res: Response) => {
        const { email } = req.body;
        const normalizedEmail = email.toLowerCase().trim();

        // 1. Check if already subscribed in newsletter table
        const { data: existing } = await supabase
            .from('newsletter_subscribers')
            .select('id')
            .eq('email', normalizedEmail)
            .maybeSingle();

        if (existing) {
            return res.status(409).json({ error: 'Ya estás suscrito a nuestra newsletter' });
        }

        // 2. Generate promo code
        const promoSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
        const promoCode = `NUEVO5-${promoSuffix}`;

        // 3. Insert subscriber
        const { error: insertError } = await supabase
            .from('newsletter_subscribers')
            .insert({ email: normalizedEmail });

        if (insertError) throw insertError;

        // 4. Create promo code in DB
        // Note: we don't link user_id here as the person might not have an account yet
        await supabase.from('promo_codes').insert({
            code: promoCode,
            discount_percentage: 5,
            is_used: false,
        });

        // 5. Send email
        try {
            await sendNewsletterWelcomeEmail(normalizedEmail, promoCode);
        } catch (e) {
            console.error('Newsletter SMTP Error:', e);
            // We don't fail the request if email fails, but log it
        }

        res.json({ success: true, message: '¡Suscripción confirmada! Revisa tu email.' });
    })
);

export default router;
