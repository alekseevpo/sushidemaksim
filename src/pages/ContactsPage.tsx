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
}: any) => (
    <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow h-full flex flex-col">
        <div
            className={`w-12 h-12 ${colorClass} rounded-2xl flex items-center justify-center mb-6`}
        >
            <Icon size={24} strokeWidth={1.5} className="text-gray-900" />
        </div>
        <h3 className="text-lg font-black text-gray-900 mb-2 uppercase tracking-tight">{title}</h3>
        <p className="text-gray-900 font-bold mb-1">{content}</p>
        <p className="text-gray-500 text-sm mb-6 flex-grow">{subContent}</p>
        {link && (
            <a
                href={link}
                target={link.startsWith('http') ? '_blank' : undefined}
                rel={link.startsWith('http') ? 'noopener noreferrer' : undefined}
                className="text-sm font-black text-red-600 hover:text-red-700 inline-flex items-center gap-2 group"
            >
                {linkText}
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </a>
        )}
    </div>
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
        <div className="bg-white text-gray-900">
            <SEO
                title="Contacto"
                description="Contacta con Sushi de Maksim en Madrid. Pedidos por teléfono, WhatsApp y redes sociales."
            />

            {/* Simple Clean Hero */}
            <section className="bg-gray-50 pt-32 pb-20 px-4">
                <div className="max-w-7xl mx-auto">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-7xl font-black text-gray-900 mb-6 tracking-tighter"
                    >
                        Contacto
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-lg md:text-2xl text-gray-500 font-medium max-w-2xl leading-relaxed"
                    >
                        ¿Tienes dudas sobre los ingredientes, alérgenos o quieres hacer un pedido
                        especial? Estamos a un mensaje de distancia.
                    </motion.p>
                </div>
            </section>

            {/* Info Cards Grid */}
            <section className="py-12 px-4">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
                    <ContactInfoCard
                        icon={Phone}
                        title="Llámanos"
                        content={settings.contact_phone}
                        subContent="Atención telefónica directa para pedidos y consultas."
                        link={`tel:${settings.contact_phone?.replace(/\s/g, '')}`}
                        linkText="Llamar ahora"
                        colorClass="bg-red-50"
                    />
                    <ContactInfoCard
                        icon={Mail}
                        title="Email"
                        content={settings.contact_email}
                        subContent="Para eventos especiales, colaboraciones o sugerencias."
                        link={`mailto:${settings.contact_email}`}
                        linkText="Enviar mensaje"
                        colorClass="bg-amber-50"
                    />
                    <ContactInfoCard
                        icon={MapPin}
                        title="Visítanos"
                        content={fullAddress}
                        subContent="Nuestra cocina central en el corazón de Madrid."
                        link={mapsUrl}
                        linkText="Ver en Google Maps"
                        colorClass="bg-blue-50"
                    />
                </div>
            </section>

            {/* Map and Form Section */}
            <section className="py-12 px-4 mb-20">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Integrated Contact Form */}
                    <div className="lg:col-span-5">
                        <div className="bg-gray-50 p-8 md:p-10 rounded-[2.5rem] border border-gray-100">
                            <h2 className="text-2xl md:text-3xl font-black mb-2">
                                Envíanos un mensaje
                            </h2>
                            <p className="text-gray-500 mb-8 font-medium">
                                Te responderemos lo antes posible.
                            </p>

                            <form className="space-y-6">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
                                        Tu nombre
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Nombre completo"
                                        className="w-full bg-white border border-gray-200 px-5 py-4 rounded-2xl outline-none focus:border-red-500 transition-colors font-medium"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
                                        Tu email
                                    </label>
                                    <input
                                        type="email"
                                        placeholder="tu@email.com"
                                        className="w-full bg-white border border-gray-200 px-5 py-4 rounded-2xl outline-none focus:border-red-500 transition-colors font-medium"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
                                        Tu mensaje
                                    </label>
                                    <textarea
                                        rows={4}
                                        placeholder="¿En qué podemos ayudarte?"
                                        className="w-full bg-white border border-gray-200 px-5 py-4 rounded-2xl outline-none focus:border-red-500 transition-colors font-medium resize-none"
                                    ></textarea>
                                </div>
                                <button className="w-full bg-gray-900 text-white font-black py-5 rounded-2xl hover:bg-red-600 transition-colors shadow-lg flex items-center justify-center gap-3">
                                    ENVIAR MENSAJE
                                    <Send size={18} />
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Right Side: Map & Schedule */}
                    <div className="lg:col-span-7 space-y-8">
                        {/* Map Card */}
                        <div className="bg-white rounded-[2.5rem] overflow-hidden border border-gray-100 h-[400px] shadow-sm relative group">
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3038.563914856037!2d-3.674640123441!3d40.397042071442!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd42272e4ed3b2e5%3A0xe719cdfe984d9b8!2sSushi%20de%20Maksim!5e0!3m2!1ses!2ses!4v1709700000000!5m2!1ses!2ses"
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                title="Ubicación"
                                className="group-hover:scale-105 transition-transform duration-700"
                            ></iframe>
                        </div>

                        {/* Schedule & Socials Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-gray-50 p-8 rounded-[2rem] border border-gray-100">
                                <div className="flex items-center gap-3 mb-6">
                                    <Clock size={20} className="text-gray-900" />
                                    <h3 className="font-black text-lg uppercase tracking-tight">
                                        Horario
                                    </h3>
                                </div>
                                <div className="space-y-3">
                                    {settings.contact_schedule?.map((item: any, idx: number) => (
                                        <div key={idx} className="flex justify-between items-start">
                                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
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
                                            Consultar en redes sociales.
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="bg-gray-50 p-8 rounded-[2rem] border border-gray-100 flex flex-col">
                                <h3 className="font-black text-lg uppercase tracking-tight mb-6">
                                    Redes Sociales
                                </h3>
                                <div className="flex flex-wrap gap-3">
                                    {settings.social_links?.map((social: any, idx: number) => {
                                        const IconComponent =
                                            iconMap[social.icon?.toLowerCase()] || Instagram;
                                        return (
                                            <a
                                                key={idx}
                                                href={social.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-gray-900 border border-gray-200 hover:border-red-500 hover:text-red-500 transition-all shadow-sm"
                                            >
                                                <IconComponent size={20} strokeWidth={1.5} />
                                            </a>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Simple Final CTA */}
            <section className="bg-red-600 py-16 px-4">
                <div className="max-w-7xl mx-auto text-center text-white">
                    <h2 className="text-3xl md:text-5xl font-black mb-6">¿Hambriento de Sushi?</h2>
                    <p className="text-red-100 text-lg mb-10 font-medium">
                        Haz tu pedido ahora y recíbelо en tiempo récord.
                    </p>
                    <a
                        href="/menu"
                        className="inline-block bg-white text-red-600 px-10 py-4 rounded-2xl font-black tracking-tight hover:scale-105 transition-transform shadow-xl"
                    >
                        VER EL MENÚ
                    </a>
                </div>
            </section>
        </div>
    );
}
