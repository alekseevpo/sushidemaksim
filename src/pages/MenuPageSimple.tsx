import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, X, Heart } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { api } from '../utils/api';

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
  'entrantes': '🥟', 'rollos-grandes': '🍣', 'rollos-clasicos': '🥢',
  'rollos-fritos': '🔥', 'sopas': '🍜', 'menus': '🎁', 'extras': '🧴', 'postre': '🍰',
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
    } catch {
      setItems([]);
    } finally {
      setIsLoading(false);
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
    setFlyingItems(prev => [...prev, {
      id: animId,
      startX,
      startY,
      endX,
      endY,
      image: hasImage ? item.image : undefined,
      emoji: hasImage ? undefined : (EMOJI[item.category] || '🍱')
    }]);

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
      setAddedItems(prev => { const n = new Set(prev); n.delete(item.id); return n; });
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

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl text-gray-900 font-bold text-center mb-6">
          Nuestro Menú
        </h1>

        {/* Search */}
        <div className="flex justify-center mb-6">
          <div className="relative w-full max-w-md">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
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

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-full font-bold border-none cursor-pointer transition-all duration-200 ${selectedCategory === 'all'
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
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold border-none cursor-pointer transition-all duration-200 ${selectedCategory === cat.id
                ? 'bg-red-600 text-white shadow-[0_4px_12px_rgba(220,38,38,0.3)]'
                : 'bg-white text-gray-700 shadow-sm hover:bg-gray-100'
                }`}
            >
              <span>{cat.icon}</span>{cat.name}
            </button>
          ))}
        </div>

        {/* Items */}
        {isLoading ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-5xl mb-4 animate-pulse">🍣</div>
            <p className="text-lg">Cargando menú...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-500">
              {search ? `No hay resultados para "${search}"` : 'No hay platos en esta categoría'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] sm:grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-6">
            {items.map(item => (
              <div
                key={item.id}
                className="bg-white rounded-xl shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1)] overflow-hidden transition-all duration-300 relative hover:-translate-y-1 hover:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.15)] flex flex-col group"
              >
                {user && (
                  <button
                    onClick={() => toggleFavorite(item.id)}
                    className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-white/90 shadow-sm flex items-center justify-center hover:scale-110 transition-transform cursor-pointer border-none mix-blend-normal"
                  >
                    <Heart
                      size={18}
                      className={favoriteItems.has(item.id) ? "text-red-500" : "text-gray-400"}
                      fill={favoriteItems.has(item.id) ? "currentColor" : "none"}
                    />
                  </button>
                )}

                {/* Image */}
                <div className="h-[200px] bg-gray-100 rounded-t-xl overflow-hidden relative">
                  {!failedImages.has(item.id) ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={() => setFailedImages(prev => new Set(prev).add(item.id))}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <span className="text-6xl">{EMOJI[item.category] ?? '🍣'}</span>
                    </div>
                  )}
                  <div className="absolute top-2 left-2 flex gap-1">
                    {item.spicy && <span className="bg-red-100 text-red-800 rounded-full px-2 py-1 text-xs font-semibold">🌶️ Picante</span>}
                    {item.is_promo && <span className="bg-green-100 text-green-800 rounded-full px-2 py-1 text-xs font-bold">🏷️ Promo</span>}
                  </div>
                </div>

                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-bold m-0 text-gray-900 leading-tight">{item.name}</h3>
                    <div className="flex gap-1 ml-2 flex-shrink-0">
                      {item.vegetarian && <span className="text-emerald-500">🥬</span>}
                    </div>
                  </div>
                  <p className="text-gray-500 text-sm leading-relaxed mb-3 flex-1 m-0">{item.description}</p>
                  {item.pieces && (
                    <div className="text-sm text-gray-400 mb-3 font-medium">{item.pieces} uds</div>
                  )}
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-[22px] font-bold text-red-600">
                      {item.price.toFixed(2).replace('.', ',')} €
                    </span>
                    <button
                      onClick={(e) => handleAddToCart(item, e)}
                      className={`px-4 py-2.5 rounded-lg font-bold border-none cursor-pointer flex items-center gap-1.5 text-sm outline-none transition-all duration-300 ${addedItems.has(item.id)
                        ? 'bg-green-600 text-white'
                        : 'bg-red-600 text-white hover:bg-red-700 shadow-md hover:shadow-lg'
                        }`}
                    >
                      {addedItems.has(item.id) ? <>✓ Añadido</> : <><Plus size={16} />Añadir</>}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Fly-to-Cart Portals */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {flyingItems.map(fly => (
            <motion.div
              key={fly.id}
              initial={{ x: fly.startX - 25, y: fly.startY - 25, scale: 1, opacity: 1 }}
              animate={{
                x: fly.endX - 25,
                // Make the arc more pronounced and ensure it hits the cart at scale 0.1
                y: [fly.startY - 25, Math.min(fly.startY - 150, fly.endY - 50), fly.endY - 25],
                scale: [1, 1.2, 0.1],
                opacity: [1, 1, 0]
              }}
              transition={{
                duration: 1.1,
                // Move horizontally in a straight line, slower
                x: { ease: "linear", duration: 1.1 },
                // Move vertically with an arc: jump up fast, fall down slowly
                y: { ease: ["easeOut", "easeIn"], times: [0, 0.4, 1], duration: 1.1 },
                // Grow a bit at start of arc, then shrink into cart
                scale: { ease: "easeInOut", times: [0, 0.3, 1], duration: 1.1 },
                // Fade out only at the very end
                opacity: { ease: "linear", times: [0, 0.85, 1], duration: 1.1 }
              }}
              className="fixed top-0 left-0 z-[1000] pointer-events-none rounded-full overflow-hidden shadow-2xl flex items-center justify-center bg-white border-2 border-red-500 will-change-transform"
              style={{ width: '50px', height: '50px' }}
            >
              {fly.image ? (
                <img src={fly.image} alt="" className="w-full h-full object-cover" />
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
