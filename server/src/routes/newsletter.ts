import { Router, Response } from 'express';
import { supabase } from '../db/supabase.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { validateResource } from '../middleware/validateResource.js';
import { subscribeSchema } from '../schemas/newsletter.schema.js';
import { strictLimiter } from '../middleware/rateLimiters.js';
import { sendNewsletterWelcomeEmail } from '../utils/email.js';

const router = Router();

// POST /api/newsletter/subscribe
router.post(
    '/subscribe',
    strictLimiter,
    validateResource(subscribeSchema),
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

        // 2. Fetch newsletter settings
        const { data: settingsData } = await supabase
            .from('site_settings')
            .select('key, value')
            .in('key', ['newsletter_bonus_enabled', 'newsletter_bonus_percent']);

        const settings: Record<string, string> = {};
        settingsData?.forEach(s => (settings[s.key] = s.value));

        const isEnabled = settings['newsletter_bonus_enabled'] === 'true';
        const discountPercent = parseInt(settings['newsletter_bonus_percent']) || 5;

        // 3. Insert subscriber
        const { error: insertError } = await supabase
            .from('newsletter_subscribers')
            .insert({ email: normalizedEmail });

        if (insertError) throw insertError;

        // 4. Handle Promo Code (if enabled)
        if (isEnabled) {
            const promoSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
            const promoCode = `NUEVO${discountPercent}-${promoSuffix}`;

            // Create promo code in DB
            await supabase.from('promo_codes').insert({
                code: promoCode,
                discount_percentage: discountPercent,
                is_used: false,
            });

            // 5. Send email
            try {
                await sendNewsletterWelcomeEmail(normalizedEmail, promoCode, discountPercent);
            } catch (e) {
                console.error('Newsletter SMTP Error:', e);
            }

            return res.json({
                success: true,
                message: '¡Suscripción confirmada! Revisa tu email para tu regalo.',
            });
        }

        res.json({ success: true, message: '¡Gracias по подписку! Мы будем держать тебя в курсе.' });
    })
);

export default router;
