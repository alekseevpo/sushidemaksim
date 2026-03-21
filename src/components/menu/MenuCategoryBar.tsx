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
        <aside className="hidden lg:block w-[218px] flex-shrink-0 sticky top-[64px] self-start z-30">
            <div className="bg-red-600 h-[calc(100vh-64px)] pb-8 px-3 flex flex-col items-stretch overflow-y-auto no-scrollbar rounded-none">
                <nav className="flex flex-col">
                    <button
                        onClick={() => setSelectedCategory('all')}
                        className={`relative w-full text-left px-4 py-4 transition-all duration-200 flex items-center gap-3 border-none cursor-pointer group ${
                            selectedCategory === 'all'
                                ? 'bg-white text-red-600 shadow-md rounded-b-xl'
                                : 'text-white/80 hover:text-white hover:bg-white/10 rounded-b-xl'
                        } rounded-t-none`}
                    >
                        <Sparkles size={20} strokeWidth={2} className="relative z-10" />
                        <span className="text-sm relative z-10 font-bold">Todos</span>
                    </button>
                    {CATEGORIES.map((cat, idx) => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`relative w-full text-left px-4 py-4 rounded-xl font-black transition-all duration-200 flex items-center gap-3 border-none cursor-pointer mt-1.5 group ${
                                selectedCategory === cat.id
                                    ? 'bg-white text-red-600 shadow-md'
                                    : 'text-white/80 hover:text-white hover:bg-white/10'
                            }`}
                        >
                            <cat.icon size={20} strokeWidth={2} className="relative z-10" />
                            <span className="text-sm relative z-10 font-bold truncate">
                                {cat.name}
                            </span>
                        </button>
                    ))}
                </nav>
            </div>
        </aside>
    );
}
