import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, X, Heart, Sparkles, Share2, Copy, Check } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { api } from '../utils/api';
import SEO from '../components/SEO';

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
    is_popular?: boolean;
    is_chef_choice?: boolean;
    is_new?: boolean;
    allergens?: string[];
}

interface FlyingItem {
    id: string;
    startX: number;
    startY: number;
    endX: number;
    endY: number;
    image?: string;
    emoji?: string;
}

const CATEGORIES = [
    { id: 'entrantes', name: 'Entrantes', icon: '🥟' },
    { id: 'rollos-grandes', name: 'Rollos Grandes', icon: '🍣' },
    { id: 'rollos-clasicos', name: 'Rollos Clásicos', icon: '🥢' },
    { id: 'rollos-fritos', name: 'Rollos Fritos', icon: '🔥' },
    { id: 'sopas', name: 'Sopas', icon: '🍜' },
    { id: 'menus', name: 'Menús', icon: '🎁' },
    { id: 'extras', name: 'Extras', icon: '🧴' },
    { id: 'postre', name: 'Postre', icon: '🍰' },
];

const EMOJI: Record<string, string> = {
    entrantes: '🥟',
    'rollos-grandes': '🍣',
    'rollos-clasicos': '🥢',
    'rollos-fritos': '🔥',
    sopas: '🍜',
    menus: '🎁',
    extras: '🧴',
    postre: '🍰',
};

