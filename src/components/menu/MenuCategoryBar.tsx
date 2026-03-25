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
        initial={false}
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
    if (isMobile) {
        return (
            <div
                className="fixed left-0 right-0 z-[40] bg-[#FDFBF7]/95 backdrop-blur-md border-b border-gray-200 lg:hidden shadow-sm select-none"
                style={{ top: 'var(--header-height, 64px)' }}
            >
                <div className="max-w-7xl mx-auto">
                    <div className="overflow-x-auto no-scrollbar snap-x snap-proximity py-3 flex items-center overscroll-contain scroll-smooth scroll-px-4">
                        <div className="flex gap-2 flex-nowrap px-4">
                            <button
                                id="cat-all"
                                onClick={() => setSelectedCategory('all')}
                                className={`whitespace-nowrap px-6 py-2.5 rounded-2xl font-black cursor-pointer text-[12px] uppercase tracking-wider snap-center border transition-all duration-300 ${
                                    selectedCategory === 'all'
                                        ? 'bg-gray-900 text-white border-gray-900 shadow-lg shadow-gray-900/10'
                                        : 'bg-white text-gray-500 border-gray-100 hover:border-gray-300'
                                }`}
                            >
                                Todos
                            </button>
                            {CATEGORIES.map(cat => (
                                <button
                                    key={cat.id}
                                    id={`cat-${cat.id}`}
                                    onClick={() => setSelectedCategory(cat.id)}
                                    className={`whitespace-nowrap flex items-center gap-2 px-6 py-2.5 rounded-2xl font-black cursor-pointer text-[12px] uppercase tracking-wider snap-center border transition-all duration-300 ${
                                        selectedCategory === cat.id
                                            ? 'bg-gray-900 text-white border-gray-900 shadow-lg shadow-gray-900/10'
                                            : 'bg-white text-gray-500 border-gray-100 hover:border-gray-300'
                                    }`}
                                >
                                    <cat.icon size={16} strokeWidth={2.5} />
                                    {cat.name}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <aside className="hidden lg:block w-[220px] flex-shrink-0 bg-red-600 min-h-full z-30">
            <div className="sticky top-[64px] h-[calc(100vh-64px)] pb-8 px-3 flex flex-col items-stretch overflow-y-auto no-scrollbar rounded-none">
                <LayoutGroup id="sidebar-katana">
                    <nav className="flex flex-col py-4">
                        <button
                            onClick={() => setSelectedCategory('all')}
                            className={`relative w-full text-left px-4 py-4 transition-all duration-300 flex items-center gap-3 border-none cursor-pointer group ${
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
                                className={`relative w-full text-left px-4 py-4 transition-all duration-300 flex items-center gap-3 border-none cursor-pointer group ${
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

                <div className="mt-auto py-10 flex items-center justify-center pointer-events-none select-none opacity-40">
                    <span className="text-white text-7xl font-serif drop-shadow-[2px_5px_10px_rgba(0,0,0,0.3)]">
                        福
                    </span>
                </div>
            </div>
        </aside>
    );
}
