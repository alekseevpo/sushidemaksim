import { useState, useEffect } from 'react';
import {
    MapPin,
    Phone,
    Mail,
    Clock,
    Instagram,
    Facebook,
    Star,
    ArrowRight,
    Utensils,
    Send,
    MessageSquare,
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

const ContactCard = ({ icon: Icon, title, content, link, linkText, delay, colorClass }: any) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay }}
        className="premium-card p-8 group flex flex-col h-full"
    >
        <div
            className={`w-14 h-14 ${colorClass} rounded-2xl flex items-center justify-center mb-6 transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}
        >
            <Icon size={28} strokeWidth={1.5} className="text-gray-900" />
        </div>
        <h3 className="text-xl font-black text-gray-900 mb-2 truncate">{title}</h3>
        <div className="text-gray-500 text-sm mb-6 leading-relaxed flex-grow">{content}</div>
        {link && (
            <a
                href={link}
                target={link.startsWith('http') ? '_blank' : undefined}
                rel={link.startsWith('http') ? 'noopener noreferrer' : undefined}
                className="inline-flex items-center gap-2 text-sm font-black text-red-600 hover:text-black transition-colors group/link"
            >
                {linkText}
                <ArrowRight
                    size={16}
                    strokeWidth={2}
                    className="transform group-hover/link:translate-x-1 transition-transform"
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
        contact_google_maps_url:
            'https://www.google.com/maps/search/?api=1&query=Calle+Barrilero,+20,+28007+Madrid',
        contact_schedule: [
            { days: 'Miércoles - Viernes', hours: '20:00 - 23:00' },
            { days: 'Sábado - Domingo', hours: '14:00 - 17:00 y 20:00 - 23:00' },
            { days: 'Lunes - Martes', hours: 'Cerrado', closed: true },
        ],
        social_links: [
            { platform: 'WhatsApp', url: 'https://wa.me/34641518390', icon: 'whatsapp' },
            { platform: 'TikTok', url: '#', icon: 'tiktok' },
            { platform: 'Instagram', url: '#', icon: 'instagram' },
            { platform: 'Facebook', url: '#', icon: 'facebook' },
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
        (fullAddress
            ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`
            : '#');

    return (
        <div className="flex-1 bg-gray-50/50">
            <SEO
                title="Contacto"
                description="Contacta con Sushi de Maksim. Llámanos, visítanos o síguenos en nuestras redes sociales para estar al día de las últimas novedades."
                keywords="contacto sushi, telefono sushi madrid, direccion maksim, ubicacion sushi"
            />

            {/* Hero Header */}
            <section className="relative h-[40vh] md:h-[60vh] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img
                        src="/sushi-hero.jpg"
                        alt="Hero background"
                        className="w-full h-full object-cover scale-110"
                    />
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-50 via-transparent to-transparent"></div>
                </div>

                <div className="max-w-4xl mx-auto text-center relative z-10 px-4">
                    <motion.span
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="inline-block px-4 py-1.5 bg-red-600/20 backdrop-blur-md border border-red-500/30 text-red-500 text-[10px] md:text-xs font-black uppercase tracking-widest rounded-full mb-6"
                    >
                        Estamos aquí para ti
                    </motion.span>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-5xl md:text-8xl font-black text-white mb-6 tracking-tight"
                    >
                        Contacto
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="text-gray-200 text-lg md:text-2xl font-medium max-w-xl mx-auto leading-relaxed"
                    >
                        ¿Tienes alguna duda o quieres hacer un pedido? <br />
                        ¡Hablemos! Estamos encantados de ayudarte.
                    </motion.p>
                </div>
            </section>

            {/* Main Content Grid */}
            <div className="max-w-7xl mx-auto px-4 -mt-20 md:-mt-32 relative z-20 pb-24">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column: Contact Cards */}
                    <div className="lg:col-span-4 space-y-6">
                        <ContactCard
                            icon={Phone}
                            title="Llámanos"
                            content={
                                <div className="space-y-1">
                                    <p>Pedidos y consultas telefónicas</p>
                                    <p className="text-gray-900 font-bold">
                                        {settings.contact_phone}
                                    </p>
                                </div>
                            }
                            link={`tel:${settings.contact_phone?.replace(/\s/g, '')}`}
                            linkText="Llamar ahora"
                            delay={0.1}
                            colorClass="bg-amber-100/50"
                        />

                        <ContactCard
                            icon={MapPin}
                            title="Visítanos"
                            content={
                                <div className="space-y-1">
                                    <p>Nuestra cocina principal en Madrid</p>
                                    <p className="text-gray-900 font-bold">{fullAddress}</p>
                                </div>
                            }
                            link={mapsUrl}
                            linkText="Ver en Google Maps"
                            delay={0.2}
                            colorClass="bg-blue-100/50"
                        />

                        <ContactCard
                            icon={Mail}
                            title="Escríbenos"
                            content={
                                <div className="space-y-1">
                                    <p>Para eventos o colaboraciones</p>
                                    <p className="text-gray-900 font-bold break-all">
                                        {settings.contact_email}
                                    </p>
                                </div>
                            }
                            link={`mailto:${settings.contact_email}`}
                            linkText="Enviar email"
                            delay={0.3}
                            colorClass="bg-red-100/50"
                        />
                    </div>

                    {/* Right Column: Integrated Form & Schedule */}
                    <div className="lg:col-span-8 flex flex-col gap-8">
                        {/* Integrated Form Card */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="premium-card overflow-hidden bg-white/80 backdrop-blur-xl"
                        >
                            <div className="p-8 md:p-12 relative">
                                <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                                    <MessageSquare size={160} />
                                </div>

                                <div className="relative z-10">
                                    <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">
                                        Envíanos un mensaje
                                    </h2>
                                    <p className="text-gray-500 mb-10 font-medium">
                                        Te responderemos en menos de 24 horas.
                                    </p>

                                    <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] uppercase font-black tracking-widest text-gray-400">
                                                Nombre
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="Tu nombre"
                                                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:border-red-500 focus:ring-4 focus:ring-red-500/5 transition-all outline-none font-medium"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] uppercase font-black tracking-widest text-gray-400">
                                                Email
                                            </label>
                                            <input
                                                type="email"
                                                placeholder="ejemplo@correo.com"
                                                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:border-red-500 focus:ring-4 focus:ring-red-500/5 transition-all outline-none font-medium"
                                            />
                                        </div>
                                        <div className="md:col-span-2 space-y-2">
                                            <label className="text-[10px] uppercase font-black tracking-widest text-gray-400">
                                                Mensaje
                                            </label>
                                            <textarea
                                                rows={4}
                                                placeholder="¿En qué podemos ayudarte?"
                                                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:border-red-500 focus:ring-4 focus:ring-red-500/5 transition-all outline-none font-medium resize-none"
                                            ></textarea>
                                        </div>
                                        <div className="md:col-span-2 pt-2">
                                            <button
                                                type="submit"
                                                className="w-full btn-premium bg-gray-900 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-gray-900/10 group"
                                            >
                                                ENVIAR MENSAJE
                                                <Send
                                                    size={18}
                                                    className="transform group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"
                                                />
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </motion.div>

                        {/* Secondary Row: Schedule & Socials */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Schedule Card */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                                className="premium-card p-8"
                            >
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-12 h-12 bg-gray-900 text-white rounded-2xl flex items-center justify-center">
                                        <Clock size={24} strokeWidth={1.5} />
                                    </div>
                                    <h3 className="text-xl font-black text-gray-900">Horarios</h3>
                                </div>
                                <div className="space-y-4">
                                    {settings.contact_schedule?.map((item: any, idx: number) => (
                                        <div
                                            key={idx}
                                            className={`flex justify-between items-start pb-4 border-b border-gray-50 last:border-0 last:pb-0 ${item.closed ? 'text-red-500' : 'text-gray-500'}`}
                                        >
                                            <span className="font-bold text-sm uppercase tracking-wider">
                                                {item.days}
                                            </span>
                                            <div className="text-right">
                                                {item.hours
                                                    .split('/')
                                                    .map((h: string, i: number) => (
                                                        <div
                                                            key={i}
                                                            className={`text-sm font-black ${item.closed ? 'text-red-500' : 'text-gray-900'}`}
                                                        >
                                                            {h.trim()}
                                                        </div>
                                                    ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>

                            {/* Socials Card */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: 0.3 }}
                                className="premium-card p-8 flex flex-col"
                            >
                                <h3 className="text-[10px] uppercase font-black tracking-[0.2em] text-gray-400 mb-8">
                                    Síguenos en Redes
                                </h3>
                                <div className="grid grid-cols-4 gap-4 flex-grow content-start">
                                    {settings.social_links?.map((social: any, idx: number) => {
                                        const IconComponent =
                                            iconMap[social.icon?.toLowerCase()] || null;

                                        let hoverBg = 'hover:bg-red-600';
                                        if (social.icon === 'whatsapp')
                                            hoverBg = 'hover:bg-green-500';
                                        if (social.icon === 'instagram')
                                            hoverBg = 'hover:bg-pink-600';
                                        if (social.icon === 'facebook')
                                            hoverBg = 'hover:bg-blue-600';
                                        if (social.icon === 'tiktok') hoverBg = 'hover:bg-black';
                                        if (social.icon === 'thefork')
                                            hoverBg = 'hover:bg-[#004a32]';
                                        if (social.icon === 'threads') hoverBg = 'hover:bg-black';

                                        return (
                                            <motion.a
                                                key={idx}
                                                whileHover={{ scale: 1.1, rotate: 5 }}
                                                whileTap={{ scale: 0.95 }}
                                                href={social.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                title={social.platform}
                                                className={`aspect-square bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 ${hoverBg} hover:text-white transition-all duration-300 shadow-sm border border-gray-100 hover:border-transparent`}
                                            >
                                                {IconComponent && (
                                                    <IconComponent size={24} strokeWidth={1.5} />
                                                )}
                                            </motion.a>
                                        );
                                    })}
                                </div>
                                <div className="mt-8 pt-6 border-t border-gray-50">
                                    <p className="text-xs text-gray-400 font-medium">
                                        Únete a nuestra comunidad y no te pierdas nada.
                                    </p>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Google Maps Embed Section */}
            <section className="max-w-7xl mx-auto px-4 mb-24">
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="premium-card overflow-hidden h-[500px] relative group"
                >
                    <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3038.563914856037!2d-3.674640123441!3d40.397042071442!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd42272e4ed3b2e5%3A0xe719cdfe984d9b8!2sSushi%20de%20Maksim!5e0!3m2!1ses!2ses!4v1709700000000!5m2!1ses!2ses"
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title="Ubicación de Sushi de Maksim"
                        className="grayscale hover:grayscale-0 transition-all duration-700"
                    ></iframe>

                    {/* Overlay badge */}
                    <div className="absolute top-6 left-6 pointer-events-none">
                        <div className="bg-white/95 backdrop-blur-md p-5 rounded-3xl premium-shadow border border-white/20 flex items-center gap-4 group-hover:translate-y-1 transition-transform">
                            <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center">
                                <img
                                    src="https://www.google.com/images/branding/googleg/1x/googleg_standard_color_128dp.png"
                                    alt="Google"
                                    className="w-6 h-6 object-contain brightness-0 invert"
                                />
                            </div>
                            <div>
                                <div className="flex items-center gap-1.5 mb-0.5">
                                    <span className="text-xl font-black text-gray-900 leading-none">
                                        4.8
                                    </span>
                                    <div className="flex gap-0.5">
                                        {[1, 2, 3, 4, 5].map(i => (
                                            <Star
                                                key={i}
                                                size={10}
                                                fill="currentColor"
                                                className="text-amber-400"
                                            />
                                        ))}
                                    </div>
                                </div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                    Valoración en Maps
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </section>

            {/* Call to Action Banner */}
            <section className="max-w-7xl mx-auto px-4 pb-24">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="bg-red-600 rounded-[3rem] p-10 md:p-20 text-center text-white relative overflow-hidden shadow-2xl"
                >
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/asfalt-dark.png')] opacity-10"></div>
                    <div className="relative z-10 max-w-2xl mx-auto">
                        <h2 className="text-3xl md:text-6xl font-black mb-6 leading-tight">
                            ¿Listo para la experiencia?
                        </h2>
                        <p className="text-red-100 text-lg md:text-xl font-medium mb-12 opacity-90 leading-relaxed">
                            Pide ahora y disfruta del auténtico sabor japonés en la comodidad de tu
                            casa.
                        </p>
                        <motion.a
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            href="/menu"
                            className="inline-block bg-white text-red-600 px-12 py-5 rounded-2xl font-black text-sm shadow-xl transition-all"
                        >
                            PEDIR AHORA
                        </motion.a>
                    </div>
                </motion.div>
            </section>
        </div>
    );
}
