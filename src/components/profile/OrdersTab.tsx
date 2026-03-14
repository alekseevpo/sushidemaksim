import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Clock, RefreshCcw, Shield } from 'lucide-react';
import { api } from '../../utils/api';
import { useCart } from '../../hooks/useCart';

function OrderTimer({ createdAt, status }: { createdAt: string; status: string }) {
    const [timeLeft, setTimeLeft] = useState('');
    const [isLate, setIsLate] = useState(false);

    useEffect(() => {
        if (status === 'delivered' || status === 'cancelled') return;

        const calculateTimeLeft = () => {
            const d = new Date(createdAt);
            const validDate = isNaN(d.getTime())
                ? new Date(
                      createdAt.replace(' ', 'T') +
                          (createdAt.includes('Z') || createdAt.includes('+') ? '' : 'Z')
                  )
                : d;
            const start = validDate.getTime();
            const end = start + 60 * 60 * 1000; // 60 minutes
            const now = new Date().getTime();
            const diff = end - now;

            if (diff <= 0) {
                setIsLate(true);
                setTimeLeft('00:00');
            } else {
                setIsLate(false);
                const minutes = Math.floor(diff / (1000 * 60));
                const seconds = Math.floor((diff % (1000 * 60)) / 1000);
                setTimeLeft(
                    `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
                );
            }
        };

        calculateTimeLeft();
        const interval = setInterval(calculateTimeLeft, 1000);
        return () => clearInterval(interval);
    }, [createdAt, status]);

    if (status === 'delivered' || status === 'cancelled') {
        return null;
    }

    return <span className={isLate ? 'text-red-500' : 'text-amber-600'}>{timeLeft}</span>;
}

function getStatusBadge(status: string) {
    const styles: Record<string, { bg: string; color: string; label: string; icon?: string }> = {
        pending: { bg: 'bg-amber-500', color: 'text-white', label: 'Enviado', icon: '📨' },
        received: { bg: 'bg-blue-500', color: 'text-white', label: 'Recibido', icon: '👀' },
        confirmed: {
            bg: 'bg-indigo-500',
            color: 'text-white',
            label: 'Aceptado',
            icon: '✅',
        },
        preparing: {
            bg: 'bg-purple-500',
            color: 'text-white',
            label: 'Preparando',
            icon: '👨‍🍳',
        },
        on_the_way: { bg: 'bg-pink-500', color: 'text-white', label: 'En camino', icon: '🛵' },
        delivered: {
            bg: 'bg-green-500',
            color: 'text-white',
            label: 'Entregado',
            icon: '🍱',
        },
        cancelled: { bg: 'bg-gray-500', color: 'text-white', label: 'Cancelado', icon: '❌' },
    };
    const s = styles[status] || styles.pending;
    return (
        <span
            className={`px-3 py-1 md:py-1.5 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-sm shadow-black/5 ${s.bg} ${s.color}`}
        >
            <span>{s.icon}</span>
            {s.label}
        </span>
    );
}

export default function OrdersTab() {
    const navigate = useNavigate();
    const { addItem } = useCart();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [isRepeating, setIsRepeating] = useState<number | null>(null);
    const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

    useEffect(() => {
        loadOrders(pagination.page);

        // Polling every 30 seconds so order status updates instantly
        const interval = setInterval(() => {
            loadOrders(pagination.page, true);
        }, 30000);

        return () => clearInterval(interval);
    }, [pagination.page]);

    const loadOrders = async (page: number, isPolling: boolean = false) => {
        if (!isPolling) setLoading(true);
        try {
            const data = await api.get(`/orders?page=${page}&limit=10`);
            setOrders(data.orders);
            setPagination(data.pagination);
        } catch {
            if (!isPolling) setOrders([]);
        } finally {
            if (!isPolling) setLoading(false);
        }
    };

    const handleRepeatOrder = async (order: any) => {
        setIsRepeating(order.id);
        try {
            for (const item of order.items) {
                await addItem({
                    id: String(item.menu_item_id || item.id),
                    name: item.name,
                    description: item.description || '',
                    price: item.price,
                    image: item.image || '',
                    category: (item.category as any) || 'rollos-grandes',
                });
            }
            navigate('/cart');
        } catch (e) {
            alert('Error al repetir el pedido.');
        } finally {
            setIsRepeating(null);
        }
    };

    if (loading) {
        return (
            <div className="space-y-4 animate-in fade-in duration-500">
                <div className="px-0 md:px-1 border-b border-gray-100 pb-4 mb-2">
                    <div className="h-8 w-48 skeleton rounded-xl mb-2" />
                    <div className="h-4 w-64 skeleton rounded-lg opacity-40" />
                </div>
                {[1, 2, 3].map(i => (
                    <div
                        key={i}
                        className="bg-white border border-gray-100 rounded-[30px] p-6 space-y-6"
                    >
                        <div className="flex justify-between items-start">
                            <div className="space-y-2">
                                <div className="h-4 w-20 skeleton rounded" />
                                <div className="h-6 w-32 skeleton rounded-lg" />
                            </div>
                            <div className="h-10 w-24 skeleton rounded-2xl" />
                        </div>
                        <div className="space-y-2">
                            <div className="h-4 w-full skeleton rounded opacity-50" />
                            <div className="h-4 w-2/3 skeleton rounded opacity-50" />
                        </div>
                        <div className="h-12 w-full skeleton rounded-2xl" />
                    </div>
                ))}
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="text-4xl mb-4 grayscale opacity-30">📦</div>
                <h3 className="text-lg font-black text-gray-900 mb-2">Sin pedidos aún</h3>
                <p className="text-gray-400 text-sm mb-6 max-w-[200px] mx-auto leading-relaxed">
                    Tus pedidos aparecerán aquí una vez realices tu primera compra.
                </p>
                <button
                    onClick={() => navigate('/menu')}
                    className="bg-red-600 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-red-100"
                >
                    Comenzar
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-4 md:space-y-5 animate-in fade-in duration-500 pb-10">
            <div className="px-0 md:px-1 border-b border-gray-100 pb-4 mb-2">
                <h2 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight m-0">
                    Mis Pedidos
                </h2>
                <p className="text-gray-400 text-[10px] md:text-xs font-medium">
                    Historial y seguimiento en tiempo real
                </p>
            </div>

            <div className="space-y-3 md:space-y-4 px-0 md:px-0">
                {orders.map(order => (
                    <div
                        key={order.id}
                        className="bg-white border border-white md:border-gray-100 rounded-[28px] md:rounded-[30px] shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
                    >
                        {/* Header: More compact, no background */}
                        <div className="px-3 md:px-5 pt-4 md:pt-5 pb-2 md:pb-3 flex items-start justify-between">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                        #{String(order.id).padStart(5, '0')}
                                    </span>
                                    {getStatusBadge(order.status)}
                                </div>
                                <div className="flex items-center gap-2 text-[9px] md:text-[10px] font-bold text-gray-400 opacity-80">
                                    <Clock size={10} strokeWidth={1.5} />
                                    {(() => {
                                        const d = new Date(order.created_at);
                                        const validDate = isNaN(d.getTime())
                                            ? new Date(
                                                  order.created_at.replace(' ', 'T') +
                                                      (order.created_at.includes('Z') ||
                                                      order.created_at.includes('+')
                                                          ? ''
                                                          : 'Z')
                                              )
                                            : d;
                                        return validDate.toLocaleDateString('es-ES', {
                                            day: 'numeric',
                                            month: 'short',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        });
                                    })()}
                                </div>
                            </div>
                            {order.status !== 'delivered' && order.status !== 'cancelled' && (
                                <div className="flex items-center gap-2">
                                    {order.status !== 'delivered' &&
                                        order.status !== 'cancelled' && (
                                            <Link
                                                to={`/track/${order.id}?phone=${encodeURIComponent(order.phone_number)}`}
                                                className="bg-red-50 text-red-600 px-3 py-1.5 rounded-xl border border-red-100 flex items-center gap-1.5 shadow-sm text-[9px] md:text-[10px] font-black hover:bg-red-100 transition-colors no-underline"
                                            >
                                                <span>🛵</span>
                                                Seguir
                                            </Link>
                                        )}
                                    <div className="bg-amber-50 px-2 py-1 rounded-lg border border-amber-100/50 flex items-center gap-1.5 shadow-sm text-[9px] md:text-[10px] font-black">
                                        <span className="animate-pulse">⏱️</span>
                                        <OrderTimer
                                            createdAt={order.created_at}
                                            status={order.status}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Order Summary */}
                        <div className="px-3 md:px-5 pb-4 flex items-end justify-between border-b border-gray-50/50">
                            <div>
                                <div className="text-xl md:text-2xl font-black text-gray-900 flex items-baseline gap-0.5 tracking-tighter">
                                    {order.total.toFixed(2).replace('.', ',')}
                                    <span className="text-xs text-red-600 font-black">€</span>
                                </div>
                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none">
                                    {order.items?.reduce(
                                        (s: number, i: any) => s + i.quantity,
                                        0
                                    ) ?? 0}{' '}
                                    unidades
                                </span>
                            </div>
                        </div>

                        {/* Items List: Minimal, no extra background */}
                        <div className="px-3 md:px-5 py-4 md:py-5 space-y-3">
                            <div className="space-y-2">
                                {order.items?.map((item: any, i: number) => (
                                    <div
                                        key={i}
                                        className="flex items-center justify-between text-xs"
                                    >
                                        <div className="flex items-center gap-2 overflow-hidden">
                                            <span className="text-[9px] md:text-[10px] font-black text-gray-400 shrink-0 w-4 text-center">
                                                {item.quantity}
                                            </span>
                                            <span className="text-[11px] md:text-xs font-bold text-gray-600 truncate opacity-80 group-hover:opacity-100">
                                                {item.name}
                                            </span>
                                        </div>
                                        <span className="text-[11px] md:text-xs font-black text-gray-300 shrink-0 tabular-nums">
                                            {(item.price_at_time * item.quantity)
                                                .toFixed(2)
                                                .replace('.', ',')}{' '}
                                            €
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {order.notes && (
                                <div className="mt-2 py-2 px-3 bg-amber-50/50 rounded-xl border-l-2 border-amber-300 flex items-start gap-2">
                                    <Shield
                                        size={10}
                                        strokeWidth={1.5}
                                        className="text-amber-500 shrink-0 mt-0.5"
                                    />
                                    <p className="text-[9px] md:text-[10px] font-bold text-amber-700 m-0 leading-relaxed italic opacity-90">
                                        {order.notes}
                                    </p>
                                </div>
                            )}

                            <button
                                onClick={() => handleRepeatOrder(order)}
                                disabled={isRepeating === order.id}
                                className={`mt-3 w-full h-10 md:h-11 rounded-xl font-black text-[10px] md:text-xs uppercase tracking-[0.1em] md:tracking-[0.15em] transition-all flex items-center justify-center gap-2
                                    ${
                                        isRepeating === order.id
                                            ? 'bg-gray-50 text-gray-300 cursor-not-allowed border border-gray-100'
                                            : 'bg-gray-900 text-white hover:bg-red-600 shadow-xl shadow-gray-100 hover:shadow-red-200 active:scale-[0.98]'
                                    }`}
                            >
                                <RefreshCcw
                                    size={14}
                                    strokeWidth={1.5}
                                    className={isRepeating === order.id ? 'animate-spin' : ''}
                                />
                                {isRepeating === order.id ? 'Añadiendo...' : 'Repetir'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {pagination.pages > 1 && (
                <div className="flex justify-center items-center gap-2 pt-4">
                    {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
                        <button
                            key={p}
                            onClick={() => loadOrders(p)}
                            className={`w-9 h-9 rounded-xl font-black text-[11px] transition-all
                                ${
                                    p === pagination.page
                                        ? 'bg-red-600 text-white shadow-lg shadow-red-100'
                                        : 'bg-white border border-gray-100 text-gray-400'
                                }`}
                        >
                            {p}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
