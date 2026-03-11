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
} from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '../utils/api';
import SEO from '../components/SEO';

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
    tiktok: (props: any) => (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
        </svg>
    ),
    instagram: Instagram,
    facebook: Facebook,
    thefork: Utensils,
    threads: (props: any) => (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            <path d="M19.25 10c0-4-3.25-7.25-7.25-7.25S4.75 6 4.75 10s3.25 7.25 7.25 7.25c1.5 0 2.85-.45 4-1.2l3.25 3.2" />
            <path d="M12 7.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5z" />
        </svg>
    ),
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
                className="text-sm font-black text-red-600 hover:text-black inline-flex items-center gap-2 transition-colors group/link"
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
    const [settings, setSettings] = useState<any>({
        contact_phone: '+34 641 518 390',
        contact_email: 'info@sushidemaksim.com',
        contact_address_line1: 'Calle Barrilero, 20,',
        contact_address_line2: '28007 Madrid',
        contact_google_maps_url: '',
        contact_schedule: [],
        social_links: [
            { platform: 'WhatsApp', url: 'https://wa.me/34641518390', icon: 'whatsapp' },
            { platform: 'Instagram', url: '#', icon: 'instagram' },
        ],
    });

    useEffect(() => {
        api.get('/settings')
            .then(data => {
                if (data && Object.keys(data).length > 0) {
                    setSettings(data);
                }
            })
            .catch(console.error);
    }, []);

    const fullAddress =
        `${settings.contact_address_line1} ${settings.contact_address_line2}`.trim();
    const mapsUrl =
        settings.contact_google_maps_url ||
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`;

    return (
        <div className="bg-white overflow-x-hidden">
            <SEO
                title="Contacto"
                description="Contacta con Sushi de Maksim en Madrid. Pedidos por teléfono, WhatsApp y redes sociales."
            />

            {/* Beautiful Hero with Safe Spacing */}
            <section className="relative pt-32 pb-24 md:pt-48 md:pb-32 px-4 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img
                        src="/sushi-hero.jpg"
                        alt="Background"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px]"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent"></div>
                </div>

                <div className="max-w-7xl mx-auto relative z-10 text-center md:text-left">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="inline-block px-4 py-1.5 bg-red-600/20 backdrop-blur-md border border-red-500/30 text-red-500 text-[10px] md:text-xs font-black uppercase tracking-widest rounded-full mb-6"
                    >
                        Estamos a tu disposición
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-4xl md:text-8xl font-black text-white mb-6 tracking-tighter"
                    >
                        Contacto
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.6 }}
                        className="text-lg md:text-2xl text-gray-300 font-medium max-w-2xl leading-relaxed"
                    >
                        ¿Tienes dudas sobre los ingredientes o quieres hacer un pedido especial?{' '}
                        <br className="hidden md:block" />
                        ¡Hablemos! Estamos encantados de ayudarte.
                    </motion.p>
                </div>
            </section>

            {/* Content Container - No overlapping negative margins here to ensure stability */}
            <div className="max-w-7xl mx-auto px-4 py-16 md:py-24">
                {/* Info Cards Row */}
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
                        subContent="Nuestra cocina central en el corazón de Tetuán."
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
                        colorClass="bg-red-100/50"
                        delay={0.3}
                    />
                </div>

                {/* Main Interaction Section */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-start">
                    {/* Integrated Contact Form */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="lg:col-span-12 xl:col-span-5 bg-gray-50 p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] border border-gray-100 relative overflow-hidden order-2 lg:order-1"
                    >
                        <div className="relative z-10">
                            <h2 className="text-2xl md:text-3xl font-black mb-2 tracking-tight">
                                Envíanos un mensaje
                            </h2>
                            <p className="text-gray-500 mb-8 md:mb-10 font-medium text-sm md:text-base">
                                Te responderemos en menos de 24h.
                            </p>

                            <form className="space-y-4 md:space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
                                            Tu nombre
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Nombre completo"
                                            className="w-full bg-white border border-gray-200 px-5 py-3 md:py-4 rounded-xl md:rounded-2xl outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/5 transition-all font-medium text-base"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
                                            Tu email
                                        </label>
                                        <input
                                            type="email"
                                            placeholder="tu@email.com"
                                            className="w-full bg-white border border-gray-200 px-5 py-3 md:py-4 rounded-xl md:rounded-2xl outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/5 transition-all font-medium text-base"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
                                        Tu mensaje
                                    </label>
                                    <textarea
                                        rows={4}
                                        placeholder="¿En qué podemos ayudarte?"
                                        className="w-full bg-white border border-gray-200 px-5 py-3 md:py-4 rounded-xl md:rounded-2xl outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/5 transition-all font-medium resize-none text-base"
                                    ></textarea>
                                </div>
                                <button className="w-full bg-gray-900 text-white font-black py-4 md:py-5 rounded-xl md:rounded-2xl hover:bg-black transition-all shadow-lg flex items-center justify-center gap-3 active:scale-[0.98]">
                                    ENVIAR MENSAJE
                                    <Send size={18} />
                                </button>
                            </form>
                        </div>
                    </motion.div>

                    {/* Map and Info Column */}
                    <div className="lg:col-span-12 xl:col-span-7 space-y-6 md:space-y-8 order-1 lg:order-2">
                        {/* Map Card */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.98 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="bg-white rounded-[2rem] md:rounded-[2.5rem] overflow-hidden border border-gray-100 h-[300px] md:h-[450px] shadow-sm relative group"
                        >
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3038.563914856037!2d-3.674640123441!3d40.397042071442!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd42272e4ed3b2e5%3A0xe719cdfe984d9b8!2sSushi%20de%20Maksim!5e0!3m2!1ses!2ses!4v1709700000000!5m2!1ses!2ses"
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                title="Ubicación"
                                className="group-hover:scale-105 transition-transform duration-1000"
                            ></iframe>
                        </motion.div>

                        {/* Schedule & Socials Info */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.2 }}
                                className="bg-gray-50 p-6 md:p-8 rounded-[2rem] border border-gray-100 h-full"
                            >
                                <div className="flex items-center gap-3 mb-6">
                                    <Clock size={20} className="text-gray-900" />
                                    <h3 className="font-black text-lg uppercase tracking-tight">
                                        Horario
                                    </h3>
                                </div>
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
                                                className={`text-sm font-black text-right ${item.closed ? 'text-red-500' : 'text-gray-900'}`}
                                            >
                                                {item.hours}
                                            </span>
                                        </div>
                                    ))}
                                    {settings.contact_schedule.length === 0 && (
                                        <p className="text-sm text-gray-500 font-medium italic">
                                            Consúltanos en redes sociales.
                                        </p>
                                    )}
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.3 }}
                                className="bg-gray-50 p-6 md:p-8 rounded-[2rem] border border-gray-100 h-full flex flex-col"
                            >
                                <h3 className="font-black text-lg uppercase tracking-tight mb-8">
                                    Síguenos
                                </h3>
                                <div className="flex flex-wrap gap-3 md:gap-4">
                                    {settings.social_links?.map((social: any, idx: number) => {
                                        const IconComponent =
                                            iconMap[social.icon?.toLowerCase()] || Instagram;
                                        return (
                                            <motion.a
                                                key={idx}
                                                whileHover={{ scale: 1.1, rotate: 5 }}
                                                whileTap={{ scale: 0.95 }}
                                                href={social.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-xl md:rounded-2xl flex items-center justify-center text-gray-900 border border-gray-100 hover:border-red-500 hover:text-red-500 transition-all shadow-sm"
                                            >
                                                <IconComponent size={20} strokeWidth={1.5} />
                                            </motion.a>
                                        );
                                    })}
                                </div>
                                <p className="text-xs text-gray-400 mt-auto pt-6 md:pt-8 font-medium">
                                    Únete a nuestra comunidad para ofertas exclusivas.
                                </p>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Premium CTA Section */}
            <section className="px-4 pb-16 md:pb-24">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="max-w-7xl mx-auto bg-red-600 rounded-[2rem] md:rounded-[3rem] p-8 md:p-24 text-center text-white relative overflow-hidden shadow-2xl shadow-red-200"
                >
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/asfalt-dark.png')] opacity-10"></div>
                    <div className="relative z-10 max-w-3xl mx-auto">
                        <h2 className="text-2xl md:text-6xl font-black mb-6 md:mb-8 leading-tight tracking-tighter">
                            ¿Listo para la experiencia?
                        </h2>
                        <p className="text-red-100 text-base md:text-xl font-medium mb-10 md:mb-12 opacity-90 leading-relaxed">
                            Pide ahora y descubre por qué somos el sushi favorito del centro de
                            Madrid.
                        </p>
                        <a
                            href="/menu"
                            className="inline-block w-full sm:w-auto bg-white text-red-600 px-10 md:px-12 py-4 md:py-5 rounded-xl md:rounded-2xl font-black tracking-tighter hover:scale-105 transition-transform shadow-xl"
                        >
                            HACER MI PEDIDO
                        </a>
                    </div>
                </motion.div>
            </section>
        </div>
    );
}
