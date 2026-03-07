import { useState, useEffect } from 'react';
import { Heart, ShoppingBag } from 'lucide-react';
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
            if (!data.isFavorite) {
                setFavorites(prev => prev.filter(item => item.id !== menuItemId));
            }
        } catch (error) {
            console.error('Error toggling favorite', error);
        }
    };

    const handleAddToCart = (item: MenuItem) => {
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
                        <span className="px-2.5 py-0.5 bg-red-600 text-white text-[10px] md:text-xs font-black rounded-full shadow-md shadow-red-100 italic">
                            {favorites.length}
                        </span>
                    </h2>
                    <p className="text-gray-500 text-xs md:text-sm mt-1">
                        Tus platos preferidos listos para pedir
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
                {favorites.map(item => (
                    <div
                        key={item.id}
                        className="bg-white border border-gray-50 rounded-[24px] md:rounded-[32px] overflow-hidden hover:shadow-2xl hover:shadow-gray-100 transition-all duration-300 group flex flex-col relative shadow-sm"
                    >
                        {/* Image Container */}
                        <div className="h-[120px] md:h-[180px] overflow-hidden relative flex items-center justify-center bg-gray-50">
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
                            <div className="absolute top-2 left-0 flex flex-col gap-1">
                                {item.spicy && (
                                    <span className="px-2 py-0.5 bg-red-600 text-white text-[8px] md:text-[10px] font-black uppercase tracking-wider rounded-r-lg shadow-lg">
                                        🌶️ Picante
                                    </span>
                                )}
                                {item.vegetarian && (
                                    <span className="px-2 py-0.5 bg-emerald-600 text-white text-[8px] md:text-[10px] font-black uppercase tracking-wider rounded-r-lg shadow-lg">
                                        🥬 Veggie
                                    </span>
                                )}
                            </div>

                            {/* Actions Overlay */}
                            <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-100 md:opacity-0 md:translate-x-12 md:group-hover:translate-x-0 md:group-hover:opacity-100 transition-all duration-300">
                                <button
                                    onClick={() => toggleFavorite(item.id)}
                                    className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-white/90 backdrop-blur-sm text-red-600 shadow-lg flex items-center justify-center hover:bg-red-600 hover:text-white transition-all transform hover:scale-110 border-none cursor-pointer"
                                >
                                    <Heart size={16} fill="currentColor" />
                                </button>
                            </div>

                            {/* Glassmorphism Bottom Border */}
                            <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                        </div>

                        {/* Content */}
                        <div className="p-6 flex flex-col flex-1">
                            <div className="flex justify-between items-start gap-4 mb-2">
                                <h3 className="text-lg font-black text-gray-900 m-0 leading-tight">
                                    {item.name}
                                </h3>
                                <div className="text-xs font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-2 py-0.5 rounded-md">
                                    {item.pieces ? `${item.pieces} uds` : 'unidad'}
                                </div>
                            </div>

                            <p className="text-gray-500 text-xs font-medium leading-relaxed mb-6 flex-1 italic group-hover:text-gray-700 transition-colors">
                                {item.description}
                            </p>

                            <div className="flex items-center justify-between gap-2 md:gap-4 mt-auto">
                                <div className="flex flex-col">
                                    <span className="text-base md:text-xl font-black text-red-600 italic tracking-tighter">
                                        {item.price.toFixed(2).replace('.', ',')} €
                                    </span>
                                    {item.pieces && (
                                        <span className="text-[10px] md:text-xs font-black text-gray-400 uppercase tracking-widest">
                                            {item.pieces} uds
                                        </span>
                                    )}
                                </div>
                                <button
                                    onClick={() => handleAddToCart(item)}
                                    className={`h-9 md:h-11 px-3 md:px-6 rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs transition-all flex items-center gap-2 shadow-sm
                                        ${
                                            addedItems.has(item.id)
                                                ? 'bg-green-600 text-white'
                                                : 'bg-gray-900 text-white hover:bg-red-600 hover:scale-[1.02] active:scale-95 shadow-gray-200'
                                        }`}
                                >
                                    {addedItems.has(item.id) ? (
                                        <>✓</>
                                    ) : (
                                        <>
                                            <ShoppingBag size={14} />
                                            <span className="hidden md:inline">Pedir</span>
                                        </>
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
