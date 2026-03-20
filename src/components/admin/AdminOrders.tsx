import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
    X,
    MessageSquare,
    Store,
    Truck,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api, ApiError } from '../../utils/api';
import { OrderTimer } from './OrderTimer';
import { Order, OrderItem } from '../../types';

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
    const queryClient = useQueryClient();
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState<string>('active');
    const [page, setPage] = useState(1);
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [notification, setNotification] = useState<{
        id: number;
        oldStatus: string;
        newStatus: string;
    } | null>(null);

    const LIMIT = 10;

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1); // Reset to first page on search
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    // Map frontend filters to backend status strings
    const filterMap: Record<string, string> = {
        active: 'pending,received,confirmed,preparing,on_the_way',
        unpaid: 'waiting_payment',
        preparing: 'confirmed,preparing',
        on_the_way: 'on_the_way',
        delivered: 'delivered',
        cancelled: 'cancelled',
        all: '',
    };

    // Orders Query
    const {
        data,
        isLoading,
        error: fetchError,
        isFetching,
        refetch,
    } = useQuery({
        queryKey: ['admin-orders', page, filter, debouncedSearch],
        queryFn: async () => {
            let url = `/admin/orders?page=${page}&limit=${LIMIT}`;
            if (debouncedSearch) {
                url += `&search=${encodeURIComponent(debouncedSearch)}`;
            }
            const statusParam = filterMap[filter];
            if (statusParam) {
                url += `&status=${statusParam}`;
            }
            return await api.get(url);
        },
        refetchInterval: 30000, // Automagical polling every 30s
    });

    const orders = data?.orders || [];
    const pagination = data?.pagination || { page: 1, limit: LIMIT, total: 0, pages: 1 };

    // Update Status Mutation
    const statusMutation = useMutation({
        mutationFn: ({ id, newStatus }: { id: number; newStatus: string }) =>
            api.patch(`/admin/orders/${id}/status`, { status: newStatus }),
        onMutate: async ({ id, newStatus }) => {
            // Optimistic update
            await queryClient.cancelQueries({
                queryKey: ['admin-orders', page, filter, debouncedSearch],
            });
            const previousData = queryClient.getQueryData([
                'admin-orders',
                page,
                filter,
                debouncedSearch,
            ]);

            // Show notification
            const order = (previousData as any)?.orders?.find((o: any) => o.id === id);
            setNotification({ id, oldStatus: order?.status || '?', newStatus });
            setTimeout(() => setNotification(null), 4000);

            return { previousData };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
        },
    });

    const handleUpdateStatus = (id: number, newStatus: string) => {
        statusMutation.mutate({ id, newStatus });
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
                                className="w-full pl-10 pr-10 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:border-red-400 focus:outline-none transition"
                            />
                            {search && (
                                <button
                                    onClick={() => setSearch('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <X size={16} strokeWidth={1.5} />
                                </button>
                            )}
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
                        onClick={() => refetch()}
                        className="w-full sm:w-auto p-2 text-gray-500 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                        title="Actualizar"
                    >
                        <RefreshCw
                            size={18}
                            strokeWidth={1.5}
                            className={isFetching ? 'animate-spin' : ''}
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
                                    setPage(1);
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

            {fetchError && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 border border-red-100 flex items-center gap-3">
                    <RefreshCw className="animate-spin" size={18} strokeWidth={1.5} />
                    <p className="font-medium">
                        {fetchError instanceof ApiError
                            ? fetchError.message
                            : 'Error al cargar los pedidos'}
                    </p>
                </div>
            )}

            {!isLoading && orders.length === 0 ? (
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
                    {isLoading && orders.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
                            <RefreshCw
                                className="animate-spin text-red-600 mb-4"
                                size={32}
                                strokeWidth={1.5}
                            />
                            <p className="text-gray-500 font-medium">Cargando pedidos...</p>
                        </div>
                    ) : (
                        orders.map((order: Order) => (
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
                                                {order.notes && (
                                                    <div
                                                        className="bg-amber-100 text-amber-600 p-1.5 rounded-lg border border-amber-200"
                                                        title="Tiene notas o comentarios"
                                                    >
                                                        <MessageSquare
                                                            size={14}
                                                            strokeWidth={2.5}
                                                        />
                                                    </div>
                                                )}
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
                                            <div className="flex items-center gap-2">
                                                <p className="text-xs text-gray-600 font-bold">
                                                    {order.phone_number}
                                                </p>
                                                <a
                                                    href={`https://wa.me/${order.phone_number.replace(/\D/g, '')}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-1 px-2 bg-green-50 text-green-600 rounded-lg text-[10px] font-black border border-green-100 hover:bg-green-100 transition-colors flex items-center gap-1"
                                                >
                                                    <MessageSquare size={10} strokeWidth={2.5} />
                                                    WHATSAPP
                                                </a>
                                            </div>
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
                                                        {order.user_stats.orderCount || 0}
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
                                                            order.user_stats.totalSpent || 0
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
                                                        {formatCurrency(
                                                            order.user_stats.avgCheck || 0
                                                        )}
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
                                                        {order.user_stats.frequency ||
                                                            'Primer pedido'}
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
                                                        {order.user_stats.favoriteDish || 'N/A'}
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

                                        {order.notes &&
                                            (() => {
                                                const notes = order.notes || '';
                                                let paymentMethod = '';
                                                let deliveryType = '';
                                                let scheduled = '';
                                                let noCall = false;
                                                let noBuzzer = false;
                                                let actualNote = '';

                                                const parts = notes.split(' | ');
                                                parts.forEach((part: string) => {
                                                    if (part.includes('[MÉTODO DE PAGO:')) {
                                                        paymentMethod = part
                                                            .replace('[MÉTODO DE PAGO: ', '')
                                                            .replace(']', '');
                                                    } else if (part.includes('[TIPO:')) {
                                                        deliveryType = part
                                                            .replace('[TIPO: ', '')
                                                            .replace(']', '');
                                                    } else if (
                                                        part.includes('[ENTREGA PROGRAMADA:')
                                                    ) {
                                                        scheduled = part
                                                            .replace('[ENTREGA PROGRAMADA: ', '')
                                                            .replace(']', '');
                                                    } else if (
                                                        part.includes(
                                                            '[NO LLAMAR PARA CONFIRMACIÓN]'
                                                        )
                                                    ) {
                                                        noCall = true;
                                                    } else if (
                                                        part.includes(
                                                            '[NO LLAMAR AL TELEFONILLO - LLAMAR AL MÓVIL]'
                                                        )
                                                    ) {
                                                        noBuzzer = true;
                                                    } else {
                                                        actualNote +=
                                                            (actualNote ? ' | ' : '') + part;
                                                    }
                                                });

                                                return (
                                                    <div className="space-y-3">
                                                        <div className="flex flex-wrap gap-2 mb-2">
                                                            {deliveryType && (
                                                                <div
                                                                    className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 ${deliveryType === 'RECOGIDA EN LOCAL' ? 'bg-amber-100 text-amber-700 border border-amber-200' : 'bg-gray-100 text-gray-700 border border-gray-200'}`}
                                                                >
                                                                    {deliveryType ===
                                                                    'RECOGIDA EN LOCAL' ? (
                                                                        <Store size={12} />
                                                                    ) : (
                                                                        <Truck size={12} />
                                                                    )}
                                                                    {deliveryType ===
                                                                    'RECOGIDA EN LOCAL'
                                                                        ? 'RECOGIDA'
                                                                        : 'DOMICILIO'}
                                                                </div>
                                                            )}
                                                            {paymentMethod && (
                                                                <div
                                                                    className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 ${paymentMethod === 'TARJETA' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}
                                                                >
                                                                    {paymentMethod === 'TARJETA' ? (
                                                                        <Wallet size={12} />
                                                                    ) : (
                                                                        <Wallet size={12} />
                                                                    )}
                                                                    {paymentMethod}
                                                                </div>
                                                            )}
                                                            {scheduled && (
                                                                <div className="px-3 py-2 rounded-xl bg-red-600 text-white border border-red-700 text-[11px] font-black uppercase tracking-wider flex items-center gap-2 animate-pulse shadow-lg shadow-red-200">
                                                                    <Clock
                                                                        size={14}
                                                                        strokeWidth={3}
                                                                    />
                                                                    <div className="flex flex-col leading-none">
                                                                        <span>
                                                                            ENTREGA PROGRAMADA
                                                                        </span>
                                                                        <span className="text-[9px] opacity-90 mt-0.5">
                                                                            {scheduled}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            )}
                                                            {noCall && (
                                                                <div className="px-2 py-1 rounded-lg bg-gray-100 text-gray-500 border border-gray-200 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5">
                                                                    <VolumeX size={12} />
                                                                    SIN LLAMADA
                                                                </div>
                                                            )}
                                                            {noBuzzer && (
                                                                <div className="px-2 py-1 rounded-lg bg-gray-100 text-gray-500 border border-gray-200 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5">
                                                                    <MessageSquare size={12} />
                                                                    MÓVIL (NO TIMBRE)
                                                                </div>
                                                            )}
                                                        </div>

                                                        {actualNote && (
                                                            <div className="bg-amber-50 border border-amber-200/50 rounded-2xl p-4 animate-in slide-in-from-top-2 duration-300">
                                                                <div className="flex items-center gap-2 text-amber-600 mb-2">
                                                                    <MessageSquare
                                                                        size={14}
                                                                        strokeWidth={2}
                                                                    />
                                                                    <span className="text-[10px] font-black uppercase tracking-widest">
                                                                        Mensaje del Cliente
                                                                    </span>
                                                                </div>
                                                                <p className="text-xs text-amber-900 font-bold leading-relaxed italic">
                                                                    "{actualNote}"
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })()}
                                    </div>

                                    {/* Items del pedido (Receipt Style) */}
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                            Productos ({order.items?.length || 0})
                                        </p>
                                        <div className="space-y-0.5 px-1">
                                            {order.items?.map((item: OrderItem, idx: number) => (
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

                                    {/* Actions */}
                                    <div className="lg:border-l border-gray-100 lg:pl-8 flex flex-col justify-start">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                                            Estado del Pedido
                                        </p>
                                        <div className="relative">
                                            <select
                                                value={order.status}
                                                onChange={e =>
                                                    handleUpdateStatus(
                                                        Number(order.id),
                                                        e.target.value
                                                    )
                                                }
                                                disabled={statusMutation.isPending}
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
                                                <RefreshCw
                                                    size={14}
                                                    strokeWidth={1.5}
                                                    className={
                                                        statusMutation.isPending
                                                            ? 'animate-spin'
                                                            : ''
                                                    }
                                                />
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

            {!isLoading && orders.length > 0 && pagination.pages > 1 && (
                <div className="mt-6 flex justify-center gap-2">
                    {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(pageNum => (
                        <button
                            key={pageNum}
                            onClick={() => setPage(pageNum)}
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
