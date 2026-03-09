import { useState, useEffect, useRef } from 'react';
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
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api, ApiError } from '../../utils/api';
import { OrderTimer } from './OrderTimer';

export default function AdminOrders() {
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
    const [isSoundEnabled, setIsSoundEnabled] = useState(false);
    const processedOrderIds = useRef<Set<number>>(new Set());
    const isFirstLoad = useRef(true);
    const audioRef = useRef<HTMLAudioElement | null>(null);

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
            const fetchedOrders = data.orders || [];

            // Sound Notification Logic
            if (isSoundEnabled) {
                const pendingOrders = fetchedOrders.filter((o: any) => o.status === 'pending');
                let hasNewPending = false;

                pendingOrders.forEach((order: any) => {
                    if (!processedOrderIds.current.has(order.id)) {
                        if (!isFirstLoad.current) {
                            hasNewPending = true;
                        }
                        processedOrderIds.current.add(order.id);
                    }
                });

                if (hasNewPending && audioRef.current) {
                    audioRef.current.play().catch(e => console.error('Audio play failed:', e));
                }
            } else {
                // Keep IDs updated even if sound is off to avoid a "blast" when turning it on
                fetchedOrders.forEach((order: any) => processedOrderIds.current.add(order.id));
            }

            setOrders(fetchedOrders);
            setPagination(data.pagination);
            isFirstLoad.current = false;
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

        // Refresh every 30 seconds to keep up to date (faster for sound alerts)
        const intervalId = setInterval(() => {
            loadOrders(pagination.page, filter, true);
        }, 30000);

        return () => clearInterval(intervalId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pagination.page, filter, isSoundEnabled]);

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
            {/* Audio element for notifications */}
            <audio
                ref={audioRef}
                src="https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3"
                preload="auto"
            />

            {/* Top Controls */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 space-y-4">
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="relative flex-1 sm:w-96">
                            <Search
                                size={18}
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
                            onClick={() => setIsSoundEnabled(!isSoundEnabled)}
                            className={`p-2 rounded-lg transition border ${
                                isSoundEnabled
                                    ? 'bg-green-50 text-green-600 border-green-100 hover:bg-green-100'
                                    : 'bg-gray-50 text-gray-400 border-gray-200 hover:bg-gray-100'
                            }`}
                            title={isSoundEnabled ? 'Desactivar sonido' : 'Activar sonido'}
                        >
                            {isSoundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
                        </button>
                    </div>
                    <button
                        onClick={() => loadOrders(pagination.page)}
                        className="w-full sm:w-auto p-2 text-gray-500 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                        title="Actualizar"
                    >
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>

                {/* Filter Tabs */}
                <div className="flex bg-gray-50 p-1 rounded-xl w-full overflow-x-auto no-scrollbar">
                    <div className="flex gap-1 min-w-max">
                        {[
                            { id: 'active', label: 'Activos' },
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
                                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition whitespace-nowrap ${
                                    filter === tab.id
                                        ? 'bg-white text-red-600 shadow-sm border border-gray-100'
                                        : 'text-gray-400 hover:text-gray-600'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {error ? (
                <div className="bg-red-50 border border-red-100 p-6 rounded-xl text-center">
                    <p className="text-red-700 font-bold mb-2">¡Ups! {error}</p>
                    <button
                        onClick={() => loadOrders(pagination.page)}
                        className="text-red-600 underline text-sm font-bold"
                    >
                        Intentar de nuevo
                    </button>
                </div>
            ) : loading && orders.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                    <RefreshCw size={32} className="mx-auto mb-4 animate-spin" />
                    <p>Cargando pedidos...</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredOrders.length === 0 ? (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                            <Package size={40} className="text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500 font-bold">No se encontraron pedidos.</p>
                        </div>
                    ) : (
                        filteredOrders.map(order => (
                            <div
                                key={order.id}
                                className="bg-white border text-left border-gray-200 shadow-sm rounded-xl overflow-hidden hover:shadow-md transition"
                            >
                                <div className="p-4 sm:p-5 bg-gray-50 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                                                Pedido #{String(order.id).padStart(5, '0')}
                                                {order.status === 'waiting_payment' && (
                                                    <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded border border-amber-200 uppercase font-black">
                                                        Invitación / Borrador
                                                    </span>
                                                )}
                                            </h3>
                                            <span className="text-sm text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full font-medium">
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
                                                    return validDate.toLocaleString('es-ES', {
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                        day: '2-digit',
                                                        month: 'short',
                                                    });
                                                })()}
                                            </span>
                                        </div>
                                        <div className="text-sm font-medium text-gray-600">
                                            <strong>Total:</strong>{' '}
                                            <span className="text-red-600 font-bold">
                                                {formatCurrency(order.total)}
                                            </span>
                                            {order.promocode && (
                                                <span className="ml-2 bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs">
                                                    Promo: {order.promocode}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3">
                                        <OrderTimer
                                            createdAt={order.created_at}
                                            status={order.status}
                                        />

                                        <select
                                            value={order.status}
                                            onChange={e =>
                                                handleUpdateStatus(order.id, e.target.value)
                                            }
                                            className={`text-sm font-bold border-2 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-offset-1 transition appearance-none cursor-pointer ${
                                                statusOptions.find(
                                                    opt => opt.value === order.status
                                                )?.color || 'bg-gray-100'
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
                                    </div>
                                </div>

                                <div className="p-4 sm:p-5 grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div>
                                            <h4 className="text-xs uppercase font-bold text-gray-400 mb-2">
                                                Cliente y Entrega
                                            </h4>
                                            <div className="bg-gray-50 rounded-lg p-3 text-sm flex flex-col gap-1 border border-gray-100">
                                                <span>
                                                    <strong>Nombre:</strong> {order.user_name}
                                                </span>
                                                <span>
                                                    <strong>Email:</strong>{' '}
                                                    <span className="text-gray-500">
                                                        {order.user_email}
                                                    </span>
                                                </span>
                                                <span>
                                                    <strong>Dirección:</strong>{' '}
                                                    {order.delivery_address}
                                                </span>
                                                <span>
                                                    <strong>Teléfono:</strong>{' '}
                                                    <a
                                                        href={`tel:${order.phone_number}`}
                                                        className="text-blue-600 hover:underline"
                                                    >
                                                        {order.phone_number}
                                                    </a>
                                                </span>
                                                {(order.device_type || order.os_name) && (
                                                    <div className="mt-2 pt-2 border-t border-gray-100 flex flex-wrap gap-3">
                                                        <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                                                            {order.device_type === 'mobile' ? (
                                                                <Smartphone size={10} />
                                                            ) : (
                                                                <Monitor size={10} />
                                                            )}
                                                            {order.device_type || 'PC'}
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                                                            <div className="w-2.5 h-2.5 rounded-full bg-gray-200 flex items-center justify-center text-[8px] text-gray-500">
                                                                OS
                                                            </div>
                                                            {order.os_name || 'N/A'}
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                                                            <Globe size={10} />
                                                            {order.browser_name || 'Browser'}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        {order.notes && (
                                            <div>
                                                <h4 className="text-xs uppercase font-bold text-gray-400 mb-2">
                                                    Comentarios
                                                </h4>
                                                <div className="bg-amber-50 rounded-lg p-3 text-sm text-amber-900 border border-amber-200 italic shadow-sm">
                                                    "{order.notes}"
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <h4 className="text-xs uppercase font-bold text-gray-400 mb-2">
                                            Artículos ({order.items?.length || 0})
                                        </h4>
                                        <div className="bg-gray-50 border border-gray-100 rounded-lg divide-y divide-gray-200">
                                            {order.items?.map((item: any) => (
                                                <div
                                                    key={item.id}
                                                    className="p-3 flex items-center justify-between text-sm"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0 bg-gray-100 border border-gray-200 flex items-center justify-center">
                                                            {item.image ? (
                                                                <img
                                                                    src={item.image}
                                                                    alt=""
                                                                    className="w-full h-full object-cover"
                                                                    onError={e => {
                                                                        e.currentTarget.style.display =
                                                                            'none';
                                                                        const p =
                                                                            e.currentTarget
                                                                                .parentElement;
                                                                        if (p)
                                                                            p.innerHTML =
                                                                                '<span class="text-xs">🍣</span>';
                                                                    }}
                                                                />
                                                            ) : (
                                                                <span className="text-xs">🍣</span>
                                                            )}
                                                        </div>
                                                        <span className="font-bold text-gray-800">
                                                            {item.name}{' '}
                                                            <span className="text-gray-400 font-normal">
                                                                x{item.quantity}
                                                            </span>
                                                        </span>
                                                    </div>
                                                    <span className="font-bold text-gray-600">
                                                        {formatCurrency(
                                                            item.price_at_time * item.quantity
                                                        )}
                                                    </span>
                                                </div>
                                            ))}
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

            {/* Notification Toast */}
            <AnimatePresence>
                {notification && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, x: 50, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                        className="fixed bottom-6 right-6 z-[100] flex items-center gap-3 bg-gray-900 text-white px-5 py-4 rounded-2xl shadow-2xl border border-white/10"
                    >
                        <div className="w-10 h-10 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center shrink-0">
                            <CheckCircle2 size={24} />
                        </div>
                        <div className="flex flex-col">
                            <p className="font-black text-sm">Estado actualizado</p>
                            <p className="text-xs text-gray-400">
                                Pedido <span className="text-white">#{notification.id}</span>:
                                <span className="mx-1 line-through opacity-50">
                                    {statusOptions.find(opt => opt.value === notification.oldStatus)
                                        ?.label || notification.oldStatus}
                                </span>
                                →
                                <span className="ml-1 text-green-400 font-bold">
                                    {statusOptions.find(opt => opt.value === notification.newStatus)
                                        ?.label || notification.newStatus}
                                </span>
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
