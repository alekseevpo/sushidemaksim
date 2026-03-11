import { useState, useEffect } from 'react';
import { Heart, Plus, Check } from 'lucide-react';

import { api } from '../../utils/api';
import { useCart } from '../../hooks/useCart';

interface MenuItem {
    id: number;
    name: string;
    description: string;
    price: number;
    image: string;
    category: string;
    pieces?: number;
    spicy?: boolean;
    vegetarian?: boolean;
    is_promo?: boolean;
}

export default function FavoritesTab() {
    const [favorites, setFavorites] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [addedItems, setAddedItems] = useState<Set<number>>(new Set());
    const [failedImages, setFailedImages] = useState<Set<number>>(new Set());
    const { addItem } = useCart();

    const EMOJI: Record<string, string> = {
        rolls: '🍣',
        sets: '🍱',
        classic: '🍙',
        baked: '🍘',
        sweet: '🍥',
        sauces: '🥢',
    };

    useEffect(() => {
        loadFavorites();
    }, []);

    const loadFavorites = async () => {
        setLoading(true);
        try {
            const data = await api.get('/user/favorites');
            setFavorites(data.favorites);
        } catch (error) {
            console.error('Failed to load favorites', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleFavorite = async (menuItemId: number) => {
        try {
            const data = await api.post('/user/favorites', { menuItemId });
            if (typeof navigator !== 'undefined' && navigator.vibrate) {
                navigator.vibrate(10);
            }
            if (!data.isFavorite) {
                setFavorites(prev => prev.filter(item => item.id !== menuItemId));
            }
        } catch (error) {
            console.error('Error toggling favorite', error);
        }
    };

    const handleAddToCart = (item: MenuItem) => {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate(10);
        }
        addItem({
            id: String(item.id),
            name: item.name,
            description: item.description,
            price: item.price,
            image: item.image,
            category: item.category as any,
            pieces: item.pieces,
            spicy: item.spicy,
            vegetarian: item.vegetarian,
            isPromo: item.is_promo,
        });
        setAddedItems(prev => new Set(prev).add(item.id));
        setTimeout(() => {
            setAddedItems(prev => {
                const n = new Set(prev);
                n.delete(item.id);
                return n;
            });
        }, 1200);
    };

    if (loading) {
        return (
            <div className="space-y-8 animate-in fade-in duration-500">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-6">
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight m-0">
                        Mis Favoritos
                    </h2>
                </div>
                <div className="bg-gray-50 rounded-[40px] p-24 text-center border-2 border-gray-100">
                    <div className="w-16 h-16 bg-white rounded-2xl shadow-xl flex items-center justify-center mx-auto mb-6 text-2xl animate-spin">
                        🍣
                    </div>
                    <p className="text-gray-500 font-bold">Cargando tus favoritos...</p>
                </div>
            </div>
        );
    }

    if (favorites.length === 0) {
        return (
            <div className="space-y-8 animate-in fade-in duration-500">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-6">
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight m-0">
                        Mis Favoritos
                    </h2>
                </div>
                <div className="bg-gray-50 rounded-[40px] p-16 text-center border-2 border-dashed border-gray-200">
                    <div className="w-20 h-20 bg-white rounded-3xl shadow-xl flex items-center justify-center mx-auto mb-6 text-3xl">
                        ❤️
                    </div>
                    <h3 className="text-xl font-black text-gray-900 mb-2">
                        Aún no tienes favoritos
                    </h3>
                    <p className="text-gray-500 text-sm max-w-xs mx-auto mb-8 leading-relaxed">
                        Añade tus platos favoritos desde el menú para tenerlos siempre a mano y
                        realizar pedidos más rápido.
                    </p>
                    <button
                        onClick={() => (window.location.href = '/menu')}
                        className="inline-flex items-center gap-2 px-8 py-3 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-700 transition-all shadow-lg shadow-red-100"
                    >
                        Explorar Menú
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5 mb-6">
                <div>
                    <h2 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight m-0 flex items-center gap-2">
                        Mis Favoritos
                        <span className="w-5 h-5 md:w-6 md:h-6 bg-red-600 text-white text-[10px] md:text-xs font-black rounded-full shadow-md shadow-red-100 flex items-center justify-center shrink-0 not-italic">
                            {favorites.length}
                        </span>
                    </h2>
                    <p className="text-gray-500 text-xs md:text-sm mt-1">
                        Tus platos preferidos listos para pedir
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-5 lg:gap-6">
                {favorites.map(item => (
                    <div
                        key={item.id}
                        className="bg-white border border-gray-100 rounded-[24px] md:rounded-[32px] overflow-hidden hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.1)] transition-all duration-500 group flex flex-col relative shadow-sm"
                    >
                        {/* Image Container */}
                        <div className="h-[130px] md:h-[190px] overflow-hidden relative flex items-center justify-center bg-gray-50/50">
                            {!failedImages.has(item.id) ? (
                                <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    onError={() =>
                                        setFailedImages(prev => new Set(prev).add(item.id))
                                    }
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-4xl md:text-6xl grayscale opacity-30 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700 transform group-hover:scale-110">
                                    {EMOJI[item.category] ?? '🍣'}
                                </div>
                            )}

                            {/* Tags Overlay */}
                            <div className="absolute top-2 left-0 flex flex-col gap-1 z-10">
                                {item.spicy && (
                                    <span className="px-2 py-0.5 bg-red-600/90 backdrop-blur-sm text-white text-[8px] md:text-[10px] font-black uppercase tracking-wider rounded-r-lg shadow-lg">
                                        🌶️ Picante
                                    </span>
                                )}
                                {item.vegetarian && (
                                    <span className="px-2 py-0.5 bg-emerald-600/90 backdrop-blur-sm text-white text-[8px] md:text-[10px] font-black uppercase tracking-wider rounded-r-lg shadow-lg">
                                        🥬 Veggie
                                    </span>
                                )}
                            </div>

                            {/* Actions Overlay */}
                            <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
                                <button
                                    onClick={() => toggleFavorite(item.id)}
                                    className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/95 backdrop-blur-sm text-red-600 shadow-xl flex items-center justify-center hover:bg-red-600 hover:text-white transition-all transform hover:scale-110 border-none cursor-pointer group/fav"
                                >
                                    <Heart
                                        size={16}
                                        strokeWidth={1.5}
                                        className="transition-transform group-hover/fav:scale-110"
                                    />
                                </button>
                            </div>

                            {/* Bottom Shadow Gradient */}
                            <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-gray-900/10 to-transparent pointer-events-none" />
                        </div>

                        <div className="p-4 md:p-6 flex flex-col flex-1">
                            <div className="mb-2 md:mb-3">
                                <div className="flex justify-between items-start gap-2 mb-1">
                                    <h3 className="text-[13px] md:text-base font-black text-gray-900 m-0 leading-tight line-clamp-2 group-hover:text-red-600 transition-colors">
                                        {item.name}
                                    </h3>
                                    <div className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-100 px-2 py-0.5 rounded-full shrink-0">
                                        {item.pieces ? `${item.pieces} pzs` : '1 ud'}
                                    </div>
                                </div>
                                <p className="text-gray-500 text-[10px] md:text-xs font-medium leading-relaxed m-0 italic line-clamp-2 opacity-80 group-hover:opacity-100 transition-opacity">
                                    {item.description}
                                </p>
                            </div>

                            <div className="mt-auto pt-3 border-t border-gray-50 flex items-center justify-between gap-3">
                                <div className="flex flex-col">
                                    <span className="text-base md:text-xl font-black text-gray-900 italic tracking-tighter">
                                        {item.price.toFixed(2).replace('.', ',')}
                                        <span className="text-[10px] md:text-xs ml-0.5 not-italic">
                                            €
                                        </span>
                                    </span>
                                </div>

                                <button
                                    onClick={() => handleAddToCart(item)}
                                    className={`h-9 md:h-11 w-9 md:w-11 rounded-xl md:rounded-full font-black text-[10px] md:text-sm transition-all flex items-center justify-center shadow-lg shadow-gray-100/50 shrink-0
                                        ${
                                            addedItems.has(item.id)
                                                ? 'bg-green-600 text-white pointer-events-none'
                                                : 'bg-gray-900 text-white hover:bg-red-600 hover:shadow-red-100 hover:-translate-y-0.5 active:scale-95'
                                        }`}
                                >
                                    {addedItems.has(item.id) ? (
                                        <Check size={18} strokeWidth={1.5} />
                                    ) : (
                                        <Plus size={20} strokeWidth={1.5} />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
