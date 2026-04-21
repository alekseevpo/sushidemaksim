import React from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { useSettings } from '../../hooks/queries/useSettings';
import { useTableI18n } from '../../utils/tableI18n';

export const TableFooter: React.FC = () => {
    const { data: settings } = useSettings();
    const { t } = useTableI18n();

    const phoneNumber = settings?.contactPhone || '+34 631 920 312';
    const cleanPhone = phoneNumber.replace(/\s/g, '');

    const socialLinks = [
        {
            id: 'whatsapp',
            name: 'WhatsApp',
            icon: '/images/icons/whatsapp.png',
            url: `https://wa.me/${cleanPhone.replace('+', '')}`,
            color: 'hover:bg-green-500/20',
        },
        {
            id: 'instagram',
            name: 'Instagram',
            icon: '/images/icons/instagram.png',
            url: 'https://www.instagram.com/sushi_de_maksim/',
            color: 'hover:bg-pink-500/20',
        },
        {
            id: 'telegram',
            name: 'Telegram',
            icon: '/images/icons/telegram.png',
            url: 'https://t.me/sushidemaksim',
            color: 'hover:bg-blue-500/20',
        },
        {
            id: 'threads',
            name: 'Threads',
            icon: '/images/icons/threads.png',
            url: 'https://www.threads.net/@sushi_de_maksim',
            color: 'hover:bg-white/10',
        },
    ];

    return (
        <footer className="relative z-10 px-6 py-12 border-t border-white/5 mt-20 bg-[#0A0A0A]">
            <div className="max-w-2xl mx-auto flex flex-col items-center gap-8">
                {/* Logo */}
                <div className="opacity-40">
                    <img
                        src="/logo.svg"
                        alt="Sushi de Maksim"
                        className="h-10 w-auto brightness-0 invert object-contain"
                    />
                </div>

                {/* Social Icons */}
                <div className="flex items-center gap-6">
                    {socialLinks.map(social => (
                        <a
                            key={social.id}
                            href={social.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center transition-all duration-300 hover:-translate-y-1 active:scale-95 group"
                        >
                            <img
                                src={social.icon}
                                alt={social.name}
                                className="w-10 h-10 object-contain invert brightness-110 opacity-90 group-hover:opacity-100 transition-all duration-300 hover:scale-110 drop-shadow-lg"
                            />
                        </a>
                    ))}
                </div>

                {/* Copyright info */}
                <div className="flex flex-col items-center gap-2 text-center">
                    <p className="text-[10px] font-black text-gray-700 uppercase tracking-[0.3em]">
                        © 2026 Sushi de Maksim
                    </p>
                    <div className="flex items-center gap-2 text-[8px] font-black text-gray-800 uppercase tracking-widest">
                        <span>{t('made_with')}</span>
                        <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                        >
                            <Heart size={10} className="text-orange-950 fill-orange-950" />
                        </motion.div>
                        <span>{t('in_madrid')}</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};
