import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Mail, MapPin } from 'lucide-react';
import { useTableI18n } from '../utils/tableI18n';
import SEO from '../components/SEO';

export default function PartnersPage() {
    const { t } = useTableI18n();

    const handleBack = () => {
        window.history.back();
    };

    return (
        <div className="min-h-screen bg-[#0d0d0d] text-white pb-12 relative overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute top-[-10%] right-[-10%] w-[80vw] h-[80vw] bg-orange-900/10 rounded-full blur-[140px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[80vw] h-[80vw] bg-orange-950/20 rounded-full blur-[140px]" />
            </div>

            <SEO
                title={`${t('partners_franchise' as any) || 'Partners / Франчайзи'} | Sushi de Maksim`}
                description="Únete a nuestra red de éxito. Información para socios y franquiciados."
            />

            {/* Header */}
            <header className="relative z-10 px-6 pt-12 pb-8 flex items-center justify-between">
                <button
                    onClick={handleBack}
                    className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 active:scale-90 transition-transform"
                >
                    <ChevronLeft size={24} />
                </button>
                <h1 className="text-xl font-black italic tracking-tighter uppercase">
                    {t('partners_franchise' as any) || 'Partners'}
                </h1>
                <div className="w-10" /> {/* Spacer */}
            </header>

            <main className="relative z-10 px-6 max-w-xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12"
                >
                    <span className="text-orange-500 font-black uppercase tracking-[0.3em] text-[10px] mb-2 block">
                        {t('opportunity' as any) || 'Oportunidad de Negocio'}
                    </span>
                    <h2 className="text-4xl font-black italic tracking-tighter leading-none mb-6">
                        {t('grow_together' as any) || 'Crezcamos Juntos'}
                    </h2>
                    <p className="text-gray-400 leading-relaxed font-medium">
                        {t('partners_desc' as any) ||
                            'Estamos buscando emprendedores apasionados que quieran llevar la auténtica experiencia de Sushi de Maksim a nuevas ubicaciones.'}
                    </p>
                </motion.div>

                {/* Info Cards */}
                <div className="grid gap-4 mb-12">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white/5 border border-white/10 rounded-2xl p-6"
                    >
                        <h3 className="text-lg font-black italic mb-2">Franquicias</h3>
                        <p className="text-sm text-gray-400">
                            Modelo de negocio probado con alta rentabilidad y soporte continuo.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white/5 border border-white/10 rounded-2xl p-6"
                    >
                        <h3 className="text-lg font-black italic mb-2">Partners locales</h3>
                        <p className="text-sm text-gray-400">
                            Colaboraciones estratégicas para expansión regional y eventos.
                        </p>
                    </motion.div>
                </div>

                {/* Contact Section Placeholder */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="bg-gradient-to-br from-orange-600 to-orange-800 rounded-3xl p-8 text-center relative overflow-hidden"
                >
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.2)_0%,transparent_70%)]" />

                    <h3 className="text-2xl font-black italic mb-4 relative z-10">
                        {t('contact_us_now' as any) || '¿Interesado?'}
                    </h3>
                    <p className="text-white/80 mb-8 text-sm font-bold relative z-10">
                        La forma de inscripción estará disponible muy pronto. Por ahora, puedes
                        contactarnos directamente.
                    </p>

                    <div className="flex flex-col gap-3 relative z-10">
                        <a
                            href="mailto:partners@sushidemaksim.com"
                            className="bg-white text-orange-700 h-14 rounded-2xl flex items-center justify-center gap-3 font-black transition-transform active:scale-95"
                        >
                            <Mail size={20} />
                            Enviar Email
                        </a>
                    </div>
                </motion.div>

                {/* Footer Info */}
                <div className="mt-12 pt-12 border-t border-white/5 flex flex-col gap-6 text-gray-500">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                            <MapPin size={18} />
                        </div>
                        <div>
                            <span className="text-[10px] uppercase font-black tracking-widest block">
                                Sede Central
                            </span>
                            <span className="text-sm font-bold">Madrid, España</span>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
