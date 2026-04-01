import { useState } from 'react';
import { Heart, Share2, Sparkles, Check, Plus, Minus } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { getOptimizedImageUrl } from '../../utils/images';
import { MenuItem } from '../../hooks/queries/useMenu';
import { EMOJI } from '../../constants/menu';
import { User } from '../../types';

interface ProductCardProps {
    item: MenuItem;
    user: User | null;
    isFavorite: boolean;
    onToggleFavorite: (id: number) => void;
    onShare: (item: MenuItem, e: React.MouseEvent) => void;
    onAddToCart: (item: MenuItem, e: React.MouseEvent<HTMLButtonElement>, quantity: number) => void;
    isAdded: boolean;
    failedImages: Set<number>;
    setFailedImages: React.Dispatch<React.SetStateAction<Set<number>>>;
    isPriority?: boolean;
    isHighlighted?: boolean;
}

export default function ProductCard({
    item,
    user,
    isFavorite,
    onToggleFavorite,
    onShare,
    onAddToCart,
    isAdded,
    failedImages,
    setFailedImages,
    isPriority,
    isHighlighted,
}: ProductCardProps) {
    const [quantity, setQuantity] = useState(1);

    const isExtra = item.category === 'extras';

    return (
        <div
            id={`item-${item.id}`}
            className={`premium-card group relative flex flex-col h-full rounded-[24px] md:rounded-[32px] overflow-hidden ${
                isHighlighted ? 'highlight-item' : ''
            }`}
        >
            {/* Action Buttons */}
            <div className="absolute top-2 left-2 md:top-4 md:left-4 z-10">
                <button
                    onClick={e => onShare(item, e)}
                    className="w-8 h-8 md:w-9 md:h-9 rounded-xl md:rounded-2xl bg-white/90 backdrop-blur-md shadow-lg flex items-center justify-center hover:scale-110 active:scale-90 transition-transform cursor-pointer border-none"
                    title="Compartir"
                >
                    <Share2 size={14} className="text-gray-900" />
                </button>
            </div>

            {user && (
                <div className="absolute top-2 right-2 md:top-4 md:right-4 z-10">
                    <button
                        onClick={e => {
                            e.preventDefault();
                            e.stopPropagation();
                            onToggleFavorite(item.id);
                        }}
                        className="w-8 h-8 md:w-9 md:h-9 rounded-xl md:rounded-2xl bg-white/95 backdrop-blur-md shadow-lg flex items-center justify-center transition-all cursor-pointer border-none z-20 touch-manipulation active:scale-90"
                    >
                        <Heart
                            size={16}
                            className={isFavorite ? 'text-orange-500' : 'text-gray-400'}
                            fill={isFavorite ? 'currentColor' : 'none'}
                        />
                    </button>
                </div>
            )}

            {/* Image Container */}
            <div className="aspect-[4/3] md:h-56 bg-gray-50 overflow-hidden relative group/img">
                {!failedImages.has(item.id) ? (
                    <img
                        src={getOptimizedImageUrl(item.image, 640)}
                        alt={item.name}
                        loading={isPriority ? 'eager' : 'lazy'}
                        decoding="async"
                        {...({ fetchpriority: isPriority ? 'high' : 'auto' } as any)}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-120 md:group-hover:scale-105 active:scale-120 md:active:scale-105"
                        onError={() => setFailedImages(prev => new Set(prev).add(item.id))}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl grayscale opacity-30">
                        {EMOJI[item.category] || '🍱'}
                    </div>
                )}

                {/* Badges Lowered */}
                <div className="absolute bottom-2 left-2 md:bottom-3 md:left-3 flex flex-wrap gap-1">
                    {item.isPopular && (
                        <span className="bg-amber-400 text-amber-950 px-1.5 py-0.5 rounded-md text-[8px] md:text-[10px] font-black tracking-wider shadow-sm flex items-center gap-1">
                            <Sparkles size={8} className="md:size-[10px]" />
                            Popular
                        </span>
                    )}
                    {item.isNew && (
                        <span className="bg-white text-gray-900 px-1.5 py-0.5 rounded-md text-[8px] md:text-[10px] font-black tracking-wider shadow-sm">
                            ✨ Nuevo
                        </span>
                    )}
                </div>
            </div>

            {/* Info Container */}
            <div className="p-3 md:p-4 flex flex-col flex-1">
                <div className="mb-1 md:mb-2 text-left min-h-[56px] md:min-h-0">
                    <h3 className="text-sm md:text-xl font-black text-gray-900 leading-tight line-clamp-2 md:line-clamp-none h-8 md:h-auto md:min-h-[60px]">
                        {item.name}
                    </h3>
                    {item.pieces && (
                        <span className="text-[8px] md:text-[10px] font-black text-gray-400 tracking-widest block opacity-70">
                            {item.pieces} Unidades
                        </span>
                    )}
                </div>

                <p className="text-gray-500 text-[11px] md:text-sm leading-tight md:leading-relaxed mb-3 md:mb-6 line-clamp-2 md:line-clamp-3 min-h-[2.5rem] md:min-h-[3.5rem] font-medium overflow-hidden">
                    {item.description}
                </p>
                <div className="mt-auto flex items-center justify-between gap-1">
                    <div className="flex flex-col">
                        <span className="text-base md:text-xl font-black text-gray-900 whitespace-nowrap">
                            {item.price.toFixed(2).replace('.', ',')} €
                        </span>
                        {isExtra && !isAdded && (
                            <div className="flex items-center bg-gray-100 rounded-lg md:rounded-xl px-0.5 py-0.5 mt-1 md:w-fit">
                                <button
                                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                    className="w-5 h-5 md:w-6 md:h-6 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors bg-transparent border-none cursor-pointer"
                                    aria-label="Disminuir cantidad"
                                >
                                    <Minus size={12} strokeWidth={3} />
                                </button>
                                <span className="w-4 md:w-6 text-center text-[10px] md:text-[12px] font-black text-gray-900">
                                    {quantity}
                                </span>
                                <button
                                    onClick={() => setQuantity(q => q + 1)}
                                    className="w-5 h-5 md:w-7 md:h-7 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors bg-transparent border-none cursor-pointer"
                                    aria-label="Aumentar cantidad"
                                >
                                    <Plus size={12} strokeWidth={3} />
                                </button>
                            </div>
                        )}
                    </div>
                    <button
                        aria-label="Añadir"
                        data-testid="add-to-cart-button"
                        disabled={isAdded}
                        onClick={e => onAddToCart(item, e, quantity)}
                        className={`h-8 w-8 md:h-10 md:w-10 xl:h-11 xl:w-[140px] xl:px-6 rounded-lg md:rounded-xl xl:rounded-2xl font-black text-xs md:text-sm transition-all duration-500 flex items-center justify-center gap-2 border-none cursor-pointer flex-shrink-0 relative overflow-hidden ${
                            isAdded
                                ? 'bg-green-500 text-white cursor-default'
                                : 'bg-gray-900 text-white hover:bg-orange-600 hover:shadow-xl hover:shadow-orange-200 active:scale-95'
                        }`}
                    >
                        <AnimatePresence mode="wait" initial={false}>
                            {isAdded ? (
                                <motion.div
                                    key="added"
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -15 }}
                                    transition={{ duration: 0.3, ease: 'easeOut' }}
                                    className="flex items-center justify-center gap-2 w-full"
                                >
                                    <Check size={16} strokeWidth={3} />
                                    <span className="hidden xl:inline">Añadido</span>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="add"
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -15 }}
                                    transition={{ duration: 0.3, ease: 'easeOut' }}
                                    className="flex items-center justify-center gap-2 w-full"
                                >
                                    <Plus size={16} strokeWidth={3} />
                                    <span className="hidden xl:inline">Añadir</span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </button>
                </div>
            </div>
        </div>
    );
}
