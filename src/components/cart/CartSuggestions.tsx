import { Sparkles, Plus } from 'lucide-react';
import { getOptimizedImageUrl } from '../../utils/images';

interface MenuItem {
    id: number;
    name: string;
    description: string;
    price: number;
    image: string;
    category: string;
}

interface CartSuggestionsProps {
    suggestions: MenuItem[];
    isLoadingSuggestions: boolean;
    handleAddToCart: (item: MenuItem, isSuggestion?: boolean) => void;
    getCategoryEmoji: (category: string) => string;
    failedImages: Set<string | number>;
    setFailedImages: React.Dispatch<React.SetStateAction<Set<string | number>>>;
}

export default function CartSuggestions({
    suggestions,
    isLoadingSuggestions,
    handleAddToCart,
    getCategoryEmoji,
    failedImages,
    setFailedImages,
}: CartSuggestionsProps) {
    if (isLoadingSuggestions) {
        return (
            <div className="bg-white rounded-xl shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1)] p-6">
                <div className="h-6 w-32 bg-gray-100 animate-pulse rounded mb-4"></div>
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="flex gap-3 items-center">
                            <div className="w-12 h-12 bg-gray-100 animate-pulse rounded"></div>
                            <div className="flex-1 space-y-2">
                                <div className="h-3 w-3/4 bg-gray-100 animate-pulse rounded"></div>
                                <div className="h-3 w-1/4 bg-gray-100 animate-pulse rounded"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (suggestions.length === 0) return null;

    return (
        <div className="bg-white rounded-xl shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1)] px-2 py-4 md:p-6 animate-in fade-in duration-500">
            <h3 className="text-base font-black mb-3 flex items-center gap-2 uppercase tracking-tight">
                <Sparkles size={16} strokeWidth={1.5} className="text-amber-500" /> Extras
            </h3>
            <div className="flex flex-col gap-2">
                {suggestions.map(item => (
                    <div
                        key={String(item.id)}
                        className="flex items-center gap-2 p-1.5 hover:bg-gray-50 rounded-xl transition-colors border border-transparent hover:border-gray-100"
                    >
                        <div className="w-12 h-12 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center border border-gray-100 group/sug">
                            {!failedImages.has(item.id) ? (
                                <img
                                    src={getOptimizedImageUrl(item.image, 128)}
                                    alt={item.name}
                                    className="w-full h-full object-cover group-hover/sug:scale-110 transition-transform duration-500"
                                    onError={() =>
                                        setFailedImages(prev => new Set(prev).add(item.id))
                                    }
                                />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-gray-50 to-white flex items-center justify-center relative overflow-hidden group-hover/sug:scale-110 transition-transform duration-500">
                                    <div className="absolute inset-0 opacity-[0.02] bg-[url('https://www.transparenttextures.com/patterns/asfalt-dark.png')]"></div>
                                    <span className="text-xl relative z-10 drop-shadow-sm">
                                        {getCategoryEmoji(item.category)}
                                    </span>
                                </div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0 pr-2">
                            <p className="text-sm font-bold text-gray-900 truncate m-0 leading-tight">
                                {item.name}
                            </p>
                            <p className="text-[11px] text-red-600 font-black m-0">
                                {item.price.toFixed(2).replace('.', ',')} €
                            </p>
                        </div>
                        <button
                            onClick={() => handleAddToCart(item, true)}
                            className="bg-gray-900 text-white rounded-full p-1.5 hover:bg-red-600 active:scale-90 transition-all duration-300 shadow-sm flex items-center justify-center border-none cursor-pointer"
                            title="Añadir al pedido"
                        >
                            <Plus size={14} strokeWidth={1.5} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
