import { MenuItem } from '../../hooks/queries/useMenu';
import { CATEGORIES } from '../../constants/menu';
import ProductCard from './ProductCard';
import React from 'react';

interface ProductGridProps {
    items: MenuItem[];
    selectedCategory: string;
    search: string;
    setSearch: (val: string) => void;
    setSelectedCategory: (val: string) => void;
    user: any;
    favorites: Set<number>;
    onToggleFavorite: (id: number) => void;
    onShare: (item: MenuItem, e: React.MouseEvent) => void;
    onAddToCart: (item: MenuItem, e: React.MouseEvent<HTMLButtonElement>, quantity: number) => void;
    addedItems: Set<number>;
    failedImages: Set<number>;
    setFailedImages: React.Dispatch<React.SetStateAction<Set<number>>>;
    highlightedItemId?: string | null;
}

export default function ProductGrid({
    items,
    selectedCategory,
    search,
    setSearch,
    setSelectedCategory,
    user,
    favorites,
    onToggleFavorite,
    onShare,
    onAddToCart,
    addedItems,
    failedImages,
    setFailedImages,
    highlightedItemId,
}: ProductGridProps) {
    if (items.length === 0) {
        return (
            <div className="text-center py-24 bg-white rounded-[40px] border border-dashed border-gray-200 shadow-sm">
                <div className="text-6xl mb-6">🙊</div>
                <h3 className="text-xl font-black text-gray-900 mb-2">
                    {search
                        ? `No hay resultados para "${search}"`
                        : 'No hay platos en esta categoría'}
                </h3>
                <p className="text-gray-500">Prueba a cambiar los filtros</p>
                <button
                    onClick={() => {
                        setSearch('');
                        setSelectedCategory('all');
                    }}
                    className="mt-8 px-8 py-3.5 bg-gray-900 text-white rounded-2xl font-black border-none cursor-pointer hover:bg-orange-600 transition-colors shadow-lg"
                >
                    Ver Todo
                </button>
            </div>
        );
    }

    const categoriesToShow =
        selectedCategory === 'all' && !search
            ? CATEGORIES.filter(cat => items.some(item => item.category === cat.id))
            : [{ id: selectedCategory, name: '', icon: () => null }];

    return (
        <div className="space-y-12 pb-32">
            {categoriesToShow.map(cat => {
                const sectionItems =
                    selectedCategory === 'all' && !search
                        ? items.filter(item => item.category === cat.id)
                        : items;

                if (sectionItems.length === 0) return null;

                return (
                    <div key={cat.id} className="scroll-mt-32" id={`section-${cat.id}`}>
                        {selectedCategory === 'all' && !search && (
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-2xl border border-gray-100">
                                    {cat.icon && (
                                        <cat.icon
                                            size={24}
                                            strokeWidth={1.5}
                                            className="text-orange-600"
                                        />
                                    )}
                                </div>
                                <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">
                                    {cat.name}
                                </h2>
                                <div className="h-[2px] flex-1 bg-gradient-to-r from-gray-100 to-transparent"></div>
                            </div>
                        )}
                        {selectedCategory === 'all' && !search && (cat as any).description && (
                            <p className="text-gray-500 text-sm md:text-base max-w-2xl mb-8 leading-relaxed font-norma -mt-4">
                                {(cat as any).description}
                            </p>
                        )}
                        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8">
                            {sectionItems.map(item => (
                                <ProductCard
                                    key={item.id}
                                    item={item}
                                    user={user}
                                    isFavorite={favorites.has(item.id)}
                                    onToggleFavorite={onToggleFavorite}
                                    onShare={onShare}
                                    onAddToCart={onAddToCart}
                                    isAdded={addedItems.has(item.id)}
                                    failedImages={failedImages}
                                    setFailedImages={setFailedImages}
                                    isHighlighted={String(item.id) === highlightedItemId}
                                />
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
