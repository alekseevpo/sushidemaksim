import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock, Tag, Plus } from 'lucide-react';
import { api } from '../utils/api';
import { useCart } from '../hooks/useCart';

const STATIC_PROMOS = [
  {
    id: 1,
    title: 'Happy Hours',
    description: '20% de descuento en todos los rollos de 12:00 a 15:00 h de lunes a viernes',
    discount: '−20%',
    validUntil: '31 de marzo 2026',
    icon: '⏰',
    color: '#DC2626',
    bg: 'from-red-600 to-red-500',
  },
  {
    id: 2,
    title: 'Cumpleaños',
    description: 'Set de rollos gratis en tu cumpleaños con pedidos a partir de 30 €',
    discount: 'Regalo',
    validUntil: 'Permanente',
    icon: '🎂',
    color: '#EC4899',
    bg: 'from-pink-500 to-pink-400',
  },
  {
    id: 3,
    title: 'Cena familiar',
    description: 'Pedido de más de 50 € — postre de regalo',
    discount: '+Postre',
    validUntil: '30 de abril 2026',
    icon: '👨‍👩‍👧‍👦',
    color: '#10B981',
    bg: 'from-emerald-500 to-emerald-400',
  },
  {
    id: 4,
    title: 'Primer pedido',
    description: '15% de descuento en tu primer pedido a través de la web',
    discount: '−15%',
    validUntil: 'Permanente',
    icon: '🎁',
    color: '#F59E0B',
    bg: 'from-amber-500 to-amber-400',
  },
];

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
  const [isLoading, setIsLoading] = useState(true);
  const [addedItems, setAddedItems] = useState<Set<number>>(new Set());
  const [failedImages, setFailedImages] = useState<Set<number>>(new Set());
  const { addItem } = useCart();

  useEffect(() => {
    api.get('/menu?category=menus&limit=20')
      .then(data => setPromoItems(data.items ?? []))
      .catch(() => setPromoItems([]))
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
    setTimeout(() => setAddedItems(prev => { const n = new Set(prev); n.delete(item.id); return n; }), 1200);
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="max-w-7xl mx-auto">

        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Promociones y ofertas 🎉
          </h1>
          <p className="text-xl text-gray-500 max-w-xl mx-auto">
            Ofertas especiales y descuentos exclusivos de Sushi de Maksim
          </p>
        </div>

        {/* Static Promo Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-14">
          {STATIC_PROMOS.map(promo => (
            <div
              key={promo.id}
              className="bg-white rounded-2xl shadow-[0_10px_15px_-3px_rgba(0,0,0,0.08)] overflow-hidden hover:-translate-y-1 hover:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.12)] transition-all duration-300"
            >
              {/* Colored header */}
              <div
                className="p-6 text-center"
                style={{ backgroundColor: promo.color }}
              >
                <div className="text-5xl mb-3">{promo.icon}</div>
                <h3 className="text-xl font-bold text-white mb-2">{promo.title}</h3>
                <span className="bg-white/20 text-white text-sm font-bold px-3 py-1 rounded-full">
                  {promo.discount}
                </span>
              </div>

              {/* Body */}
              <div className="p-5">
                <p className="text-gray-600 text-sm leading-relaxed mb-4">{promo.description}</p>
                <div className="flex items-center gap-2 text-xs text-gray-400 mb-5">
                  <Clock size={13} />
                  <span>Válido hasta: {promo.validUntil}</span>
                </div>
                <Link
                  to="/menu"
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg font-bold text-sm text-white no-underline transition hover:opacity-90"
                  style={{ backgroundColor: promo.color }}
                >
                  Ver menú <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Weekly Banner */}
        <div className="bg-gradient-to-r from-red-600 to-pink-500 rounded-2xl p-10 text-center text-white mb-14 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 50%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
          <div className="relative z-10">
            <div className="text-6xl mb-4">🎯</div>
            <h2 className="text-3xl font-bold mb-3">¡Súper oferta de la semana!</h2>
            <p className="text-xl mb-4 opacity-90">
              Pide el menú «Chef Gourmet» y llévate un postre Mochi de regalo
            </p>
            <div className="inline-block bg-white/20 px-6 py-2 rounded-lg text-lg font-bold mb-6">
              Ahorra hasta 5,00 €
            </div>
            <br />
            <Link
              to="/menu"
              className="inline-flex items-center gap-2 bg-white text-red-600 px-8 py-3 rounded-xl font-bold text-lg no-underline hover:bg-gray-50 transition mt-2"
            >
              Pedir ahora <ArrowRight size={20} />
            </Link>
          </div>
        </div>

        {/* Promo Menu Items from API */}
        <div className="mb-4">
          <div className="flex items-center gap-3 mb-6">
            <Tag size={22} className="text-red-600" />
            <h2 className="text-2xl font-bold text-gray-900 m-0">Menús especiales</h2>
          </div>

          {isLoading ? (
            <div className="text-center py-10 text-gray-400">
              <div className="text-4xl mb-3 animate-pulse">🎁</div>
              <p>Cargando ofertas...</p>
            </div>
          ) : promoItems.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No hay menús disponibles ahora mismo</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {promoItems.map(item => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl shadow-[0_10px_15px_-3px_rgba(0,0,0,0.08)] overflow-hidden hover:-translate-y-1 hover:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.12)] transition-all duration-300 flex flex-col group"
                >
                  <div className="h-44 bg-gray-100 overflow-hidden relative">
                    {!failedImages.has(item.id) ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={() => setFailedImages(prev => new Set(prev).add(item.id))}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-5xl">🎁</div>
                    )}
                    <span className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                      🏷️ Menú especial
                    </span>
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="font-bold text-gray-900 text-lg mb-1">{item.name}</h3>
                    <p className="text-gray-500 text-sm flex-1 mb-4 leading-relaxed">{item.description}</p>
                    <div className="flex items-center justify-between mt-auto">
                      <span className="text-2xl font-bold text-red-600">
                        {item.price.toFixed(2).replace('.', ',')} €
                      </span>
                      <button
                        onClick={() => handleAdd(item)}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-bold text-sm border-none cursor-pointer transition-all duration-300 ${addedItems.has(item.id)
                            ? 'bg-green-600 text-white'
                            : 'bg-red-600 text-white hover:bg-red-700 shadow-md'
                          }`}
                      >
                        {addedItems.has(item.id) ? '✓ Añadido' : <><Plus size={15} /> Añadir</>}
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
