import { Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CATEGORIES } from '../../constants/menu';

interface MenuSearchProps {
    search: string;
    setSearch: (val: string) => void;
    isSearchExpanded: boolean;
    setIsSearchExpanded: (val: boolean) => void;
    selectedCategory: string;
}

export default function MenuSearch({
    search,
    setSearch,
    isSearchExpanded,
    setIsSearchExpanded,
    selectedCategory,
}: MenuSearchProps) {
    const categoryName = CATEGORIES.find(c => c.id === selectedCategory)?.name || 'Todos';

    return (
        <header className="mb-4 md:mb-12 relative">
            <AnimatePresence mode="wait">
                {!isSearchExpanded ? (
                    <motion.div
                        key="search-button"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="md:hidden flex items-center justify-between w-full h-16 pt-2"
                    >
                        <div className="flex items-baseline gap-2">
                            <h1 className="text-2xl text-gray-900 font-black tracking-tighter mb-0">
                                Nuestro Menú
                            </h1>
                            <span className="text-red-600 font-bold text-base italic whitespace-nowrap">
                                {categoryName}
                            </span>
                        </div>
                        <button
                            onClick={() => setIsSearchExpanded(true)}
                            className="w-12 h-12 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-center text-gray-500 hover:text-red-600 transition-colors cursor-pointer"
                        >
                            <Search size={22} strokeWidth={2} />
                        </button>
                    </motion.div>
                ) : (
                    <motion.div
                        key="search-input-mobile"
                        initial={{ opacity: 0, width: '48px', x: 20 }}
                        animate={{ opacity: 1, width: '100%', x: 0 }}
                        exit={{ opacity: 0, width: '48px', x: 20 }}
                        className="md:hidden relative w-full flex items-center gap-2 h-16 pt-2"
                    >
                        <div className="relative flex-1">
                            <Search
                                size={18}
                                strokeWidth={1.5}
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                            />
                            <input
                                autoFocus
                                type="text"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="¿Qué te apetece hoy?"
                                className="w-full pl-12 pr-12 py-3.5 border border-gray-200 rounded-2xl bg-white text-base outline-none focus:border-red-400 focus:shadow-[0_0_0_4px_rgba(220,38,38,0.05)] transition-all shadow-sm"
                            />
                            {search && (
                                <button
                                    onClick={() => setSearch('')}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 border-none bg-transparent cursor-pointer"
                                >
                                    <X size={20} strokeWidth={1.5} />
                                </button>
                            )}
                        </div>
                        <button
                            onClick={() => {
                                setIsSearchExpanded(false);
                                setSearch('');
                            }}
                            className="px-2 font-bold text-sm text-red-600 border-none bg-transparent cursor-pointer"
                        >
                            Cancelar
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Desktop Header */}
            <div className="hidden md:flex items-center justify-between w-full pt-8">
                <div className="flex items-baseline gap-4">
                    <h1 className="text-5xl text-gray-900 font-black tracking-tighter mb-0 whitespace-nowrap">
                        Nuestro Menú
                    </h1>
                    <span className="text-red-600 font-bold text-2xl italic whitespace-nowrap">
                        {categoryName}
                    </span>
                </div>
                <div className="relative w-full max-w-md ml-8">
                    <Search
                        size={18}
                        strokeWidth={1.5}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="¿Qué te apetece hoy?"
                        className="w-full pl-12 pr-12 py-3.5 border border-gray-200 rounded-2xl bg-white text-base outline-none focus:border-red-400 focus:shadow-[0_0_0_4_rgba(220,38,38,0.05)] transition-all shadow-sm"
                    />
                    {search && (
                        <button
                            onClick={() => setSearch('')}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 border-none bg-transparent cursor-pointer"
                        >
                            <X size={20} strokeWidth={1.5} />
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
}
