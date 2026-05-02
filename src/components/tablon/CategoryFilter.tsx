import { useMemo } from 'react';
import type { TablonCategory } from '../../hooks/queries/useTablon';

interface CategoryFilterProps {
    categories: TablonCategory[];
    selectedCategoryId: string | null;
    onSelect: (categoryId: string | null) => void;
}

export function CategoryFilter({ categories, selectedCategoryId, onSelect }: CategoryFilterProps) {
    const sortedCategories = useMemo(
        () => [...categories].sort((a, b) => a.name.localeCompare(b.name, 'es')),
        [categories]
    );

    return (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0 md:flex-wrap">
            {/* All button */}
            <button
                data-testid="category-filter-all"
                onClick={() => onSelect(null)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    selectedCategoryId === null
                        ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25'
                        : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
            >
                📋 Todos
            </button>

            {sortedCategories.map(cat => (
                <button
                    key={cat.id}
                    data-testid={`category-filter-${cat.name.toLowerCase().replace(/\s+/g, '-')}`}
                    onClick={() =>
                        onSelect(
                            cat.id.toString() === selectedCategoryId ? null : cat.id.toString()
                        )
                    }
                    className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                        selectedCategoryId === cat.id.toString()
                            ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25'
                            : 'bg-white/10 text-gray-300 hover:bg-white/20'
                    }`}
                >
                    {cat.emoji} {cat.name}
                </button>
            ))}
        </div>
    );
}
