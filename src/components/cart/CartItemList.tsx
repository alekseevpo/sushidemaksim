import { Trash2, Minus, Plus, X } from 'lucide-react';
import { getOptimizedImageUrl } from '../../utils/images';
import { CartItem } from '../../types';
import { triggerHaptic } from '../../utils/haptics';

interface CartItemListProps {
    items: CartItem[];
    updateQuantity: (id: string, quantity: number) => void;
    removeItem: (id: string) => void;
    clearCart: () => void;
    getCategoryEmoji: (category: string) => string;
    failedImages: Set<string | number>;
    setFailedImages: React.Dispatch<React.SetStateAction<Set<string | number>>>;
}

export default function CartItemList({
    items,
    updateQuantity,
    removeItem,
    clearCart,
    getCategoryEmoji,
    failedImages,
    setFailedImages,
}: CartItemListProps) {
    return (
        <div className="bg-transparent md:bg-white md:rounded-xl md:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1)] p-0 md:p-6 mb-4 md:mb-6">
            <div className="flex items-center justify-between mb-4 md:mb-6 px-4 md:px-0">
                <h2 className="text-xl md:text-xl font-black m-0 uppercase tracking-tight">
                    Productos ({items.length})
                </h2>
                <button
                    onClick={clearCart}
                    className="text-sm font-bold text-gray-400 hover:text-red-600 transition-colors border-none bg-transparent cursor-pointer flex items-center gap-1 w-fit"
                >
                    <Trash2 size={14} strokeWidth={1.5} /> Vaciar cesta
                </button>
            </div>

            <div className="flex flex-col gap-4">
                {items.map(item => (
                    <div
                        key={item.id}
                        className="relative flex items-center gap-3 p-3 bg-white border-b border-gray-50 last:border-none animate-in slide-in-from-left duration-300"
                    >
                        <div className="w-16 h-16 sm:w-16 sm:h-16 rounded-xl overflow-hidden shrink-0 bg-gray-50 flex items-center justify-center border border-gray-100 relative group/img">
                            {!failedImages.has(item.id) ? (
                                <img
                                    src={getOptimizedImageUrl(item.image, 256)}
                                    alt={`Producto ${item.name}`}
                                    loading="lazy"
                                    className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-500"
                                    onError={() =>
                                        setFailedImages(prev => new Set(prev).add(item.id))
                                    }
                                />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-gray-50 to-white flex items-center justify-center relative overflow-hidden group-hover/img:scale-110 transition-transform duration-500">
                                    <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/asfalt-dark.png')]"></div>
                                    <div className="absolute w-12 h-12 bg-red-500/5 rounded-full blur-xl"></div>
                                    <span className="text-2xl relative z-10 drop-shadow-md">
                                        {getCategoryEmoji(item.category)}
                                    </span>
                                    <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent"></div>
                                </div>
                            )}
                        </div>

                        <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-gray-900 leading-tight mb-1 md:mb-2 text-sm md:text-sm truncate">
                                {item.name}
                            </h3>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center bg-gray-50 rounded-lg p-0.5 border border-gray-100">
                                    <button
                                        onClick={() => {
                                            triggerHaptic();
                                            item.quantity > 1
                                                ? updateQuantity(item.id, item.quantity - 1)
                                                : removeItem(item.id);
                                        }}
                                        className="w-8 h-8 md:w-7 md:h-7 rounded-md bg-white border-none shadow-sm cursor-pointer flex items-center justify-center hover:text-red-600 active:scale-90 transition-all font-bold"
                                    >
                                        <Minus size={14} strokeWidth={1.5} />
                                    </button>
                                    <span className="w-8 md:w-8 text-center font-black text-gray-900 text-sm">
                                        {item.quantity}
                                    </span>
                                    <button
                                        onClick={() => {
                                            triggerHaptic();
                                            updateQuantity(item.id, item.quantity + 1);
                                        }}
                                        className="w-8 h-8 md:w-7 md:h-7 rounded-md bg-white border-none shadow-sm cursor-pointer flex items-center justify-center hover:text-red-600 active:scale-90 transition-all font-bold"
                                    >
                                        <Plus size={14} strokeWidth={1.5} />
                                    </button>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-base md:text-base font-black text-gray-900">
                                        {(item.price * item.quantity).toFixed(2).replace('.', ',')}{' '}
                                        €
                                    </span>
                                    <button
                                        onClick={() => {
                                            triggerHaptic(40); // HEAVY
                                            removeItem(item.id);
                                        }}
                                        className="text-gray-300 hover:text-red-500 cursor-pointer p-0 transition-colors flex items-center justify-center border-none bg-transparent"
                                        aria-label="Eliminar"
                                    >
                                        <X size={18} strokeWidth={1.5} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
