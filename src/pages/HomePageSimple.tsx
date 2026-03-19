import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, ChevronRight, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import SEO from '../components/SEO';
import Newsletter from '../components/Newsletter';
import RatingsBanner from '../components/RatingsBanner';
import { api } from '../utils/api';
import { useCart } from '../hooks/useCart';

interface MenuItem {
    id: number;
    name: string;
    description: string;
    price: number;
    image: string;
    category: string;
    is_popular?: boolean;
    is_chef_choice?: boolean;
    pieces?: number;
}

const Marquee = () => (
    <div className="relative py-4 md:py-6 overflow-hidden bg-gray-950 border-y border-white/5 select-none">
        <div className="flex whitespace-nowrap animate-marquee">
            {[1, 2].map(i => (
                <div key={i} className="flex items-center gap-12 px-6">
                    <span className="text-white/10 text-3xl md:text-5xl font-black italic tracking-tighter">
                        FRESH SEAFOOD DAILY
                    </span>
                    <span className="text-red-600/30 text-3xl md:text-5xl font-black">●</span>
                    <span className="text-white/10 text-3xl md:text-5xl font-black italic tracking-tighter">
                        PREMIUM QUALITY
                    </span>
                    <span className="text-red-600/30 text-3xl md:text-5xl font-black">●</span>
                    <span className="text-white/10 text-3xl md:text-5xl font-black italic tracking-tighter">
                        FASTEST DELIVERY
                    </span>
                    <span className="text-red-600/30 text-3xl md:text-5xl font-black">●</span>
                </div>
            ))}
        </div>
    </div>
);

