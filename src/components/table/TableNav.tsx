import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';
import { CATEGORIES } from '../../constants/menu';
import { Beer, UtensilsCrossed } from 'lucide-react';
import { useTableI18n } from '../../utils/tableI18n';

interface TableNavProps {
    activeType: 'food' | 'drinks';
    onTypeChange: (type: 'food' | 'drinks') => void;
    activeCategory: string;
    onCategoryClick: (id: string) => void;
    categories: typeof CATEGORIES;
}

export const TableNav: React.FC<TableNavProps> = ({
    activeType,
    onTypeChange,
    activeCategory,
    onCategoryClick,
    categories,
}) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const { t } = useTableI18n();

    // Scroll active category into view when it changes
    useEffect(() => {
        if (scrollContainerRef.current) {
            const activeEl = scrollContainerRef.current.querySelector(
                `[data-category="${activeCategory}"]`
            );
            if (activeEl) {
                requestAnimationFrame(() => {
                    activeEl.scrollIntoView({
                        behavior: 'smooth',
                        block: 'nearest',
                        inline: 'center',
                    });
                });
            }
        }
    }, [activeCategory]);

    return (
        <div className="fixed top-[var(--header-height,64px)] left-0 right-0 z-50 bg-[#0A0A0A]/90 backdrop-blur-xl border-b border-white/5 flex flex-col pt-4 overflow-hidden">
            {/* Food / Drinks Toggle */}
            <div className="px-4 mb-4">
                <div className="relative flex p-1 bg-white/5 rounded-2xl w-full max-w-sm mx-auto">
                    {/* Sliding Background */}
                    <motion.div
                        className="absolute inset-y-1 left-1 w-[calc(50%-4px)] bg-orange-600 rounded-xl shadow-lg z-0"
                        animate={{ x: activeType === 'drinks' ? '100%' : '0%' }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />

                    <button
                        onClick={() => onTypeChange('food')}
                        className={cn(
                            'relative z-10 flex-1 py-2.5 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-colors',
                            activeType === 'food' ? 'text-white' : 'text-gray-400'
                        )}
                    >
                        <UtensilsCrossed size={14} /> {t('food')}
                    </button>
                    <button
                        onClick={() => onTypeChange('drinks')}
                        className={cn(
                            'relative z-10 flex-1 py-2.5 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-colors',
                            activeType === 'drinks' ? 'text-white' : 'text-gray-400'
                        )}
                    >
                        <Beer size={14} /> {t('drinks')}
                    </button>
                </div>
            </div>

            {/* Category Swipe Bar */}
            <div
                ref={scrollContainerRef}
                className="flex overflow-x-auto scrollbar-hide px-4 pb-3 gap-6 touch-pan-x"
            >
                {categories.map(cat => {
                    const isActive = activeCategory === cat.id;
                    return (
                        <button
                            key={cat.id}
                            data-category={cat.id}
                            onClick={() => onCategoryClick(cat.id)}
                            className={cn(
                                'relative flex-shrink-0 px-2 py-2 transition-all duration-300 flex flex-col items-center gap-1.5',
                                isActive ? 'scale-105' : 'opacity-60'
                            )}
                        >
                            <span
                                className={cn(
                                    'relative z-10 text-[11px] font-black uppercase tracking-[0.2em] whitespace-nowrap transition-all duration-300',
                                    isActive ? 'text-white' : 'text-gray-500'
                                )}
                            >
                                {t(`cat_${cat.id}` as any)}
                            </span>

                            {/* Minimal Indicator (Dot or thin line) */}
                            {isActive && (
                                <motion.div
                                    layoutId="active-nav-indicator"
                                    className="w-1.5 h-1.5 bg-orange-600 rounded-full"
                                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
