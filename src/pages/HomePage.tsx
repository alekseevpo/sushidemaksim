import { useState, useRef, useMemo, memo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import SEO from '../components/SEO';
import Newsletter from '../components/Newsletter';
import RatingsBanner from '../components/RatingsBanner';
import ReviewsSEO from '../components/ReviewsSEO';
import { useCart } from '../hooks/useCart';
import { usePopularItems, useCategories, MenuItem } from '../hooks/queries/useMenu';
import ProductCard from '../components/menu/ProductCard';
import ShareModal from '../components/menu/ShareModal';
import { getOptimizedImageUrl } from '../utils/images';
import SafeImage from '../components/common/SafeImage';
import ReservationModal from '../components/reservations/ReservationModal';
import { useSettings } from '../hooks/queries/useSettings';
import { api } from '../utils/api';
import { HomeSkeleton } from '../components/skeletons/HomeSkeleton';
import { SITE_URL } from '../constants/config';

const Marquee = () => (
    <div className="relative py-4 md:py-6 overflow-hidden bg-black border-y border-white/5 select-none">
        <div className="flex whitespace-nowrap animate-marquee">
            {[1, 2].map(i => (
                <div key={i} className="flex items-center gap-12 px-6">
                    <span className="text-white/10 text-3xl md:text-5xl font-black italic tracking-tighter">
                        FRESH SEAFOOD DAILY
                    </span>
                    <span className="text-orange-600/30 text-3xl md:text-5xl font-black">●</span>
                    <span className="text-white/10 text-3xl md:text-5xl font-black italic tracking-tighter">
                        PREMIUM QUALITY
                    </span>
                    <span className="text-orange-600/30 text-3xl md:text-5xl font-black">●</span>
                    <span className="text-white/10 text-3xl md:text-5xl font-black italic tracking-tighter">
                        FASTEST DELIVERY
                    </span>
                    <span className="text-orange-600/30 text-3xl md:text-5xl font-black">●</span>
                </div>
            ))}
        </div>
    </div>
);

const CategoryCard = memo(
    ({
        id,
        name,
        image,
        index,
    }: {
        id: string;
        name: string;
        image: string | null;
        index: number;
    }) => {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group relative h-40 md:h-56 rounded-[2rem] overflow-hidden cursor-pointer bg-gray-100"
            >
                <Link to={`/menu#section-${id}`} className="absolute inset-0 z-10" />

                <SafeImage
                    src={image || ''}
                    alt={`Sushi de Maksim: Categoría ${name} - Madrid`}
                    loading="lazy"
                    decoding="async"
                    getOptimizedUrl={(url: string) => getOptimizedImageUrl(url, 640)}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                    fallbackContent={
                        <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                            <span className="text-gray-300 font-bold text-[10px] uppercase">
                                No Image
                            </span>
                        </div>
                    }
                />

                {/* Soft gradient overlay for text readability at top */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent"></div>

                {/* Title at the TOP - uniform and compact */}
                <div className="absolute top-5 left-5 right-5">
                    <h3 className="text-white font-black text-[15px] md:text-[18px] leading-tight drop-shadow-sm tracking-tight">
                        {name}
                    </h3>
                </div>
            </motion.div>
        );
    }
);

export default function HomePage() {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const { items, addItem } = useCart();

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const container = scrollContainerRef.current;
            const scrollAmount = container.clientWidth * 0.8;
            container.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth',
            });
        }
    };

    const [sharingItem, setSharingItem] = useState<MenuItem | null>(null);
    const [copying, setCopying] = useState(false);
    const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);

    // Use TanStack Query — fetch only popular items instead of entire catalog
    const { data: popularItems = [], isLoading: itemsLoading } = usePopularItems(8);
    const { data: categoriesData = [], isLoading: catsLoading } = useCategories();
    const { data: settings } = useSettings();

    // Fetch active promo banners for dynamic display
    const { data: promosData, isLoading: promosLoading } = useQuery({
        queryKey: ['promos'],
        queryFn: () => api.get('/promos'),
        staleTime: 5 * 60 * 1000,
    });

    const isLoading = itemsLoading || catsLoading || promosLoading;

    const activePromos = ((promosData?.promos ?? []) as any[]).filter(
        p => p.code !== 'TEST10' && p.title !== 'TEST10'
    );

    const categoriesWithImages = useMemo(() => {
        // Hardcoded mapping for homepage to ensure premium look if DB fallback fails
        const TOP_CATEGORY_FALLBACKS: Record<string, string> = {
            postre: getOptimizedImageUrl(
                'https://dvsmzciknlfevgxpnefr.supabase.co/storage/v1/object/public/images/menu/1772834659669-446.webp',
                640
            ),
            'rollos-clasicos': getOptimizedImageUrl(
                'https://dvsmzciknlfevgxpnefr.supabase.co/storage/v1/object/public/images/menu/1773679824487-765.webp',
                640
            ),
            entrantes: getOptimizedImageUrl(
                'https://dvsmzciknlfevgxpnefr.supabase.co/storage/v1/object/public/images/menu/1773469716444-139.webp',
                640
            ),
            'rollos-grandes': getOptimizedImageUrl(
                'https://dvsmzciknlfevgxpnefr.supabase.co/storage/v1/object/public/images/menu/1773691339304-197.webp',
                640
            ),
            'rollos-fritos': getOptimizedImageUrl(
                'https://dvsmzciknlfevgxpnefr.supabase.co/storage/v1/object/public/images/menu/1773682008412-27.webp',
                640
            ),
            'rollos-fritos-horneados': getOptimizedImageUrl(
                'https://dvsmzciknlfevgxpnefr.supabase.co/storage/v1/object/public/images/menu/1773682008412-27.webp',
                640
            ),
            menus: getOptimizedImageUrl(
                'https://dvsmzciknlfevgxpnefr.supabase.co/storage/v1/object/public/images/menu/1773689515418-937.webp',
                640
            ),
            extras: getOptimizedImageUrl(
                'https://dvsmzciknlfevgxpnefr.supabase.co/storage/v1/object/public/images/menu/1773690670774-801.webp',
                640
            ),
            sopas: getOptimizedImageUrl(
                'https://dvsmzciknlfevgxpnefr.supabase.co/storage/v1/object/public/images/menu/1773688556688-515.webp',
                640
            ),
        };

        const CATEGORY_ORDER = [
            'entrantes',
            'rollos-grandes',
            'rollos-clasicos',
            'rollos-fritos-horneados',
            'rollos-fritos',
            'sopas',
            'menus',
            'extras',
            'postre',
        ];

        return categoriesData
            .map((cat: any) => {
                // Normalize ID: replace spaces/slashes with hyphens, remove special chars
                const catId = String(cat.id || cat.name || '')
                    .toLowerCase()
                    .trim()
                    .replace(/\s+/g, '-')
                    .replace(/\//g, '-')
                    .normalize('NFD')
                    .replace(/[\u0300-\u036f]/g, '') // Remove accents
                    .replace(/[^a-z0-9-]/g, '')
                    .replace(/-+/g, '-');

                // Category images come from the API or hardcoded fallbacks.
                // No need to scan full menu catalog.

                return {
                    ...cat,
                    catId, // Store normalized ID for sorting
                    image: cat.image || TOP_CATEGORY_FALLBACKS[catId] || null,
                };
            })
            .sort((a: any, b: any) => {
                const indexA = CATEGORY_ORDER.indexOf(a.catId);
                const indexB = CATEGORY_ORDER.indexOf(b.catId);

                // If both are in the list, sort by index
                if (indexA !== -1 && indexB !== -1) return indexA - indexB;
                // If only one is in the list, prioritized identified one
                if (indexA !== -1) return -1;
                if (indexB !== -1) return 1;
                // Fallback to alphabetical for unknown categories
                return String(a.name).localeCompare(String(b.name));
            });
    }, [categoriesData]);

    // 2. Pre-calculate the slice for rendering
    const categoryList = useMemo(() => {
        return categoriesWithImages.slice(0, 8);
    }, [categoriesWithImages]);

    if (isLoading) {
        return <HomeSkeleton />;
    }

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

    const handleAddToCart = (item: any, _e?: any, quantity: number = 1) => {
        addItem(
            {
                ...item,
                id: String(item.id),
                category: item.category as any,
            },
            quantity
        );

        // Haptic
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate(10);
        }
    };

    return (
        <div className="overflow-hidden">
            <SEO
                title="Sushi a domicilio en Madrid — Sushi de Maksim | Calidad Premium"
                description={`El mejor sushi artesanal de Madrid con entrega a domicilio. Pide online rolls, nigiri y sashimi frescos. ⭐ ${settings?.ratingGoogle || '4.9'}/5 basado en ${settings?.ratingReviewsCount || '+500'} reseñas. ¡Pide ahora y disfruta de la experiencia japonesa!`}
                keywords="sushi madrid, sushi a domicilio madrid, pedir sushi online, mejor sushi madrid, sushi de maksim, comida japonesa madrid"
                schema={{
                    '@context': 'https://schema.org',
                    '@type': 'Restaurant',
                    name: 'Sushi de Maksim',
                    image: `${SITE_URL}/sushi-hero.webp`,
                    '@id': SITE_URL,
                    url: SITE_URL,
                    telephone: '+34 631 920 312',
                    priceRange: '$$',
                    servesCuisine: ['Japanese', 'Sushi'],
                    address: {
                        '@type': 'PostalAddress',
                        streetAddress: settings?.contactAddressLine1 || 'C. de Barrilero, 20',
                        addressLocality: 'Madrid',
                        postalCode: '28007',
                        addressCountry: 'ES',
                    },
                    geo: {
                        '@type': 'GeoCoordinates',
                        latitude: 40.397042,
                        longitude: -3.672449,
                    },
                    aggregateRating: {
                        '@type': 'AggregateRating',
                        ratingValue: (settings?.ratingGoogle || 4.9).toString(),
                        reviewCount: (settings?.ratingReviewsCount || 524).toString(),
                        bestRating: '5',
                        worstRating: '1',
                    },
                    openingHoursSpecification: [
                        {
                            '@type': 'OpeningHoursSpecification',
                            dayOfWeek: ['Wednesday', 'Thursday'],
                            opens: '19:00',
                            closes: '23:00',
                        },
                        {
                            '@type': 'OpeningHoursSpecification',
                            dayOfWeek: ['Friday', 'Saturday', 'Sunday'],
                            opens: '14:00',
                            closes: '23:00',
                        },
                    ],
                    acceptsReservations: 'true',
                    potentialAction: {
                        '@type': 'OrderAction',
                        target: {
                            '@type': 'EntryPoint',
                            urlTemplate: `${SITE_URL}/menu`,
                            inLanguage: 'es',
                            actionPlatform: [
                                'http://schema.org/DesktopWebPlatform',
                                'http://schema.org/MobileWebPlatform',
                            ],
                        },
                        deliveryMethod: ['http://purl.org/goodrelations/v1#DeliveryModeOwnFleet'],
                    },
                }}
            />
            <div className="bg-black">
                {/* Hero Section */}
                <section className="relative h-[100svh] w-full px-4 md:px-6 flex flex-col items-center justify-center text-center overflow-hidden bg-black">
                    {/* Visual context for SEO */}
                    <h1 className="sr-only">
                        Sushi de Maksim: El mejor sushi artesanal a domicilio en Madrid
                    </h1>
                    <h2 className="sr-only">Bienvenido a nuestro restaurante japonés premium</h2>

                    {/* Background Image with optimized loading */}
                    <div className="absolute inset-0 z-0">
                        <div className="absolute inset-0 bg-black/60 z-10" />
                        <motion.div
                            initial={{ scale: 1, opacity: 0 }}
                            animate={{ scale: 1, opacity: 0.4 }}
                            transition={{ duration: 1.5, ease: 'easeOut' }}
                            className="w-full h-full"
                        >
                            <SafeImage
                                src="https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&auto=format&fit=crop"
                                alt="Premium Sushi Background"
                                className="w-full h-full object-cover sm:object-center object-[65%_center]"
                                loading="eager"
                                getOptimizedUrl={url => getOptimizedImageUrl(url, 1080)}
                                {...({ fetchpriority: 'high' } as any)}
                            />
                        </motion.div>
                    </div>

                    <div className="relative z-20 flex flex-col items-center max-w-4xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                            className="space-y-6"
                        >
                            <span className="inline-block px-4 py-1.5 bg-orange-600/10 border border-orange-600/20 text-orange-500 text-[10px] md:text-xs font-black uppercase tracking-[0.3em] rounded-full backdrop-blur-sm">
                                Artesanía japonesa en tu mesa
                            </span>

                            <h2 className="text-[42px] leading-[0.9] md:text-8xl font-black text-white tracking-tighter">
                                Sabor que <br />
                                <span className="text-orange-600 italic">Despierta</span> Sentidos
                            </h2>

                            <p className="text-sm md:text-lg text-gray-300 max-w-md mx-auto leading-relaxed font-medium">
                                Descubre la perfección en cada bocado. Sushi artesanal preparado con
                                los ingredientes más frescos del mercado.
                            </p>

                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                                <Link
                                    to="/menu"
                                    className="group relative w-full sm:w-auto px-10 py-5 bg-orange-600 text-white rounded-2xl font-black text-[13px] tracking-widest transition-all duration-300 hover:bg-orange-700 hover:scale-105 active:scale-95 flex items-center justify-center gap-2 shadow-2xl shadow-orange-600/20 no-underline"
                                >
                                    EXPLORAR MENÚ
                                    <ArrowRight
                                        className="transition-transform group-hover:translate-x-1"
                                        size={18}
                                    />
                                </Link>

                                <button
                                    onClick={() =>
                                        window.dispatchEvent(new CustomEvent('open:reservation'))
                                    }
                                    className="w-full sm:w-auto px-10 py-5 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black text-[13px] tracking-widest transition-all duration-300 border border-white/10 hover:border-white/20 active:scale-95 flex items-center justify-center no-underline cursor-pointer backdrop-blur-sm"
                                >
                                    RESERVAR MESA
                                </button>
                            </div>
                        </motion.div>
                    </div>

                    {/* Scroll Down Indicator — CSS-only for perf (avoid FM infinite loop) */}
                    <div className="absolute bottom-10 inset-x-0 flex flex-col items-center justify-center gap-1.5 text-white/40 pointer-events-none animate-pulse">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-center ml-[0.3em]">
                            Scrollea
                        </span>
                        <ArrowRight className="rotate-90" size={16} />
                    </div>
                </section>

                <Marquee />
            </div>

            {/* Ratings Banner (Google + The Fork) */}
            <RatingsBanner />

            {/* Press & Partnerships Section */}
            <section className="bg-[#fd6e2b]/5 py-10 md:py-20 overflow-hidden border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="flex flex-col lg:flex-row items-center gap-12 lg:gap-24"
                    >
                        <div className="flex-1 text-center lg:text-left">
                            <span className="inline-block px-3 py-1 bg-orange-600 text-white text-[10px] font-black uppercase rounded-full mb-6 tracking-widest">
                                Aliados y Prensa Premium
                            </span>
                            <h2 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tighter leading-tight mb-6">
                                Reconocidos por los <br />
                                <span className="text-orange-600 italic">
                                    Mejores de la Industria
                                </span>
                            </h2>
                            <p className="text-gray-500 text-lg font-medium leading-relaxed max-w-xl mx-auto lg:mx-0">
                                Orgullosos de ser destacados por plataformas líderes y críticos
                                gastronómicos como el referente del sushi artesanal en Madrid.
                            </p>
                        </div>

                        <div className="flex-[1.5] grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
                            {/* Sushify Card */}
                            <a
                                href="https://sushify.es/sushi/sushi-de-maksim/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group relative block"
                            >
                                <div className="absolute -inset-4 bg-orange-600/5 rounded-[2.5rem] blur-2xl group-hover:bg-orange-600/10 transition-all duration-500"></div>
                                <div className="relative bg-white p-8 rounded-[2.5rem] shadow-xl shadow-orange-600/5 border border-gray-50 flex flex-col items-center gap-4 group-hover:scale-[1.02] transition-transform duration-500">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                                            <span className="text-white font-black text-lg italic">
                                                S
                                            </span>
                                        </div>
                                        <span className="text-xl font-black text-gray-900 tracking-tighter">
                                            SUSHIFY<span className="text-orange-600">.ES</span>
                                        </span>
                                    </div>
                                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] group-hover:text-orange-600 transition-colors">
                                        Ver Reseña
                                    </div>
                                </div>
                            </a>

                            {/* Groupon Card */}
                            <a
                                href="https://www.groupon.es/deals/sushi-de-maksim-1"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group relative block"
                            >
                                <div className="absolute -inset-4 bg-[#53a318]/5 rounded-[2.5rem] blur-2xl group-hover:bg-[#53a318]/10 transition-all duration-500"></div>
                                <div className="relative bg-white p-8 rounded-[2.5rem] shadow-xl shadow-[#53a318]/5 border border-gray-50 flex flex-col items-center gap-4 group-hover:scale-[1.02] transition-transform duration-500">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 bg-[#53a318] rounded-lg flex items-center justify-center">
                                            <svg
                                                viewBox="0 0 24 24"
                                                className="w-5 h-5 fill-white"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
                                            </svg>
                                        </div>
                                        <span className="text-xl font-black text-[#53a318] tracking-tighter uppercase">
                                            Groupon
                                        </span>
                                    </div>
                                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] group-hover:text-[#53a318] transition-colors">
                                        Ver Ofertas
                                    </div>
                                </div>
                            </a>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Categories Section */}
            <section className="py-10 md:py-16 px-2 md:px-6 bg-transparent overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                        <div className="max-w-xl text-center md:text-left">
                            <motion.span
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                className="text-orange-600 font-black text-xs uppercase tracking-widest mb-4 block"
                            >
                                ¿Qué te apetece hoy?
                            </motion.span>
                            <h2 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tighter leading-tight">
                                Explora Nuestra <span className="text-orange-600">Carta</span>
                            </h2>
                        </div>
                        <Link
                            to="/menu"
                            className="group flex items-center justify-center md:justify-start gap-3 text-gray-900 font-black text-sm hover:text-orange-600 transition-colors no-underline"
                        >
                            VER TODAS LAS CATEGORÍAS
                            <div className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center group-hover:bg-orange-50 transition-colors">
                                <ArrowRight size={18} strokeWidth={2} />
                            </div>
                        </Link>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 md:gap-8">
                        {categoryList.map((cat: any, idx: number) => (
                            <CategoryCard
                                key={cat.id}
                                id={cat.id}
                                name={cat.name}
                                image={cat.image}
                                index={idx}
                            />
                        ))}
                        {categoriesWithImages.length === 0 && (
                            <div className="col-span-full text-center text-gray-400 py-12">
                                No se encontraron categorías.
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Dynamic Promo Banner Section */}
            {activePromos.length > 0 ? (
                <section className="px-4 py-6 md:py-12">
                    <div className="max-w-7xl mx-auto space-y-6">
                        {activePromos.slice(0, 2).map((promo: any, idx: number) => (
                            <motion.div
                                key={promo.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.15 }}
                                className="relative overflow-hidden rounded-[2.5rem] bg-gray-900 p-8 md:p-12"
                            >
                                {promo.image_url && (
                                    <div className="absolute inset-0 z-0">
                                        <SafeImage
                                            src={promo.image_url}
                                            alt={promo.title}
                                            className="w-full h-full object-cover opacity-20"
                                            loading="lazy"
                                            getOptimizedUrl={(url: string) =>
                                                getOptimizedImageUrl(url, 1080)
                                            }
                                        />
                                    </div>
                                )}
                                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-orange-600/20 to-transparent pointer-events-none" />
                                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                                    <div className="text-center md:text-left">
                                        {promo.subtitle && (
                                            <span className="inline-block px-3 py-1 bg-orange-600 text-white text-[10px] font-black uppercase rounded-full mb-4">
                                                {promo.subtitle || promo.title}
                                            </span>
                                        )}
                                        <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter mb-4">
                                            <span className="text-orange-500">
                                                {promo.discount}
                                            </span>{' '}
                                            {!promo.subtitle ? promo.title : ''}
                                        </h2>
                                        <p className="text-gray-400 font-medium max-w-md">
                                            {promo.description}
                                        </p>
                                    </div>
                                    <Link
                                        to={promo.cta_link || '/promos'}
                                        className="px-10 py-5 bg-white text-gray-900 rounded-2xl font-black text-xs tracking-widest hover:bg-orange-600 hover:text-white transition-all shadow-xl shrink-0"
                                    >
                                        {promo.cta_text || 'VER OFERTA'}
                                    </Link>
                                </div>
                            </motion.div>
                        ))}
                        {activePromos.length > 2 && (
                            <div className="text-center">
                                <Link
                                    to="/promos"
                                    className="inline-flex items-center gap-2 text-orange-600 font-black text-sm uppercase tracking-widest hover:underline"
                                >
                                    <Sparkles size={16} />
                                    Todas las ofertas
                                    <ArrowRight size={16} />
                                </Link>
                            </div>
                        )}
                    </div>
                </section>
            ) : (
                <section className="px-4 py-6 md:py-12">
                    <div className="max-w-7xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="relative overflow-hidden rounded-[2.5rem] bg-gray-900 p-8 md:p-12"
                        >
                            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-orange-600/20 to-transparent pointer-events-none"></div>
                            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                                <div className="text-center md:text-left">
                                    <span className="inline-block px-3 py-1 bg-orange-600 text-white text-[10px] font-black uppercase rounded-full mb-4">
                                        Oferta de Bienvenida
                                    </span>
                                    <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter mb-4">
                                        <span className="text-orange-500">10%</span> de Descuento
                                    </h2>
                                    <p className="text-gray-400 font-medium max-w-md">
                                        Válido para todos los nuevos usuarios registrados que
                                        realicen su primer pedido por un importe superior a 70€.
                                    </p>
                                </div>
                                <Link
                                    to="/menu"
                                    className="px-10 py-5 bg-white text-gray-900 rounded-2xl font-black text-xs tracking-widest hover:bg-orange-600 hover:text-white transition-all shadow-xl"
                                >
                                    ORDENAR AHORA
                                </Link>
                            </div>
                        </motion.div>
                    </div>
                </section>
            )}

            {/* Reservation Section */}
            <section className="py-10 md:py-20 px-4 bg-white overflow-hidden">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="relative h-[300px] md:h-[500px] rounded-[3rem] overflow-hidden order-last lg:order-first"
                    >
                        <SafeImage
                            src="/blog_post_chef_hands.webp"
                            getOptimizedUrl={(url: string) => getOptimizedImageUrl(url, 1000)}
                            alt="Reserva tu mesa — Sushi de Maksim Madrid"
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                        <div className="absolute bottom-10 left-10">
                            <p className="text-white font-black text-2xl uppercase tracking-tighter">
                                Ambiente <span className="text-orange-500">Exclusivo</span>
                            </p>
                        </div>
                    </motion.div>

                    <div className="text-center lg:text-left">
                        <span className="text-orange-600 font-black text-xs uppercase tracking-widest mb-4 block">
                            Vive la experiencia completa
                        </span>
                        <h2 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tighter leading-tight mb-6">
                            Reserva tu <span className="text-orange-600">Mesa</span>
                        </h2>
                        <p className="text-gray-500 text-lg mb-10 max-w-lg mx-auto lg:mx-0 font-medium">
                            Disfruta de nuestro sushi recién preparado en un ambiente diseñado para
                            deleitar todos tus sentidos. Ideal para cenas románticas, reuniones o
                            celebraciones especiales.
                        </p>
                        <button
                            onClick={() => setIsReservationModalOpen(true)}
                            className="w-full sm:w-auto px-12 py-6 bg-gray-900 text-white rounded-2xl font-black text-xs tracking-widest hover:bg-orange-600 transition-all shadow-xl active:scale-95"
                        >
                            SOLICITAR RESERVA
                        </button>
                    </div>
                </div>
            </section>

            {/* Chef's Recommendations / Popular Section */}
            <section className="py-10 md:py-24 px-0 md:px-6 bg-gray-50/50 overflow-hidden relative">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                        <div className="max-w-xl text-center md:text-left">
                            <motion.span
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                className="text-orange-600 font-black text-xs uppercase tracking-widest mb-4 block"
                            >
                                Seleccionados por el Chef
                            </motion.span>
                            <h2 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tighter leading-tight">
                                Nuestros <span className="text-orange-600">Favoritos</span>{' '}
                                Ineludibles
                            </h2>
                        </div>
                        <div className="flex items-center">
                            <Link
                                to="/menu"
                                className="group flex items-center justify-center md:justify-start gap-3 text-gray-900 font-black text-sm hover:text-orange-600 transition-colors no-underline"
                            >
                                VER CARTA COMPLETA
                                <div className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center group-hover:bg-orange-50 transition-colors">
                                    <ArrowRight size={18} strokeWidth={2} />
                                </div>
                            </Link>
                        </div>
                    </div>

                    {popularItems.length > 0 ? (
                        <div className="relative group/slider">
                            {/* Desktop Arrows - Left */}
                            <button
                                onClick={() => scroll('left')}
                                className="hidden md:flex absolute -left-4 lg:-left-16 top-[40%] -translate-y-1/2 z-20 w-14 h-14 rounded-full bg-white/90 backdrop-blur-md shadow-2xl items-center justify-center hover:bg-orange-600 hover:text-white transition-all border border-gray-100/50 group-hover/slider:translate-x-[-4px]"
                                aria-label="Scroll left"
                            >
                                <ChevronLeft size={28} strokeWidth={2.5} />
                            </button>

                            {/* Desktop Arrows - Right */}
                            <button
                                onClick={() => scroll('right')}
                                className="hidden md:flex absolute -right-4 lg:-right-16 top-[40%] -translate-y-1/2 z-20 w-14 h-14 rounded-full bg-white/90 backdrop-blur-md shadow-2xl items-center justify-center hover:bg-orange-600 hover:text-white transition-all border border-gray-100/50 group-hover/slider:translate-x-[4px]"
                                aria-label="Scroll right"
                            >
                                <ChevronRight size={28} strokeWidth={2.5} />
                            </button>

                            <div
                                ref={scrollContainerRef}
                                className="relative -mx-4 px-4 overflow-x-auto no-scrollbar pb-10 snap-x snap-mandatory md:snap-none scroll-smooth scroll-px-4"
                            >
                                <div className="flex gap-2.5 md:gap-8 flex-nowrap w-max min-w-full">
                                    {popularItems.map((item: any, index: number) => (
                                        <div
                                            key={item.id}
                                            className="w-[260px] md:w-[320px] snap-start shrink-0"
                                        >
                                            <ProductCard
                                                item={item as any}
                                                user={null}
                                                isFavorite={false}
                                                onToggleFavorite={() => {}}
                                                onShare={handleShare}
                                                onAddToCart={handleAddToCart}
                                                isAdded={items.some(
                                                    cartItem => cartItem.id === String(item.id)
                                                )}
                                                isPriority={index < 2}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-12 text-gray-400 font-medium">
                            No se encontraron productos destacados.
                        </div>
                    )}
                </div>
            </section>

            {/* Reviews Section */}
            <ReviewsSEO />

            {/* Blog Teaser / SEO Section */}
            <section className="py-10 md:py-20 bg-transparent px-4 border-t border-gray-100">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] }}
                        style={{ willChange: 'opacity, transform', backfaceVisibility: 'hidden' }}
                        className="relative px-4"
                    >
                        <div className="rounded-[2rem] md:rounded-[2.5rem] overflow-hidden shadow-2xl skew-y-1">
                            <SafeImage
                                src="/blog_post_chef_hands.webp"
                                getOptimizedUrl={(url: string) => getOptimizedImageUrl(url, 800)}
                                alt="Preparación artesanal de sushi — Sushi de Maksim"
                                loading="lazy"
                                decoding="async"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        {/* Floating Badge */}
                        <div className="absolute -bottom-4 -right-2 md:-bottom-6 md:-right-6 bg-white p-4 md:p-6 rounded-2xl md:rounded-3xl shadow-2xl border border-gray-100 max-w-[160px] md:max-w-[200px] animate-float">
                            <div className="flex gap-1 mb-1 md:mb-2">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <Star
                                        key={i}
                                        size={10}
                                        strokeWidth={1.5}
                                        className="text-amber-400"
                                    />
                                ))}
                            </div>
                            <p className="text-[9px] md:text-[11px] font-bold text-gray-800 italic leading-tight">
                                "El mejor sushi que he probado en todo Madrid."
                            </p>
                            <p className="text-[7px] md:text-[9px] text-gray-400 mt-1 uppercase font-black">
                                Pablo G. - Cliente Verificado
                            </p>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ duration: 0.8, delay: 0.2, ease: [0.21, 0.47, 0.32, 0.98] }}
                        style={{ willChange: 'opacity, transform', backfaceVisibility: 'hidden' }}
                        className="text-center lg:text-left pt-10 lg:pt-0"
                    >
                        <span className="text-orange-600 font-black text-[10px] md:text-xs uppercase tracking-[0.2em] mb-4 block">
                            Nuestra Historia
                        </span>
                        <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-6 leading-tight tracking-tighter">
                            Más que una Cocina, <br className="hidden md:block" />
                            Una{' '}
                            <span className="italic underline decoration-orange-600 decoration-4 underline-offset-8">
                                Pasión
                            </span>
                        </h2>
                        <p className="text-gray-500 mb-8 leading-relaxed font-medium">
                            En Sushi de Maksim, cada corte de pescado es un homenaje a la técnica
                            milenaria. Nos esforzamos por llevarte no solo una cena, sino un momento
                            de placer gastronómico inolvidable.
                        </p>
                        <div className="space-y-4 mb-10">
                            {[
                                'Pescado Fresco del Día',
                                'Arroz Premium de Grano Corto',
                                'Recetas Originales del Chef',
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className="w-5 h-5 rounded-full bg-orange-600 flex items-center justify-center">
                                        <ChevronRight
                                            size={12}
                                            strokeWidth={1.5}
                                            className="text-white"
                                        />
                                    </div>
                                    <span className="font-bold text-gray-800 text-sm">{item}</span>
                                </div>
                            ))}
                        </div>
                        <Link
                            to="/blog"
                            className="text-gray-900 font-black text-sm group flex items-center gap-2 hover:text-orange-600 transition-colors"
                        >
                            LEER MÁS EN NUESTRO BLOG
                            <ArrowRight
                                size={16}
                                strokeWidth={1.5}
                                className="group-hover:translate-x-1 transition-transform"
                            />
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* Call to Action */}

            {/* Newsletter Section */}
            <Newsletter />

            {sharingItem && (
                <ShareModal
                    item={sharingItem}
                    onClose={() => setSharingItem(null)}
                    onCopy={copyToClipboard}
                    copying={copying}
                />
            )}
            <ReservationModal
                isOpen={isReservationModalOpen}
                onClose={() => setIsReservationModalOpen(false)}
            />
        </div>
    );
}
