import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import SEO from '../components/SEO';
import { tracker } from '../analytics/tracker';
import { MenuItemsSkeleton } from '../components/skeletons/MenuSkeleton';
import { CATEGORIES, EMOJI } from '../constants/menu';
import { MenuItem, useMenu, useFavorites, useToggleFavorite } from '../hooks/queries/useMenu';
import MenuCategoryBar from '../components/menu/MenuCategoryBar';
import MenuSearch from '../components/menu/MenuSearch';
import ShareModal from '../components/menu/ShareModal';
import ProductGrid from '../components/menu/ProductGrid';
import FlyToCart, { FlyingItem } from '../components/menu/FlyToCart';

export default function MenuPage() {
    const [searchParams] = useSearchParams();
    const initialCategory = searchParams.get('category') || 'all';
    const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState(search);
    const { addItem } = useCart();
    const { user } = useAuth();
    const [addedItems, setAddedItems] = useState<Set<number>>(new Set());
    const [flyingItems, setFlyingItems] = useState<FlyingItem[]>([]);
    const [sharingItem, setSharingItem] = useState<MenuItem | null>(null);
    const [copying, setCopying] = useState(false);
    const [isSearchExpanded, setIsSearchExpanded] = useState(false);

    // Queries
    const { data: items = [], isLoading, isError } = useMenu(selectedCategory, debouncedSearch);
    const { data: favorites } = useFavorites(user);
    const { mutate: toggleFavorite } = useToggleFavorite();
    const [highlightedItemId, setHighlightedItemId] = useState<string | null>(null);

    // Debounce search input
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(search);
            if (search.trim().length > 2) {
                tracker.track('search', {
                    metadata: { query: search },
                    userId: user?.id,
                });
            }
        }, 350);
        return () => clearTimeout(handler);
    }, [search, user?.id]);

    const initialCategoryMount = useRef(true);
    const initialSearchMount = useRef(true);

    // Scroll to top of menu section when category changes
    useEffect(() => {
        if (initialCategoryMount.current) {
            initialCategoryMount.current = false;
            return;
        }

        const menuTop = document.getElementById('menu-content');
        if (menuTop) {
            const isMobile = window.innerWidth < 1024;
            // Use stable predictive offset (compact header 64px + small buffer)
            const offset = isMobile ? 80 : 80;
            const targetTop = Math.max(
                0,
                menuTop.getBoundingClientRect().top + window.scrollY - offset
            );

            // Using instant scroll avoids the "jump from bottom" visual glitch
            // that occurs when the DOM drastically shrinks in height (e.g. going from "All" to a small category)
            // while a long smooth-scroll animation is trying to play.
            if ((window as any).lenis) {
                (window as any).lenis.scrollTo(targetTop, { immediate: true });
            } else {
                window.scrollTo({ top: targetTop, behavior: 'instant' });
            }
        }
    }, [selectedCategory, user?.id]);

    useEffect(() => {
        if (debouncedSearch && !isLoading && items.length > 0) {
            if (initialSearchMount.current) {
                initialSearchMount.current = false;
                return;
            }
            const menuTop = document.getElementById('menu-content');
            if (menuTop) {
                const isMobile = window.innerWidth < 1024;
                const offset = isMobile ? 80 : 80;
                const targetTop = Math.max(
                    0,
                    menuTop.getBoundingClientRect().top + window.scrollY - offset
                );

                if ((window as any).lenis) {
                    (window as any).lenis.scrollTo(targetTop, { immediate: true });
                } else {
                    window.scrollTo({ top: targetTop, behavior: 'instant' });
                }
            }
        }
    }, [debouncedSearch, isLoading, items.length]);

    const hasScrolledToHash = useRef(false);

    // Handle initial hash scroll and highlight
    useEffect(() => {
        if (!isLoading && items.length > 0 && !hasScrolledToHash.current) {
            const hash = window.location.hash;
            if (hash) {
                const id = hash.replace('#', '');
                hasScrolledToHash.current = true;

                // If it's a specific product link (item-ID), highlight it
                if (id.startsWith('item-')) {
                    const itemId = id.replace('item-', '');
                    setHighlightedItemId(itemId);
                    setTimeout(() => setHighlightedItemId(null), 3000);
                }

                setTimeout(() => {
                    const el = document.getElementById(id);
                    if (el) {
                        const headerHeight =
                            parseInt(
                                getComputedStyle(document.documentElement).getPropertyValue(
                                    '--header-height'
                                )
                            ) || 80;

                        const offset = headerHeight + 16;
                        const top = el.getBoundingClientRect().top + window.scrollY - offset;
                        window.scrollTo({ top, behavior: 'smooth' });
                    }
                }, 400); // Slightly more delay for better stability
            }
        }
    }, [isLoading, items.length]);

    const handleShare = (item: MenuItem, e: React.MouseEvent) => {
        e.stopPropagation();
        setSharingItem(item);
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

    const handleAddToCart = (
        item: MenuItem,
        e: React.MouseEvent<HTMLButtonElement>,
        quantity: number = 1
    ) => {
        try {
            // Determine start and end coordinates for animation
            const cartIcon = document.getElementById('cart-icon');
            let endX = window.innerWidth - 40; // Fallback x
            let endY = 40; // Fallback y

            if (cartIcon) {
                const rect = cartIcon.getBoundingClientRect();
                endX = rect.left + rect.width / 2;
                endY = rect.top + rect.height / 2;
            }

            const startX = e.clientX || 0;
            const startY = e.clientY || 0;

            const animId = Date.now().toString() + Math.random().toString();
            const hasImage = !!item.image;

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
            }, 900);
        } catch (err) {
            console.error('Animation error:', err);
        }

        // Haptic feedback
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate(10);
        }

        // Add to real cart
        addItem(
            {
                id: String(item.id),
                name: item.name,
                description: item.description,
                price: item.price,
                image: item.image,
                category: item.category as any,
                pieces: item.pieces,
                spicy: item.spicy,
                vegetarian: item.vegetarian,
                isPromo: item.isPromo,
            },
            quantity
        );

        tracker.track('add_to_cart', {
            metadata: {
                productId: item.id,
                productName: item.name,
                category: item.category,
                price: item.price,
                quantity,
            },
            userId: user?.id,
        });

        const itemId = item.id;
        setAddedItems(prev => new Set(prev).add(itemId));

        // Use a unique timeout per item to avoid race conditions
        setTimeout(() => {
            setAddedItems(prev => {
                const n = new Set(prev);
                n.delete(itemId);
                return n;
            });
        }, 1600);
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

    const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            {
                '@type': 'ListItem',
                position: 1,
                name: 'Inicio',
                item: 'https://sushidemaksim.com/',
            },
            {
                '@type': 'ListItem',
                position: 2,
                name: 'Carta',
                item: 'https://sushidemaksim.com/menu',
            },
        ],
    };

    return (
        <div className="min-h-screen bg-transparent pb-0 pt-0 flex flex-col">
            <SEO
                title={
                    selectedCategory === 'all'
                        ? 'Menú de Sushi a Domicilio en Madrid | Carta Compleта'
                        : `Menú de ${CATEGORIES.find(c => c.id === selectedCategory)?.name || 'Sushi'} en Madrid`
                }
                description="Descubre el mejor menú de sushi en Madrid. Rolls artesanales, nigiri, sashimi и combos premium con entrega rápida a domicilio. ¡Calidad superior en cada bocado!"
                keywords="menu sushi madrid, carta sushi, pedir sushi online madrid, sushi a domicilio, nigiri madrid, rolls japoneses"
                schema={[menuSchema, breadcrumbSchema]}
                url="https://sushidemaksim.com/menu"
            />
            <div className="max-w-[1440px] mx-auto flex-1 md:flex px-3 md:px-6 w-full">
                {/* Desktop Sidebar Sidebar */}
                <MenuCategoryBar
                    selectedCategory={selectedCategory}
                    setSelectedCategory={setSelectedCategory}
                />

                <div className="flex-1 min-w-0 md:pl-8 pt-4 min-h-[70vh]" id="menu-content">
                    {/* Header Section with Search */}
                    <div className="mb-4">
                        <MenuSearch
                            search={search}
                            setSearch={setSearch}
                            isSearchExpanded={isSearchExpanded}
                            setIsSearchExpanded={setIsSearchExpanded}
                        />
                    </div>

                    {/* Fixed category bar on mobile */}
                    <MenuCategoryBar
                        selectedCategory={selectedCategory}
                        setSelectedCategory={setSelectedCategory}
                        isMobile
                    />

                    {/* Items Section */}
                    {isLoading ? (
                        <div className="space-y-12">
                            <MenuItemsSkeleton showHeader={selectedCategory === 'all' && !search} />
                        </div>
                    ) : isError ? (
                        <div className="flex flex-col items-center justify-center py-20 bg-gray-50/50 rounded-[32px] border-2 border-dashed border-gray-100 animate-in fade-in zoom-in-95 duration-500">
                            <span className="text-5xl mb-6 drop-shadow-lg">🍱</span>
                            <h3 className="text-xl font-black text-gray-900 mb-2 uppercase tracking-tight">
                                Algo salió mal
                            </h3>
                            <p className="text-gray-500 font-medium text-center max-w-sm px-6">
                                No pudimos cargar el menú en este momento. Por favor, revisa tu
                                conexión e inténtalo de nuevo.
                            </p>
                            <button
                                onClick={() => window.location.reload()}
                                className="mt-8 px-8 py-3.5 bg-gray-900 text-white rounded-2xl font-black text-sm hover:bg-black transition-all active:scale-95 shadow-xl shadow-gray-200"
                            >
                                REINTENTAR
                            </button>
                        </div>
                    ) : (
                        <ProductGrid
                            items={items}
                            selectedCategory={selectedCategory}
                            search={search}
                            setSearch={setSearch}
                            setSelectedCategory={setSelectedCategory}
                            user={user}
                            favorites={favorites as Set<number>}
                            onToggleFavorite={toggleFavorite}
                            onShare={handleShare}
                            onAddToCart={handleAddToCart}
                            addedItems={addedItems}
                            highlightedItemId={highlightedItemId}
                        />
                    )}
                </div>
            </div>

            {/* Share Modal */}
            <ShareModal
                item={sharingItem}
                onClose={() => setSharingItem(null)}
                onCopy={copyToClipboard}
                copying={copying}
            />

            {/* Fly-to-Cart Animation */}
            <FlyToCart items={flyingItems} />
        </div>
    );
}