export default function MenuPageSimple() {
    const [items, setItems] = useState<MenuItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const { addItem } = useCart();
    const { user } = useAuth();
    const [addedItems, setAddedItems] = useState<Set<number>>(new Set());
    const [favoriteItems, setFavoriteItems] = useState<Set<number>>(new Set());
    const [failedImages, setFailedImages] = useState<Set<number>>(new Set());
    const [flyingItems, setFlyingItems] = useState<FlyingItem[]>([]);
    const [sharingItem, setSharingItem] = useState<MenuItem | null>(null);
    const [copying, setCopying] = useState(false);
    const debounceTimer = useRef<ReturnType<typeof setTimeout>>();

    // Debounce search input — only fire API call after 350ms of no typing
    useEffect(() => {
        debounceTimer.current = setTimeout(() => {
            setDebouncedSearch(search);
        }, 350);
        return () => clearTimeout(debounceTimer.current);
    }, [search]);

    useEffect(() => {
        loadMenu();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedCategory, debouncedSearch]);

    // Scroll to top when category changes to ensure user sees the results
    useEffect(() => {
        if (!isLoading) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [selectedCategory, isLoading]);

    // Scroll to top on search only if there are results and search is not empty
    useEffect(() => {
        if (debouncedSearch && !isLoading && items.length > 0) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [debouncedSearch, isLoading, items.length]);

    const loadMenu = async () => {
        setIsLoading(true);
        try {
            const qs = new URLSearchParams();
            if (selectedCategory && selectedCategory !== 'all') {
                qs.append('category', selectedCategory);
            }
            if (debouncedSearch) {
                qs.append('search', debouncedSearch);
            }
            const data = await api.get(`/menu?${qs.toString()}`);
            setItems(data.items);

            if (user) {
                const favData = await api.get('/user/favorites');
                setFavoriteItems(new Set(favData.favorites.map((f: any) => f.id)));
            }

            // Check for deep link after items are loaded
            const params = new URLSearchParams(window.location.search);
            const itemId = params.get('id');
            if (itemId) {
                setTimeout(() => {
                    const el = document.getElementById(`item-${itemId}`);
                    if (el) {
                        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        el.classList.add('ring-2', 'ring-red-500', 'ring-offset-4');
                        setTimeout(
                            () => el.classList.remove('ring-2', 'ring-red-500', 'ring-offset-4'),
                            3000
                        );
                    }
                }, 500);
            }
        } catch {
            setItems([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleShare = async (item: MenuItem, e: React.MouseEvent) => {
        e.stopPropagation();
        const shareUrl = `${window.location.origin}/menu?id=${item.id}`;
        const shareData = {
            title: item.name,
            text: `¡Mira qué pintaza tiene este ${item.name} de Sushi de Maksim! 🍣`,
            url: shareUrl,
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                if ((err as Error).name !== 'AbortError') {
                    setSharingItem(item);
                }
            }
        } else {
            setSharingItem(item);
        }
    };

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopying(true);
            setTimeout(() => setCopying(false), 2000);
        } catch (err) {
            console.error('Failed to copy', err);
        }
    };

    const handleAddToCart = (item: MenuItem, e: React.MouseEvent<HTMLButtonElement>) => {
        // Determine start and end coordinates for animation
        const cartIcon = document.getElementById('cart-icon');
        let endX = window.innerWidth - 40; // Fallback x
        let endY = 40; // Fallback y

        if (cartIcon) {
            const rect = cartIcon.getBoundingClientRect();
            endX = rect.left + rect.width / 2;
            endY = rect.top + rect.height / 2;
        }

        const startX = e.clientX;
        const startY = e.clientY;

        const animId = Date.now().toString() + Math.random().toString();
        const hasImage = !failedImages.has(item.id) && item.image;

        // Spawn the flying element
        setFlyingItems(prev => [
            ...prev,
            {
                id: animId,
                startX,
                startY,
                endX,
                endY,
                image: hasImage ? item.image : undefined,
                emoji: hasImage ? undefined : EMOJI[item.category] || '🍱',
            },
        ]);

        // Remove flying element after animation finishes
        setTimeout(() => {
            setFlyingItems(prev => prev.filter(f => f.id !== animId));
        }, 1200);

        // Add to real cart
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

    const toggleFavorite = async (itemId: number) => {
        if (!user) return;
        try {
            const data = await api.post('/user/favorites', { menuItemId: itemId });
            setFavoriteItems(prev => {
                const next = new Set(prev);
                if (data.isFavorite) next.add(itemId);
                else next.delete(itemId);
                return next;
            });
        } catch (error) {
            console.error('Failed to toggle favorite', error);
        }
    };

    const menuSchema = {
        '@context': 'https://schema.org',
        '@type': 'Menu',
        name: 'Menú Sushi de Maksim',
        mainEntityOfPage: 'https://sushidemaksim.com/menu',
        hasMenuSection: CATEGORIES.map(cat => ({
            '@type': 'MenuSection',
            name: cat.name,
            hasMenuItem: items
                .filter(item => item.category === cat.id)
                .map(item => ({
                    '@type': 'MenuItem',
                    name: item.name,
                    description: item.description,
                    offers: {
                        '@type': 'Offer',
                        price: item.price,
                        priceCurrency: 'EUR',
                    },
                    image: item.image,
                })),
        })),
    };

    return (
        <div className="min-h-screen bg-transparent px-2 md:px-4 py-4 md:py-8">
            <SEO
                title="Menú y Carta de Sushi"
                description="Explora nuestra carta completa de sushi. Rolles, nigiri, sashimi, combos y más opciones deliciosas con entrega a domicilio en Madrid."
                keywords="menu sushi, carta sushi, pedir sushi madrid, nigiri, sashimi, rolls"
                schema={menuSchema}
            />
            <div className="max-w-7xl mx-auto">
                <h1 className="text-2xl md:text-4xl text-gray-900 font-black text-center mb-4 md:mb-6 tracking-tight">
                    Nuestro Menú
                </h1>

                {/* Search */}
                <div className="flex justify-center mb-6">
                    <div className="relative w-full max-w-md">
                        <Search
                            size={18}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Buscar platos..."
                            className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-full bg-white text-sm outline-none focus:border-red-400 focus:shadow-[0_0_0_3px_rgba(220,38,38,0.1)] transition"
                        />
                        {search && (
                            <button
                                onClick={() => setSearch('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 border-none bg-transparent cursor-pointer"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Category Filter - Sticky and Scrollable on Mobile */}
                <div className="sticky top-20 z-20 -mx-2 md:-mx-4 px-2 md:px-4 py-3 md:py-4 bg-gray-50/80 backdrop-blur-md mb-6 md:mb-8">
                    <div className="flex overflow-x-auto no-scrollbar gap-2 md:gap-2 max-w-7xl mx-auto flex-nowrap sm:flex-wrap sm:justify-center">
                        <button
                            onClick={() => setSelectedCategory('all')}
                            className={`whitespace-nowrap flex-shrink-0 px-4 md:px-5 py-2 md:py-2.5 rounded-full font-black border-none cursor-pointer transition-all duration-200 text-xs md:text-sm ${
                                selectedCategory === 'all'
                                    ? 'bg-red-600 text-white shadow-[0_4px_12px_rgba(220,38,38,0.3)]'
                                    : 'bg-white text-gray-700 shadow-sm hover:bg-gray-100'
                            }`}
                        >
                            Todos
                        </button>
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.id)}
                                className={`whitespace-nowrap flex-shrink-0 flex items-center gap-1.5 md:gap-2 px-4 md:px-5 py-2 md:py-2.5 rounded-full font-black border-none cursor-pointer transition-all duration-200 text-xs md:text-sm ${
                                    selectedCategory === cat.id
                                        ? 'bg-red-600 text-white shadow-[0_4px_12px_rgba(220,38,38,0.3)]'
                                        : 'bg-white text-gray-700 shadow-sm hover:bg-gray-100'
                                }`}
                            >
                                <span className="text-sm md:text-base">{cat.icon}</span>
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Items */}
                {isLoading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                            <div
                                key={i}
                                className="bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col h-full animate-pulse border border-gray-100"
                            >
                                <div className="h-[140px] md:h-[200px] bg-gray-200"></div>
                                <div className="p-3 md:p-4 flex-1 flex flex-col">
                                    <div className="h-5 md:h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                                    <div className="h-3 md:h-4 bg-gray-200 rounded w-full mb-1"></div>
                                    <div className="h-3 md:h-4 bg-gray-200 rounded w-5/6 mb-4"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : items.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-xl text-gray-500">
                            {search
                                ? `No hay resultados para "${search}"`
                                : 'No hay platos en esta categoría'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6 lg:gap-8 pb-20">
                        {items.map(item => (
                            <div
                                key={item.id}
                                id={`item-${item.id}`}
                                className="bg-white rounded-[24px] md:rounded-[32px] shadow-[0_4px_15px_-3px_rgba(0,0,0,0.05)] overflow-hidden transition-all duration-300 relative hover:-translate-y-1 hover:shadow-[0_20px_30px_-5px_rgba(0,0,0,0.1)] flex flex-col group border border-gray-50/50"
                            >
                                <div className="absolute top-2 left-2 right-2 z-10 flex justify-between items-center pointer-events-none">
                                    <button
                                        onClick={e => handleShare(item, e)}
                                        className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-white/90 backdrop-blur-sm shadow-sm flex items-center justify-center hover:scale-110 transition-transform cursor-pointer border-none mix-blend-normal pointer-events-auto"
                                        title="Compartir"
                                    >
                                        <Share2 size={14} className="text-gray-600" />
                                    </button>

                                    {user && (
                                        <button
                                            onClick={() => toggleFavorite(item.id)}
                                            className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-white/90 backdrop-blur-sm shadow-sm flex items-center justify-center hover:scale-110 transition-transform cursor-pointer border-none mix-blend-normal pointer-events-auto"
                                        >
                                            <Heart
                                                size={16}
                                                className={
                                                    favoriteItems.has(item.id)
                                                        ? 'text-red-500'
                                                        : 'text-gray-400'
                                                }
                                                fill={
                                                    favoriteItems.has(item.id)
                                                        ? 'currentColor'
                                                        : 'none'
                                                }
                                            />
                                        </button>
                                    )}
                                </div>

                                {/* Image */}
                                <div className="h-[140px] md:h-[220px] bg-gray-50 overflow-hidden relative flex items-center justify-center">
                                    {!failedImages.has(item.id) ? (
                                        <img
                                            src={item.image}
                                            alt={`Sushi ${item.name} - ${item.category}`}
                                            loading="lazy"
                                            decoding="async"
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            onError={() =>
                                                setFailedImages(prev => new Set(prev).add(item.id))
                                            }
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-gray-50 to-white flex items-center justify-center text-4xl md:text-6xl grayscale opacity-30 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500">
                                            {EMOJI[item.category] || '🍱'}
                                        </div>
                                    )}
                                    <div className="absolute top-10 md:top-12 left-0 flex flex-col gap-1 z-10">
                                        {item.is_popular && (
                                            <span className="bg-amber-500 text-white rounded-r-lg pl-1.5 pr-2 py-0.5 text-[8px] md:text-[10px] font-black uppercase tracking-wider shadow-lg flex items-center gap-1">
                                                <Sparkles size={10} fill="currentColor" /> Top
                                            </span>
                                        )}
                                        {item.is_new && (
                                            <span className="bg-blue-600 text-white rounded-r-lg pl-1.5 pr-2 py-0.5 text-[8px] md:text-[10px] font-black uppercase tracking-wider shadow-lg flex items-center gap-1">
                                                🆕 Nuevo
                                            </span>
                                        )}
                                        {item.is_promo && (
                                            <span className="bg-red-600 text-white rounded-r-lg pl-1.5 pr-2 py-0.5 text-[8px] md:text-[10px] font-black uppercase tracking-wider shadow-lg flex items-center gap-1">
                                                🏷️ Oferta
                                            </span>
                                        )}
                                    </div>
                                    <div className="absolute bottom-1.5 right-1.5 flex gap-1">
                                        {item.spicy && (
                                            <span
                                                className="bg-red-600/90 backdrop-blur-sm text-white rounded-full w-5 h-5 md:w-6 md:h-6 flex items-center justify-center text-[10px] shadow-lg"
                                                title="Picante"
                                            >
                                                🌶️
                                            </span>
                                        )}
                                        {item.vegetarian && (
                                            <span
                                                className="bg-emerald-600/90 backdrop-blur-sm text-white rounded-full w-5 h-5 md:w-6 md:h-6 flex items-center justify-center text-[10px] shadow-lg"
                                                title="Vegetariano"
                                            >
                                                🥬
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="p-3 md:p-5 flex flex-col flex-1">
                                    <h3 className="text-sm md:text-lg font-black m-0 text-gray-900 leading-tight mb-1 line-clamp-2 md:line-clamp-none">
                                        {item.name}
                                    </h3>

                                    <p className="hidden md:block text-gray-500 text-sm leading-relaxed mb-3 flex-1 m-0">
                                        {item.description}
                                    </p>

                                    <div className="flex items-center justify-between mt-auto">
                                        <div className="flex flex-col">
                                            <span className="text-base md:text-[22px] font-black text-gray-900 leading-none">
                                                {item.price.toFixed(2).replace('.', ',')} €
                                            </span>
                                            {item.pieces && (
                                                <span className="text-[10px] md:text-xs text-gray-400 font-bold mt-0.5">
                                                    {item.pieces} uds
                                                </span>
                                            )}
                                        </div>
                                        <button
                                            onClick={e => handleAddToCart(item, e)}
                                            className={`w-9 h-9 md:w-auto md:px-5 md:py-2.5 rounded-xl md:rounded-xl font-black border-none cursor-pointer flex items-center justify-center gap-1.5 text-xs outline-none transition-all duration-300 ${
                                                addedItems.has(item.id)
                                                    ? 'bg-green-600 text-white'
                                                    : 'bg-gray-900 text-white hover:bg-red-600 shadow-xl shadow-gray-100 hover:shadow-red-200 active:scale-95'
                                            }`}
                                        >
                                            {addedItems.has(item.id) ? (
                                                <span className="font-black">✓</span>
                                            ) : (
                                                <>
                                                    <Plus size={18} />
                                                    <span className="hidden md:inline">Añadir</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Share Modal */}
            <AnimatePresence>
                {sharingItem && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSharingItem(null)}
                            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative bg-white rounded-[32px] shadow-2xl w-full max-w-sm overflow-hidden"
                        >
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xl font-black text-gray-900">
                                        Compartir 🍣
                                    </h3>
                                    <button
                                        onClick={() => setSharingItem(null)}
                                        className="p-2 hover:bg-gray-100 rounded-full transition-colors border-none bg-transparent cursor-pointer"
                                    >
                                        <X size={20} className="text-gray-400" />
                                    </button>
                                </div>

                                {/* Preview Card Style */}
                                <div className="bg-gray-50 rounded-2xl p-4 mb-6 flex gap-4 border border-gray-100">
                                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-white shadow-sm flex-shrink-0">
                                        <img
                                            src={sharingItem.image}
                                            alt=""
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-black text-gray-900 text-sm leading-tight mb-1">
                                            {sharingItem.name}
                                        </p>
                                        <p className="text-xs text-gray-500 line-clamp-1">
                                            {sharingItem.description}
                                        </p>
                                        <p className="text-red-600 font-black text-sm mt-1">
                                            {sharingItem.price.toFixed(2).replace('.', ',')} €
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 mb-6">
                                    <a
                                        href={`https://wa.me/?text=${encodeURIComponent(`¡Mira este ${sharingItem.name} de Sushi de Maksim! 🍣\n${window.location.origin}/menu?id=${sharingItem.id}`)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex flex-col items-center justify-center gap-2 p-4 bg-green-50 hover:bg-green-100 text-green-700 rounded-2xl transition-colors no-underline"
                                    >
                                        <div className="w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-green-200">
                                            <svg
                                                className="w-6 h-6 fill-current"
                                                viewBox="0 0 24 24"
                                            >
                                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                                            </svg>
                                        </div>
                                        <span className="text-xs font-black">WhatsApp</span>
                                    </a>
                                    <a
                                        href={`https://t.me/share/url?url=${encodeURIComponent(`${window.location.origin}/menu?id=${sharingItem.id}`)}&text=${encodeURIComponent(`¡Mira este ${sharingItem.name} de Sushi de Maksim! 🍣`)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex flex-col items-center justify-center gap-2 p-4 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-2xl transition-colors no-underline"
                                    >
                                        <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-blue-200">
                                            <svg
                                                className="w-5 h-5 fill-current"
                                                viewBox="0 0 24 24"
                                            >
                                                <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm5.891 8.146l-2.003 9.464c-.149.659-.54 1.222-1.096 1.222-.359 0-.615-.152-.862-.323l-3.111-2.274-1.503 1.447c-.161.163-.362.253-.59.253-.105 0-.211-.02-.315-.062-.352-.142-.587-.487-.587-.866v-2.592l7.103-6.197c.18-.163.076-.254-.15-.125l-8.791 5.485-2.528-.8c-.546-.174-.558-.547.115-.8l9.885-3.815c.458-.19.914-.078 1.223.232.31.31.391.751.232 1.206z" />
                                            </svg>
                                        </div>
                                        <span className="text-xs font-black">Telegram</span>
                                    </a>
                                </div>

                                <button
                                    onClick={() =>
                                        copyToClipboard(
                                            `${window.location.origin}/menu?id=${sharingItem.id}`
                                        )
                                    }
                                    className={`w-full flex items-center justify-center gap-3 p-4 rounded-2xl font-black text-sm transition-all border-none cursor-pointer ${copying ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                >
                                    {copying ? (
                                        <>
                                            <Check size={18} className="text-green-400" />
                                            Enlace Copiado
                                        </>
                                    ) : (
                                        <>
                                            <Copy size={18} />
                                            Copiar Enlace
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Fly-to-Cart Portals */}
            {typeof document !== 'undefined' &&
                createPortal(
                    <AnimatePresence>
                        {flyingItems.map(fly => (
                            <motion.div
                                key={fly.id}
                                initial={{
                                    x: fly.startX - 25,
                                    y: fly.startY - 25,
                                    scale: 1,
                                    opacity: 1,
                                }}
                                animate={{
                                    x: fly.endX - 25,
                                    // Make the arc more pronounced and ensure it hits the cart at scale 0.1
                                    y: [
                                        fly.startY - 25,
                                        Math.min(fly.startY - 150, fly.endY - 50),
                                        fly.endY - 25,
                                    ],
                                    scale: [1, 1.2, 0.1],
                                    opacity: [1, 1, 0],
                                }}
                                transition={{
                                    duration: 1.1,
                                    // Move horizontally in a straight line, slower
                                    x: { ease: 'linear', duration: 1.1 },
                                    // Move vertically with an arc: jump up fast, fall down slowly
                                    y: {
                                        ease: ['easeOut', 'easeIn'],
                                        times: [0, 0.4, 1],
                                        duration: 1.1,
                                    },
                                    // Grow a bit at start of arc, then shrink into cart
                                    scale: { ease: 'easeInOut', times: [0, 0.3, 1], duration: 1.1 },
                                    // Fade out only at the very end
                                    opacity: { ease: 'linear', times: [0, 0.85, 1], duration: 1.1 },
                                }}
                                className="fixed top-0 left-0 z-[1000] pointer-events-none rounded-full overflow-hidden shadow-2xl flex items-center justify-center bg-white border-2 border-red-500 will-change-transform"
                                style={{ width: '50px', height: '50px' }}
                            >
                                {fly.image ? (
                                    <img
                                        src={fly.image}
                                        alt=""
                                        loading="lazy"
                                        decoding="async"
                                        className="w-full h-full object-cover scale-105"
                                    />
                                ) : (
                                    <span className="text-2xl">{fly.emoji}</span>
                                )}
                            </motion.div>
                        ))}
                    </AnimatePresence>,
                    document.body
                )}
        </div>
    );
}