const CategoryCard = ({ id, name, image, index }: any) => {
    const [imageFailed, setImageFailed] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="group relative h-48 md:h-64 rounded-[2rem] overflow-hidden cursor-pointer"
        >
            <Link to={`/menu#section-${id}`} className="absolute inset-0 z-10" />
            {image && !imageFailed ? (
                <img
                    src={image}
                    alt={name}
                    onError={() => setImageFailed(true)}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                />
            ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center"></div>
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/60"></div>

            {/* Title at the top */}
            <div className="absolute top-6 left-6 right-6">
                <h3 className="text-white font-black text-xl md:text-2xl uppercase tracking-tighter drop-shadow-lg">
                    {name}
                </h3>
            </div>

            {/* Arrow at the bottom right */}
            <div className="absolute bottom-6 right-6">
                <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white group-hover:bg-red-600 group-hover:border-red-600 transition-all shrink-0">
                    <ArrowRight size={18} />
                </div>
            </div>
        </motion.div>
    );
};

const ProductCard = ({ item, index }: { item: MenuItem; index: number }) => {
    const { addItem } = useCart();
    const [isAdded, setIsAdded] = useState(false);

    const handleAdd = (e: React.MouseEvent) => {
        e.preventDefault();
        // Convert MenuItem to SushiItem expected by addItem
        const sushiItem: any = {
            ...item,
            id: String(item.id),
            category: item.category as any,
        };
        addItem(sushiItem);
        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 2000);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.2) }}
            className="w-[280px] md:w-[320px] snap-center shrink-0 bg-white rounded-[32px] p-4 shadow-xl shadow-gray-100/50 border border-gray-100 group flex flex-col h-full"
        >
            <div className="relative aspect-square mb-4 rounded-[24px] overflow-hidden bg-gray-50">
                <img
                    src={item.image || '/placeholder-sushi.png'}
                    alt={item.name}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3 flex flex-col gap-2">
                    {item.is_popular && (
                        <span className="bg-amber-400 text-amber-950 text-[10px] font-black px-3 py-1 rounded-full shadow-lg flex items-center gap-1.5 uppercase tracking-wider">
                            <Star size={10} fill="currentColor" />
                            Popular
                        </span>
                    )}
                </div>
            </div>
            <div className="flex-1 px-2">
                <div className="flex justify-between items-start mb-1">
                    <h4 className="text-lg font-black text-gray-900 line-clamp-1 flex-1">
                        {item.name}
                    </h4>
                    {item.pieces && (
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2 opacity-70 mt-1">
                            {item.pieces} pzs
                        </span>
                    )}
                </div>
                <p className="text-gray-500 text-xs font-medium line-clamp-2 mb-4 leading-relaxed">
                    {item.description}
                </p>
            </div>
            <div className="px-2 pb-2 flex items-center justify-between mt-auto">
                <span className="text-xl font-black text-gray-900">
                    {item.price.toFixed(2).replace('.', ',')}€
                </span>
                <button
                    onClick={handleAdd}
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-lg active:scale-90 shrink-0 ${
                        isAdded
                            ? 'bg-green-500 text-white translate-y-[-4px]'
                            : 'bg-gray-900 text-white hover:bg-black'
                    }`}
                >
                    {isAdded ? (
                        <div className="text-xs font-black">OK</div>
                    ) : (
                        <Plus size={20} strokeWidth={2.5} />
                    )}
                </button>
            </div>
        </motion.div>
    );
};

export default function HomePageSimple() {
    const [popularItems, setPopularItems] = useState<MenuItem[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        const fetchData = async () => {
            try {
                const [categoriesData, allItemsData] = await Promise.all([
                    api.get('/menu/info/categories'),
                    api.get('/menu'),
                ]);

                if (!isMounted) return;

                const allItems = allItemsData.items || [];

                // Filter popular items from all items list locally to save an API call
                const popular = allItems.filter((item: any) => item.is_popular).slice(0, 8);
                setPopularItems(popular);

                const enhancedCategories = (categoriesData.categories || []).map((cat: any) => {
                    // Find the first item in this category that has an image
                    const representativeItem = allItems.find(
                        (item: any) => item.category === cat.id && item.image
                    );
                    return {
                        ...cat,
                        image: representativeItem?.image || null,
                    };
                });
                setCategories(enhancedCategories);
            } catch (error) {
                if (!isMounted) return;
                console.error('Error fetching data:', error);
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        fetchData();
        return () => {
            isMounted = false;
        };
    }, []);

    return (
        <div className="overflow-hidden">
            <SEO
                title="Sushibar en Madrid centro"
                description="El mejor sushi artesanal de Madrid. Entrega rápida, atún Balfegó y salmón noruego. Pide online ahora y disfruta de la experiencia Maksim en tu casa."
                keywords="sushi, madrid, delivery, pedido a domicilio, rollo, maksim, atun balfego"
                schema={{
                    '@context': 'https://schema.org',
                    '@type': 'FoodEstablishment',
                    name: 'Sushi de Maksim',
                    image: 'https://sushidemaksim.com/sushi-hero.jpg',
                    '@id': 'https://sushidemaksim.com',
                    url: 'https://sushidemaksim.com',
                    telephone: '+34600000000',
                    priceRange: '$$',
                    address: {
                        '@type': 'PostalAddress',
                        streetAddress: 'Calle de la Infanta Mercedes, 62',
                        addressLocality: 'Madrid',
                        postalCode: '28020',
                        addressCountry: 'ES',
                    },
                    geo: {
                        '@type': 'GeoCoordinates',
                        latitude: 40.4571,
                        longitude: -3.7037,
                    },
                    openingHoursSpecification: [
                        {
                            '@type': 'OpeningHoursSpecification',
                            dayOfWeek: [
                                'Monday',
                                'Tuesday',
                                'Wednesday',
                                'Thursday',
                                'Friday',
                                'Saturday',
                                'Sunday',
                            ],
                            opens: '12:00',
                            closes: '22:00',
                        },
                    ],
                    servesCuisine: 'Japanese, Sushi',
                    acceptsReservations: 'false',
                }}
            />

            {/* Hero Section */}
            <section className="relative min-h-[70vh] md:min-h-[85vh] flex items-center justify-center px-4 pt-32 md:pt-40 pb-20 md:pb-32 bg-[url('/sushi-hero.jpg')] bg-neutral-950 bg-cover bg-center">
                {/* Background Overlay (Filter) */}
                <div className="absolute inset-0 z-0 bg-black/50"></div>
                <div className="absolute inset-0 z-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent"></div>
                <div className="absolute inset-0 z-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
                <div className="absolute inset-0 z-0 backdrop-blur-[2px] md:backdrop-blur-none"></div>

                <div className="max-w-7xl mx-auto w-full relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className="text-center lg:text-left"
                    >
                        <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="inline-block px-4 py-1.5 bg-red-600/20 backdrop-blur-md border border-red-500/30 text-red-500 text-[10px] md:text-xs font-black uppercase tracking-widest rounded-full mb-6"
                        >
                            Artesanía Japonesa en tu Mesa
                        </motion.span>

                        <h1 className="text-4xl md:text-7xl font-black text-white mb-6 leading-[1.1] tracking-tight">
                            Sabor que <br className="hidden md:block" />
                            <span className="text-red-500 italic">Despierta</span> Sentidos
                        </h1>

                        <p className="text-base md:text-xl text-gray-300 mb-10 max-w-lg mx-auto lg:mx-0 leading-relaxed font-medium">
                            Descubre la perfección en cada bocado. Sushi artesanal preparado con los
                            ingredientes más frescos del mercado.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center lg:justify-start">
                            <Link
                                to="/menu"
                                className="w-full sm:w-auto group btn-premium bg-red-600 text-white px-10 py-5 rounded-2xl font-black text-xs tracking-widest flex items-center justify-center gap-3 shadow-[0_20px_40px_-15px_rgba(220,38,38,0.5)] transition-all"
                            >
                                EXPLORAR MENÚ
                                <motion.div
                                    animate={{ x: 0 }}
                                    whileHover={{ x: 5 }}
                                    transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                                >
                                    <ArrowRight size={18} strokeWidth={2} />
                                </motion.div>
                            </Link>
                            <Link
                                to="/blog"
                                className="w-full sm:w-auto btn-premium glass-dark text-white border border-white/20 px-10 py-5 rounded-2xl font-black text-xs tracking-widest flex items-center justify-center gap-3 hover:bg-white/10 transition-all uppercase"
                            >
                                NUESTRO BLOG
                            </Link>
                        </div>
                    </motion.div>

                    {/* Visual element for desktop */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                        transition={{ duration: 1, delay: 0.3 }}
                        className="hidden lg:block relative"
                    >
                        <div className="relative z-10 w-full aspect-square max-w-md mx-auto rounded-[3rem] overflow-hidden border-8 border-white/10 premium-shadow">
                            <motion.img
                                animate={{
                                    y: [0, -20, 0],
                                }}
                                transition={{
                                    duration: 6,
                                    repeat: Infinity,
                                    ease: 'easeInOut',
                                }}
                                src="/blog_post_chef_hands.png"
                                alt="Experiencia Chef en Sushi de Maksim"
                                fetchPriority="high"
                                decoding="async"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        {/* Decoration */}
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-red-600/30 blur-[80px] rounded-full"></div>
                        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-red-600/20 blur-[80px] rounded-full"></div>
                    </motion.div>
                </div>
            </section>

            <Marquee />

            {/* Ratings Banner (Google + The Fork) */}
            <RatingsBanner />

            {/* Categories Section */}
            <section className="py-24 px-4 bg-transparent overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                        <div className="max-w-xl text-center md:text-left">
                            <motion.span
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                className="text-red-600 font-black text-xs uppercase tracking-widest mb-4 block"
                            >
                                ¿Qué te apetece hoy?
                            </motion.span>
                            <h2 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tighter leading-tight">
                                Explora Nuestra <span className="text-red-600">Carta</span>
                            </h2>
                        </div>
                        <Link
                            to="/menu"
                            className="group flex items-center justify-center md:justify-start gap-3 text-gray-900 font-black text-sm hover:text-red-600 transition-colors no-underline"
                        >
                            VER TODAS LAS CATEGORÍAS
                            <div className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center group-hover:bg-red-50 transition-colors">
                                <ArrowRight size={18} strokeWidth={2} />
                            </div>
                        </Link>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
                        {categories.slice(0, 8).map((cat, idx) => (
                            <CategoryCard
                                key={cat.id}
                                id={cat.id}
                                name={cat.name}
                                icon={cat.icon}
                                image={cat.image}
                                index={idx}
                            />
                        ))}
                        {categories.length === 0 && !isLoading && (
                            <div className="col-span-full text-center text-gray-400 py-12">
                                No se encontraron categorías.
                            </div>
                        )}
                        {isLoading &&
                            [1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                                <div
                                    key={i}
                                    className="h-44 md:h-64 bg-gray-100 rounded-[2rem] animate-pulse flex flex-col p-6"
                                >
                                    <div className="h-6 w-2/3 bg-gray-200/50 rounded-lg mb-auto" />
                                    <div className="self-end h-10 w-10 rounded-full bg-gray-200/50" />
                                </div>
                            ))}
                    </div>
                </div>
            </section>

            {/* Promo Banner Section */}
            <section className="px-4 py-12">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="relative overflow-hidden rounded-[2.5rem] bg-gray-900 p-8 md:p-12"
                    >
                        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-red-600/20 to-transparent pointer-events-none"></div>
                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                            <div className="text-center md:text-left">
                                <span className="inline-block px-3 py-1 bg-red-600 text-white text-[10px] font-black uppercase rounded-full mb-4">
                                    Oferta de Bienvenida
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter mb-4">
                                    <span className="text-red-500">10%</span> de Descuento
                                </h2>
                                <p className="text-gray-400 font-medium max-w-md">
                                    Válido para todos los nuevos usuarios registrados que realicen
                                    su primer pedido por un importe superior a 70€.
                                </p>
                            </div>
                            <Link
                                to="/menu"
                                className="px-10 py-5 bg-white text-gray-900 rounded-2xl font-black text-xs tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-xl"
                            >
                                ORDENAR AHORA
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Chef's Recommendations / Popular Section */}
            <section className="py-24 bg-gray-50/50 overflow-hidden">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                        <div className="max-w-xl text-center md:text-left">
                            <motion.span
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                className="text-red-600 font-black text-xs uppercase tracking-widest mb-4 block"
                            >
                                Seleccionados por el Chef
                            </motion.span>
                            <h2 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tighter leading-tight">
                                Nuestros <span className="text-red-600">Favoritos</span> Ineludibles
                            </h2>
                        </div>
                        <Link
                            to="/menu"
                            className="group flex items-center justify-center md:justify-start gap-3 text-gray-900 font-black text-sm hover:text-red-600 transition-colors no-underline"
                        >
                            VER CARTA COMPLETA
                            <div className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center group-hover:bg-red-50 transition-colors">
                                <ArrowRight size={18} strokeWidth={2} />
                            </div>
                        </Link>
                    </div>

                    {!isLoading && popularItems.length > 0 ? (
                        <div className="relative -mx-4 px-4 overflow-x-auto no-scrollbar pb-10 snap-x snap-mandatory md:snap-none scroll-smooth">
                            <div className="flex gap-6 md:gap-8 flex-nowrap w-max min-w-full">
                                {popularItems.map((item, index) => (
                                    <ProductCard key={item.id} item={item} index={index} />
                                ))}
                            </div>
                        </div>
                    ) : isLoading ? (
                        <div className="relative -mx-4 px-4 overflow-hidden pb-10">
                            <div className="flex gap-6 md:gap-8 flex-nowrap overflow-x-auto no-scrollbar">
                                {[1, 2, 3, 4].map(i => (
                                    <div
                                        key={i}
                                        className="min-w-[280px] md:min-w-[320px] bg-white rounded-[32px] p-4 shadow-sm border border-gray-100 flex flex-col h-full animate-pulse"
                                    >
                                        <div className="aspect-square mb-4 rounded-[24px] bg-gray-50" />
                                        <div className="flex-1 px-2">
                                            <div className="h-6 w-3/4 bg-gray-100 rounded-lg mb-2" />
                                            <div className="h-4 w-1/2 bg-gray-50 rounded-md mb-4" />
                                        </div>
                                        <div className="px-2 pb-2 flex items-center justify-between mt-auto">
                                            <div className="h-8 w-16 bg-gray-50 rounded-lg" />
                                            <div className="h-12 w-12 bg-gray-100 rounded-2xl" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-12 text-gray-400 font-medium">
                            Cargando delicias...
                        </div>
                    )}
                </div>
            </section>

            {/* Blog Teaser / SEO Section */}
            <section className="py-24 bg-transparent px-4 border-t border-gray-100">
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
                            <img
                                src="/blog_post_chef_hands.png"
                                alt="Preparación artesanal de sushi"
                                loading="lazy"
                                decoding="async"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        {/* Floating Badge */}
                        <div className="absolute -bottom-4 -right-2 md:-bottom-6 md:-right-6 bg-white p-4 md:p-6 rounded-2xl md:rounded-3xl shadow-2xl border border-gray-100 max-w-[160px] md:max-w-[200px] animate-bounce duration-[3000ms]">
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
                        <span className="text-red-600 font-black text-[10px] md:text-xs uppercase tracking-[0.2em] mb-4 block">
                            Nuestra Historia
                        </span>
                        <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-6 leading-tight tracking-tighter">
                            Más que una Cocina, <br className="hidden md:block" />
                            Una{' '}
                            <span className="italic underline decoration-red-600 decoration-4 underline-offset-8">
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
                                    <div className="w-5 h-5 rounded-full bg-red-600 flex items-center justify-center">
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
                            className="text-gray-900 font-black text-sm group flex items-center gap-2 hover:text-red-600 transition-colors"
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
        </div>
    );
}
