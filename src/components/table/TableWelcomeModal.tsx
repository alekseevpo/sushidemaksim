import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, UserPlus, Gift } from 'lucide-react';
import { useTableI18n } from '../../utils/tableI18n';

interface TableWelcomeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onRegister: () => void;
}

export const TableWelcomeModal: React.FC<TableWelcomeModalProps> = ({ 
    isOpen, 
    onClose, 
    onRegister 
}) => {
    const { t } = useTableI18n();

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/80 z-[200] backdrop-blur-md"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-sm bg-[#141414] rounded-[40px] z-[201] overflow-hidden border border-white/10 shadow-2xl"
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
                                className="w-20 h-20 bg-orange-600 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-orange-600/30 mb-6"
                            >
                                <div className="flex flex-col items-center leading-none">
                                    <span className="text-2xl font-black italic">-10%</span>
                                </div>
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
                </>
            )}
        </AnimatePresence>
    );
};
