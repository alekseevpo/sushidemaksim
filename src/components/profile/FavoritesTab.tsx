import { useState, useEffect } from 'react';
import { Heart, Plus } from 'lucide-react';
import { cardStyle } from './profileStyles';
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
                // If unfavorited, immediately remove it from the list here
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
            <div>
                <h1
                    style={{
                        fontSize: '24px',
                        fontWeight: 'bold',
                        marginBottom: '20px',
                        color: '#111827',
                    }}
                >
                    Mis Favoritos
                </h1>
                <div style={{ ...cardStyle, textAlign: 'center', padding: '48px 24px' }}>
                    <div
                        style={{ fontSize: '32px', marginBottom: '12px' }}
                        className="animate-pulse"
                    >
                        ⏳
                    </div>
                    <p style={{ color: '#6B7280' }}>Cargando favoritos...</p>
                </div>
            </div>
        );
    }

    if (favorites.length === 0) {
        return (
            <div>
                <h1
                    style={{
                        fontSize: '24px',
                        fontWeight: 'bold',
                        marginBottom: '20px',
                        color: '#111827',
                    }}
                >
                    Mis Favoritos
                </h1>
                <div style={{ ...cardStyle, textAlign: 'center', padding: '48px 24px' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>❤️</div>
                    <h3
                        style={{
                            fontSize: '18px',
                            fontWeight: 'bold',
                            marginBottom: '8px',
                            color: '#111827',
                        }}
                    >
                        No tienes favoritos aún
                    </h3>
                    <p style={{ fontSize: '14px', color: '#6B7280' }}>
                        Puedes añadir tus platos preferidos desde el Menú usando el botón del
                        corazón.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div>
            <h1
                style={{
                    fontSize: '24px',
                    fontWeight: 'bold',
                    marginBottom: '20px',
                    color: '#111827',
                }}
            >
                Mis Favoritos ({favorites.length})
            </h1>

            <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-6">
                {favorites.map(item => (
                    <div
                        key={item.id}
                        className="bg-white rounded-xl shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1)] overflow-hidden transition-all duration-300 relative hover:-translate-y-1 hover:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.15)] flex flex-col group"
                    >
                        {/* Favorite Button Overlay  */}
                        <button
                            onClick={() => toggleFavorite(item.id)}
                            className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-white/90 shadow-sm flex items-center justify-center text-red-500 hover:scale-110 transition-transform cursor-pointer border-none mix-blend-normal"
                        >
                            <Heart size={18} fill="currentColor" />
                        </button>

                        {/* Image */}
                        <div className="h-[180px] bg-gray-100 rounded-t-xl overflow-hidden relative">
                            {!failedImages.has(item.id) ? (
                                <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    onError={() =>
                                        setFailedImages(prev => new Set(prev).add(item.id))
                                    }
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                    <span className="text-6xl">{EMOJI[item.category] ?? '🍣'}</span>
                                </div>
                            )}
                            <div className="absolute top-2 left-2 flex gap-1">
                                {item.spicy && (
                                    <span className="bg-red-100 text-red-800 rounded-full px-2 py-1 text-xs font-semibold">
                                        🌶️ Picante
                                    </span>
                                )}
                                {item.is_promo && (
                                    <span className="bg-green-100 text-green-800 rounded-full px-2 py-1 text-xs font-bold">
                                        🏷️ Promo
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="p-4 flex flex-col flex-1">
                            <div className="flex items-start justify-between mb-2">
                                <h3 className="text-[17px] font-bold m-0 text-gray-900 leading-tight">
                                    {item.name}
                                </h3>
                                <div className="flex gap-1 ml-2 flex-shrink-0">
                                    {item.vegetarian && (
                                        <span className="text-emerald-500 text-sm">🥬</span>
                                    )}
                                </div>
                            </div>
                            <p className="text-gray-500 text-[13px] leading-relaxed mb-3 flex-1 m-0">
                                {item.description}
                            </p>
                            {item.pieces && (
                                <div className="text-[13px] text-gray-400 mb-3 font-medium">
                                    {item.pieces} uds
                                </div>
                            )}
                            <div className="flex items-center justify-between mt-auto">
                                <span className="text-[20px] font-bold text-red-600">
                                    {item.price.toFixed(2).replace('.', ',')} €
                                </span>
                                <button
                                    onClick={() => handleAddToCart(item)}
                                    className={`px-3 py-2 rounded-lg font-bold border-none cursor-pointer flex items-center gap-1.5 text-[13px] outline-none transition-all duration-300 ${
                                        addedItems.has(item.id)
                                            ? 'bg-green-600 text-white'
                                            : 'bg-red-600 text-white hover:bg-red-700 shadow-sm'
                                    }`}
                                >
                                    {addedItems.has(item.id) ? (
                                        <>✓ Añadido</>
                                    ) : (
                                        <>
                                            <Plus size={14} />
                                            Añadir
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
