CREATE TABLE IF NOT EXISTS public.site_settings (
    key text PRIMARY KEY,
    value text NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to settings"
    ON public.site_settings FOR SELECT
    USING (true);

CREATE POLICY "Allow admin to manage settings"
    ON public.site_settings FOR ALL
    USING (true);

INSERT INTO public.site_settings (key, value) VALUES
('contact_phone', '+34 641 518 390'),
('contact_email', 'info@sushidemaksim.com'),
('contact_address_line1', 'Calle Barrilero, 20,'),
('contact_address_line2', '28007 Madrid'),
('contact_google_maps_url', 'https://www.google.com/maps/search/?api=1&query=Calle+Barrilero,+20,+28007+Madrid'),
('contact_schedule', '[{"days": "Miércoles - Viernes", "hours": "20:00 - 23:00"}, {"days": "Sábado - Domingo", "hours": "14:00 - 17:00 y 20:00 - 23:00"}, {"days": "Lunes - Martes", "hours": "Cerrado", "closed": true}]'),
('social_links', '[{"platform": "WhatsApp", "url": "https://wa.me/34624682795", "icon": "whatsapp"}, {"platform": "TikTok", "url": "#", "icon": "tiktok"}, {"platform": "Instagram", "url": "#", "icon": "instagram"}, {"platform": "Facebook", "url": "#", "icon": "facebook"}]')
ON CONFLICT (key) DO NOTHING;
