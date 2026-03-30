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
    chopsticksCount: number;
    updateChopsticks: (count: number) => void;
}

export default function CartItemList({
    items,
    updateQuantity,
    removeItem,
    clearCart,
    getCategoryEmoji,
    failedImages,
    setFailedImages,
    chopsticksCount,
    updateChopsticks,
}: CartItemListProps) {
    return (
        <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 mb-6 overflow-hidden">
            <div className="flex items-center justify-between p-4 pb-2 border-b border-gray-50 bg-gray-50/30">
                <h2 className="text-sm font-black m-0 uppercase tracking-widest text-gray-400">
                    Productos ({items.length})
                </h2>
                <button
                    onClick={clearCart}
                    className="text-[10px] font-black uppercase tracking-widest text-gray-300 hover:text-orange-500 transition-colors border-none bg-transparent cursor-pointer flex items-center gap-1.5"
                >
                    <Trash2 size={12} strokeWidth={2.5} /> Vaciar
                </button>
            </div>

            <div className="flex flex-col">
                {items.map(item => (
                    <div
                        key={item.id}
                        className="relative flex items-center gap-3 px-3 py-3 bg-white border-b border-gray-50 last:border-none animate-in slide-in-from-left duration-300"
                    >
                        <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-gray-50 flex items-center justify-center border border-gray-100 relative group/img">
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
                                    <div className="absolute w-12 h-12 bg-orange-500/5 rounded-full blur-xl"></div>
                                    <span className="text-2xl relative z-10 drop-shadow-md">
                                        {getCategoryEmoji(item.category)}
                                    </span>
                                    <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent"></div>
                                </div>
                            )}
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="mb-2">
                                <h3 className="font-bold text-gray-900 leading-tight text-[13px] md:text-sm truncate mb-0.5">
                                    {item.name}
                                </h3>
                                {item.description && (
                                    <p className="text-[10px] text-gray-400 font-medium leading-none truncate opacity-60">
                                        {item.description}
                                    </p>
                                )}
                            </div>
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center bg-gray-50 rounded-lg p-0.5 border border-gray-100">
                                    <button
                                        onClick={() => {
                                            triggerHaptic();
                                            item.quantity > 1
                                                ? updateQuantity(item.id, item.quantity - 1)
                                                : removeItem(item.id);
                                        }}
                                        className="w-7 h-7 md:w-6 md:h-6 rounded-md bg-white border-none shadow-sm cursor-pointer flex items-center justify-center hover:text-orange-600 active:scale-90 transition-all font-bold"
                                    >
                                        <Minus size={12} strokeWidth={2.5} />
                                    </button>
                                    <span className="w-7 md:w-7 text-center font-black text-gray-900 text-xs">
                                        {item.quantity}
                                    </span>
                                    <button
                                        onClick={() => {
                                            triggerHaptic();
                                            updateQuantity(item.id, item.quantity + 1);
                                        }}
                                        className="w-7 h-7 md:w-6 md:h-6 rounded-md bg-white border-none shadow-sm cursor-pointer flex items-center justify-center hover:text-orange-600 active:scale-90 transition-all font-bold"
                                    >
                                        <Plus size={12} strokeWidth={2.5} />
                                    </button>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-[15px] md:text-base font-black text-gray-900">
                                        {(item.price * item.quantity).toFixed(2).replace('.', ',')}{' '}
                                        €
                                    </span>
                                    <button
                                        onClick={() => {
                                            triggerHaptic(40); // HEAVY
                                            removeItem(item.id);
                                        }}
                                        className="text-gray-300 hover:text-orange-400 cursor-pointer p-0 transition-colors flex items-center justify-center border-none bg-transparent"
                                        aria-label="Eliminar"
                                    >
                                        <X size={16} strokeWidth={2.5} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer with Info and Chopsticks */}
            <div className="p-4 bg-gray-50/50 border-t border-gray-100">
                <div className="flex flex-col gap-4">
                    {/* Notice */}
                    <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 text-center">
                        <p className="text-[12px] font-black text-orange-600 leading-tight m-0 uppercase tracking-widest">
                            Salsa de soja, wasabi y jengibre están incluidos en su pedido.
                        </p>
                    </div>

                    {/* Chopsticks Question */}
                    <div className="flex items-center justify-between gap-4 py-1">
                        <div className="flex flex-col">
                            <p className="text-[10px] sm:text-[13px] font-black text-gray-900 m-0 uppercase tracking-wide sm:tracking-widest whitespace-nowrap">
                                ¿Cuántos palillos le pongo?
                            </p>
                        </div>

                        <div className="flex items-center bg-white rounded-lg p-0.5 border border-gray-200 shadow-sm">
                            <button
                                onClick={() => {
                                    triggerHaptic();
                                    updateChopsticks(Math.max(0, chopsticksCount - 1));
                                }}
                                className="w-8 h-8 rounded-md bg-transparent border-none cursor-pointer flex items-center justify-center hover:text-orange-600 active:scale-90 transition-all font-bold disabled:opacity-30"
                                disabled={chopsticksCount <= 0}
                            >
                                <Minus size={14} strokeWidth={2.5} />
                            </button>
                            <span className="w-8 text-center font-black text-gray-900 text-[14px]">
                                {chopsticksCount}
                            </span>
                            <button
                                onClick={() => {
                                    triggerHaptic();
                                    updateChopsticks(Math.min(10, chopsticksCount + 1));
                                }}
                                className="w-8 h-8 rounded-md bg-transparent border-none cursor-pointer flex items-center justify-center hover:text-orange-600 active:scale-90 transition-all font-bold disabled:opacity-30"
                                disabled={chopsticksCount >= 10}
                            >
                                <Plus size={14} strokeWidth={2.5} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
