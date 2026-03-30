import { motion, LayoutGroup } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { CATEGORIES } from '../../constants/menu';

interface MenuCategoryBarProps {
    selectedCategory: string;
    setSelectedCategory: (cat: string) => void;
    isMobile?: boolean;
}

const KatanaUnderline = () => (
    <motion.div
        layoutId="katana-active"
        className="absolute -bottom-10 left-4 right-0 flex items-center justify-start pointer-events-none z-0"
        transition={{
            type: 'spring',
            stiffness: 250,
            damping: 25,
            mass: 0.5,
        }}
    >
        <img src="/katana.png" alt="Katana" className="w-[240px] h-24 object-contain" />
    </motion.div>
);

export default function MenuCategoryBar({
    selectedCategory,
    setSelectedCategory,
    isMobile = false,
}: MenuCategoryBarProps) {
    const handleCategoryClick = (id: string, e: React.MouseEvent<HTMLButtonElement>) => {
        if (isMobile) {
            e.currentTarget.scrollIntoView({
                behavior: 'smooth',
                inline: 'center',
                block: 'nearest',
            });
            requestAnimationFrame(() => setSelectedCategory(id));
        } else {
            setSelectedCategory(id);
        }
    };

    if (isMobile) {
        return (
            <div
                className="fixed left-0 right-0 z-[40] bg-[#FBF7F0] border-b border-gray-200 md:hidden shadow-sm select-none"
                style={{ top: 'var(--header-height, 64px)' }}
            >
                <div className="max-w-7xl mx-auto flex-1 md:flex px-4 md:px-6 w-full">
                    <LayoutGroup id="mobile-categories">
                        <div
                            className="overflow-x-auto no-scrollbar snap-x snap-proximity py-3 flex items-center overscroll-contain touch-pan-x"
                            data-lenis-prevent
                            data-lenis-prevent-touch
                        >
                            <div className="flex gap-2 flex-nowrap px-4">
                                {/* TODOS Button */}
                                <button
                                    id="cat-all"
                                    onClick={e => handleCategoryClick('all', e)}
                                    style={{ WebkitFontSmoothing: 'antialiased' }}
                                    className={`relative transform-gpu backface-hidden whitespace-nowrap px-6 py-2.5 rounded-2xl font-black cursor-pointer text-[12px] uppercase tracking-wider snap-center border transition-colors motion-reduce:transition-none duration-300 ${
                                        selectedCategory === 'all'
                                            ? 'text-white border-transparent'
                                            : 'bg-white text-gray-500 border-gray-100 hover:border-gray-300'
                                    }`}
                                >
                                    {selectedCategory === 'all' && (
                                        <motion.div
                                            layoutId="mobile-active-pill"
                                            className="absolute inset-0 bg-gray-900 rounded-2xl shadow-lg shadow-gray-900/10 z-0"
                                            transition={{
                                                type: 'spring',
                                                stiffness: 300,
                                                damping: 30,
                                                mass: 0.8,
                                            }}
                                        />
                                    )}
                                    <span className="relative z-10">Todos</span>
                                </button>

                                {/* CATEGORY Buttons */}
                                {CATEGORIES.map(cat => (
                                    <button
                                        key={cat.id}
                                        id={`cat-${cat.id}`}
                                        onClick={e => handleCategoryClick(cat.id, e)}
                                        style={{ WebkitFontSmoothing: 'antialiased' }}
                                        className={`relative transform-gpu backface-hidden whitespace-nowrap flex items-center gap-2 px-6 py-2.5 rounded-2xl font-black cursor-pointer text-[12px] uppercase tracking-wider snap-center border transition-colors motion-reduce:transition-none duration-300 ${
                                            selectedCategory === cat.id
                                                ? 'text-white border-transparent'
                                                : 'bg-white text-gray-500 border-gray-100 hover:border-gray-300'
                                        }`}
                                    >
                                        {selectedCategory === cat.id && (
                                            <motion.div
                                                layoutId="mobile-active-pill"
                                                className="absolute inset-0 bg-gray-900 rounded-2xl shadow-lg shadow-gray-900/10 z-0"
                                                transition={{
                                                    type: 'spring',
                                                    stiffness: 300,
                                                    damping: 30,
                                                    mass: 0.8,
                                                }}
                                            />
                                        )}
                                        <cat.icon
                                            size={16}
                                            strokeWidth={2.5}
                                            className="relative z-10"
                                        />
                                        <span className="relative z-10">{cat.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </LayoutGroup>
                </div>
            </div>
        );
    }

    return (
        <aside className="hidden md:block w-[200px] flex-shrink-0 relative bg-orange-600">
            <div
                className="sticky flex flex-col items-stretch pb-10 overflow-visible no-scrollbar"
                style={{
                    top: 'var(--header-height, 80px)',
                    height: 'calc(100dvh - var(--header-height, 80px))',
                    willChange: 'transform',
                }}
                data-lenis-prevent
            >
                <LayoutGroup id="sidebar-katana">
                    <nav className="flex flex-col py-4 px-2 relative z-10">
                        <button
                            onClick={() => setSelectedCategory('all')}
                            className={`relative w-full text-left px-4 py-4 transition-all duration-300 flex items-center gap-3 border-none cursor-pointer group rounded-xl ${
                                selectedCategory === 'all'
                                    ? 'text-white'
                                    : 'text-white/40 hover:text-white'
                            }`}
                        >
                            <Sparkles
                                size={20}
                                strokeWidth={selectedCategory === 'all' ? 2.5 : 2}
                                className={`relative z-10 transition-transform duration-300 ${
                                    selectedCategory === 'all'
                                        ? 'stroke-current scale-110'
                                        : 'group-hover:scale-110'
                                }`}
                            />
                            <span className="text-sm relative z-10 font-bold tracking-wide">
                                Todos
                            </span>
                            {selectedCategory === 'all' && <KatanaUnderline />}
                        </button>

                        {CATEGORIES.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.id)}
                                className={`relative w-full text-left px-4 py-4 transition-all duration-300 flex items-center gap-3 border-none cursor-pointer group rounded-xl ${
                                    selectedCategory === cat.id
                                        ? 'text-white'
                                        : 'text-white/40 hover:text-white'
                                }`}
                            >
                                <cat.icon
                                    size={20}
                                    strokeWidth={selectedCategory === cat.id ? 2.5 : 2}
                                    className={`relative z-10 transition-transform duration-300 ${
                                        selectedCategory === cat.id
                                            ? 'scale-110'
                                            : 'group-hover:scale-110'
                                    }`}
                                />
                                <span className="text-sm relative z-10 font-bold tracking-wide">
                                    {cat.name}
                                </span>
                                {selectedCategory === cat.id && <KatanaUnderline />}
                            </button>
                        ))}
                    </nav>
                </LayoutGroup>

                <div className="mt-auto py-10 flex items-center justify-center pointer-events-none select-none opacity-40 relative z-10">
                    <span className="text-white text-7xl font-serif drop-shadow-[2px_5px_10px_rgba(0,0,0,0.3)]">
                        福
                    </span>
                </div>
            </div>
        </aside>
    );
}
