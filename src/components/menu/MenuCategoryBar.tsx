import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { CATEGORIES } from '../../constants/menu';

interface MenuCategoryBarProps {
    selectedCategory: string;
    setSelectedCategory: (cat: string) => void;
    isMobile?: boolean;
}

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
        <aside className="hidden lg:block w-64 flex-shrink-0 sticky top-[96px] self-start z-30">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-black text-gray-900 mb-6 px-2">Categorías</h2>
                <nav className="flex flex-col gap-1">
                    <button
                        onClick={() => setSelectedCategory('all')}
                        className={`relative w-full text-left px-4 py-3 rounded-2xl font-black transition-all duration-200 flex items-center gap-3 border-none cursor-pointer ${
                            selectedCategory === 'all'
                                ? 'text-red-600'
                                : 'text-gray-500 hover:text-gray-900'
                        }`}
                    >
                        <Sparkles size={20} strokeWidth={1.5} className="relative z-10" />
                        <span className="text-sm relative z-10 font-bold">Todos</span>
                        {selectedCategory === 'all' && (
                            <motion.div
                                layoutId="category-bg"
                                className="absolute inset-0 bg-red-50 rounded-2xl"
                                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                            />
                        )}
                    </button>
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`relative w-full text-left px-4 py-3 rounded-2xl font-black transition-all duration-200 flex items-center gap-3 border-none cursor-pointer ${
                                selectedCategory === cat.id
                                    ? 'text-red-600'
                                    : 'text-gray-500 hover:text-gray-900'
                            }`}
                        >
                            <cat.icon size={20} strokeWidth={1.5} className="relative z-10" />
                            <span className="text-sm relative z-10 font-bold">{cat.name}</span>
                            {selectedCategory === cat.id && (
                                <motion.div
                                    layoutId="category-bg"
                                    className="absolute inset-0 bg-red-50 rounded-2xl"
                                    transition={{
                                        type: 'spring',
                                        bounce: 0.2,
                                        duration: 0.6,
                                    }}
                                />
                            )}
                        </button>
                    ))}
                </nav>
            </div>
        </aside>
    );
}
