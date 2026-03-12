import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Instagram, Phone, MessageCircle, Facebook, Twitter } from 'lucide-react';
import { api } from '../utils/api';

export default function Footer() {
    const [settings, setSettings] = useState<any>(null);

    useEffect(() => {
        api.get('/settings').then(setSettings).catch(console.error);
    }, []);

    const phoneNumber = settings?.contact_phone || '+34 641 518 390';
    const cleanPhone = phoneNumber.replace(/\s/g, '');

    return (
        <footer className="bg-black text-gray-400 py-12 mt-auto border-t border-white/5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
                        <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                        <span className="font-bold text-white text-lg tracking-wide uppercase">
                            Sushi<span className="text-red-500 font-light">Maksim</span>
                        </span>
                    </div>
                    <p className="text-sm max-w-xs mx-auto md:mx-0">
                        El mejor sushi de la ciudad, directo a tu puerta con la frescura que
                        mereces.
                    </p>
                    <p className="text-[10px] mt-4 text-gray-600 uppercase tracking-widest font-black shrink-0">
                        © 2026 DESARROLLADO POR SELENIT
                    </p>
                </div>

                <div className="flex flex-col items-center md:items-end gap-6">
                    <div className="flex gap-8 text-xs font-black uppercase tracking-widest">
                        <Link to="/menu" className="hover:text-red-500 transition-colors">
                            Menú
                        </Link>
                        <Link to="/blog" className="hover:text-red-500 transition-colors">
                            Blog
                        </Link>
                        <Link to="/promo" className="hover:text-red-500 transition-colors">
                            Promos
                        </Link>
                        <Link to="/contacts" className="hover:text-red-500 transition-colors">
                            Contacto
                        </Link>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Dynamic Social Links from Settings */}
                        {settings?.social_links?.map((social: any, idx: number) => {
                            const platform = social.platform.toLowerCase();
                            if (platform === 'whatsapp') return null; // Handle WhatsApp separately or skip if duplicate
                            
                            let Icon = MessageCircle;
                            let hoverClass = 'hover:bg-blue-500/20 hover:border-blue-500/30 hover:text-blue-500';

                            if (platform === 'instagram') {
                                Icon = Instagram;
                                hoverClass = 'hover:bg-pink-500/20 hover:border-pink-500/30 hover:text-pink-500';
                            } else if (platform === 'facebook') {
                                Icon = Facebook;
                                hoverClass = 'hover:bg-blue-600/20 hover:border-blue-600/30 hover:text-blue-600';
                            } else if (platform === 'twitter' || platform === 'x') {
                                Icon = Twitter;
                                hoverClass = 'hover:bg-gray-800/20 hover:border-gray-800/30 hover:text-white';
                            }

                            return (
                                <a
                                    key={idx}
                                    href={social.url === '#' ? 'https://www.instagram.com/sushi_de_maksim/' : social.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center transition-all ${hoverClass}`}
                                    title={social.platform}
                                >
                                    <Icon size={20} strokeWidth={1.5} />
                                </a>
                            );
                        })}

                        {/* Fallback / Static Instagram if not in settings */}
                        {(!settings?.social_links || settings.social_links.length === 0) && (
                            <a
                                href="https://www.instagram.com/sushi_de_maksim/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center transition-all hover:bg-pink-500/20 hover:border-pink-500/30 hover:text-pink-500"
                                title="Instagram"
                            >
                                <Instagram size={20} strokeWidth={1.5} />
                            </a>
                        )}

                        {/* WhatsApp (Main Contact) */}
                        <a
                            href={`https://wa.me/${cleanPhone.replace('+', '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center transition-all hover:bg-green-500/20 hover:border-green-500/30 hover:text-green-500"
                            title="WhatsApp"
                        >
                            <MessageCircle size={20} strokeWidth={1.5} />
                        </a>

                        {/* Phone Icon Button */}
                        <a
                            href={`tel:${cleanPhone}`}
                            className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center transition-all hover:bg-red-700 hover:scale-110 active:scale-95 shadow-lg shadow-red-600/20"
                            title={`Llamar: ${phoneNumber}`}
                        >
                            <Phone size={20} strokeWidth={2} />
                        </a>
                    </div>

                    {/* Botón discreto para administradores */}
                    <Link
                        to="/admin"
                        className="inline-flex items-center gap-1.5 text-[10px] uppercase font-black tracking-tighter text-gray-700 hover:text-gray-400 transition-colors"
                        title="Acceso de personal"
                    >
                        <Shield size={12} strokeWidth={1.5} />
                        <span>Staff Access</span>
                    </Link>
                </div>
            </div>
        </footer>
    );
}
