import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, X, ChevronRight } from 'lucide-react';

export default function CookieConsent() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('cookieConsent');
        if (!consent) {
            // Delay showing to not overwhelm the user immediately
            const timer = setTimeout(() => setIsVisible(true), 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('cookieConsent', 'accepted');
        setIsVisible(false);
    };

    const handleDecline = () => {
        localStorage.setItem('cookieConsent', 'declined');
        setIsVisible(false);
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="fixed bottom-6 left-6 right-6 z-[9999] max-w-4xl mx-auto"
                >
                    <div className="bg-white/90 backdrop-blur-xl border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.15)] rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-6">
                        <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center shrink-0">
                            <ShieldCheck className="text-red-600 w-8 h-8" />
                        </div>

                        <div className="flex-1 text-center md:text-left">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                Tu privacidad es importante
                            </h3>
                            <p className="text-gray-500 text-sm leading-relaxed max-w-2xl">
                                Utilizamos cookies propias и de terceros para mejorar tu
                                experiencia, analizar el tráfico и personalizar el contenido de{' '}
                                <span className="font-bold text-gray-900 underline decoration-red-500/30">
                                    Sushi de Maksim
                                </span>
                                . Al hacer clic en "Aceptar", consientes su uso.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                            <button
                                onClick={handleDecline}
                                className="w-full sm:w-auto px-6 py-3 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors bg-transparent border-none cursor-pointer"
                            >
                                Solo necesarias
                            </button>
                            <button
                                onClick={handleAccept}
                                className="w-full sm:w-auto px-8 py-3 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-2xl shadow-lg shadow-red-200 transition-all active:scale-95 flex items-center justify-center gap-2 group"
                            >
                                Aceptar todas
                                <ChevronRight
                                    size={16}
                                    className="group-hover:translate-x-1 transition-transform"
                                />
                            </button>
                        </div>

                        <button
                            onClick={() => setIsVisible(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-1"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
