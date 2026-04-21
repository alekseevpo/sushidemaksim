import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Check } from 'lucide-react';
import { SushiItem } from '../../types';
import { cn } from '../../utils/cn';
import SafeImage from '../common/SafeImage';

interface TableProductCardProps {
    item: SushiItem;
    onAddToCart: (item: SushiItem, e: React.MouseEvent) => void;
    isAdded?: boolean;
    onClick?: () => void;
}

export const TableProductCard: React.FC<TableProductCardProps> = ({
    item,
    onAddToCart,
    isAdded,
    onClick,
}) => {
    const [showCheck, setShowCheck] = React.useState(false);

    const handleAdd = (e: React.MouseEvent) => {
        e.stopPropagation();
        onAddToCart(item, e);
        setShowCheck(true);
        setTimeout(() => setShowCheck(false), 800);
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileTap={{ scale: 0.98 }}
            className="group relative bg-black rounded-3xl overflow-hidden border border-white/5 shadow-2xl shadow-black transition-shadow cursor-default"
            onClick={onClick}
        >
            {/* Image Container - 1:1 Aspect Ratio */}
            <div className="relative aspect-square overflow-hidden bg-gray-100">
                <SafeImage
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                />

                {/* Labels (Promo, New, etc) */}
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                    {item.isPromo && (
                        <span className="px-2 py-1 bg-red-500 text-white text-[10px] font-black rounded-lg tracking-wider uppercase">
                            OFFER
                        </span>
                    )}
                    {item.isNew && (
                        <span className="px-2 py-1 bg-green-500 text-white text-[10px] font-black rounded-lg tracking-wider uppercase">
                            NEW
                        </span>
                    )}
                </div>
            </div>

            {/* Content Container */}
            <div className="p-3 pb-12">
                <h3 className="text-sm font-black text-white line-clamp-2 italic leading-tight uppercase">
                    {item.name}
                </h3>
                {item.description && (
                    <p className="text-[10px] text-gray-400 line-clamp-2 mt-1 leading-normal font-medium">
                        {item.description}
                    </p>
                )}
            </div>

            {/* Bottom Action Bar */}
            <div className="absolute bottom-0 left-0 right-0 p-2 flex items-center justify-between bg-[#1A1A1A] border-t border-white/5">
                <span className="text-sm font-black text-white pl-1">{item.price.toFixed(2)}€</span>

                <button
                    onClick={handleAdd}
                    className={cn(
                        'w-10 h-10 rounded-2xl flex items-center justify-center transition-all active:scale-90',
                        showCheck
                            ? 'bg-green-500 text-white shadow-[0_0_15px_rgba(34,197,94,0.4)]'
                            : 'bg-orange-600 text-white hover:bg-orange-700'
                    )}
                >
                    <AnimatePresence mode="wait">
                        {showCheck ? (
                            <motion.div
                                key="check"
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.5, opacity: 0 }}
                            >
                                <Check size={18} strokeWidth={3} />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="plus"
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.5, opacity: 0 }}
                            >
                                <Plus size={18} strokeWidth={3} />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </button>
            </div>
        </motion.div>
    );
};
