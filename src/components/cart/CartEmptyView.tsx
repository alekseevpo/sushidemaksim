import { Link } from 'react-router-dom';
import { ShoppingCart, ArrowDown, Flame, Check, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

interface MenuItem {
    id: number;
    name: string;
    description: string;
    price: number;
    image: string;
    category: string;
}

interface CartEmptyViewProps {
    popularItems: MenuItem[];
    isLoadingPopular: boolean;
    handleAddToCart: (item: MenuItem) => void;
    getCategoryEmoji: (category: string) => string;
    failedImages: Set<string | number>;
    setFailedImages: React.Dispatch<React.SetStateAction<Set<string | number>>>;
    addedItems: Set<number>;
}

export default function CartEmptyView({
    popularItems,
    isLoadingPopular,
    handleAddToCart,
    getCategoryEmoji,
    failedImages,
    setFailedImages,
    addedItems,
}: CartEmptyViewProps) {
    return (
        <div className="min-h-screen bg-transparent px-4 py-8 flex items-center">
            <div className="max-w-4xl mx-auto text-center py-16 w-full">
                <div className="flex justify-center mb-6">
                    <div className="w-24 h-24 bg-gray-50 rounded-[32px] flex items-center justify-center -rotate-12 shadow-sm border border-gray-100">
                        <ShoppingCart size={40} className="text-gray-400" strokeWidth={1.5} />
                    </div>
                </div>
                <h1 className="text-4xl font-bold mb-4 text-gray-900 tracking-tight">
                    Tu cesta está vacía
                </h1>
                <p className="text-gray-500 mb-8 max-w-md mx-auto">
                    <span className="block text-xl font-bold text-gray-900 mb-2">
                        Mira lo que tenemos para ti
                    </span>
                    Añade platos del menú o elige una de nuestras sugerencias a continuación para
                    hacer tu pedido.
                </p>
                <div className="flex flex-col items-center gap-4 mb-12">
                    <Link
                        to="/menu"
                        className="bg-red-600 text-white px-8 py-4 rounded-2xl no-underline font-black shadow-lg shadow-red-200 active:scale-90 transition-all w-full sm:w-auto"
                    >
                        Ver Menú Completo
                    </Link>

                    <motion.div
                        animate={{ y: [0, 10, 0] }}
                        transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                        className="text-red-300 mt-8"
                    >
                        <ArrowDown size={32} strokeWidth={2} />
                    </motion.div>
                </div>

                {(popularItems.length > 0 || isLoadingPopular) && (
                    <div className="mt-12">
                        <div className="flex flex-col items-center justify-center gap-2 mb-8">
                            <span className="inline-block px-4 py-1.5 bg-red-50 text-red-600 text-xs font-black uppercase tracking-widest rounded-full mb-2">
                                Recomendaciones
                            </span>
                            <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight m-0 flex items-center gap-3 w-full justify-center">
                                <Flame
                                    size={28}
                                    strokeWidth={1.5}
                                    className="text-red-600 shrink-0"
                                />
                                <span className="truncate">Top Ventas y Ofertas</span>
                                <Flame
                                    size={28}
                                    strokeWidth={1.5}
                                    className="text-red-600 shrink-0"
                                />
                            </h2>
                        </div>
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8 text-left">
                            {isLoadingPopular
                                ? [1, 2, 3, 4, 5, 6].map(i => (
                                      <div
                                          key={i}
                                          className="bg-white rounded-[32px] p-4 space-y-4 border border-gray-100"
                                      >
                                          <div className="aspect-[4/3] bg-gray-100 animate-pulse rounded-2xl" />
                                          <div className="space-y-2">
                                              <div className="h-4 w-3/4 bg-gray-100 animate-pulse rounded" />
                                              <div className="h-3 w-1/2 bg-gray-100 animate-pulse rounded" />
                                          </div>
                                          <div className="flex justify-between items-center pt-2">
                                              <div className="h-6 w-16 bg-gray-100 animate-pulse rounded" />
                                              <div className="h-10 w-24 bg-gray-100 animate-pulse rounded-xl" />
                                          </div>
                                      </div>
                                  ))
                                : popularItems.map(item => (
                                      <div
                                          key={item.id}
                                          className="premium-card group relative flex flex-col h-full rounded-[24px] md:rounded-[32px] overflow-hidden"
                                      >
                                          <div className="aspect-[4/3] bg-gray-50 overflow-hidden relative border border-gray-100">
                                              {!failedImages.has(item.id) ? (
                                                  <img
                                                      src={item.image}
                                                      alt={item.name}
                                                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                      onError={() =>
                                                          setFailedImages(prev =>
                                                              new Set(prev).add(item.id)
                                                          )
                                                      }
                                                  />
                                              ) : (
                                                  <div className="w-full h-full bg-gradient-to-br from-gray-50 to-white flex items-center justify-center relative overflow-hidden group-hover:scale-110 transition-transform duration-700">
                                                      <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/asfalt-dark.png')]"></div>
                                                      <div className="absolute w-24 h-24 bg-red-500/10 rounded-full blur-2xl"></div>
                                                      <span className="text-4xl relative z-10 drop-shadow-2xl translate-y-2">
                                                          {getCategoryEmoji(item.category)}
                                                      </span>
                                                      <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent"></div>
                                                  </div>
                                              )}
                                              <div className="absolute top-2 right-2 md:top-3 md:right-3 bg-white/90 backdrop-blur-md text-[8px] md:text-[10px] font-black px-2 py-1 rounded-lg shadow-sm">
                                                  ★ TOP
                                              </div>
                                          </div>
                                          <div className="p-3 md:p-6 flex flex-col flex-1">
                                              <div className="mb-1 md:mb-2">
                                                  <h3 className="text-sm md:text-xl font-black text-gray-900 leading-tight line-clamp-2 md:line-clamp-1 h-8 md:h-auto font-bold uppercase">
                                                      {item.name}
                                                  </h3>
                                              </div>
                                              <p className="text-gray-500 text-[11px] md:text-sm leading-tight md:leading-relaxed mb-3 md:mb-6 line-clamp-2 min-h-[2.5rem] md:min-h-0 font-medium overflow-hidden">
                                                  {item.description}
                                              </p>
                                              <div className="mt-auto flex items-center justify-between gap-1">
                                                  <span className="text-base md:text-2xl font-black text-gray-900 whitespace-nowrap">
                                                      {item.price.toFixed(2).replace('.', ',')} €
                                                  </span>
                                                  <button
                                                      onClick={() => handleAddToCart(item)}
                                                      className={`h-8 w-8 md:h-11 md:w-auto md:px-6 rounded-lg md:rounded-2xl font-black text-sm transition-all duration-300 flex items-center justify-center gap-2 border-none cursor-pointer flex-shrink-0 ${
                                                          addedItems.has(item.id)
                                                              ? 'bg-green-500 text-white'
                                                              : 'bg-gray-900 text-white hover:bg-red-600 hover:shadow-lg hover:shadow-red-200 active:scale-90'
                                                      }`}
                                                  >
                                                      {addedItems.has(item.id) ? (
                                                          <Check size={16} />
                                                      ) : (
                                                          <>
                                                              <Plus size={16} strokeWidth={1.5} />
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
                    </div>
                )}
            </div>
        </div>
    );
}
