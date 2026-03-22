import { motion } from 'framer-motion';
import { Clock, ArrowRight, X } from 'lucide-react';
import { CartItem } from '../../types';

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
                            -{(total * promoDiscount / 100).toFixed(2).replace('.', ',')} €
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

            <div className="mb-6">
                {!promoDiscount ? (
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={promoCode}
                            onChange={(e) => setPromoCode(e.target.value)}
                            placeholder="Código promo"
                            className={`flex-1 px-4 py-3 bg-gray-50 border ${promoError ? 'border-red-300' : 'border-gray-200'} rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all uppercase font-bold`}
                        />
                        <button
                            onClick={() => handleApplyPromo(promoCode)}
                            disabled={isApplyingPromo || !promoCode.trim()}
                            className="px-4 py-3 bg-gray-900 text-white rounded-xl text-xs font-black hover:bg-gray-800 disabled:bg-gray-200 disabled:text-gray-400 transition-colors border-none cursor-pointer uppercase"
                        >
                            {isApplyingPromo ? '...' : 'Aplicar'}
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center justify-between p-3 bg-green-50 border border-green-100 rounded-xl animate-in slide-in-from-top-2 duration-300">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                                <span className="text-green-600 font-black text-xs">%{promoDiscount}</span>
                            </div>
                            <div>
                                <p className="text-[10px] text-green-700 font-black uppercase tracking-widest leading-none mb-1">Código Activo</p>
                                <p className="text-xs font-bold text-gray-900 uppercase">{promoCode}</p>
                            </div>
                        </div>
                        <button 
                            onClick={handleRemovePromo}
                            className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors bg-transparent border-none cursor-pointer"
                        >
                            <X size={18} />
                        </button>
                    </div>
                )}
                {promoError && (
                    <p className="mt-2 text-[11px] text-red-600 font-bold px-1 italic">
                        {promoError}
                    </p>
                )}
            </div>

            <button
                onClick={handleOrder}
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
