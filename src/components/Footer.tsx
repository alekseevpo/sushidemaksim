import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Phone, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '../utils/api';

export default function Footer() {
    const [settings, setSettings] = useState<any>(null);

    useEffect(() => {
        api.get('/settings').then(setSettings).catch(console.error);
    }, []);

    const phoneNumber = settings?.contact_phone || '+34 641 518 390';
    const cleanPhone = phoneNumber.replace(/\s/g, '');

    // Social Platforms Configuration
    const socialConfig = [
        {
            id: 'whatsapp',
            name: 'WhatsApp',
            icon: '/whatsapp.png',
            url: `https://wa.me/${cleanPhone.replace('+', '')}`,
            hover: 'hover:bg-green-500/20 hover:border-green-500/30',
        },
        {
            id: 'telegram',
            name: 'Telegram',
            icon: '/telegram.png',
            url: 'https://t.me/sushidemaksim',
            hover: 'hover:bg-blue-400/20 hover:border-blue-400/30',
        },
        {
            id: 'instagram',
            name: 'Instagram',
            icon: '/instagram.png',
            url: 'https://instagram.com/sushidemaksim',
            hover: 'hover:bg-pink-500/20 hover:border-pink-500/30',
        },
        {
            id: 'thefork',
            name: 'The Fork',
            icon: '/fork.png',
            url: 'https://www.thefork.es/restaurante/sushi-de-maksim-r804561',
            hover: 'hover:bg-emerald-600/20 hover:border-emerald-600/30',
        },
    ];

    // Priority: Settings URL > Static Config Default URL
    const getUrl = (platformId: string, defaultUrl: string) => {
        const found = settings?.social_links?.find((l: any) =>
            l.platform.toLowerCase().includes(platformId.toLowerCase())
        );
        return found?.url && found.url !== '#' ? found.url : defaultUrl;
    };

    return (
        <footer className="bg-black text-gray-400 py-16 mt-auto border-t border-white/5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-12">
                <div className="text-center md:text-left">
                    <Link
                        to="/"
                        onClick={() => (window as any).lenis?.scrollTo(0)}
                        className="flex items-center justify-center md:justify-start gap-4 md:gap-6 mb-8 no-underline group cursor-pointer"
                    >
                        <div className="transform group-hover:rotate-12 transition-transform duration-500 shrink-0">
                            <img
                                src="/logo.svg"
                                alt="Sushi de Maksim"
                                width={120}
                                height={40}
                                className="h-10 md:h-14 w-auto brightness-0 invert object-contain"
                            />
                        </div>
                        <div className="flex flex-col leading-none -space-y-1 md:-space-y-2">
                            <span className="text-[11px] md:text-sm font-black uppercase tracking-[0.25em] text-red-500">
                                Sushi de
                            </span>
                            <span className="font-black text-3xl md:text-6xl tracking-tighter text-white">
                                MAKSIM<span className="text-red-600">.</span>
                            </span>
                        </div>
                    </Link>
                    <p className="text-sm max-w-xs mx-auto md:mx-0 leading-relaxed font-medium text-gray-400/80">
                        Auténtica experiencia japonesa en el corazón de Madrid. Frescura, tradición
                        y calidad en cada pieza.
                    </p>
                </div>

                <div className="flex flex-col items-center md:items-end gap-10">
                    <div className="flex gap-10 text-[11px] font-black uppercase tracking-[0.15em] text-gray-500">
                        <Link to="/menu" className="hover:text-white transition-colors">
                            Menú
                        </Link>
                        <Link to="/blog" className="hover:text-white transition-colors">
                            Blog
                        </Link>
                        <Link to="/promo" className="hover:text-white transition-colors">
                            Promos
                        </Link>
                        <Link to="/contacts" className="hover:text-white transition-colors">
                            Contacto
                        </Link>
                    </div>

                    <div className="flex flex-wrap items-center justify-center md:justify-end gap-3">
                        {socialConfig.map(social => {
                            const url = getUrl(social.id, social.url);

                            return (
                                <a
                                    key={social.id}
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`w-10 h-10 md:w-11 md:h-11 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center transition-all duration-300 ${social.hover} hover:-translate-y-1.5 hover:shadow-xl hover:shadow-red-500/20 overflow-hidden group`}
                                    title={social.name}
                                >
                                    <img
                                        src={social.icon}
                                        alt={social.name}
                                        className={`w-5 h-5 md:w-6 md:h-6 object-contain transition-all duration-300 group-hover:scale-110 opacity-80 group-hover:opacity-100 ${social.id !== 'threads' ? 'brightness-0 invert' : ''}`}
                                    />
                                </a>
                            );
                        })}

                        {/* Phone Button */}
                        <a
                            href={`tel:${cleanPhone}`}
                            className="w-10 h-10 md:w-11 md:h-11 rounded-xl bg-red-600 text-white flex items-center justify-center transition-all duration-300 hover:bg-red-700 hover:scale-110 active:scale-95 shadow-xl shadow-red-600/40 ml-2"
                            title={`Llamar: ${phoneNumber}`}
                        >
                            <Phone size={24} strokeWidth={2} />
                        </a>
                    </div>

                    {/* Botón discreto para administradores */}
                    <Link
                        to="/admin"
                        className="inline-flex items-center gap-2 text-[10px] uppercase font-black tracking-widest text-gray-800 hover:text-gray-500 transition-colors mt-4"
                    >
                        <Shield size={12} strokeWidth={1.5} />
                        <span>Staff Access</span>
                    </Link>
                </div>
            </div>

            {/* Bottom Copyright Row - Moved here for mobile priority */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-white/5">
                <div className="flex flex-col md:flex-row items-center justify-center md:justify-between gap-4 text-[10px] text-gray-700 uppercase tracking-[0.25em] font-black">
                    <div className="flex items-center gap-1.5 order-2 md:order-1">
                        <span>© 2026 DESARROLLADO POR SELENIT</span>
                        <motion.div
                            animate={{
                                scale: [1, 1.25, 1],
                                opacity: [0.6, 1, 0.6],
                            }}
                            transition={{
                                duration: 1.2,
                                repeat: Infinity,
                                ease: 'easeInOut',
                            }}
                        >
                            <Heart size={10} className="text-red-600 fill-red-600" />
                        </motion.div>
                    </div>

                    <span className="order-1 md:order-2">TODOS LOS DERECHOS RESERVADOS</span>
                </div>
            </div>
        </footer>
    );
}
