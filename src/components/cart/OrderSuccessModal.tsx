import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { CheckCircle, Store, MapPin, Mail, Phone } from 'lucide-react';

interface OrderSuccessModalProps {
    orderId: number;
    phone: string;
    isAuthenticated: boolean;
    user: any;
    isScheduled: boolean;
    scheduledDate: string;
    scheduledTime: string;
    deliveryType: 'delivery' | 'pickup';
    address: string;
    house: string;
    apartment: string;
    orderWhatsappUrl: string | null;
    total: number;
    deliveryCost: number;
}

export default function OrderSuccessModal({
    orderId,
    phone,
    isAuthenticated,
    user,
    isScheduled,
    scheduledDate,
    scheduledTime,
    deliveryType,
    address,
    house,
    apartment,
    orderWhatsappUrl,
    total,
    deliveryCost,
}: OrderSuccessModalProps) {
    const navigate = useNavigate();

    return (
        <div className="fixed inset-0 z-modal overflow-y-auto bg-gray-900/40 backdrop-blur-md animate-in fade-in duration-500">
            <div className="flex min-h-full items-center justify-center p-2 md:p-4">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="bg-white rounded-[32px] md:rounded-[40px] shadow-2xl p-4 md:p-10 max-w-md w-full text-center relative overflow-hidden border border-white my-auto pb-6"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full -mr-16 -mt-16 blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-red-500/5 rounded-full -ml-16 -mb-16 blur-3xl" />

                    <div className="w-16 h-16 bg-green-50 rounded-[20px] flex items-center justify-center mx-auto mb-2.5 relative shadow-inner border-2 border-white">
                        <CheckCircle size={32} strokeWidth={1.5} className="text-green-600" />
                    </div>

                    <h1
                        className="text-xl font-black mb-1 text-gray-900 tracking-tight"
                        data-testid="success-title"
                    >
                        ¡Pedido exitoso!
                    </h1>
                    <p className="text-gray-500 text-[13px] font-medium mb-3 leading-relaxed px-2">
                        Tu pedido{' '}
                        <span className="text-gray-900 font-black">
                            #{String(orderId).padStart(5, '0')}
                        </span>{' '}
                        ha sido recibido.
                        {isScheduled ? (
                            <> Lo prepararemos para la fecha y hora seleccionada.</>
                        ) : (
                            <> y ya estamos preparando tus sushis con amor.</>
                        )}
                    </p>

                    <div className="flex flex-col gap-1.5 mb-3.5">
                        {/* Time Block */}
                        <div className="bg-gray-50/50 p-2 rounded-2xl border border-gray-100 flex items-center justify-center">
                            <div className="flex flex-col items-center">
                                <span className="text-[9px] uppercase font-black text-gray-400 tracking-widest mb-0.5">
                                    {isScheduled
                                        ? 'Entrega programada'
                                        : deliveryType === 'pickup'
                                          ? 'Tiempo de preparación'
                                          : 'Entrega estimada'}
                                </span>
                                <div className="text-base font-black text-red-600 text-center">
                                    {isScheduled ? (
                                        <div className="flex flex-col items-center leading-tight">
                                            <span>
                                                {new Date(scheduledDate).toLocaleDateString(
                                                    'es-ES',
                                                    { day: 'numeric', month: 'long' }
                                                )}
                                            </span>
                                            <span className="text-[13px] opacity-60 font-black">
                                                a las {scheduledTime}
                                            </span>
                                        </div>
                                    ) : deliveryType === 'pickup' ? (
                                        '20 – 30 min'
                                    ) : (
                                        '30 – 60 min'
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Address Block */}
                        <div className="bg-gray-50/50 p-2.5 rounded-2xl border border-gray-100 mb-1.5 text-left">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-white rounded-xl text-red-600 shadow-sm shrink-0 border border-gray-100">
                                    {deliveryType === 'pickup' ? (
                                        <Store size={18} />
                                    ) : (
                                        <MapPin size={18} />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-[9px] font-black uppercase text-gray-400 tracking-widest mb-0.5">
                                        {deliveryType === 'pickup'
                                            ? 'Punto de Recogida'
                                            : 'Dirección de Entrega'}
                                    </h4>
                                    <p className="text-[13px] font-black text-gray-900 leading-tight truncate">
                                        {deliveryType === 'pickup'
                                            ? 'Calle Barrilero, 20, 28007 Madrid'
                                            : `${address}${house ? `, Portal: ${house}` : ''}${apartment ? `, Piso: ${apartment}` : ''}`}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Order Summary / Receipt */}
                        <div className="bg-gray-900 rounded-3xl p-4 text-white shadow-xl shadow-gray-900/10 mb-1.5">
                            <h4 className="text-[9px] font-black uppercase text-white/50 tracking-widest mb-3 text-center">
                                Resumen del pedido
                            </h4>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center text-[11px] font-bold text-white/70">
                                    <span className="uppercase tracking-wider">Productos</span>
                                    <span>{total.toFixed(2).replace('.', ',')} €</span>
                                </div>
                                <div className="flex justify-between items-center text-[11px] font-bold text-white/70">
                                    <span className="uppercase tracking-wider">Envío</span>
                                    <span className={deliveryCost <= 0 ? 'text-green-400' : ''}>
                                        {deliveryCost <= 0
                                            ? 'GRATIS'
                                            : `${deliveryCost.toFixed(2).replace('.', ',')} €`}
                                    </span>
                                </div>
                                <div className="pt-2 mt-2 border-t border-white/10 flex justify-between items-end">
                                    <span className="text-[10px] uppercase font-black text-white/40 tracking-widest">
                                        Total Pagado
                                    </span>
                                    <div className="text-xl font-black text-white tracking-tighter">
                                        {(total + (deliveryCost > 0 ? deliveryCost : 0))
                                            .toFixed(2)
                                            .replace('.', ',')}
                                        <span className="text-xs text-red-400 ml-1">€</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Help / Contact Block */}
                        <div className="bg-gray-50/50 p-3 rounded-2xl border border-gray-100">
                            <h4 className="text-[9px] font-black uppercase text-gray-400 tracking-widest mb-2 text-center">
                                ¿Necesitas ayuda?
                            </h4>

                            {orderWhatsappUrl && (
                                <a
                                    href={orderWhatsappUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full mb-2 bg-[#25D366] text-white px-8 py-2.5 rounded-2xl font-black text-[13px] hover:bg-[#1ebd59] transition-all shadow-lg shadow-green-100 transform active:scale-95 flex items-center justify-center gap-2 no-underline"
                                >
                                    <svg
                                        width="18"
                                        height="18"
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                    >
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                                    </svg>
                                    Confirmar por WhatsApp
                                </a>
                            )}

                            <div className="flex justify-center gap-3">
                                <a
                                    href={`https://wa.me/34641518390`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2.5 bg-white rounded-xl text-[#25D366] shadow-sm border border-gray-100 hover:scale-110 active:scale-95 transition-all outline-none"
                                    title="WhatsApp Directo"
                                >
                                    <svg
                                        width="18"
                                        height="18"
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                    >
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                                    </svg>
                                </a>
                                <a
                                    href={`mailto:info@sushidemaksim.com`}
                                    className="p-2.5 bg-white rounded-xl text-red-600 shadow-sm border border-gray-100 hover:scale-110 active:scale-95 transition-all outline-none"
                                    title="Email"
                                >
                                    <Mail size={18} strokeWidth={2} />
                                </a>
                                <a
                                    href={`tel:+34641518390`}
                                    className="p-2.5 bg-white rounded-xl text-blue-600 shadow-sm border border-gray-100 hover:scale-110 active:scale-95 transition-all outline-none"
                                    title="Llamar"
                                >
                                    <Phone size={18} strokeWidth={2} />
                                </a>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2 relative z-10">
                        {isAuthenticated ? (
                            <div className="flex flex-col gap-2">
                                <button
                                    onClick={() => navigate('/profile?tab=orders')}
                                    className="bg-red-600 text-white px-8 py-3 rounded-2xl font-black text-[13px] hover:bg-red-700 transition-all shadow-lg shadow-red-100 transform active:scale-95 flex items-center justify-center gap-2"
                                >
                                    Mis Pedidos
                                </button>
                                <Link
                                    to={`/track/${orderId}?phone=${encodeURIComponent(phone || user?.phone || '')}`}
                                    className="bg-gray-900 text-white px-8 py-3 rounded-2xl font-black text-[13px] no-underline text-center hover:bg-black transition-all active:scale-95 flex items-center justify-center gap-2"
                                >
                                    Seguir mi pedido 🛵
                                </Link>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2">
                                <Link
                                    to={`/track/${orderId}?phone=${encodeURIComponent(phone)}`}
                                    className="bg-red-600 text-white px-8 py-3 rounded-2xl font-black text-[13px] no-underline text-center hover:bg-red-700 transition-all shadow-lg shadow-red-100 transform active:scale-95"
                                >
                                    Seguir mi pedido 🛵
                                </Link>
                                <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-2xl flex flex-col items-center">
                                    <p className="text-[10px] text-amber-800 font-bold mb-1.5 px-2 text-center leading-tight">
                                        🎁 ¡Consigue descuentos en tus próximos pedidos!
                                    </p>
                                    <button
                                        onClick={() =>
                                            document.dispatchEvent(
                                                new CustomEvent('custom:openLogin', {
                                                    detail: { mode: 'register' },
                                                })
                                            )
                                        }
                                        className="bg-gray-900 text-white w-full py-2.5 rounded-xl font-bold text-[11px] hover:bg-gray-800 transition transform active:scale-95 uppercase tracking-wider font-bold"
                                    >
                                        Crear cuenta
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
