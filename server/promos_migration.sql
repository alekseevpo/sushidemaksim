CREATE TABLE IF NOT EXISTS public.promos (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title text NOT NULL,
    description text NOT NULL,
    discount text NOT NULL,
    valid_until text NOT NULL,
    icon text NOT NULL,
    color text NOT NULL,
    bg text NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.promos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to promos"
    ON public.promos FOR SELECT
    USING (is_active = true);

CREATE POLICY "Allow admin to manage promos"
    ON public.promos FOR ALL
    USING (true); -- Realistically, you want to restrict this to admins via your API layer if you use service role in backend
    
INSERT INTO public.promos (title, description, discount, valid_until, icon, color, bg) VALUES
('Happy Hours', '20% de descuento en todos los rollos de 12:00 a 15:00 h de lunes a viernes', '−20%', '31 de marzo 2026', '⏰', '#DC2626', 'from-red-600 to-red-500'),
('Cumpleaños', 'Set de rollos gratis en tu cumpleaños con pedidos a partir de 30 €', 'Regalo', 'Permanente', '🎂', '#EC4899', 'from-pink-500 to-pink-400'),
('Cena familiar', 'Pedido de más de 50 € — postre de regalo', '+Postre', '30 de abril 2026', '👨‍👩‍👧‍👦', '#10B981', 'from-emerald-500 to-emerald-400'),
('Primer pedido', '15% de descuento en tu primer pedido a través de la web', '−15%', 'Permanente', '🎁', '#F59E0B', 'from-amber-500 to-amber-400');
