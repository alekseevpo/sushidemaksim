import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { CATEGORIES } from '../../constants/menu';

interface MenuCategoryBarProps {
    selectedCategory: string;
    setSelectedCategory: (cat: string) => void;
    isMobile?: boolean;
}

const KatanaUnderline = () => (
    <motion.div
        layoutId="katana-underline"
        className="absolute -bottom-10 left-4 right-0 flex items-center justify-start pointer-events-none z-0"
        initial={{ opacity: 0, scaleX: 0, originX: 0 }}
        animate={{ opacity: 1, scaleX: 1 }}
        transition={{ type: 'spring', stiffness: 150, damping: 25 }}
    >
        <img src="/katana.png" alt="Katana" className="w-[250px] h-24 object-contain" />
    </motion.div>
);

export default function MenuCategoryBar({
    selectedCategory,
    setSelectedCategory,
    isMobile = false,
}: MenuCategoryBarProps) {
    if (isMobile) {
        return (
            <div className="fixed top-16 left-0 right-0 z-[40] bg-[#FDFBF7] border-b border-gray-200 lg:hidden">
                <div className="max-w-7xl mx-auto">
                    <div className="overflow-x-auto no-scrollbar px-4 py-3">
                        <div className="flex gap-2 flex-nowrap">
                            <button
                                id="cat-all"
                                onClick={() => setSelectedCategory('all')}
                                className={`whitespace-nowrap px-5 py-2.5 rounded-2xl font-black cursor-pointer text-sm snap-center border ${
                                    selectedCategory === 'all'
                                        ? 'bg-red-600 text-white border-red-600'
                                        : 'bg-white text-gray-700 border-gray-200'
                                }`}
                            >
                                Todos
                            </button>
                            {CATEGORIES.map(cat => (
                                <button
                                    key={cat.id}
                                    id={`cat-${cat.id}`}
                                    onClick={() => setSelectedCategory(cat.id)}
                                    className={`whitespace-nowrap flex items-center gap-2 px-5 py-2.5 rounded-2xl font-black cursor-pointer text-sm snap-center border ${
                                        selectedCategory === cat.id
                                            ? 'bg-red-600 text-white border-red-600'
                                            : 'bg-white text-gray-700 border-gray-200'
                                    }`}
                                >
                                    <cat.icon size={18} strokeWidth={1.5} />
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
        <aside className="hidden lg:block w-[218px] flex-shrink-0 bg-red-600 min-h-full z-30">
            <div className="sticky top-[64px] h-[calc(100vh-64px)] pb-8 px-3 flex flex-col items-stretch overflow-y-auto no-scrollbar rounded-none">
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
                                selectedCategory === 'all' ? 'scale-110' : 'group-hover:scale-110'
                            }`}
                        />
                        <span className="text-sm relative z-10 font-bold tracking-wide">Todos</span>
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

                <div className="mt-auto pb-4 pt-8 flex items-center justify-center opacity-10 pointer-events-none select-none">
                    <span className="text-white text-7xl font-serif">福</span>
                </div>
            </div>
        </aside>
    );
}
