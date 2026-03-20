import { motion } from 'framer-motion';
import { Clock, ArrowRight } from 'lucide-react';
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
    handleOrder: () => void;
    handleInvite: () => void;
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
    handleOrder,
    handleInvite,
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
                        <span
                            className={`font-bold ${deliveryCost <= 0 ? 'text-green-600' : 'text-gray-900'}`}
                        >
                            {deliveryCost <= 0
                                ? 'GRATIS'
                                : `${deliveryCost.toFixed(2).replace('.', ',')} €`}
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
