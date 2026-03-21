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
        <aside className="hidden lg:block w-[120px] flex-shrink-0 sticky top-[64px] self-start z-30">
            <div className="bg-red-600 min-h-[calc(100vh-64px)] py-6 px-1 flex flex-col items-stretch shadow-xl">
                <nav className="flex flex-col gap-2">
                    <button
                        onClick={() => setSelectedCategory('all')}
                        className={`relative w-full text-center py-4 rounded-xl font-black transition-all duration-200 flex flex-col items-center justify-center gap-1 border-none cursor-pointer group ${
                            selectedCategory === 'all'
                                ? 'bg-white text-red-600 shadow-lg'
                                : 'text-white/80 hover:text-white hover:bg-white/10'
                        }`}
                    >
                        <Sparkles size={24} strokeWidth={2} className="relative z-10" />
                        <span className="text-[10px] uppercase tracking-wider relative z-10 font-black">Todos</span>
                    </button>
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`relative w-full text-center py-4 rounded-xl font-black transition-all duration-200 flex flex-col items-center justify-center gap-1 border-none cursor-pointer group ${
                                selectedCategory === cat.id
                                    ? 'bg-white text-red-600 shadow-lg'
                                    : 'text-white/80 hover:text-white hover:bg-white/10'
                            }`}
                        >
                            <cat.icon size={24} strokeWidth={2} className="relative z-10" />
                            <span className="text-[10px] uppercase tracking-wider relative z-10 font-black leading-tight px-1">
                                {cat.name}
                            </span>
                        </button>
                    ))}
                </nav>
            </div>
        </aside>
    );
}
