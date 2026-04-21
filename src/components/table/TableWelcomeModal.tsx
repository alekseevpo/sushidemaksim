import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, UserPlus } from 'lucide-react';
import { useTableI18n } from '../../utils/tableI18n';

interface TableWelcomeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onRegister: () => void;
}

export const TableWelcomeModal: React.FC<TableWelcomeModalProps> = ({
    isOpen,
    onClose,
    onRegister,
}) => {
    const { t } = useTableI18n();

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 overflow-hidden pointer-events-none">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-md pointer-events-auto"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-sm bg-[#141414] rounded-[40px] shadow-2xl overflow-hidden border border-white/10 pointer-events-auto"
                    >
                        {/* Decorative Background */}
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                            <div className="absolute top-[-20%] right-[-20%] w-64 h-64 bg-orange-600/20 rounded-full blur-[60px]" />
                            <div className="absolute bottom-[-20%] left-[-20%] w-64 h-64 bg-orange-900/20 rounded-full blur-[60px]" />
                        </div>

                        <div className="relative p-8 flex flex-col items-center text-center">
                            {/* Close Button */}
                            <button
                                onClick={onClose}
                                className="absolute top-6 right-6 p-2 text-gray-500 hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>

                            {/* Badge/Icon */}
                            <motion.div
                                initial={{ rotate: -15, scale: 0 }}
                                animate={{ rotate: 0, scale: 1 }}
                                transition={{ type: 'spring', delay: 0.2 }}
                                className="flex items-center justify-center text-orange-600 mb-6"
                            >
                                <span className="text-7xl font-black italic tracking-tighter drop-shadow-[0_0_20px_rgba(234,88,12,0.4)]">
                                    -10%
                                </span>
                            </motion.div>

                            <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-3 leading-tight">
                                {t('welcome_title')}
                            </h2>

                            <p className="text-gray-400 text-sm font-medium leading-relaxed mb-8 px-2">
                                {t('welcome_text')}
                            </p>

                            <div className="w-full space-y-3">
                                <button
                                    onClick={onRegister}
                                    className="w-full h-14 bg-orange-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 active:scale-95 transition-transform shadow-lg shadow-orange-600/20"
                                >
                                    <UserPlus size={18} strokeWidth={2.5} />
                                    {t('register_btn')}
                                </button>

                                <button
                                    onClick={onClose}
                                    className="w-full h-12 text-gray-500 font-bold text-[10px] uppercase tracking-widest hover:text-white transition-colors"
                                >
                                    {t('skip_btn')}
                                </button>
                            </div>

                            {/* Trust Badge */}
                            <div className="mt-8 flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/5">
                                <Sparkles size={12} className="text-orange-500" />
                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                                    Premium Service
                                </span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
