import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Instagram, Phone, MessageCircle, Facebook, Utensils, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '../utils/api';

// Custom SVG Icons for a premium look
const TelegramIcon = ({ size = 20 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" />
    </svg>
);

const ThreadsIcon = ({ size = 20 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19.25 10c0-4-3.25-7.25-7.25-7.25S4.75 6 4.75 10s3.25 7.25 7.25 7.25c1.5 0 2.85-.45 4-1.2l3.25 3.2" />
        <path d="M12 7.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5z" />
    </svg>
);

const TheForkIcon = ({ size = 20 }: { size?: number }) => (
    <Utensils size={size} strokeWidth={1.5} />
);

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
            icon: MessageCircle, 
            url: `https://wa.me/${cleanPhone.replace('+', '')}`,
            hover: 'hover:bg-green-500/20 hover:border-green-500/30 hover:text-green-500'
        },
        { 
            id: 'telegram', 
            name: 'Telegram', 
            icon: TelegramIcon, 
            url: '#', 
            hover: 'hover:bg-blue-400/20 hover:border-blue-400/30 hover:text-blue-400'
        },
        { 
            id: 'instagram', 
            name: 'Instagram', 
            icon: Instagram, 
            url: 'https://www.instagram.com/sushi_de_maksim/', 
            hover: 'hover:bg-pink-500/20 hover:border-pink-500/30 hover:text-pink-500'
        },
        { 
            id: 'thefork', 
            name: 'The Fork', 
            icon: TheForkIcon, 
            url: '#', 
            hover: 'hover:bg-emerald-600/20 hover:border-emerald-600/30 hover:text-emerald-500'
        },
        { 
            id: 'facebook', 
            name: 'Facebook', 
            icon: Facebook, 
            url: '#', 
            hover: 'hover:bg-blue-600/20 hover:border-blue-600/30 hover:text-blue-600'
        },
        { 
            id: 'threads', 
            name: 'Threads', 
            icon: ThreadsIcon, 
            url: '#', 
            hover: 'hover:bg-white/10 hover:border-white/20 hover:text-white'
        }
    ];

    // Priority: Settings URL > Static Config Default URL
    const getUrl = (platformId: string, defaultUrl: string) => {
        const found = settings?.social_links?.find((l: any) => l.platform.toLowerCase().includes(platformId.toLowerCase()));
        return found?.url && found.url !== '#' ? found.url : defaultUrl;
    };

    return (
        <footer className="bg-black text-gray-400 py-16 mt-auto border-t border-white/5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-12">
                <div className="text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-4 mb-5">
                        <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center shadow-2xl shadow-red-600/40 transform hover:rotate-12 transition-transform duration-500">
                            <div className="w-3.5 h-3.5 bg-white rounded-full scale-110 shadow-inner"></div>
                        </div>
                        <span className="font-black text-white text-3xl tracking-tighter uppercase whitespace-nowrap">
                            Sushi<span className="text-red-500 font-light">Maksim</span>
                        </span>
                    </div>
                    <p className="text-sm max-w-xs mx-auto md:mx-0 leading-relaxed font-medium text-gray-400/80">
                        Auténtica experiencia japonesa en el corazón de Madrid. Frescura, tradición y calidad en cada pieza.
                    </p>
                </div>


                <div className="flex flex-col items-center md:items-end gap-10">
                    <div className="flex gap-10 text-[11px] font-black uppercase tracking-[0.15em] text-gray-500">
                        <Link to="/menu" className="hover:text-white transition-colors">Menú</Link>
                        <Link to="/blog" className="hover:text-white transition-colors">Blog</Link>
                        <Link to="/promo" className="hover:text-white transition-colors">Promos</Link>
                        <Link to="/contacts" className="hover:text-white transition-colors">Contacto</Link>
                    </div>

                    <div className="flex flex-wrap items-center justify-center md:justify-end gap-3">
                        {socialConfig.map((social) => {
                            const Icon = social.icon;
                            const url = getUrl(social.id, social.url);
                            
                            return (
                                <a
                                    key={social.id}
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center transition-all duration-300 ${social.hover} hover:-translate-y-1.5 hover:shadow-xl hover:shadow-black/50`}
                                    title={social.name}
                                >
                                    <Icon size={22} strokeWidth={1.5} />
                                </a>
                            );
                        })}

                        {/* Phone Button */}
                        <a
                            href={`tel:${cleanPhone}`}
                            className="w-11 h-11 rounded-xl bg-red-600 text-white flex items-center justify-center transition-all duration-300 hover:bg-red-700 hover:scale-110 active:scale-95 shadow-xl shadow-red-600/30 ml-2"
                            title={`Llamar: ${phoneNumber}`}
                        >
                            <Phone size={22} strokeWidth={2} />
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
                <div className="flex flex-col md:flex-row items-center justify-center md:justify-between gap-4 text-[10px] text-gray-700 uppercase tracking-[0.25em] font-black italic">
                    <div className="flex items-center gap-1.5 order-2 md:order-1">
                        <span>© 2026 DESARROLLADO POR SELENIT</span>
                        <motion.div
                            animate={{ 
                                scale: [1, 1.25, 1],
                                opacity: [0.6, 1, 0.6]
                            }}
                            transition={{ 
                                duration: 1.2,
                                repeat: Infinity,
                                ease: "easeInOut"
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
