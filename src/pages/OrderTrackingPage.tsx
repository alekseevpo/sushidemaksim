import { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Package, MapPin, Phone, Info, ChevronLeft, ArrowRight } from 'lucide-react';
import { api } from '../utils/api';
import SEO from '../components/SEO';
import OrderStepper from '../components/OrderStepper';

export default function OrderTrackingPage() {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const phone = searchParams.get('phone') || '';

    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchOrder = useCallback(async () => {
        try {
            const data = await api.get(`/orders/track/${id}?phone=${encodeURIComponent(phone)}`);
            setOrder(data.order);
            setError(null);
        } catch (err: any) {
            setError(err.message || 'Error al obtener el pedido');
        } finally {
            setLoading(false);
        }
    }, [id, phone]);

    useEffect(() => {
        fetchOrder();

        const interval = setInterval(fetchOrder, 30000);
        return () => clearInterval(interval);
    }, [fetchOrder]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-6">
                <div className="text-center">
                    <div className="w-16 h-16 bg-red-50 rounded-[32px] flex items-center justify-center mx-auto mb-6 text-2xl animate-spin border-2 border-white shadow-inner">
                        🍣
                    </div>
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">
                        Localizando tu pedido...
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-6">
                <div className="max-w-md w-full bg-white rounded-[40px] p-12 shadow-2xl text-center border border-gray-100">
                    <div className="w-24 h-24 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-8 text-4xl shadow-inner border-2 border-white">
                        🔍
                    </div>
                    <h1 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">
                        Pedido no encontrado
                    </h1>
                    <p className="text-gray-500 font-medium mb-10 leading-relaxed italic">
                        {error}. Comprueba el número de pedido y el teléfono.
                    </p>
                    <button
                        onClick={() => navigate('/menu')}
                        className="w-full py-4 bg-red-600 text-white rounded-2xl font-black text-sm hover:bg-red-700 transition-all shadow-xl shadow-red-100"
                    >
                        Volver al menú
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FDFBF7] pb-20">
            <SEO
                title={`Seguimiento Pedido #${id}`}
                description="Sigue el estado de tu pedido de Sushi de Maksim en tiempo real."
            />

            <div className="max-w-4xl mx-auto px-4 pt-10">
                <button
                    onClick={() => navigate(-1)}
                    className="group flex items-center gap-2 text-gray-400 hover:text-red-600 transition-colors mb-8 font-black text-xs uppercase tracking-widest"
                >
                    <ChevronLeft
                        size={18}
                        strokeWidth={1.5}
                        className="transition-transform group-hover:-translate-x-1"
                    />
                    Volver
                </button>

                <div className="bg-white rounded-[40px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] border border-white overflow-hidden">
                    {/* Header */}
                    <div className="bg-red-600 p-8 md:p-12 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />

                        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div>
                                <span className="text-[10px] uppercase font-black tracking-[0.2em] opacity-80 decoration-white/30 underline underline-offset-4 mb-2 block">
                                    Enlace de seguimiento
                                </span>
                                <h1 className="text-4xl md:text-5xl font-black m-0 tracking-tighter decoration-white/20 underline underline-offset-8">
                                    Pedido #{String(order.id).padStart(5, '0')}
                                </h1>
                            </div>
                            <div className="bg-white/20 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/20">
                                <span className="block text-[10px] uppercase font-black tracking-widest opacity-80 mb-1">
                                    Entrega Estimada
                                </span>
                                <span className="text-2xl font-black">
                                    {order.estimated_delivery_time || '30-45 min'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 md:p-12">
                        {/* Status Stepper */}
                        <div className="mb-16">
                            <OrderStepper currentStatus={order.status} />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            {/* Order Info */}
                            <div className="space-y-8">
                                <div>
                                    <h3 className="flex items-center gap-2 text-sm font-black text-gray-900 uppercase tracking-widest mb-4">
                                        <MapPin
                                            size={18}
                                            strokeWidth={1.5}
                                            className="text-red-600"
                                        />
                                        Dirección de entrega
                                    </h3>
                                    <p className="text-gray-600 font-medium leading-relaxed bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                        {order.delivery_address}
                                    </p>
                                </div>

                                {order.notes && (
                                    <div>
                                        <h3 className="flex items-center gap-2 text-sm font-black text-gray-900 uppercase tracking-widest mb-4">
                                            <Info
                                                size={18}
                                                strokeWidth={1.5}
                                                className="text-amber-500"
                                            />
                                            Notas del pedido
                                        </h3>
                                        <p className="text-amber-700 font-medium text-sm leading-relaxed bg-amber-50 p-4 rounded-2xl border border-amber-100 italic">
                                            {order.notes}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Order Summary */}
                            <div className="bg-gray-50 rounded-[32px] p-8 border border-white shadow-inner self-start">
                                <h3 className="flex items-center gap-2 text-sm font-black text-gray-900 uppercase tracking-widest mb-6">
                                    <Package
                                        size={18}
                                        strokeWidth={1.5}
                                        className="text-gray-400"
                                    />
                                    Resumen del pedido
                                </h3>

                                <div className="space-y-4 mb-8">
                                    {order.items?.map((item: any, idx: number) => (
                                        <div
                                            key={idx}
                                            className="flex justify-between items-center text-sm"
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="w-6 h-6 bg-white rounded-lg flex items-center justify-center font-black text-xs text-red-600 shadow-sm">
                                                    {item.quantity}
                                                </span>
                                                <span className="font-bold text-gray-700">
                                                    {item.name}
                                                </span>
                                            </div>
                                            <span className="font-black text-gray-400">
                                                {(item.price_at_time * item.quantity)
                                                    .toFixed(2)
                                                    .replace('.', ',')}{' '}
                                                €
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <div className="pt-6 border-t border-gray-200 flex justify-between items-end">
                                    <span className="text-xs uppercase font-black text-gray-400 tracking-widest">
                                        Total pagado
                                    </span>
                                    <div className="text-3xl font-black text-gray-900 tracking-tighter">
                                        {Number(order.total).toFixed(2).replace('.', ',')}
                                        <span className="text-sm text-red-600 italic ml-1">€</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer Help */}
                        <div className="mt-16 pt-10 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-600">
                                    <Phone size={24} strokeWidth={1.5} />
                                </div>
                                <div className="text-left">
                                    <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                        ¿Dudas? Contáctanos
                                    </span>
                                    <span className="font-black text-gray-900">
                                        +34 912 345 678
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={() => navigate('/menu')}
                                className="group flex items-center gap-2 bg-gray-900 text-white px-8 py-4 rounded-2xl font-black text-sm hover:bg-black transition-all shadow-xl shadow-gray-100"
                            >
                                Seguir comprando
                                <ArrowRight
                                    size={18}
                                    strokeWidth={1.5}
                                    className="transition-transform group-hover:translate-x-1"
                                />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
