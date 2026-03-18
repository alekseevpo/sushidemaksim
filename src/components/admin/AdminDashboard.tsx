import {
    RefreshCw,
    ExternalLink,
    DollarSign,
    ShoppingBag,
    Activity,
    TrendingUp,
    ChevronRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { OrderTimer } from './OrderTimer';

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

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">Resumen hoy</h2>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/menu')}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 transition shadow-sm"
                    >
                        <ExternalLink size={16} strokeWidth={1.5} />
                        Ver Tienda
                    </button>
                    <button
                        onClick={() => loadStats()}
                        className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition"
                    >
                        <RefreshCw
                            size={14}
                            strokeWidth={1.5}
                            className={loading ? 'animate-spin' : ''}
                        />
                        Actualizar datos
                    </button>
                </div>
            </div>

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
                                    <div>
                                        <p className="font-bold text-gray-900 text-sm">
                                            #{String(order.id).padStart(5, '0')}
                                        </p>
                                        <p className="text-xs text-gray-500">{order.user_name}</p>
                                    </div>
                                    <div className="text-right flex flex-col items-end gap-1">
                                        <p className="font-bold text-gray-900 text-sm">
                                            {Number(order.total).toFixed(2).replace('.', ',')} €
                                        </p>
                                        <OrderTimer
                                            createdAt={order.created_at}
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
                                                    {report.orders_count ?? report.order_count ?? 0}
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
