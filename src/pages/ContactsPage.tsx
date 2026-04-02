import { useState, useEffect } from 'react';
import {
    MapPin,
    Phone,
    Mail,
    Clock,
    Instagram,
    Facebook,
    ArrowRight,
    Utensils,
    Send,
    Calendar,
    Loader2,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '../utils/api';
import SEO from '../components/SEO';
import { Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { getOptimizedImageUrl } from '../utils/images';

const iconMap: Record<string, any> = {
    whatsapp: (props: any) => (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
            <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1" />
        </svg>
    ),
    instagram: Instagram,
    facebook: Facebook,
    thefork: Utensils,
};

const ContactInfoCard = ({
    icon: Icon,
    title,
    content,
    subContent,
    link,
    linkText,
    colorClass,
    delay,
}: any) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay }}
        className="premium-card p-6 md:p-8 flex flex-col group"
    >
        <div
            className={`w-12 h-12 ${colorClass} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
        >
            <Icon size={24} strokeWidth={1.5} className="text-gray-900" />
        </div>
        <h3 className="text-lg font-black text-gray-900 mb-2 uppercase tracking-tight">{title}</h3>
        <p className="text-gray-900 font-bold mb-1">{content}</p>
        <p className="text-gray-500 text-sm mb-6 flex-grow leading-relaxed">{subContent}</p>
        {link && (
            <a
                href={link}
                target={link.startsWith('http') ? '_blank' : undefined}
                rel={link.startsWith('http') ? 'noopener noreferrer' : undefined}
                className="text-sm font-black text-orange-600 hover:text-black inline-flex items-center gap-2 transition-colors group/link"
            >
                {linkText}
                <ArrowRight
                    size={14}
                    className="group-hover/link:translate-x-1 transition-transform"
                />
            </a>
        )}
    </motion.div>
);

export default function ContactsPage() {
    const { success: showSuccess, error: showError } = useToast();
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: '',
    });

    const [settings, setSettings] = useState<any>({
        contact_phone: '+34 631 920 312',
        contact_email: 'info@sushidemaksim.com',
        contact_address_line1: 'Calle Barrilero, 20,',
        contact_address_line2: '28007 Madrid',
        contact_google_maps_url: '',
        contact_schedule: [
            { days: 'lunes', hours: 'Cerrado', closed: true },
            { days: 'martes', hours: 'Cerrado', closed: true },
            { days: 'miércoles', hours: '20:00–23:00' },
            { days: 'jueves (Día del padre)', hours: '20:00–23:00' },
            { days: 'viernes', hours: '20:00–23:00' },
            { days: 'sábado', hours: '14:00–17:00 / 20:00–23:00' },
            { days: 'domingo', hours: '14:00–17:00' },
        ],
        social_links: [
            { platform: 'WhatsApp', url: 'https://wa.me/34631920312', icon: 'whatsapp' },
            { platform: 'Instagram', url: '#', icon: 'instagram' },
        ],
    });

    useEffect(() => {
        api.get('/settings')
            .then(data => {
                if (data && Object.keys(data).length > 0) {
                    setSettings((prev: any) => ({
                        ...prev,
                        ...data,
                        contact_schedule:
                            data.contact_schedule && data.contact_schedule.length > 0
                                ? data.contact_schedule
                                : prev.contact_schedule,
                    }));
                }
            })
            .catch(console.error);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name || !formData.email || !formData.message) {
            showError('Por favor, rellena todos los campos.');
            return;
        }

        setSubmitting(true);

        try {
            await api.post('/contact', {
                ...formData,
            });

            showSuccess('¡Mensaje enviado con éxito! Te responderemos pronto.');
            setFormData({ name: '', email: '', message: '' });
        } catch (err: any) {
            showError(err.message || 'Error al enviar el mensaje.');
        } finally {
            setSubmitting(false);
        }
    };

    const fullAddress =
        `${settings.contact_address_line1} ${settings.contact_address_line2}`.trim();
    const mapsUrl =
        settings.contact_google_maps_url ||
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`;

    return (
        <div className="min-h-screen bg-transparent pt-0">
            <SEO
                title="Contacto y Ubicación — Sushi de Maksim Madrid"
                description="Visítanos en Madrid o haz tu pedido de sushi a domicilio. Dirección: Calle del Barrilero, 20. Teléfono: +34 631 920 312. ¡Te esperamos para ofrecerte el mejor sushi artesanal!"
                keywords="contacto sushi madrid, direccion sushi de maksim, telefono sushi madrid, pedir sushi domicilio madrid"
                schema={{
                    '@context': 'https://schema.org',
                    '@type': 'LocalBusiness',
                    name: 'Sushi de Maksim',
                    image: 'https://sushidemaksim.com/sushi-hero.webp',
                    telephone: '+34631920312',
                    email: 'info@sushidemaksim.com',
                    address: {
                        '@type': 'PostalAddress',
                        streetAddress: 'Calle del Barrilero, 20',
                        addressLocality: 'Madrid',
                        postalCode: '28007',
                        addressCountry: 'ES',
                    },
                    geo: {
                        '@type': 'GeoCoordinates',
                        latitude: 40.397042,
                        longitude: -3.672449,
                    },
                    url: 'https://sushidemaksim.com/contacts',
                    openingHoursSpecification: [
                        {
                            '@type': 'OpeningHoursSpecification',
                            dayOfWeek: [
                                'Monday',
                                'Tuesday',
                                'Wednesday',
                                'Thursday',
                                'Friday',
                                'Saturday',
                                'Sunday',
                            ],
                            opens: '12:00',
                            closes: '23:30',
                        },
                    ],
                }}
            />

            {/* Hero Section styled like BlogPage */}
            <section className="relative h-[40vh] overflow-hidden flex items-center justify-center bg-black">
                <div className="absolute inset-0 z-0">
                    <img
                        src={getOptimizedImageUrl('/images/promos/promo_hero_bg.png', 1080)}
                        alt="Contacto Sushi de Maksim"
                        {...({ fetchpriority: 'high' } as any)}
                        decoding="async"
                        className="w-full h-full object-cover opacity-40 scale-105"
                    />
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="relative z-10 text-center px-4"
                >
                    <span className="inline-block px-3 py-1 bg-orange-600 text-white text-[11px] font-bold rounded-full mb-4 tracking-widest uppercase">
                        Estamos a tu disposición
                    </span>
                    <h1 className="text-4xl md:text-6xl font-black text-white mb-4 drop-shadow-lg">
                        Contacto & <span className="text-orange-500 italic">Soporte</span>
                    </h1>
                    <p className="text-gray-300 max-w-xl mx-auto text-sm md:text-base font-medium">
                        ¿Tienes dudas o quieres hacer un pedido especial? ¡Hablemos!
                    </p>
                </motion.div>
            </section>

            <div className="max-w-7xl mx-auto px-2 md:px-4 -mt-10 relative z-20">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 md:mb-24">
                    <ContactInfoCard
                        icon={Phone}
                        title="Llámanos"
                        content={settings.contact_phone}
                        subContent="Atención telefónica directa para pedidos y consultas."
                        link={`tel:${settings.contact_phone?.replace(/\s/g, '')}`}
                        linkText="Llamar ahora"
                        colorClass="bg-amber-100/50"
                        delay={0.1}
                    />
                    <ContactInfoCard
                        icon={MapPin}
                        title="Visítanos"
                        content={fullAddress}
                        subContent="Nuestra cocina central en el corazón de Retiro."
                        link={mapsUrl}
                        linkText="Ver en Google Maps"
                        colorClass="bg-blue-100/50"
                        delay={0.2}
                    />
                    <ContactInfoCard
                        icon={Mail}
                        title="Email"
                        content={settings.contact_email}
                        subContent="Para eventos especiales, colaboraciones o prensa."
                        link={`mailto:${settings.contact_email}`}
                        linkText="Enviar email"
                        colorClass="bg-orange-100/50"
                        delay={0.3}
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-start">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="lg:col-span-12 xl:col-span-5 bg-gray-50 px-4 py-8 md:p-10 rounded-[2rem] border border-gray-100 relative overflow-hidden order-2 xl:order-1"
                    >
                        <div className="relative z-10">
                            <h2 className="text-2xl md:text-3xl font-black mb-2 tracking-tight">
                                Envíanos un mensaje
                            </h2>
                            <p className="text-gray-500 mb-8 md:mb-10 font-medium text-sm md:text-base">
                                Te responderemos en menos de 24h.
                            </p>

                            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
                                            Tu nombre
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={e =>
                                                setFormData(prev => ({
                                                    ...prev,
                                                    name: e.target.value,
                                                }))
                                            }
                                            required
                                            disabled={submitting}
                                            placeholder="Nombre completo"
                                            className="w-full bg-white border border-gray-200 px-5 py-3 md:py-4 rounded-xl md:rounded-2xl outline-none focus:border-orange-500 transition-all font-medium text-base disabled:opacity-50"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
                                            Tu email
                                        </label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={e =>
                                                setFormData(prev => ({
                                                    ...prev,
                                                    email: e.target.value,
                                                }))
                                            }
                                            required
                                            disabled={submitting}
                                            placeholder="tu@email.com"
                                            className="w-full bg-white border border-gray-200 px-5 py-3 md:py-4 rounded-xl md:rounded-2xl outline-none focus:border-orange-500 transition-all font-medium text-base disabled:opacity-50"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
                                        Tu mensaje
                                    </label>
                                    <textarea
                                        rows={4}
                                        value={formData.message}
                                        onChange={e =>
                                            setFormData(prev => ({
                                                ...prev,
                                                message: e.target.value,
                                            }))
                                        }
                                        required
                                        disabled={submitting}
                                        placeholder="¿En qué podemos ayudarte?"
                                        className="w-full bg-white border border-gray-200 px-5 py-3 md:py-4 rounded-xl md:rounded-2xl outline-none focus:border-orange-500 transition-all font-medium resize-none text-base disabled:opacity-50"
                                    ></textarea>
                                </div>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full bg-gray-900 text-white font-black py-4 md:py-5 rounded-xl md:rounded-2xl hover:bg-black transition-all shadow-lg flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {submitting ? (
                                        <>
                                            <Loader2 size={18} className="animate-spin" />
                                            ENVIANDO...
                                        </>
                                    ) : (
                                        <>
                                            ENVIAR MENSAJE
                                            <Send size={18} />
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </motion.div>

                    <div className="lg:col-span-12 xl:col-span-7 space-y-6 md:space-y-8 order-1 xl:order-2">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.98 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="bg-white rounded-[2rem] overflow-hidden border border-gray-100 h-[300px] md:h-[450px] shadow-sm relative group"
                        >
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3038.563914856037!2d-3.674640123441!3d40.397042071442!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd42272e4ed3b2e5%3A0xe719cdfe984d9b8!2sSushi%20de%20Maksim!5e0!3m2!1ses!2ses!4v1709700000000!5m2!1ses!2ses"
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                allowFullScreen
                                loading="lazy"
                                title="Ubicación"
                                className="group-hover:scale-105 transition-transform duration-1000"
                            ></iframe>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="bg-gray-50 p-6 md:p-8 rounded-[2rem] border border-gray-100"
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <Clock size={20} className="text-gray-900" />
                                <h3 className="font-black text-lg uppercase tracking-tight">
                                    Horario
                                </h3>
                            </div>
                            <div className="max-w-2xl">
                                <div className="space-y-4">
                                    {settings.contact_schedule?.map((item: any, idx: number) => (
                                        <div
                                            key={idx}
                                            className="flex justify-between items-start pb-2 border-b border-gray-100 last:border-0 last:pb-0"
                                        >
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                                {item.days}
                                            </span>
                                            <span
                                                className={`text-sm font-black text-right ${item.closed ? 'text-orange-500' : 'text-gray-900'}`}
                                            >
                                                {item.hours}
                                            </span>
                                        </div>
                                    ))}

                                    <div className="pt-6 mt-6 border-t border-gray-100">
                                        <div className="flex items-center gap-2 mb-4 text-orange-600">
                                            <Calendar size={14} strokeWidth={2.5} />
                                            <span className="text-[10px] font-black uppercase tracking-widest">
                                                Próximos Festivos
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {[
                                                { name: 'Jueves Santo', date: '2 Abr' },
                                                { name: 'Viernes Santo', date: '3 Abr' },
                                                { name: 'Fiesta del Trabajo', date: '1 May' },
                                                { name: 'Comunidad de Madrid', date: '2 May' },
                                                { name: 'San Isidro', date: '15 May' },
                                            ].map((holiday, hIdx) => (
                                                <div
                                                    key={hIdx}
                                                    className="flex justify-between items-center bg-white/50 p-3 rounded-xl border border-gray-50"
                                                >
                                                    <span className="text-[11px] font-bold text-gray-600">
                                                        {holiday.name} ({holiday.date})
                                                    </span>
                                                    <a
                                                        href={`https://wa.me/34631920312?text=${encodeURIComponent(`Hola, me gustaría confirmar el horario para el festivo ${holiday.name} (${holiday.date})`)}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[9px] font-black uppercase tracking-tight hover:bg-emerald-100 transition-colors border border-emerald-100/50"
                                                    >
                                                        {iconMap.whatsapp({
                                                            size: 10,
                                                            strokeWidth: 2.5,
                                                        })}
                                                        Consultar
                                                    </a>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="mt-4 flex items-center gap-3 bg-amber-50 p-4 rounded-xl border border-amber-200 shadow-sm transition-all hover:bg-amber-100/50">
                                            <div className="w-8 h-8 bg-amber-200 rounded-lg flex items-center justify-center text-amber-900">
                                                {iconMap.whatsapp({ size: 16, strokeWidth: 2.5 })}
                                            </div>
                                            <p className="text-xs text-amber-900 font-black leading-tight m-0">
                                                Consultar horario especial en días festivos
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            <section className="px-4 pb-16 md:pb-24">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="max-w-7xl mx-auto bg-orange-600 rounded-[2rem] md:rounded-[3rem] px-5 py-10 md:p-24 text-center text-white relative overflow-hidden shadow-2xl shadow-orange-200"
                >
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/asfalt-dark.png')] opacity-10"></div>
                    <div className="relative z-10 max-w-3xl mx-auto">
                        <h2 className="text-2xl md:text-6xl font-black mb-6 md:mb-8 leading-tight tracking-tighter">
                            ¿Listo para la experiencia?
                        </h2>
                        <p className="text-orange-100 text-base md:text-xl font-medium mb-10 md:mb-12 opacity-90 leading-relaxed">
                            Pide ahora y descubre por qué somos el sushi favorito del centro de
                            Madrid.
                        </p>
                        <Link
                            to="/menu"
                            className="inline-block w-full sm:w-auto bg-white text-orange-600 px-10 md:px-12 py-4 md:py-5 rounded-xl md:rounded-2xl font-black tracking-tighter hover:scale-105 transition-transform shadow-xl"
                        >
                            HACER MI PEDIDO
                        </Link>
                    </div>
                </motion.div>
            </section>
        </div>
    );
}
