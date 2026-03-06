import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock, Tag, Plus } from 'lucide-react';
import { api } from '../utils/api';
import { useCart } from '../hooks/useCart';
import SEO from '../components/SEO';

interface PromoItem {
    id: number;
    name: string;
    description: string;
    price: number;
    image: string;
    category: string;
}

export default function PromoPageSimple() {
    const [promoItems, setPromoItems] = useState<PromoItem[]>([]);
    const [staticPromos, setStaticPromos] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [addedItems, setAddedItems] = useState<Set<number>>(new Set());
    const [failedImages, setFailedImages] = useState<Set<number>>(new Set());
    const { addItem } = useCart();

    useEffect(() => {
        Promise.all([api.get('/menu?category=menus&limit=20'), api.get('/promos')])
            .then(([menuData, promosData]) => {
                setPromoItems(menuData.items ?? []);
                setStaticPromos(promosData.promos ?? []);
            })
            .catch(() => {
                setPromoItems([]);
                setStaticPromos([]);
            })
            .finally(() => setIsLoading(false));
    }, []);

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
        <div className="flex-1 bg-white">
            <SEO
                title="Ofertas y Promociones"
                description="Descubre nuestras promociones exclusivas, combos especiales de sushi con descuentos y ofertas limitadas. ¡Pide online ahora!"
                keywords="ofertas sushi, promos sushi, combos sushi madrid, descuento sushi"
            />

            {/* Hero Header */}
            <section className="relative bg-[url('/sushi-hero.jpg')] bg-cover bg-center pt-20 pb-28 px-4">
                <div className="absolute inset-0 bg-black/70"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-gray-50/20 to-transparent"></div>
                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
                        Promociones y ofertas <span className="text-red-500">🎉</span>
                    </h1>
                    <p className="text-gray-300 text-lg md:text-xl font-medium max-w-xl mx-auto">
                        Ofertas especiales y descuentos exclusivos de Sushi de Maksim
                    </p>
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-4 -mt-16 mb-20 relative z-20">
                {/* Static Promo Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-20">
                    {!isLoading &&
                        staticPromos.map(promo => (
                            <div
                                key={promo.id}
                                className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 flex flex-col group"
                            >
                                {/* Colored header */}
                                <div
                                    className={`p-8 text-center bg-gradient-to-br ${promo.bg} relative overflow-hidden`}
                                >
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-150"></div>
                                    <div className="text-5xl mb-4 relative z-10 transform group-hover:scale-110 transition-transform">
                                        {promo.icon}
                                    </div>
                                    <h3 className="text-2xl font-black text-white mb-3 relative z-10">
                                        {promo.title}
                                    </h3>
                                    <span className="bg-black/20 backdrop-blur-md text-white text-sm font-black px-4 py-1.5 rounded-full relative z-10">
                                        {promo.discount}
                                    </span>
                                </div>

                                {/* Body */}
                                <div className="p-6 flex flex-col flex-1">
                                    <p className="text-gray-600 font-medium leading-relaxed mb-6 flex-1">
                                        {promo.description}
                                    </p>
                                    <div className="flex items-center gap-2 text-sm text-gray-400 mb-6 font-semibold bg-gray-50 p-3 rounded-xl">
                                        <Clock size={16} className="text-gray-500" />
                                        <span>
                                            Válido hasta:{' '}
                                            <span className="text-gray-700">
                                                {promo.valid_until}
                                            </span>
                                        </span>
                                    </div>
                                    {/* Visual line */}
                                    <div className="w-full h-px bg-gray-100 mb-6"></div>
                                    <Link
                                        to="/menu"
                                        className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-black text-sm text-white no-underline transition-all hover:opacity-90 active:scale-95 shadow-lg group-hover:shadow-xl"
                                        style={{
                                            backgroundColor: promo.color,
                                            boxShadow: `0 10px 25px -5px ${promo.color}40`,
                                        }}
                                    >
                                        Ver menú{' '}
                                        <ArrowRight
                                            size={16}
                                            className="group-hover:translate-x-1 transition-transform"
                                        />
                                    </Link>
                                </div>
                            </div>
                        ))}
                </div>

                {/* Weekly Banner */}
                <div className="bg-red-600 rounded-[3rem] p-12 text-center text-white mb-20 relative overflow-hidden shadow-[0_20px_50px_rgba(220,38,38,0.3)]">
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/asfalt-dark.png')] opacity-10"></div>
                    <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/20 blur-[80px] rounded-full"></div>
                    <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-black/20 blur-[80px] rounded-full"></div>

                    <div className="relative z-10 max-w-3xl mx-auto">
                        <div className="text-6xl mb-6 transform hover:scale-110 transition-transform">
                            🎯
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">
                            ¡Súper oferta de la semana!
                        </h2>
                        <p className="text-xl md:text-2xl font-medium mb-8 opacity-90 text-red-100">
                            Pide el menú «Chef Gourmet» y llévate un postre Mochi de regalo
                        </p>
                        <div className="inline-block bg-white/20 backdrop-blur-md px-8 py-3 rounded-full text-xl font-black mb-10 border border-white/30">
                            Ahorra hasta 5,00 €
                        </div>
                        <br />
                        <Link
                            to="/menu"
                            className="inline-flex items-center gap-2 bg-white text-red-600 px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-wide no-underline transition-all active:scale-95 shadow-xl hover:shadow-2xl hover:-translate-y-1 group"
                        >
                            Pedir este combo{' '}
                            <ArrowRight
                                size={20}
                                className="group-hover:translate-x-1 transition-transform"
                            />
                        </Link>
                    </div>
                </div>

                {/* Promo Menu Items from API */}
                <div className="mb-10 max-w-5xl mx-auto">
                    <div className="flex items-center justify-center gap-3 mb-10">
                        <Tag size={28} className="text-red-600" />
                        <h2 className="text-3xl font-black text-gray-900 m-0 tracking-tight">
                            Menús especiales
                        </h2>
                    </div>

                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {[1, 2].map(i => (
                                <div
                                    key={i}
                                    className="bg-white rounded-[2rem] shadow-sm overflow-hidden flex flex-col h-full animate-pulse border border-gray-100"
                                >
                                    <div className="h-56 bg-gray-200"></div>
                                    <div className="p-8 flex flex-col gap-4">
                                        <div className="h-8 bg-gray-200 rounded w-2/3"></div>
                                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                                        <div className="h-4 bg-gray-200 rounded w-5/6 mb-2"></div>
                                        <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                                        <div className="flex justify-between items-end mt-4">
                                            <div>
                                                <div className="h-4 bg-gray-200 rounded w-12 mb-2"></div>
                                                <div className="h-8 bg-gray-200 rounded w-20"></div>
                                            </div>
                                            <div className="h-10 bg-gray-200 rounded-full w-32"></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : promoItems.length === 0 ? (
                        <div className="bg-gray-50 rounded-[2rem] p-12 text-center border-2 border-dashed border-gray-200">
                            <div className="text-5xl mb-4 grayscale opacity-50">🍱</div>
                            <p className="text-gray-500 text-lg font-medium">
                                No hay menús disponibles ahora mismo
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {promoItems.map(item => (
                                <div
                                    key={item.id}
                                    className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/40 overflow-hidden hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 flex flex-col group border border-gray-50"
                                >
                                    <div className="h-56 bg-gray-100 overflow-hidden relative">
                                        {!failedImages.has(item.id) ? (
                                            <img
                                                src={item.image}
                                                alt={`Oferta ${item.name}`}
                                                loading="lazy"
                                                decoding="async"
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                onError={() =>
                                                    setFailedImages(prev =>
                                                        new Set(prev).add(item.id)
                                                    )
                                                }
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-6xl">
                                                🎁
                                            </div>
                                        )}
                                        <span className="absolute top-4 left-4 bg-black/80 backdrop-blur-md text-white text-xs uppercase tracking-wider font-black px-3 py-1.5 rounded-full">
                                            Solo hoy
                                        </span>
                                    </div>
                                    <div className="p-8 flex flex-col flex-1">
                                        <h3 className="font-black text-gray-900 text-2xl mb-2">
                                            {item.name}
                                        </h3>
                                        <p className="text-gray-500 font-medium flex-1 mb-6 leading-relaxed">
                                            {item.description}
                                        </p>
                                        <div className="flex items-center justify-between mt-auto">
                                            <span className="text-3xl font-black text-red-600">
                                                {item.price.toFixed(2).replace('.', ',')} €
                                            </span>
                                            <button
                                                onClick={() => handleAdd(item)}
                                                className={`flex items-center gap-2 px-6 py-3.5 rounded-xl font-black text-sm border-none cursor-pointer transition-all duration-300 active:scale-95 ${
                                                    addedItems.has(item.id)
                                                        ? 'bg-green-500 text-white shadow-lg shadow-green-500/30'
                                                        : 'bg-red-600 text-white hover:bg-red-700 shadow-xl shadow-red-600/20'
                                                }`}
                                            >
                                                {addedItems.has(item.id) ? (
                                                    '✓ Añadido'
                                                ) : (
                                                    <>
                                                        <Plus size={16} /> Añadir
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
