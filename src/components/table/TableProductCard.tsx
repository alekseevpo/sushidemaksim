import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Check } from 'lucide-react';
import { SushiItem } from '../../types';
import { cn } from '../../utils/cn';
import SafeImage from '../common/SafeImage';

interface TableProductCardProps {
    item: SushiItem;
    onAddToCart: (item: SushiItem, e: React.MouseEvent, selectedOption?: string) => void;
    onClick?: () => void;
}

const ITEM_OPTIONS: Record<string, string[]> = {
    '113': ['Mahou', 'Mahou 0.0', 'Alhambra', 'Heineken', 'Estrella Galicia'],
    '116': ['Coca-Cola', 'Coca-Cola Zero', 'Fanta Naranja', 'Fanta Limón', 'Sprite'],
};

export const TableProductCard: React.FC<TableProductCardProps> = ({
    item,
    onAddToCart,
    onClick,
}) => {
    const [showCheck, setShowCheck] = React.useState(false);
    const options = ITEM_OPTIONS[item.id];
    const [selectedOption, setSelectedOption] = React.useState(options ? options[0] : '');

    const handleAdd = (e: React.MouseEvent) => {
        e.stopPropagation();
        onAddToCart(item, e, selectedOption);
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
            <div className="p-3 pb-2">
                <h3 className="text-sm font-black text-white line-clamp-2 italic leading-tight uppercase">
                    {item.name}
                </h3>
                {item.description && (
                    <p className="text-[10px] text-gray-400 line-clamp-2 mt-1 leading-normal font-medium">
                        {item.description}
                    </p>
                )}
            </div>

            {/* Options Dropdown if applicable */}
            {options && (
                <div className="px-3 pb-3">
                    <select
                        value={selectedOption}
                        onChange={e => setSelectedOption(e.target.value)}
                        onClick={e => e.stopPropagation()}
                        className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-3 py-2 text-[10px] font-black text-white uppercase tracking-tighter outline-none focus:border-orange-600 transition-colors cursor-pointer appearance-none"
                        style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                            backgroundRepeat: 'no-repeat',
                            backgroundPosition: 'right 0.75rem center',
                            backgroundSize: '1rem',
                        }}
                    >
                        {options.map(opt => (
                            <option key={opt} value={opt} className="bg-black">
                                {opt}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            <div className="h-10"></div>

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
