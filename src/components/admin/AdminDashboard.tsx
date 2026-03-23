import {
    RefreshCw,
    ExternalLink,
    DollarSign,
    ShoppingBag,
    Activity,
    TrendingUp,
    ChevronRight,
    AlertTriangle,
    Power,
    Clock,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { OrderTimer } from './OrderTimer';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

interface AdminDashboardProps {
    stats: any;
    reports: any[];
    loading: boolean;
    loadStats: (isPolling?: boolean) => Promise<void>;
    setActiveTab: (tab: any) => void;
}

const StatCard = ({ title, value, icon: Icon, colorClass, desc }: any) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col justify-between">
        <div className="flex justify-between items-start mb-4">
            <div>
                <p className="text-sm font-semibold text-gray-500 mb-1">{title}</p>
                <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
            </div>
            <div className={`p-2.5 rounded-lg ${colorClass}`}>
                <Icon size={20} strokeWidth={1.5} />
            </div>
        </div>
        <p className="text-[11px] text-gray-400 line-clamp-1">{desc}</p>
    </div>
);

export default function AdminDashboard({
    stats,
    reports,
    loading,
    loadStats,
    setActiveTab,
}: AdminDashboardProps) {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

    // Settings Query for Store Status
    const { data: storeSettings, isLoading: settingsLoading } = useQuery({
        queryKey: ['admin-settings'],
        queryFn: async () => {
            const data = await api.get('/admin/settings');
            return data;
        },
    });

    const updateSettingsMutation = useMutation({
        mutationFn: (payload: any) => api.put('/admin/settings', payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
            setIsUpdatingStatus(false);
        },
        onError: () => {
            setIsUpdatingStatus(false);
            alert('Error updating store status');
        },
    });

    const toggleStoreStatus = () => {
        if (!storeSettings) return;
        setIsUpdatingStatus(true);
        updateSettingsMutation.mutate({
            ...storeSettings,
            is_store_closed: !storeSettings.is_store_closed,
        });
    };

    const handleUpdateDeliveryTime = (time: string) => {
        if (!storeSettings) return;
        updateSettingsMutation.mutate({
            ...storeSettings,
            est_delivery_time: time,
        });
    };

    const isClosed = storeSettings?.is_store_closed;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <h2 className="text-lg font-bold text-gray-900">Resumen hoy</h2>

                <div className="flex flex-wrap items-center gap-3">
                    <button
                        onClick={() => navigate('/menu')}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 transition shadow-sm"
                    >
                        <ExternalLink size={16} strokeWidth={1.5} />
                        Ver Tienda
                    </button>
                    <button
                        onClick={() => loadStats()}
                        className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition bg-white border border-gray-100 px-4 py-2 rounded-xl"
                    >
                        <RefreshCw
                            size={14}
                            strokeWidth={1.5}
                            className={loading ? 'animate-spin' : ''}
                        />
                        Actualizar
                    </button>
                </div>
            </div>

            {/* Store Status Toggle Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:scale-110 transition-transform duration-700">
                        <Power size={120} strokeWidth={1} />
                    </div>

                    <div className="flex items-center gap-5 relative z-10">
                        <div
                            className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors shadow-inner
                            ${isClosed ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}
                        >
                            <Power
                                size={28}
                                strokeWidth={2}
                                className={isUpdatingStatus ? 'animate-pulse' : ''}
                            />
                        </div>
                        <div>
                            <h3 className="font-black text-gray-900 text-lg">
                                Parámetros de la Tienda
                            </h3>
                            <div className="flex items-center gap-2">
                                <span
                                    className={`flex h-2 w-2 rounded-full ${isClosed ? 'bg-red-500' : 'bg-green-500 animate-pulse'}`}
                                />
                                <p className="text-sm font-bold text-gray-500 uppercase tracking-tight">
                                    {isClosed
                                        ? 'Tienda Cerrada Temporalmente'
                                        : 'Tienda Abierta y Operativa'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={toggleStoreStatus}
                        disabled={isUpdatingStatus || settingsLoading}
                        className={`w-full md:w-auto flex items-center justify-center gap-3 px-8 py-4 rounded-2xl text-sm font-black transition-all shadow-xl active:scale-95
                            ${
                                isClosed
                                    ? 'bg-red-600 text-white hover:bg-black shadow-red-200'
                                    : 'bg-green-600 text-white hover:bg-black shadow-green-200'
                            }
                            ${isUpdatingStatus ? 'opacity-50 cursor-not-allowed' : ''}
                        `}
                    >
                        {isUpdatingStatus ? (
                            <RefreshCw size={20} className="animate-spin" />
                        ) : isClosed ? (
                            'ABRIR TIENDA'
                        ) : (
                            'MARCAR CERRADA (EMERGENCIA)'
                        )}
                    </button>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col justify-center">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-inner">
                            <Clock size={20} strokeWidth={2} />
                        </div>
                        <h3 className="font-bold text-gray-900">Tiempo Entrega</h3>
                    </div>
                    <div className="relative group">
                        <input
                            type="text"
                            defaultValue={storeSettings?.est_delivery_time || '30-60 min'}
                            onBlur={e => handleUpdateDeliveryTime(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-black text-gray-700 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all font-mono"
                            placeholder="Ej: 30-45 min"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-[10px] font-bold text-blue-400 bg-white px-2 py-1 rounded-lg shadow-sm border border-blue-50">
                                EDITAR
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Emergency Alert if Store is Closed */}
            <AnimatePresence>
                {isClosed && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                    >
                        <div className="bg-red-600 text-white p-5 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-2xl shadow-red-100 border border-red-500">
                            <div className="flex items-center gap-4">
                                <div className="bg-white/20 p-3 rounded-xl backdrop-blur-md">
                                    <AlertTriangle
                                        size={24}
                                        className="text-white animate-bounce"
                                    />
                                </div>
                                <div>
                                    <p className="font-black text-base uppercase tracking-tight">
                                        ¡Atención! La cocina está pausada
                                    </p>
                                    <p className="text-sm text-white/80 font-medium">
                                        Los clientes verán el mensaje de cierre y no podrán procesar
                                        el carrito.
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={toggleStoreStatus}
                                className="w-full md:w-auto bg-white text-red-600 px-8 py-3 rounded-xl text-sm font-black hover:bg-black hover:text-white transition-all shadow-lg active:scale-95"
                            >
                                ACTIVAR TIENDA AHORA
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => (
                        <div
                            key={i}
                            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-32 animate-pulse flex flex-col justify-between"
                        >
                            <div className="w-1/2 h-4 bg-gray-200 rounded"></div>
                            <div className="w-3/4 h-8 bg-gray-200 rounded"></div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        title="Ingresos de hoy"
                        value={`${Number(stats?.revenueToday || 0)
                            .toFixed(2)
                            .replace('.', ',')} €`}
                        icon={DollarSign}
                        colorClass="bg-green-100 text-green-600"
                        desc="Total cobrado (Madrid)"
                    />
                    <StatCard
                        title="Nuevos Pedidos"
                        value={Number(stats?.ordersToday || 0)}
                        icon={ShoppingBag}
                        colorClass="bg-blue-100 text-blue-600"
                        desc="Pedidos recibidos hoy"
                    />
                    <StatCard
                        title="Pedidos Pendientes"
                        value={stats?.pendingOrders ?? 0}
                        icon={Activity}
                        colorClass="bg-amber-100 text-amber-600"
                        desc="Requieren tu atención inmediata"
                    />
                    <StatCard
                        title="Nuevos Clientes"
                        value={stats?.usersToday || 0}
                        icon={TrendingUp}
                        colorClass="bg-purple-100 text-purple-600"
                        desc="Usuarios registrados hoy"
                    />
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-gray-900">Últimos Pedidos</h3>
                        <button
                            onClick={() => setActiveTab('orders')}
                            className="text-red-600 text-xs font-bold hover:underline"
                        >
                            Ver todos
                        </button>
                    </div>

                    {loading ? (
                        <div className="space-y-3">
                            {[1, 2, 3].map(i => (
                                <div
                                    key={i}
                                    className="h-12 bg-gray-50 rounded animate-pulse"
                                ></div>
                            ))}
                        </div>
                    ) : !stats?.recentOrders?.length ? (
                        <div className="text-center py-10 text-gray-400 text-sm">
                            No hay pedidos recientes
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-50">
                            {stats.recentOrders.map((order: any) => (
                                <div
                                    key={order.id}
                                    className="py-3 flex items-center justify-between text-left"
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-xs overflow-hidden shrink-0 shadow-sm border border-gray-50
                                                ${order.user_avatar?.startsWith('http') ? 'bg-gray-100' : order.user_avatar ? 'bg-gray-100 text-[18px]' : 'bg-red-600'}`}
                                        >
                                            {order.user_avatar ? (
                                                order.user_avatar.startsWith('http') ? (
                                                    <img
                                                        src={`${order.user_avatar}${order.user_avatar.includes('?') ? '&' : '?'}t=${Date.now()}`}
                                                        alt={order.user_name}
                                                        className="w-full h-full object-cover"
                                                        onError={e => {
                                                            (
                                                                e.currentTarget as HTMLImageElement
                                                            ).style.display = 'none';
                                                            e.currentTarget.parentElement!.innerText =
                                                                (order.user_name || '?')
                                                                    .split(' ')
                                                                    .filter(Boolean)
                                                                    .map((n: string) => n[0])
                                                                    .join('')
                                                                    .toUpperCase()
                                                                    .slice(0, 2);
                                                        }}
                                                    />
                                                ) : (
                                                    <span className="select-none">
                                                        {order.user_avatar}
                                                    </span>
                                                )
                                            ) : (
                                                <span className="select-none">
                                                    {(order.user_name || 'Invitado')
                                                        .split(' ')
                                                        .filter(Boolean)
                                                        .map((n: string) => n[0])
                                                        .join('')
                                                        .toUpperCase()
                                                        .slice(0, 2)}
                                                </span>
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 text-sm">
                                                #{String(order.id).padStart(5, '0')}
                                            </p>
                                            <p className="text-xs text-gray-500 truncate max-w-[120px]">
                                                {order.user_name || 'Invitado'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right flex flex-col items-end gap-1">
                                        <p className="font-bold text-gray-900 text-sm">
                                            {Number(order.total).toFixed(2).replace('.', ',')} €
                                        </p>
                                        <OrderTimer
                                            createdAt={order.createdAt}
                                            status={order.status}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                    <h3 className="font-bold text-gray-900 mb-4">Top Productos Mensuales</h3>

                    {loading ? (
                        <div className="space-y-3">
                            {[1, 2, 3].map(i => (
                                <div
                                    key={i}
                                    className="h-12 bg-gray-50 rounded animate-pulse"
                                ></div>
                            ))}
                        </div>
                    ) : !stats?.topItems?.length ? (
                        <div className="text-center py-10 text-gray-400 text-sm">
                            No hay datos de ventas disponibles
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {stats.topItems.map((item: any, idx: number) => (
                                <div key={idx} className="flex items-center gap-4">
                                    <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center font-bold text-xs">
                                        #{idx + 1}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-sm font-bold text-gray-800">
                                                {item.name}
                                            </span>
                                            <span className="text-xs text-gray-500 font-medium">
                                                {item.sold} vendidos
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                                            <div
                                                className="bg-red-500 h-full rounded-full transition-all duration-1000"
                                                style={{
                                                    width: `${Math.min(100, (item.sold / (stats.topItems[0].sold || 1)) * 100)}%`,
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Daily Reports Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mt-6 overflow-hidden">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-gray-900">Historial de Reportes Diarios</h3>
                    <span className="text-xs font-medium text-gray-500 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
                        Últimos 30 días
                    </span>
                </div>

                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="h-10 bg-gray-50 rounded animate-pulse"></div>
                        ))}
                    </div>
                ) : !reports?.length ? (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <RefreshCw className="text-gray-300" size={32} strokeWidth={1.5} />
                        </div>
                        <p className="text-gray-500">No hay reportes disponibles todavía.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-xs font-bold text-gray-400 uppercase tracking-widest bg-gray-50/50">
                                    <th className="px-4 py-3 pb-4">Día</th>
                                    <th className="px-4 py-3 pb-4">Pedidos</th>
                                    <th className="px-4 py-3 pb-4">Ingresos</th>
                                    <th className="px-4 py-3 pb-4">Ticket Medio</th>
                                    <th className="px-4 py-3 pb-4 text-right">Detalles</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {reports.map((report: any) => (
                                    <tr
                                        key={report.date}
                                        className="hover:bg-gray-50/80 transition-colors group"
                                    >
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex flex-col items-center justify-center">
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase leading-none mb-1">
                                                        {new Date(report.date).toLocaleDateString(
                                                            'es-ES',
                                                            {
                                                                month: 'short',
                                                            }
                                                        )}
                                                    </span>
                                                    <span className="text-sm font-black text-gray-900 leading-none">
                                                        {new Date(report.date).getDate()}
                                                    </span>
                                                </div>
                                                <span className="text-xs font-bold text-gray-700 capitalize">
                                                    {new Date(report.date).toLocaleDateString(
                                                        'es-ES',
                                                        {
                                                            weekday: 'long',
                                                        }
                                                    )}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-black text-gray-900">
                                                    {report.orders_count ?? report.orderCount ?? 0}
                                                </span>
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                                    pedidos
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className="text-sm font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-lg border border-green-100/50">
                                                {Number(report.total_revenue ?? report.total ?? 0)
                                                    .toFixed(2)
                                                    .replace('.', ',')}{' '}
                                                €
                                            </span>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className="text-xs font-bold text-gray-600">
                                                {Number(
                                                    report.avg_ticket ??
                                                        report.average_ticket ??
                                                        report.avg_price ??
                                                        0
                                                )
                                                    .toFixed(2)
                                                    .replace('.', ',')}{' '}
                                                €
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-right">
                                            <ChevronRight
                                                size={16}
                                                strokeWidth={1.5}
                                                className="text-gray-300 group-hover:text-red-500 group-hover:translate-x-1 transition-all inline-block"
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
