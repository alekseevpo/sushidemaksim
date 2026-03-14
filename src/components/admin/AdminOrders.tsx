import { useState, useEffect } from 'react';
import {
    Package,
    Search,
    RefreshCw,
    Smartphone,
    Monitor,
    Globe,
    CheckCircle2,
    Volume2,
    VolumeX,
    Calendar,
    ShoppingCart,
    Wallet,
    TrendingUp,
    Clock,
    Heart,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api, ApiError } from '../../utils/api';
import { OrderTimer } from './OrderTimer';

interface AdminOrdersProps {
    isGlobalSoundEnabled: boolean;
    setIsGlobalSoundEnabled: (enabled: boolean) => void;
    globalPendingCount: number;
}

export default function AdminOrders({
    isGlobalSoundEnabled,
    setIsGlobalSoundEnabled,
    globalPendingCount,
}: AdminOrdersProps) {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState<string>('active');
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
    const [notification, setNotification] = useState<{
        id: number;
        oldStatus: string;
        newStatus: string;
    } | null>(null);

    const loadOrders = async (
        page: number = 1,
        currentFilter: string = filter,
        isPolling: boolean = false
    ) => {
        if (!isPolling) setLoading(true);
        setError(null);
        try {
            let url = `/admin/orders?page=${page}&limit=${pagination.limit}`;

            // Map frontend filters to backend status strings
            const filterMap: Record<string, string> = {
                active: 'pending,received,confirmed,preparing,on_the_way',
                unpaid: 'waiting_payment',
                preparing: 'confirmed,preparing',
                on_the_way: 'on_the_way',
                delivered: 'delivered',
                cancelled: 'cancelled',
            };

            const statusParam = filterMap[currentFilter];
            if (statusParam) {
                url += `&status=${statusParam}`;
            }

            const data = await api.get(url);
            setOrders(data.orders || []);
            setPagination(data.pagination);
        } catch (err) {
            console.error('Error fetching admin orders:', err);
            if (!isPolling)
                setError(err instanceof ApiError ? err.message : 'Error al cargar los pedidos');
        } finally {
            if (!isPolling) setLoading(false);
        }
    };

    useEffect(() => {
        loadOrders(pagination.page);
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Refresh every 30 seconds
        const intervalId = setInterval(() => {
            loadOrders(pagination.page, filter, true);
        }, 30000);

        return () => clearInterval(intervalId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pagination.page, filter]);

    const handleUpdateStatus = async (id: number, newStatus: string) => {
        const order = orders.find(o => o.id === id);
        const oldStatus = order?.status;

        try {
            await api.patch(`/admin/orders/${id}/status`, { status: newStatus });
            setOrders(orders.map(o => (o.id === id ? { ...o, status: newStatus } : o)));

            // Show notification
            setNotification({ id, oldStatus: oldStatus || '?', newStatus });
            // Hide notification after 4 seconds
            setTimeout(() => setNotification(null), 4000);
        } catch (err) {
            alert(err instanceof ApiError ? err.message : 'Error al actualizar status');
        }
    };

    const statusOptions = [
        {
            value: 'waiting_payment',
            label: 'Esperando Pago',
            color: 'bg-gray-100 text-gray-500 border-gray-200',
        },
        {
            value: 'pending',
            label: 'Enviado',
            color: 'bg-amber-100 text-amber-700 border-amber-200',
        },
        {
            value: 'received',
            label: 'Recibido',
            color: 'bg-blue-100 text-blue-700 border-blue-200',
        },
        {
            value: 'confirmed',
            label: 'Aceptado',
            color: 'bg-indigo-100 text-indigo-700 border-indigo-200',
        },
        {
            value: 'preparing',
            label: 'Preparando',
            color: 'bg-purple-100 text-purple-700 border-purple-200',
        },
        {
            value: 'on_the_way',
            label: 'En camino',
            color: 'bg-pink-100 text-pink-700 border-pink-200',
        },
        {
            value: 'delivered',
            label: 'Entregado',
            color: 'bg-green-100 text-green-700 border-green-200',
        },
        {
            value: 'cancelled',
            label: 'Cancelado',
            color: 'bg-red-100 text-red-700 border-red-200',
        },
    ];

    const formatCurrency = (amount: number) => {
        return Number(amount).toFixed(2).replace('.', ',') + ' €';
    };

    const filteredOrders = orders.filter(o => {
        // Since status filtering is now handled by the backend,
        // we only perform frontend filtering for the SEARCH string.
        if (!search) return true;

        const matchesSearch =
            String(o.id).includes(search) ||
            (o.delivery_address &&
                o.delivery_address.toLowerCase().includes(search.toLowerCase())) ||
            (o.phone_number && o.phone_number.includes(search)) ||
            (o.promocode && o.promocode.toLowerCase().includes(search.toLowerCase()));

        return matchesSearch;
    });

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Top Controls */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 space-y-4">
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="relative flex-1 sm:w-96">
                            <Search
                                size={18}
                                strokeWidth={1.5}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            />
                            <input
                                type="text"
                                placeholder="Buscar ID, Teléfono, Promo..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:border-red-400 focus:outline-none transition"
                            />
                        </div>
                        <button
                            onClick={() => setIsGlobalSoundEnabled(!isGlobalSoundEnabled)}
                            className={`p-2 rounded-lg transition border ${
                                isGlobalSoundEnabled
                                    ? 'bg-green-50 text-green-600 border-green-100 hover:bg-green-100'
                                    : 'bg-gray-50 text-gray-400 border-gray-200 hover:bg-gray-100'
                            }`}
                            title={isGlobalSoundEnabled ? 'Desactivar sonido' : 'Activar sonido'}
                        >
                            {isGlobalSoundEnabled ? (
                                <Volume2 size={18} strokeWidth={1.5} />
                            ) : (
                                <VolumeX size={18} strokeWidth={1.5} />
                            )}
                        </button>
                    </div>
                    <button
                        onClick={() => loadOrders(pagination.page)}
                        className="w-full sm:w-auto p-2 text-gray-500 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                        title="Actualizar"
                    >
                        <RefreshCw
                            size={18}
                            strokeWidth={1.5}
                            className={loading ? 'animate-spin' : ''}
                        />
                    </button>
                </div>

                {/* Filter Tabs */}
                <div className="flex bg-gray-50 p-1 rounded-xl w-full overflow-x-auto no-scrollbar">
                    <div className="flex gap-1 min-w-max">
                        {[
                            {
                                id: 'active',
                                label: 'POR HACER (TODO)',
                                badge: globalPendingCount > 0,
                            },
                            { id: 'unpaid', label: 'Por Pagar' },
                            { id: 'preparing', label: 'Cocinando' },
                            { id: 'on_the_way', label: 'En Camino' },
                            { id: 'delivered', label: 'Entregados' },
                            { id: 'cancelled', label: 'Cancelados' },
                            { id: 'all', label: 'Todos' },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => {
                                    setFilter(tab.id);
                                    setPagination(prev => ({ ...prev, page: 1 }));
                                }}
                                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition whitespace-nowrap relative ${
                                    filter === tab.id
                                        ? 'bg-white text-red-600 shadow-sm border border-gray-100'
                                        : 'text-gray-400 hover:text-gray-600'
                                }`}
                            >
                                {tab.label}
                                {tab.badge && (
                                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600 border border-white"></span>
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 border border-red-100 flex items-center gap-3">
                    <RefreshCw className="animate-spin" size={18} strokeWidth={1.5} />
                    <p className="font-medium">{error}</p>
                </div>
            )}

            {!loading && filteredOrders.length === 0 ? (
                <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center">
                    <div className="w-16 h-16 bg-gray-50 text-gray-300 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Package size={32} strokeWidth={1.5} />
                    </div>
                    <h3 className="text-gray-500 font-medium tracking-tight">
                        No se encontraron pedidos.
                    </h3>
                </div>
            ) : (
                <div className="grid gap-4">
                    {loading && filteredOrders.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
                            <RefreshCw
                                className="animate-spin text-red-600 mb-4"
                                size={32}
                                strokeWidth={1.5}
                            />
                            <p className="text-gray-500 font-medium">Cargando pedidos...</p>
                        </div>
                    ) : (
                        filteredOrders.map(order => (
                            <div
                                key={order.id}
                                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden"
                            >
                                {/* Header del pedido */}
                                <div className="p-4 sm:p-5 border-b border-gray-50 bg-gray-50/30 flex flex-wrap items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-white p-2.5 rounded-xl border border-gray-100 shadow-sm">
                                            <Package
                                                className="text-red-500"
                                                size={20}
                                                strokeWidth={1.5}
                                            />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <h4 className="font-bold text-gray-900">
                                                    Pedido #{String(order.id).padStart(5, '0')}
                                                </h4>
                                                <span
                                                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                                                        statusOptions.find(
                                                            s => s.value === order.status
                                                        )?.color || ''
                                                    }`}
                                                >
                                                    {statusOptions.find(
                                                        s => s.value === order.status
                                                    )?.label || order.status}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-500 font-medium">
                                                {new Date(order.created_at).toLocaleString(
                                                    'es-ES',
                                                    {
                                                        day: '2-digit',
                                                        month: 'short',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    }
                                                )}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 ml-auto sm:ml-0">
                                        <OrderTimer
                                            createdAt={order.created_at}
                                            status={order.status}
                                        />
                                        <div className="text-right">
                                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-0.5">
                                                Total
                                            </p>
                                            <p className="text-lg font-black text-gray-900">
                                                {formatCurrency(order.total)}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Cuerpo del pedido */}
                                <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 overflow-hidden">
                                    {/* Info Cliente & Stats */}
                                    <div className="space-y-6">
                                        <div>
                                            <div className="flex items-center gap-2 text-gray-400 mb-2">
                                                <Smartphone size={14} strokeWidth={1.5} />
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-pretty">
                                                    Cliente y Contacto
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <p className="font-bold text-gray-900 text-sm">
                                                    {order.users?.name || 'Invitado'}
                                                </p>
                                                {order.user_stats && (
                                                    <div className="flex items-center gap-1 px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded-md text-[9px] font-bold border border-blue-100">
                                                        <Calendar size={10} strokeWidth={2} />
                                                        REG.{' '}
                                                        {new Date(
                                                            order.user_stats.registrationDate
                                                        ).toLocaleDateString()}
                                                    </div>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-600 font-medium">
                                                {order.phone_number}
                                            </p>
                                            {order.users?.email && (
                                                <p className="text-[10px] text-gray-400 mt-1">
                                                    {order.users.email}
                                                </p>
                                            )}
                                        </div>

                                        {order.user_stats && (
                                            <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100">
                                                <div className="space-y-0.5">
                                                    <div className="flex items-center gap-1.5 text-gray-400">
                                                        <ShoppingCart size={11} strokeWidth={1.5} />
                                                        <span className="text-[9px] font-bold uppercase tracking-tighter">
                                                            Pedidos
                                                        </span>
                                                    </div>
                                                    <p className="text-xs font-black text-gray-900">
                                                        {order.user_stats.orderCount}
                                                    </p>
                                                </div>
                                                <div className="space-y-0.5">
                                                    <div className="flex items-center gap-1.5 text-gray-400">
                                                        <Wallet size={11} strokeWidth={1.5} />
                                                        <span className="text-[9px] font-bold uppercase tracking-tighter">
                                                            Invertido
                                                        </span>
                                                    </div>
                                                    <p className="text-xs font-black text-gray-900">
                                                        {formatCurrency(
                                                            order.user_stats.totalSpent
                                                        )}
                                                    </p>
                                                </div>
                                                <div className="space-y-0.5">
                                                    <div className="flex items-center gap-1.5 text-gray-400">
                                                        <TrendingUp size={11} strokeWidth={1.5} />
                                                        <span className="text-[9px] font-bold uppercase tracking-tighter">
                                                            Ticket Medio
                                                        </span>
                                                    </div>
                                                    <p className="text-xs font-black text-gray-900">
                                                        {formatCurrency(order.user_stats.avgCheck)}
                                                    </p>
                                                </div>
                                                <div className="space-y-0.5">
                                                    <div className="flex items-center gap-1.5 text-gray-400">
                                                        <Clock size={11} strokeWidth={1.5} />
                                                        <span className="text-[9px] font-bold uppercase tracking-tighter">
                                                            Frecuencia
                                                        </span>
                                                    </div>
                                                    <p className="text-[10px] font-black text-gray-900 leading-none">
                                                        {order.user_stats.frequency}
                                                    </p>
                                                </div>
                                                <div className="col-span-2 pt-2 border-t border-gray-200/50 mt-1 space-y-0.5">
                                                    <div className="flex items-center gap-1.5 text-red-400">
                                                        <Heart
                                                            size={11}
                                                            strokeWidth={1.5}
                                                            fill="currentColor"
                                                        />
                                                        <span className="text-[9px] font-bold uppercase tracking-tighter">
                                                            Plato Favorito
                                                        </span>
                                                    </div>
                                                    <p className="text-xs font-black text-gray-900 line-clamp-1">
                                                        {order.user_stats.favoriteDish}
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        <div className="max-w-[280px]">
                                            <div className="flex items-center gap-2 text-gray-400 mb-2">
                                                <Monitor size={14} strokeWidth={1.5} />
                                                <span className="text-[10px] font-bold uppercase tracking-widest">
                                                    Dirección de Entrega
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-700 leading-relaxed font-medium break-words">
                                                {order.delivery_address}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Items del pedido (Compact Receipt Style) */}
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                            Productos ({order.items?.length || 0})
                                        </p>
                                        <div className="space-y-0.5 px-1">
                                            {order.items?.map((item: any, idx: number) => (
                                                <div
                                                    key={idx}
                                                    className="flex items-center justify-between gap-2 py-1.5 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 px-1 rounded transition-colors"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[11px] font-black text-red-600 min-w-[18px]">
                                                            {item.quantity}x
                                                        </span>
                                                        <span className="text-[11px] font-bold text-gray-700 line-clamp-1">
                                                            {item.name}
                                                        </span>
                                                    </div>
                                                    <span className="text-[10px] font-bold text-gray-400 tabular-nums">
                                                        {formatCurrency(item.price_at_time)}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Acciones de Estatus */}
                                    <div className="lg:border-l border-gray-100 lg:pl-8 flex flex-col justify-start">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                                            Estado del Pedido
                                        </p>
                                        <div className="relative">
                                            <select
                                                value={order.status}
                                                onChange={e =>
                                                    handleUpdateStatus(order.id, e.target.value)
                                                }
                                                className={`w-full px-4 py-2.5 rounded-xl text-sm font-bold border-2 transition-all appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-100 ${
                                                    statusOptions.find(
                                                        s => s.value === order.status
                                                    )?.color ||
                                                    'bg-white border-gray-200 text-gray-700'
                                                }`}
                                            >
                                                {statusOptions.map(opt => (
                                                    <option
                                                        key={opt.value}
                                                        value={opt.value}
                                                        className="bg-white text-gray-900 font-medium"
                                                    >
                                                        {opt.label}
                                                    </option>
                                                ))}
                                            </select>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                                                <RefreshCw size={14} strokeWidth={1.5} />
                                            </div>
                                        </div>

                                        <div className="mt-4 pt-4 border-t border-gray-50">
                                            <div className="flex items-center gap-2 text-gray-400 mb-2">
                                                <Globe size={14} strokeWidth={1.5} />
                                                <span className="text-[10px] font-bold uppercase tracking-widest">
                                                    Origen
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                                <p className="text-[11px] font-bold text-gray-500">
                                                    Web Directa
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {!loading && filteredOrders.length > 0 && pagination.pages > 1 && (
                <div className="mt-6 flex justify-center gap-2">
                    {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(pageNum => (
                        <button
                            key={pageNum}
                            onClick={() => loadOrders(pageNum)}
                            className={`w-10 h-10 flex items-center justify-center rounded-lg font-bold text-sm transition ${
                                pageNum === pagination.page
                                    ? 'bg-red-600 text-white shadow-md'
                                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                            }`}
                        >
                            {pageNum}
                        </button>
                    ))}
                </div>
            )}

            <AnimatePresence>
                {notification && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="fixed bottom-6 right-6 z-50 pointer-events-none"
                    >
                        <div className="bg-gray-900/95 backdrop-blur-md text-white rounded-2xl shadow-2xl p-5 border border-white/10 flex items-center gap-4 min-w-[320px]">
                            <div className="bg-green-500/20 text-green-400 p-2.5 rounded-xl border border-green-500/20">
                                <CheckCircle2 size={24} strokeWidth={1.5} />
                            </div>
                            <div className="flex-1">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                                    Pedido #{String(notification.id).padStart(5, '0')}
                                </p>
                                <p className="text-sm font-bold leading-tight">
                                    Estado actualizado a{' '}
                                    <span className="text-green-400">
                                        {statusOptions.find(s => s.value === notification.newStatus)
                                            ?.label || notification.newStatus}
                                    </span>
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
