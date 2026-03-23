import { motion } from 'framer-motion';
import { Clock, ArrowRight, X } from 'lucide-react';
import { CartItem } from '../../types';
import { triggerHaptic, HAPTIC_PATTERNS } from '../../utils/haptics';

interface CartSummaryProps {
    items: CartItem[];
    total: number;
    deliveryType: 'delivery' | 'pickup';
    deliveryCost: number;
    finalTotal: number;
    isStoreClosed: boolean;
    isOrdering: boolean;
    isInviting: boolean;
    isAuthenticated: boolean;
    hasAddress: boolean;
    handleOrder: () => void;
    handleInvite: () => void;
    promoCode: string;
    setPromoCode: (val: string) => void;
    promoDiscount: number | null;
    handleApplyPromo: (code: string) => void;
    isApplyingPromo: boolean;
    promoError: string | null;
    handleRemovePromo: () => void;
}

export default function CartSummary({
    items,
    total,
    deliveryType,
    deliveryCost,
    finalTotal,
    isStoreClosed,
    isOrdering,
    isInviting,
    isAuthenticated,
    hasAddress,
    handleOrder,
    handleInvite,
    promoCode,
    setPromoCode,
    promoDiscount,
    handleApplyPromo,
    isApplyingPromo,
    promoError,
    handleRemovePromo,
}: CartSummaryProps) {
    return (
        <div className="bg-white md:rounded-xl shadow-[0_4px_10px_rgba(0,0,0,0.03)] md:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1)] p-5 md:p-6 sticky top-24 rounded-t-[32px] md:rounded-xl border-b md:border-none border-gray-50 h-fit">
            <h2 className="text-lg font-black mb-4 uppercase tracking-tight">Resumen</h2>

            {isStoreClosed && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-2 text-amber-900"
                >
                    <Clock size={16} className="shrink-0 mt-0.5" />
                    <p className="text-[11px] font-bold leading-tight m-0">
                        Restaurante cerrado. Puedes realizar tu pedido y nos pondremos en contacto
                        contigo sin falta.
                    </p>
                </motion.div>
            )}

            <div className="flex flex-col gap-3 mb-6">
                <div className="flex justify-between text-gray-500 text-sm">
                    <span>Productos ({items.reduce((s, i) => s + i.quantity, 0)} uds.)</span>
                    <span className="font-bold text-gray-900">
                        {total.toFixed(2).replace('.', ',')} €
                    </span>
                </div>
                {deliveryType === 'delivery' && (
                    <div className="flex justify-between text-gray-500 text-sm animate-in fade-in duration-300">
                        <span>Envío</span>
                        {!hasAddress ? (
                            <span className="text-gray-400 italic">A determinar</span>
                        ) : (
                            <span
                                className={`font-bold ${deliveryCost <= 0 ? 'text-green-600' : 'text-gray-900'}`}
                            >
                                {deliveryCost <= 0
                                    ? 'GRATIS'
                                    : `${deliveryCost.toFixed(2).replace('.', ',')} €`}
                            </span>
                        )}
                    </div>
                )}
                {promoDiscount && (
                    <div className="flex justify-between text-green-600 text-sm animate-in zoom-in duration-300">
                        <span>Descuento ({promoDiscount}%)</span>
                        <span className="font-bold">
                            -{((total * promoDiscount) / 100).toFixed(2).replace('.', ',')} €
                        </span>
                    </div>
                )}
                <div className="border-t border-gray-200 pt-3 mt-1">
                    <div className="flex justify-between text-lg font-bold">
                        <span>Total</span>
                        <div className="text-right">
                            <span className="text-red-600">
                                {finalTotal.toFixed(2).replace('.', ',')} €
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mb-8">
                <div className="flex items-center gap-2 mb-3">
                    <div className="w-1.5 h-4 bg-red-600 rounded-full" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                        Cupón de descuento
                    </span>
                </div>
                {!promoDiscount ? (
                    <div className="relative group">
                        <div className="flex gap-2 p-1.5 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl transition-all duration-300 focus-within:border-red-500/30 focus-within:bg-white focus-within:shadow-lg focus-within:shadow-red-500/5">
                            <input
                                type="text"
                                value={promoCode}
                                onChange={e => setPromoCode(e.target.value.toUpperCase())}
                                placeholder="Introduce tu código"
                                className="flex-1 px-3 py-2 bg-transparent border-none text-sm focus:outline-none uppercase font-black tracking-tight placeholder:text-gray-300 placeholder:font-bold"
                            />
                            <button
                                onClick={() => {
                                    triggerHaptic();
                                    handleApplyPromo(promoCode);
                                }}
                                disabled={isApplyingPromo || !promoCode.trim()}
                                className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 border-none cursor-pointer flex items-center gap-2 shadow-sm
                                    ${
                                        isApplyingPromo || !promoCode.trim()
                                            ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                                            : 'bg-red-600 text-white hover:bg-black hover:scale-105 active:scale-95 shadow-red-100'
                                    }`}
                            >
                                {isApplyingPromo ? (
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    'Aplicar'
                                )}
                            </button>
                        </div>
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative overflow-hidden p-4 bg-green-50 rounded-2xl border-2 border-green-200/50 shadow-lg shadow-green-500/5 group"
                    >
                        {/* Decorative background element */}
                        <div className="absolute top-0 right-0 -mr-4 -mt-4 w-12 h-12 bg-green-500/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700" />

                        <div className="relative flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center shadow-md border border-green-100 shrink-0">
                                    <span className="text-green-600 font-black text-xs">
                                        -{promoDiscount}%
                                    </span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[9px] text-green-700 font-black uppercase tracking-[0.2em] leading-none mb-1 opacity-60">
                                        Código Aplicado
                                    </span>
                                    <span className="text-sm font-black text-gray-900 uppercase tracking-tight">
                                        {promoCode}
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    triggerHaptic(HAPTIC_PATTERNS.MEDIUM);
                                    handleRemovePromo();
                                }}
                                className="w-8 h-8 rounded-full hover:bg-red-50 text-gray-300 hover:text-red-500 transition-all duration-300 bg-white shadow-sm border border-gray-100 flex items-center justify-center cursor-pointer group/close"
                            >
                                <X
                                    size={14}
                                    className="group-hover/close:rotate-90 transition-transform"
                                />
                            </button>
                        </div>
                    </motion.div>
                )}
                {promoError && (
                    <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-3 flex items-center gap-2 px-2"
                    >
                        <div className="w-1 h-1 rounded-full bg-red-400 animate-pulse" />
                        <p className="text-[10px] text-red-500 font-black uppercase tracking-wider italic">
                            {promoError}
                        </p>
                    </motion.div>
                )}
            </div>

            <button
                onClick={() => {
                    triggerHaptic(HAPTIC_PATTERNS.SUCCESS);
                    handleOrder();
                }}
                disabled={isOrdering || isInviting || items.length === 0}
                className="bg-red-600 text-white px-6 py-4 rounded-2xl font-black border-none cursor-pointer w-full mb-3 text-base hover:bg-red-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed shadow-xl shadow-red-200 flex items-center justify-center gap-2 active:scale-[0.98] font-bold uppercase tracking-wide"
                data-testid="order-button"
            >
                {isOrdering ? (
                    'Procesando...'
                ) : (
                    <>
                        <span>Realizar pedido</span>
                        <ArrowRight size={18} strokeWidth={2} />
                    </>
                )}
            </button>

            <button
                onClick={() => {
                    triggerHaptic(HAPTIC_PATTERNS.MEDIUM);
                    if (isAuthenticated) {
                        handleInvite();
                    } else {
                        document.dispatchEvent(new Event('custom:openLogin'));
                    }
                }}
                disabled={isOrdering || isInviting || items.length === 0}
                className="bg-gray-900 text-white px-6 py-4 rounded-2xl font-black border-none cursor-pointer w-full text-sm hover:bg-gray-800 transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-[0.98] font-bold uppercase tracking-wide"
                data-testid="invite-button"
            >
                {isInviting ? 'Generando...' : '¡Que me inviten! 🎁'}
            </button>

            {items.length > 0 && (
                <p className="text-[10px] text-gray-400 mt-4 text-center font-medium px-4">
                    Al pulsar "Realizar pedido" aceptas nuestras condiciones generales de venta y
                    política de privacidad.
                </p>
            )}
        </div>
    );
}
