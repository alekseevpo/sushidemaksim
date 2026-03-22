import { useState, useEffect, useRef } from 'react';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import SEO from '../components/SEO';
import { MenuItemsSkeleton } from '../components/skeletons/MenuSkeleton';
import { CATEGORIES, EMOJI } from '../constants/menu';
import { MenuItem, useMenu, useFavorites, useToggleFavorite } from '../hooks/queries/useMenu';
import MenuCategoryBar from '../components/menu/MenuCategoryBar';
import MenuSearch from '../components/menu/MenuSearch';
import ShareModal from '../components/menu/ShareModal';
import ProductGrid from '../components/menu/ProductGrid';
import FlyToCart, { FlyingItem } from '../components/menu/FlyToCart';

export default function MenuPageSimple() {
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState(search);
    const { addItem } = useCart();
    const { user } = useAuth();
    const [addedItems, setAddedItems] = useState<Set<number>>(new Set());
    const [failedImages, setFailedImages] = useState<Set<number>>(new Set());
    const [flyingItems, setFlyingItems] = useState<FlyingItem[]>([]);
    const [sharingItem, setSharingItem] = useState<MenuItem | null>(null);
    const [copying, setCopying] = useState(false);
    const [isSearchExpanded, setIsSearchExpanded] = useState(false);

    // Queries
    const { data: items = [], isLoading } = useMenu(selectedCategory, debouncedSearch);
    const { data: favorites } = useFavorites(user);
    const { mutate: toggleFavorite } = useToggleFavorite();
    const [highlightedItemId, setHighlightedItemId] = useState<string | null>(null);

    // Debounce search input
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(search);
        }, 350);
        return () => clearTimeout(handler);
    }, [search]);

    const initialCategoryMount = useRef(true);
    const initialSearchMount = useRef(true);

    // Scroll to top of menu section when category changes
    useEffect(() => {
        if (!isLoading) {
            if (initialCategoryMount.current) {
                initialCategoryMount.current = false;
                return;
            }
            const menuTop = document.getElementById('menu-content');
            if (menuTop) {
                const headerHeight =
                    parseInt(
                        getComputedStyle(document.documentElement).getPropertyValue(
                            '--header-height'
                        )
                    ) || 80;
                const isMobile = window.innerWidth < 1024;
                const offset = headerHeight + (isMobile ? 80 : 32);
                const top = menuTop.getBoundingClientRect().top + window.scrollY - offset;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        }
    }, [selectedCategory, isLoading]);

    // Scroll active category into view on mobile
    useEffect(() => {
        const activeCat = document.getElementById(`cat-${selectedCategory}`);
        if (activeCat && activeCat.scrollIntoView) {
            activeCat.scrollIntoView({
                behavior: 'smooth',
                inline: selectedCategory === 'all' ? 'start' : 'center',
                block: 'nearest',
            });
        }
    }, [selectedCategory]);

    useEffect(() => {
        if (debouncedSearch && !isLoading && items.length > 0) {
            if (initialSearchMount.current) {
                initialSearchMount.current = false;
                return;
            }
            const menuTop = document.getElementById('menu-content');
            if (menuTop) {
                const headerHeight =
                    parseInt(
                        getComputedStyle(document.documentElement).getPropertyValue(
                            '--header-height'
                        )
                    ) || 80;
                const isMobile = window.innerWidth < 1024;
                const offset = headerHeight + (isMobile ? 80 : 32);
                const top = menuTop.getBoundingClientRect().top + window.scrollY - offset;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        }
    }, [debouncedSearch, isLoading, items.length]);

    // Handle initial hash scroll and highlight
    useEffect(() => {
        if (!isLoading && items.length > 0) {
            const hash = window.location.hash;
            if (hash) {
                const id = hash.replace('#', '');
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
                        const isMobile = window.innerWidth < 1024;
                        const offset = headerHeight + (isMobile ? 80 : 32);
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
                isPromo: item.is_promo,
            },
            quantity
        );

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

    return (
        <div className="min-h-screen bg-transparent px-0 md:px-4 pb-0 pt-0 flex flex-col">
            <SEO
                title={
                    selectedCategory === 'all'
                        ? 'Menú y Carta de Sushi'
                        : `Menú: ${CATEGORIES.find(c => c.id === selectedCategory)?.name || 'Sushi'}`
                }
                description="Explora nuestra carta completa de sushi. Rolles, nigiri, sashimi, combos y más opciones deliciosas con entrega a domicilio en Madrid."
                keywords="menu sushi, carta sushi, pedir sushi madrid, nigiri, sashimi, rolls"
                schema={menuSchema}
            />
            <div className="max-w-7xl mx-auto flex-1 lg:flex px-3 md:px-4 w-full">
                {/* Desktop Sidebar Sidebar */}
                <MenuCategoryBar
                    selectedCategory={selectedCategory}
                    setSelectedCategory={setSelectedCategory}
                />

                <div className="flex-1 min-w-0 md:pl-8 pt-4 md:pt-8" id="menu-content">
                    {/* Spacer for fixed category bar on mobile */}
                    <div className="h-12 lg:hidden" />
                    {/* Header Section with Search */}
                    <MenuSearch
                        search={search}
                        setSearch={setSearch}
                        isSearchExpanded={isSearchExpanded}
                        setIsSearchExpanded={setIsSearchExpanded}
                        selectedCategory={selectedCategory}
                    />

                    {/* Fixed category bar on mobile */}
                    <MenuCategoryBar
                        selectedCategory={selectedCategory}
                        setSelectedCategory={setSelectedCategory}
                        isMobile
                    />

                    {/* Items Section */}
                    {isLoading ? (
                        <div className="space-y-12">
                            <MenuItemsSkeleton />
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
                            failedImages={failedImages}
                            setFailedImages={setFailedImages}
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
