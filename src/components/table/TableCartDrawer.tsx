import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, Trash2, ShoppingCart } from 'lucide-react';
import { useTableOrder } from '../../context/TableOrderContext';
import { useTableI18n } from '../../utils/tableI18n';
import SafeImage from '../common/SafeImage';

interface TableCartDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

export const TableCartDrawer: React.FC<TableCartDrawerProps> = ({ isOpen, onClose }) => {
    const { items, total, itemCount, updateQuantity, removeItem, clearCart } = useTableOrder();
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
                        className="fixed inset-0 bg-black/40 z-[100] backdrop-blur-sm"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-[#0A0A0A] z-[101] shadow-2xl flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-6 flex items-center justify-between border-b border-white/5 bg-[#141414]">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
                                    <ShoppingCart size={20} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-white italic tracking-tighter uppercase leading-none">
                                        {t('your_order')}
                                    </h2>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">
                                        {itemCount} {itemCount === 1 ? t('item') : t('items')}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2.5 bg-black text-white rounded-xl active:scale-90 transition-all border border-white/5"
                            >
                                <X size={20} strokeWidth={2.5} />
                            </button>
                        </div>

                        {/* Items List */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            {items.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center px-6">
                                    <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center text-gray-700 mb-4">
                                        <ShoppingCart size={40} />
                                    </div>
                                    <h3 className="text-lg font-black text-white uppercase italic">
                                        {t('empty_cart')}
                                    </h3>
                                    <p className="text-gray-400 text-sm mt-2">
                                        {t('empty_cart')}...
                                    </p>
                                    <button
                                        onClick={onClose}
                                        className="mt-6 px-8 py-3 bg-white text-black rounded-2xl font-black text-xs tracking-widest uppercase"
                                    >
                                        {t('continue_adding')}
                                    </button>
                                </div>
                            ) : (
                                items.map(item => (
                                    <motion.div
                                        key={item.id}
                                        layout
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="flex items-center gap-4 bg-[#141414] p-3 rounded-2xl border border-white/5 shadow-sm"
                                    >
                                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-800 flex-shrink-0">
                                            <SafeImage
                                                src={item.image}
                                                alt={item.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-xs font-black text-white uppercase italic truncate">
                                                {item.name}
                                            </h4>
                                            <p className="text-[10px] text-orange-500 font-bold mt-0.5">
                                                {item.price.toFixed(2)}€ / unit
                                            </p>

                                            {/* Quantity Controls */}
                                            <div className="flex items-center gap-3 mt-2">
                                                <div className="flex items-center bg-black rounded-lg p-0.5 border border-white/5">
                                                    <button
                                                        onClick={() =>
                                                            updateQuantity(
                                                                item.id,
                                                                item.quantity - 1
                                                            )
                                                        }
                                                        className="p-1 hover:text-orange-500 text-gray-400"
                                                    >
                                                        <Minus size={14} strokeWidth={3} />
                                                    </button>
                                                    <span className="w-6 text-center text-xs font-black text-white">
                                                        {item.quantity}
                                                    </span>
                                                    <button
                                                        onClick={() =>
                                                            updateQuantity(
                                                                item.id,
                                                                item.quantity + 1
                                                            )
                                                        }
                                                        className="p-1 hover:text-orange-500 text-gray-400"
                                                    >
                                                        <Plus size={14} strokeWidth={3} />
                                                    </button>
                                                </div>
                                                <button
                                                    onClick={() => removeItem(item.id)}
                                                    className="p-1.5 text-gray-300 hover:text-red-500 transition-colors"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="text-sm font-black text-white">
                                            {(item.price * item.quantity).toFixed(2)}€
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>

                        {/* Footer Summary */}
                        {items.length > 0 && (
                            <div className="p-6 bg-[#0A0A0A]/80 backdrop-blur-xl border-t border-white/5 shadow-[0_-10px_40px_rgba(0,0,0,0.2)]">
                                <div className="space-y-3 mb-6">
                                    <div className="flex justify-between text-gray-500 text-[10px] font-black uppercase tracking-widest">
                                        <span>Subtotal</span>
                                        <span className="text-white">{total.toFixed(2)}€</span>
                                    </div>
                                    <div className="flex justify-between text-gray-500 text-[10px] font-black uppercase tracking-widest">
                                        <span>Table Fee</span>
                                        <span className="text-green-500">FREE</span>
                                    </div>
                                    <div className="pt-3 border-t border-white/5 flex justify-between items-baseline">
                                        <span className="text-sm font-black uppercase tracking-widest text-gray-400">
                                            {t('total')}
                                        </span>
                                        <span className="text-3xl font-black text-orange-600">
                                            {total.toFixed(2)}€
                                        </span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => {
                                        // TODO: Real order submission logic
                                        alert(t('fast_easy'));
                                        clearCart();
                                        onClose();
                                    }}
                                    className="w-full h-16 bg-orange-600 text-white rounded-[24px] font-black text-lg tracking-widest uppercase hover:bg-orange-700 active:scale-95 transition-all flex items-center justify-center gap-3"
                                >
                                    {t('place_order')}
                                </button>

                                <button
                                    onClick={onClose}
                                    className="w-full mt-3 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-600 transition-colors"
                                >
                                    {t('continue_adding')}
                                </button>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
