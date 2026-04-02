import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock, Tag, Plus, Check } from 'lucide-react';
import { api } from '../utils/api';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import SEO from '../components/SEO';
import { PromoSkeleton } from '../components/skeletons/PromoSkeleton';
import { useQuery } from '@tanstack/react-query';
import { getOptimizedImageUrl } from '../utils/images';
import SafeImage from '../components/common/SafeImage';

const PROMO_IMAGES: Record<string, string> = {
    '10º Pedido':
        'https://dvsmzciknlfevgxpnefr.supabase.co/storage/v1/object/public/images/menu/1773678886624-263.webp',
    Cumpleaños:
        'https://dvsmzciknlfevgxpnefr.supabase.co/storage/v1/object/public/images/menu/1773469942612-40.png',
    'Cena familiar':
        'https://dvsmzciknlfevgxpnefr.supabase.co/storage/v1/object/public/images/menu/1773678687933-236.webp',
    'Primer pedido':
        'https://dvsmzciknlfevgxpnefr.supabase.co/storage/v1/object/public/images/menu/1773465830356-360.png',
};
interface PromoItem {
    id: number;
    name: string;
    description: string;
    price: number;
    image: string;
    category: string;
}

export default function PromoPage() {
    const [addedItems, setAddedItems] = useState<Set<number>>(new Set());
    const { addItem } = useCart();
    const { user } = useAuth();

    // Use React Query for consolidated fetching and caching
    const { data: menuData, isLoading: menuLoading } = useQuery({
        queryKey: ['menu', 'promo'],
        queryFn: () => api.get('/menu?is_promo=true'),
        staleTime: 1000 * 60 * 5,
    });

    const { data: promosData, isLoading: promosLoading } = useQuery({
        queryKey: ['promos'],
        queryFn: () => api.get('/promos'),
        staleTime: 1000 * 60 * 5,
    });

    const promoItems = (menuData?.items ?? []) as PromoItem[];
    const staticPromos = (promosData?.promos ?? []) as any[];
    const isLoading = menuLoading || promosLoading;

    if (isLoading) return <PromoSkeleton />;

    const handleAdd = (item: PromoItem) => {
        addItem({
            id: String(item.id),
            name: item.name,
            description: item.description,
            price: item.price,
            image: item.image,
            category: item.category as any,
            isPromo: true,
        });
        setAddedItems(prev => new Set(prev).add(item.id));
        setTimeout(
            () =>
                setAddedItems(prev => {
                    const n = new Set(prev);
                    n.delete(item.id);
                    return n;
                }),
            1200
        );
    };

    return (
        <div className="flex-1 bg-transparent">
            <SEO
                title="Ofertas y Promociones"
                description="Descubre nuestras promociones exclusivas, combos especiales de sushi con descuentos y ofertas limitadas. ¡Pide online ahora!"
                keywords="ofertas sushi, promos sushi, combos sushi madrid, descuento sushi"
            />

            {/* Hero Header */}
            <section className="relative h-64 md:h-80 flex items-center justify-center overflow-hidden pt-12">
                <SafeImage
                    src="/images/promos/promo_hero_bg.png"
                    alt="Ofertas y Promociones background"
                    className="absolute inset-0 w-full h-full object-cover"
                    getOptimizedUrl={(url: string) => getOptimizedImageUrl(url, 1080)}
                    {...({ fetchpriority: 'high' } as any)}
                />
                <div className="absolute inset-0 bg-black/60"></div>
                <div className="max-w-4xl mx-auto text-center relative z-10 px-4">
                    <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
                        Promociones y Ofertas
                    </h1>
                    <p className="text-gray-200 text-base md:text-xl font-medium max-w-xl mx-auto">
                        Ofertas especiales y Descuentos exclusivos
                    </p>
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-2 md:px-4 -mt-16 md:-mt-20 mb-20 relative z-20">
                {/* Static Promo Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6 mb-12">
                    {staticPromos.map(promo => (
                        <div
                            key={promo.id}
                            className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden hover:-translate-y-1 transition-transform duration-300 flex flex-col group"
                        >
                            {/* Image Header wrapper */}
                            <div className="h-48 md:h-56 w-full relative overflow-hidden flex flex-col items-center justify-end pb-5">
                                <SafeImage
                                    src={PROMO_IMAGES[promo.title] || '/sushi-hero.webp'}
                                    alt={promo.title}
                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    getOptimizedUrl={(url: string) =>
                                        getOptimizedImageUrl(url, 800)
                                    }
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>

                                <div className="relative z-10 text-center px-4 w-full flex flex-col items-center">
                                    <h3 className="text-xl md:text-2xl font-black text-white mb-2 drop-shadow-lg">
                                        {promo.title}
                                    </h3>
                                    <span className="inline-block bg-white/40 text-white text-[10px] md:text-sm font-black px-4 py-1.5 rounded-full border border-white/30 shadow-xl">
                                        {promo.discount}
                                    </span>
                                </div>
                            </div>

                            {/* Body */}
                            <div className="p-5 md:p-6 flex flex-col flex-1">
                                <p className="text-gray-600 font-medium text-xs md:text-sm leading-relaxed mb-6 flex-1">
                                    {promo.description}
                                </p>
                                <div className="flex items-center gap-2 text-[10px] md:text-xs text-gray-400 mb-6 font-bold bg-gray-50 p-3 rounded-xl transition-colors group-hover:bg-gray-100 border border-gray-50">
                                    <Clock size={14} strokeWidth={1.5} className="text-gray-500" />
                                    <span>
                                        Válido hasta:{' '}
                                        <span className="text-gray-700">{promo.valid_until}</span>
                                    </span>
                                </div>
                                <Link
                                    to="/menu"
                                    className="flex items-center justify-center gap-2 w-full py-4 rounded-xl font-black text-xs md:text-sm text-white transition-all hover:opacity-95 active:scale-90 shadow-lg shadow-gray-200"
                                    style={{
                                        backgroundColor:
                                            promo.color?.toLowerCase() === '#dc2626'
                                                ? '#F26522'
                                                : promo.color,
                                    }}
                                >
                                    Ver menú <ArrowRight size={16} strokeWidth={1.5} />
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>

                {/* 3+1 Fritos Banner */}
                <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-[2.5rem] md:rounded-[3rem] p-6 md:p-12 mb-20 relative overflow-hidden shadow-[0_20px_50px_rgba(249,115,22,0.3)] flex flex-col lg:flex-row items-center gap-8 lg:gap-16 group isolate [transform:translateZ(0)]">
                    {/* Text Section */}
                    <div className="flex-1 text-white relative z-10 text-center lg:text-left mt-4 lg:mt-0">
                        <div className="inline-block bg-white/20 backdrop-blur-md px-5 py-2 rounded-full text-xs md:text-sm font-black mb-6 border border-white/30 uppercase tracking-wider text-orange-50 shadow-sm">
                            ¡Oferta Crujiente!
                        </div>
                        <h2 className="text-4xl md:text-6xl font-black mb-4 tracking-tight leading-tight drop-shadow-md">
                            3 + 1 en Fritos
                        </h2>
                        <p className="text-lg md:text-2xl font-medium mb-10 opacity-95 text-orange-50 drop-shadow max-w-xl mx-auto lg:mx-0">
                            Pide 3 rollos fritos y llévate el{' '}
                            <strong className="text-white bg-orange-600/50 px-2 py-0.5 rounded-lg">
                                4º de regalo
                            </strong>
                            . ¡Descubre el crujiente perfecto para compartir!
                        </p>
                        <Link
                            to="/menu?category=rollos-fritos"
                            className="inline-flex items-center justify-center gap-2 bg-white text-orange-600 px-10 py-5 rounded-2xl font-black text-sm uppercase transition-all active:scale-90 shadow-xl hover:shadow-2xl hover:bg-orange-50 w-full sm:w-auto"
                        >
                            PEDIR AHORA <ArrowRight size={20} strokeWidth={1.5} />
                        </Link>
                    </div>

                    {/* Images Section: 2x2 Grid */}
                    <div className="w-full max-w-[320px] lg:max-w-[400px] shrink-0 grid grid-cols-2 gap-3 lg:gap-4 relative z-10 mx-auto">
                        {/* Image 1 */}
                        <div className="aspect-square rounded-[2rem] overflow-hidden shadow-xl border-4 border-white/30 relative group-hover:-translate-y-2 group-hover:-rotate-2 transition-all duration-500 bg-white">
                            <img
                                src={getOptimizedImageUrl(
                                    'https://dvsmzciknlfevgxpnefr.supabase.co/storage/v1/object/public/images/menu/1773682529547-664.webp',
                                    400
                                )}
                                alt="Rollo Frito 1"
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute top-2 left-2 lg:top-3 lg:left-3 bg-black/70 backdrop-blur-sm text-white font-black text-[10px] lg:text-xs px-2.5 py-1 rounded-full shadow-lg">
                                1
                            </div>
                        </div>
                        {/* Image 2 */}
                        <div className="aspect-square rounded-[2rem] overflow-hidden shadow-xl border-4 border-white/30 relative group-hover:-translate-y-2 group-hover:rotate-2 transition-all duration-500 delay-[50ms] bg-white">
                            <img
                                src={getOptimizedImageUrl(
                                    'https://dvsmzciknlfevgxpnefr.supabase.co/storage/v1/object/public/images/menu/1773682745971-320.webp',
                                    400
                                )}
                                alt="Rollo Frito 2"
                                className="w-full h-full object-cover scale-110"
                            />
                            <div className="absolute top-2 left-2 lg:top-3 lg:left-3 bg-black/70 backdrop-blur-sm text-white font-black text-[10px] lg:text-xs px-2.5 py-1 rounded-full shadow-lg">
                                2
                            </div>
                        </div>
                        {/* Image 3 */}
                        <div className="aspect-square rounded-[2rem] overflow-hidden shadow-xl border-4 border-white/30 relative group-hover:-translate-y-2 group-hover:-rotate-1 transition-all duration-500 delay-[100ms] bg-white">
                            <img
                                src={getOptimizedImageUrl(
                                    'https://dvsmzciknlfevgxpnefr.supabase.co/storage/v1/object/public/images/menu/1773686290480-300.webp',
                                    400
                                )}
                                alt="Rollo Frito 3"
                                className="w-full h-full object-cover scale-110"
                            />
                            <div className="absolute top-2 left-2 lg:top-3 lg:left-3 bg-black/70 backdrop-blur-sm text-white font-black text-[10px] lg:text-xs px-2.5 py-1 rounded-full shadow-lg">
                                3
                            </div>
                        </div>
                        {/* Gift (?) Image */}
                        <div className="aspect-square rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white bg-gradient-to-br from-orange-500 to-rose-600 relative group-hover:-translate-y-3 group-hover:rotate-6 group-hover:scale-105 transition-all duration-500 delay-[150ms] flex flex-col items-center justify-center text-white">
                            <span className="text-6xl lg:text-8xl font-black drop-shadow-2xl opacity-90 mt-2">
                                ?
                            </span>
                            <span className="text-sm lg:text-xl font-black uppercase tracking-widest mt-1 drop-shadow-lg scale-y-110">
                                + Regalo
                            </span>
                        </div>
                    </div>

                    {/* Background decorations */}
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/asfalt-dark.png')] opacity-10 pointer-events-none"></div>
                    <div className="absolute -top-32 -right-32 w-96 h-96 bg-white/20 blur-[100px] rounded-full pointer-events-none"></div>
                    <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-black/20 blur-[100px] rounded-full pointer-events-none"></div>
                </div>

                {/* Weekly Banner */}
                <div className="bg-orange-600 rounded-[2.5rem] md:rounded-[3rem] px-5 py-10 md:p-12 text-center text-white mb-20 relative overflow-hidden shadow-[0_20px_50px_rgba(242,101,34,0.3)]">
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/asfalt-dark.png')] opacity-10"></div>

                    <div className="relative z-10 max-w-3xl mx-auto">
                        <h2 className="text-2xl md:text-5xl font-black mb-4 tracking-tight leading-tight">
                            ¡Premio a tu lealtad!
                        </h2>
                        <p className="text-base md:text-2xl font-medium mb-8 opacity-90 text-orange-100">
                            ¡Tras completar 4 pedidos recibirás un 5% de descuento para tu 5º
                            pedido!
                        </p>
                        <div className="inline-block bg-white/20 backdrop-blur-md px-6 py-2 rounded-full text-sm md:text-xl font-black mb-10 border border-white/30 tracking-wide">
                            Para usuarios registrados
                        </div>
                        <br />
                        <Link
                            to={user ? '/menu' : '/profile'}
                            className="inline-flex items-center gap-2 bg-white text-orange-600 px-10 py-5 rounded-2xl font-black text-sm uppercase transition-all active:scale-90 shadow-xl hover:shadow-2xl"
                        >
                            {user ? 'HACER UN PEDIDO' : 'REGISTRARSE'}{' '}
                            <ArrowRight size={20} strokeWidth={1.5} />
                        </Link>
                    </div>
                </div>

                {/* Promo Menu Items from API */}
                <div className="mb-10 max-w-5xl mx-auto">
                    <div className="flex items-center justify-center gap-3 mb-10">
                        <Tag size={28} strokeWidth={1.5} className="text-orange-600" />
                        <h2 className="text-3xl font-black text-gray-900 m-0 tracking-tight">
                            Menús especiales
                        </h2>
                    </div>

                    {promoItems.length === 0 ? (
                        <div className="bg-gray-50 rounded-[2.5rem] p-12 text-center border-2 border-dashed border-gray-200">
                            <div className="text-5xl mb-4 grayscale opacity-50">🍱</div>
                            <p className="text-gray-500 text-lg font-medium">
                                No hay menús disponibles
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
                            {promoItems.map(item => (
                                <div
                                    key={item.id}
                                    className="bg-white rounded-3xl shadow-xl shadow-gray-200/40 overflow-hidden hover:-translate-y-1 transition-transform duration-300 flex flex-col group border border-gray-50"
                                >
                                    <div className="h-32 md:h-56 bg-gray-50 overflow-hidden relative flex items-center justify-center">
                                        <SafeImage
                                            src={item.image}
                                            alt={`Oferta ${item.name}`}
                                            loading="lazy"
                                            decoding="async"
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                            getOptimizedUrl={(url: string) =>
                                                getOptimizedImageUrl(url, 640)
                                            }
                                            fallbackContent={
                                                <div className="w-full h-full bg-gradient-to-br from-gray-50 to-white flex items-center justify-center relative overflow-hidden group-hover:scale-110 transition-transform duration-700">
                                                    <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/asfalt-dark.png')]"></div>
                                                    <span className="text-3xl md:text-6xl relative z-10 drop-shadow-2xl">
                                                        🎁
                                                    </span>
                                                </div>
                                            }
                                        />
                                        <span className="absolute top-2 left-2 md:top-4 md:left-4 bg-black/80 backdrop-blur-md text-white text-[8px] md:text-xs uppercase tracking-wider font-black px-2 py-1 md:px-3 md:py-1.5 rounded-full">
                                            Promo
                                        </span>
                                    </div>
                                    <div className="p-3 md:p-8 flex flex-col flex-1">
                                        <h3 className="font-black text-gray-900 text-sm md:text-2xl mb-1 md:mb-2 line-clamp-1">
                                            {item.name}
                                        </h3>
                                        <p className="text-gray-500 font-medium text-[10px] md:text-base leading-tight md:leading-relaxed mb-3 md:mb-6 line-clamp-2 md:line-clamp-none">
                                            {item.description}
                                        </p>
                                        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2 md:gap-0 mt-auto">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] md:text-sm font-bold text-gray-400 line-through decoration-orange-500/50 -mb-1">
                                                    {Math.round(item.price * 1.11)} €
                                                </span>
                                                <span className="text-base md:text-3xl font-black text-orange-600 leading-none">
                                                    {item.price.toFixed(2).replace('.', ',')} €
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => handleAdd(item)}
                                                className={`flex items-center justify-center gap-1 px-3 py-2 md:px-6 md:py-3.5 rounded-xl font-black text-[10px] md:text-sm border-none cursor-pointer transition-all duration-300 active:scale-90 ${
                                                    addedItems.has(item.id)
                                                        ? 'bg-green-500 text-white shadow-lg'
                                                        : 'bg-orange-600 text-white hover:bg-orange-700 shadow-xl'
                                                }`}
                                            >
                                                {addedItems.has(item.id) ? (
                                                    <Check size={16} />
                                                ) : (
                                                    <>
                                                        <Plus
                                                            size={14}
                                                            strokeWidth={1.5}
                                                            className="md:w-4 md:h-4"
                                                        />{' '}
                                                        <span className="hidden md:inline">
                                                            Añadir
                                                        </span>
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
            </div>
        </div>
    );
}
