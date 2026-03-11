import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    Search,
    X,
    Heart,
    Sparkles,
    Share2,
    Copy,
    Check,
    Waves,
    Fish,
    Flame,
    Soup,
    Gift,
    Droplets,
    Cake,
} from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { api } from '../utils/api';
import SEO from '../components/SEO';
import { MenuSkeleton } from '../components/skeletons/MenuSkeleton';

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
    { id: 'entrantes', name: 'Entrantes', icon: Waves },
    { id: 'rollos-grandes', name: 'Rollos Grandes', icon: Fish },
    { id: 'rollos-clasicos', name: 'Rollos Clásicos', icon: Fish },
    { id: 'rollos-fritos', name: 'Rollos Fritos', icon: Flame },
    { id: 'sopas', name: 'Sopas', icon: Soup },
    { id: 'menus', name: 'Menús', icon: Gift },
    { id: 'extras', name: 'Extras', icon: Droplets },
    { id: 'postre', name: 'Postre', icon: Cake },
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

        // Haptic feedback
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate(10);
        }

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
                if (data.isFavorite) {
                    next.add(itemId);
                    if (typeof navigator !== 'undefined' && navigator.vibrate) {
                        navigator.vibrate(10);
                    }
                } else next.delete(itemId);
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
            <div className="max-w-7xl mx-auto flex gap-8">
                {/* Desktop Sidebar Sidebar */}
                <aside className="hidden lg:block w-64 flex-shrink-0 sticky top-24 self-start">
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                        <h2 className="text-lg font-black text-gray-900 mb-6 px-2">Categorías</h2>
                        <nav className="flex flex-col gap-1">
                            <button
                                onClick={() => setSelectedCategory('all')}
                                className={`w-full text-left px-4 py-3 rounded-2xl font-black transition-all duration-200 flex items-center gap-3 border-none cursor-pointer ${
                                    selectedCategory === 'all'
                                        ? 'bg-red-50 text-red-600'
                                        : 'bg-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                            >
                                <Sparkles size={20} strokeWidth={1.5} />
                                <span className="text-sm">Todos</span>
                            </button>
                            {CATEGORIES.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedCategory(cat.id)}
                                    className={`w-full text-left px-4 py-3 rounded-2xl font-black transition-all duration-200 flex items-center gap-3 border-none cursor-pointer ${
                                        selectedCategory === cat.id
                                            ? 'bg-red-50 text-red-600'
                                            : 'bg-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                                >
                                    <cat.icon size={20} strokeWidth={1.5} />
                                    <span className="text-sm">{cat.name}</span>
                                </button>
                            ))}
                        </nav>
                    </div>
                </aside>

                <div className="flex-1 min-w-0">
                    <h1 className="text-3xl md:text-5xl text-gray-900 font-black mb-4 md:mb-8 tracking-tighter">
                        Nuestro Menú
                    </h1>

                    {/* Search */}
                    <div className="flex mb-8">
                        <div className="relative w-full max-w-xl">
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
                                className="w-full pl-12 pr-12 py-4 border border-gray-200 rounded-3xl bg-white text-base outline-none focus:border-red-400 focus:shadow-[0_0_0_4px_rgba(220,38,38,0.05)] transition-all shadow-sm"
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

                    {/* Category Filter - Mobile Only (Horizontal scroll) */}
                    <div className="lg:hidden sticky top-[72px] z-20 -mx-4 px-4 py-4 bg-gray-50/80 backdrop-blur-md mb-6 overflow-x-auto no-scrollbar">
                        <div className="flex gap-2 flex-nowrap">
                            <button
                                onClick={() => setSelectedCategory('all')}
                                className={`whitespace-nowrap px-5 py-2.5 rounded-2xl font-black border-none cursor-pointer transition-all duration-200 text-sm ${
                                    selectedCategory === 'all'
                                        ? 'bg-red-600 text-white shadow-lg shadow-red-200'
                                        : 'bg-white text-gray-700 shadow-sm'
                                }`}
                            >
                                Todos
                            </button>
                            {CATEGORIES.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedCategory(cat.id)}
                                    className={`whitespace-nowrap flex items-center gap-2 px-5 py-2.5 rounded-2xl font-black border-none cursor-pointer transition-all duration-200 text-sm ${
                                        selectedCategory === cat.id
                                            ? 'bg-red-600 text-white shadow-lg shadow-red-200'
                                            : 'bg-white text-gray-700 shadow-sm'
                                    }`}
                                >
                                    <cat.icon size={18} strokeWidth={1.5} />
                                    {cat.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Items */}
                    {isLoading ? (
                        <MenuSkeleton />
                    ) : items.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-[40px] border border-dashed border-gray-200">
                            <div className="text-6xl mb-4">🙊</div>
                            <h3 className="text-xl font-black text-gray-900 mb-2">
                                {search
                                    ? `No hay resultados para "${search}"`
                                    : 'No hay platos en esta categoría'}
                            </h3>
                            <p className="text-gray-500">Intenta buscar con otros términos</p>
                            <button
                                onClick={() => {
                                    setSearch('');
                                    setSelectedCategory('all');
                                }}
                                className="mt-6 px-6 py-3 bg-gray-900 text-white rounded-2xl font-black border-none cursor-pointer hover:bg-red-600 transition-colors"
                            >
                                Ver todo el menú
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-12 pb-24">
                            {(selectedCategory === 'all' && !search
                                ? CATEGORIES.filter(cat =>
                                      items.some(item => item.category === cat.id)
                                  )
                                : [{ id: selectedCategory, name: '', icon: '' }]
                            ).map(cat => {
                                const sectionItems =
                                    selectedCategory === 'all' && !search
                                        ? items.filter(item => item.category === cat.id)
                                        : items;

                                if (sectionItems.length === 0) return null;

                                return (
                                    <div
                                        key={cat.id}
                                        className="scroll-mt-32"
                                        id={`section-${cat.id}`}
                                    >
                                        {selectedCategory === 'all' && !search && (
                                            <div className="flex items-center gap-4 mb-6 md:mb-8">
                                                <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-2xl border border-gray-100">
                                                    <cat.icon
                                                        size={24}
                                                        strokeWidth={1.5}
                                                        className="text-red-600"
                                                    />
                                                </div>
                                                <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">
                                                    {cat.name}
                                                </h2>
                                                <div className="h-[2px] flex-1 bg-gradient-to-r from-gray-100 to-transparent"></div>
                                            </div>
                                        )}

                                        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
                                            {sectionItems.map(item => (
                                                <div
                                                    key={item.id}
                                                    id={`item-${item.id}`}
                                                    className="premium-card group flex flex-col h-full rounded-[32px] overflow-hidden"
                                                >
                                                    <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                        <button
                                                            onClick={e => handleShare(item, e)}
                                                            className="w-9 h-9 rounded-2xl bg-white/90 backdrop-blur-md shadow-xl flex items-center justify-center hover:scale-110 transition-transform cursor-pointer border-none"
                                                            title="Compartir"
                                                        >
                                                            <Share2
                                                                size={16}
                                                                strokeWidth={1.5}
                                                                className="text-gray-900"
                                                            />
                                                        </button>

                                                        {user && (
                                                            <button
                                                                onClick={() =>
                                                                    toggleFavorite(item.id)
                                                                }
                                                                className="w-9 h-9 rounded-2xl bg-white/90 backdrop-blur-md shadow-xl flex items-center justify-center hover:scale-110 transition-transform cursor-pointer border-none"
                                                            >
                                                                <Heart
                                                                    size={18}
                                                                    strokeWidth={1.5}
                                                                    className={
                                                                        favoriteItems.has(item.id)
                                                                            ? 'text-red-500'
                                                                            : 'text-gray-400'
                                                                    }
                                                                    fill="none"
                                                                />
                                                            </button>
                                                        )}
                                                    </div>

                                                    {/* Image Container */}
                                                    <div className="h-44 md:h-56 bg-white overflow-hidden relative flex items-center justify-center p-2">
                                                        {!failedImages.has(item.id) ? (
                                                            <img
                                                                src={item.image}
                                                                alt={item.name}
                                                                loading="lazy"
                                                                className="w-full h-full object-cover rounded-2xl transition-transform duration-700 group-hover:scale-105"
                                                                onError={() =>
                                                                    setFailedImages(prev =>
                                                                        new Set(prev).add(item.id)
                                                                    )
                                                                }
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full bg-gray-50 rounded-2xl flex items-center justify-center text-5xl grayscale opacity-30 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500">
                                                                {EMOJI[item.category] || '🍱'}
                                                            </div>
                                                        )}

                                                        {/* Badges */}
                                                        <div className="absolute bottom-4 left-4 flex flex-col gap-1.5">
                                                            {item.is_popular && (
                                                                <span className="bg-amber-400 text-amber-950 px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-lg flex items-center gap-1">
                                                                    <Sparkles
                                                                        size={10}
                                                                        strokeWidth={1.5}
                                                                    />{' '}
                                                                    Popular
                                                                </span>
                                                            )}
                                                            {item.is_new && (
                                                                <span className="bg-white text-gray-900 px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-lg">
                                                                    ✨ Nuevo
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="p-6 flex flex-col flex-1">
                                                        <div className="mb-2">
                                                            <h3 className="text-lg md:text-xl font-black text-gray-900 leading-tight line-clamp-1">
                                                                {item.name}
                                                            </h3>
                                                            {item.pieces && (
                                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">
                                                                    {item.pieces} Unidades
                                                                </span>
                                                            )}
                                                        </div>

                                                        <p className="text-gray-500 text-sm leading-relaxed mb-6 line-clamp-2 md:line-clamp-none flex-1 font-medium">
                                                            {item.description}
                                                        </p>

                                                        <div className="flex items-center justify-between">
                                                            <span className="text-2xl font-black text-gray-900">
                                                                {item.price
                                                                    .toFixed(2)
                                                                    .replace('.', ',')}{' '}
                                                                €
                                                            </span>
                                                            <button
                                                                onClick={e =>
                                                                    handleAddToCart(item, e)
                                                                }
                                                                className={`h-11 px-6 rounded-2xl font-black text-sm transition-all duration-300 flex items-center gap-2 border-none cursor-pointer ${
                                                                    addedItems.has(item.id)
                                                                        ? 'bg-green-500 text-white'
                                                                        : 'bg-gray-900 text-white hover:bg-red-600 hover:shadow-xl hover:shadow-red-200 active:scale-95'
                                                                }`}
                                                            >
                                                                {addedItems.has(item.id) ? (
                                                                    <Check
                                                                        size={20}
                                                                        strokeWidth={1.5}
                                                                    />
                                                                ) : (
                                                                    <>
                                                                        <Plus
                                                                            size={18}
                                                                            strokeWidth={1.5}
                                                                        />
                                                                        <span>Añadir</span>
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
                            })}
                        </div>
                    )}
                </div>
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
                                        <X size={20} strokeWidth={1.5} className="text-gray-400" />
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
                                            <Check
                                                size={18}
                                                strokeWidth={1.5}
                                                className="text-green-400"
                                            />
                                            Enlace Copiado
                                        </>
                                    ) : (
                                        <>
                                            <Copy size={18} strokeWidth={1.5} />
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
