import { useState, useEffect } from 'react';
import { MapPin, Phone, Mail, Clock, Instagram, Facebook, Star, ArrowRight } from 'lucide-react';
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
            strokeWidth="2"
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
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
        </svg>
    ),
    instagram: Instagram,
    facebook: Facebook,
};

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

    return (
        <div className="flex-1 bg-transparent">
            <SEO
                title="Contacto"
                description="Contacta con Sushi de Maksim. Llámanos, visítanos o síguenos en nuestras redes sociales para estar al día de las últimas novedades."
                keywords="contacto sushi, telefono sushi madrid, direccion maksim, ubicacion sushi"
            />
            {/* Hero Header */}
            <section className="relative bg-[url('/sushi-hero.jpg')] bg-cover bg-center pt-20 pb-28 px-4">
                <div className="absolute inset-0 bg-black/70"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-gray-50/20 to-transparent"></div>
                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Contacto</h1>
                    <p className="text-gray-300 text-lg font-medium">
                        Estamos aquí para ayudarte. ¡Hablemos!
                    </p>
                </div>
            </section>
            {/* Restaurant Photo Section */}
            <section className="max-w-7xl mx-auto px-4 -mt-16 mb-12 relative z-20">
                <div className="relative h-[300px] md:h-[450px] w-full rounded-3xl overflow-hidden shadow-2xl">
                    <img
                        src="https://lh3.googleusercontent.com/gps-cs-s/AHVAwerkdGixMAWgBIMmoJjP1MX7jWMzKqJ7V9vy4jvAQaJRkD1rLfsKxfAkLuD2GL5-Dlv8H-JPqpTtZYfNrw0EwmQxJjmolR9MRhiJOn2PmlUYM-U7hShrCdYQZ_Ns2rut3ZKiQc8=w1200"
                        alt="Interior Sushi de Maksim"
                        fetchPriority="high"
                        decoding="async"
                        className="w-full h-full object-cover"
                    />

                    {/* Google Rating Badge */}
                    <div className="absolute top-6 right-6 bg-white/95 backdrop-blur-sm p-3 md:p-4 rounded-2xl shadow-xl flex items-center gap-3 animate-in fade-in zoom-in duration-700">
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                            <img
                                src="https://www.google.com/images/branding/googleg/1x/googleg_standard_color_128dp.png"
                                alt="Google Rating"
                                loading="lazy"
                                decoding="async"
                                className="w-6 h-6 object-contain"
                            />
                        </div>
                        <div>
                            <div className="flex items-center gap-1 mb-0.5">
                                <span className="text-lg md:text-xl font-black text-gray-900">
                                    4.8
                                </span>
                                <div className="flex items-center">
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <Star
                                            key={i}
                                            size={14}
                                            className="fill-amber-400 text-amber-400"
                                        />
                                    ))}
                                </div>
                            </div>
                            <p className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider">
                                Puntuación en Maps
                            </p>
                        </div>
                    </div>

                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-8">
                        <p className="text-white font-medium text-lg">
                            Nuestro acogedor local en el corazón de Madrid
                        </p>
                    </div>
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Contact Info Cards */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white p-8 rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 transform hover:-translate-y-1 transition duration-300">
                            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-xl flex items-center justify-center mb-6">
                                <Phone size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Llámanos</h3>
                            <p className="text-gray-500 mb-4">
                                Atención al cliente y pedidos por teléfono.
                            </p>
                            <a
                                href={`tel:${settings.contact_phone?.replace(/\s/g, '')}`}
                                className="text-lg font-bold text-red-600 hover:text-red-700 transition"
                            >
                                {settings.contact_phone}
                            </a>
                        </div>

                        <div className="bg-white p-8 rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 transform hover:-translate-y-1 transition duration-300">
                            <div className="w-12 h-12 bg-gray-900 text-white rounded-xl flex items-center justify-center mb-6">
                                <Clock size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Horario</h3>
                            <div className="space-y-2 text-gray-500 text-sm">
                                {settings.contact_schedule?.map((item: any, idx: number) => (
                                    <div
                                        key={idx}
                                        className={`flex justify-between font-medium ${item.closed ? 'text-red-500 pt-1' : ''}`}
                                    >
                                        <span>{item.days}</span>
                                        <div
                                            className={item.hours.includes('/') ? 'text-right' : ''}
                                        >
                                            {item.hours.split('/').map((h: string, i: number) => (
                                                <div
                                                    key={i}
                                                    className={item.closed ? '' : 'text-gray-900'}
                                                >
                                                    {h.trim()}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white p-8 rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 transform hover:-translate-y-1 transition duration-300">
                            <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center mb-6">
                                <Mail size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Escríbenos</h3>
                            <p className="text-gray-500 mb-4">
                                Para consultas generales o eventos especiales.
                            </p>
                            <a
                                href={`mailto:${settings.contact_email}`}
                                className="text-lg font-bold text-amber-600 hover:text-amber-700 transition"
                            >
                                {settings.contact_email}
                            </a>
                        </div>

                        <div className="bg-white p-8 rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 transform hover:-translate-y-1 transition duration-300">
                            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-6">
                                <MapPin size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Encuéntranos</h3>
                            <p className="text-gray-500 mb-4 leading-relaxed">
                                {settings.contact_address_line1}
                                <br />
                                {settings.contact_address_line2}
                            </p>
                            <a
                                href={settings.contact_google_maps_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm font-bold text-blue-600 hover:underline inline-flex items-center gap-1"
                            >
                                Ver en Google Maps <ArrowRight size={14} />
                            </a>
                        </div>
                    </div>

                    {/* Contact Form / Socials */}
                    <div className="lg:col-span-2">
                        <div className="bg-white p-8 md:p-12 rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 h-full">
                            <h2 className="text-3xl font-bold text-gray-900 mb-8">
                                Envíanos un mensaje
                            </h2>

                            <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700">
                                        Nombre completo
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Tu nombre"
                                        className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-red-400 focus:ring-0 transition outline-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700">Email</label>
                                    <input
                                        type="email"
                                        placeholder="tu@email.com"
                                        className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-red-400 focus:ring-0 transition outline-none"
                                    />
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-sm font-bold text-gray-700">
                                        Asunto
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="¿En qué podemos ayudarte?"
                                        className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-red-400 focus:ring-0 transition outline-none"
                                    />
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-sm font-bold text-gray-700">
                                        Mensaje
                                    </label>
                                    <textarea
                                        rows={4}
                                        placeholder="Escribe tu mensaje aquí..."
                                        className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-red-400 focus:ring-0 transition outline-none resize-none"
                                    ></textarea>
                                </div>
                                <div className="md:col-span-2">
                                    <button
                                        type="submit"
                                        className="w-full bg-red-600 text-white font-bold py-4 rounded-xl hover:bg-red-700 transform hover:scale-[1.01] transition-all shadow-lg shadow-red-200"
                                    >
                                        Enviar mensaje
                                    </button>
                                </div>
                            </form>

                            <div className="mt-12 pt-12 border-t border-gray-100">
                                <h4 className="text-sm font-bold text-gray-400 uppercase mb-6">
                                    Redes Sociales
                                </h4>
                                <div className="flex flex-wrap gap-4">
                                    {settings.social_links?.map((social: any, idx: number) => {
                                        const IconComponent =
                                            iconMap[social.icon?.toLowerCase()] || null;

                                        // Colors mapping for popular networks to maintain the design
                                        let hoverColor = 'hover:bg-gray-900';
                                        if (social.icon === 'whatsapp')
                                            hoverColor = 'hover:bg-green-500';
                                        if (social.icon === 'instagram')
                                            hoverColor = 'hover:bg-pink-600';
                                        if (social.icon === 'facebook')
                                            hoverColor = 'hover:bg-blue-600';
                                        if (social.icon === 'tiktok') hoverColor = 'hover:bg-black';

                                        return (
                                            <a
                                                key={idx}
                                                href={social.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                title={social.platform}
                                                className={`w-12 h-12 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center ${hoverColor} hover:text-white transition-all duration-300 shadow-sm`}
                                            >
                                                {IconComponent && <IconComponent size={24} />}
                                            </a>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Map Section */}
            <section className="max-w-7xl mx-auto px-4 mt-16 mb-16">
                <div className="bg-white rounded-3xl overflow-hidden shadow-xl border border-gray-100 h-[450px] relative">
                    <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3038.563914856037!2d-3.674640123441!3d40.397042071442!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd42272e4ed3b2e5%3A0xe719cdfe984d9b8!2sSushi%20de%20Maksim!5e0!3m2!1ses!2ses!4v1709700000000!5m2!1ses!2ses"
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title="Ubicación de Sushi de Maksim"
                    ></iframe>
                </div>
            </section>

            {/* Reviews Section */}
            <section className="max-w-7xl mx-auto px-4 mb-24">
                <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">
                            Opiniones de clientes
                        </h2>
                        <p className="text-gray-500">
                            Lo que dicen quienes ya han probado nuestro sushi
                        </p>
                    </div>
                    <a
                        href="https://www.google.com/maps/place/Sushi+de+Maksim/@40.397042,-3.672449,15z/data=!4m8!3m7!1s0xd42272e4ed3b2e5:0xe719cdfe984d9b8!8m2!3d40.397042!4d-3.672449!9m1!1b1!16s%2Fg%2F11t5yrd0z7"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-bold text-red-600 hover:underline flex items-center gap-1 bg-red-50 px-4 py-2 rounded-lg transition"
                    >
                        Ver todas en Google Maps <ArrowRight size={14} />
                    </a>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        {
                            name: 'Maria G.',
                            text: 'Increíble calidad del pescado. El salmón se deshace en la boca. Volveremos sin duda.',
                            date: 'Hace 2 semanas',
                        },
                        {
                            name: 'Jorge L.',
                            text: 'El mejor sushi de Madrid calidad-precio. El ambiente es muy acogedor y el servicio impecable.',
                            date: 'Hace 1 mes',
                        },
                        {
                            name: 'Elena M.',
                            text: 'Pedimos a domicilio y llegó todo perfecto. Los rollos fritos son una maravilla. Muy recomendado.',
                            date: 'Hace 3 días',
                        },
                    ].map((review, i) => (
                        <div
                            key={i}
                            className="bg-gray-50 p-6 rounded-2xl border border-gray-100 hover:shadow-lg transition duration-300 flex flex-col h-full"
                        >
                            <div className="flex gap-1 mb-4">
                                {[1, 2, 3, 4, 5].map(star => (
                                    <Star
                                        key={star}
                                        size={14}
                                        className="fill-amber-400 text-amber-400"
                                    />
                                ))}
                            </div>
                            <p className="text-gray-700 italic mb-6 flex-1">"{review.text}"</p>
                            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest mt-auto pt-4 border-t border-gray-200/50">
                                <span className="text-gray-900">{review.name}</span>
                                <span className="text-gray-400 font-medium">{review.date}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
