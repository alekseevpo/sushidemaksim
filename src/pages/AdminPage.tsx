import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    ShieldCheck,
    LayoutDashboard,
    Package,
    Users,
    Menu as MenuIcon,
    HelpCircle,
    TrendingUp,
    ShoppingBag,
    DollarSign,
    Activity,
    ChevronRight,
    RefreshCw,
    X,
    ArrowLeft,
    ExternalLink,
    BarChart3,
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
    PieChart,
    Pie,
    AreaChart,
    Area,
    Legend,
} from 'recharts';
import { useAuth } from '../hooks/useAuth';
import { api } from '../utils/api';
import AdminMenu from '../components/admin/AdminMenu';
import AdminUsers from '../components/admin/AdminUsers';
import AdminOrders from '../components/admin/AdminOrders';
import AdminPromos from '../components/admin/AdminPromos';
import AdminBlog from '../components/admin/AdminBlog';
import AdminSettings from '../components/admin/AdminSettings';
import { OrderTimer } from '../components/admin/OrderTimer';

type TabId = 'dashboard' | 'orders' | 'menu' | 'users' | 'promos' | 'blog' | 'settings' | 'analytics';

export default function AdminPage() {
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = (searchParams.get('tab') as TabId) || 'dashboard';

    const setActiveTab = (tab: TabId) => {
        setSearchParams({ tab });
    };
    const [stats, setStats] = useState<any>(null);
    const [reports, setReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showHelp, setShowHelp] = useState(true);

    // Authorization Check
    useEffect(() => {
        if (isAuthenticated && user && user.role !== 'admin' && !user.is_superadmin) {
            navigate('/profile'); // Redirect normal users away
        }
    }, [isAuthenticated, user, navigate]);

    useEffect(() => {
        if (user?.role === 'admin' && activeTab === 'dashboard') {
            loadStats();
            // Polling every 60 seconds to keep stats updated without skeleton
            const interval = setInterval(() => loadStats(true), 60000);
            return () => clearInterval(interval);
        }
    }, [user, activeTab]);

    const loadStats = async (isPolling: boolean = false) => {
        if (!isPolling) setLoading(true);
        try {
            const [statsData, reportsData] = await Promise.all([
                api.get('/admin/stats'),
                api.get('/admin/reports'),
            ]);
            setStats(statsData);
            setReports(reportsData || []);
        } catch (err) {
            console.error('Failed to load stats', err);
        } finally {
            if (!isPolling) setLoading(false);
        }
    };

    if (!isAuthenticated || (user?.role !== 'admin' && !user?.is_superadmin)) {
        return (
            <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', padding: '32px 16px' }}>
                <div
                    style={{
                        maxWidth: '600px',
                        margin: '0 auto',
                        textAlign: 'center',
                        padding: '80px 0',
                    }}
                >
                    <div style={{ fontSize: '80px', marginBottom: '24px' }}>🔒</div>
                    <h1
                        style={{
                            fontSize: '28px',
                            fontWeight: 'bold',
                            marginBottom: '12px',
                            color: '#111827',
                        }}
                    >
                        Acceso restringido
                    </h1>
                    <p style={{ fontSize: '16px', color: '#6B7280', marginBottom: '32px' }}>
                        No tienes permisos para acceder a este panel general.
                    </p>
                    <button
                        onClick={() => navigate('/')}
                        style={{
                            backgroundColor: '#DC2626',
                            color: 'white',
                            padding: '12px 32px',
                            borderRadius: '10px',
                            border: 'none',
                            fontWeight: 'bold',
                            fontSize: '15px',
                            cursor: 'pointer',
                        }}
                    >
                        Volver al inicio
                    </button>
                </div>
            </div>
        );
    }

    const navLinks: { id: TabId; label: string; icon: any }[] = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'analytics', label: 'Analítica Avanzada', icon: BarChart3 },
        { id: 'orders', label: 'Gestión de Pedidos', icon: Package },
        { id: 'menu', label: 'Gestión de Menú', icon: MenuIcon },
        { id: 'users', label: 'Usuarios y Clientes', icon: Users },
        { id: 'promos', label: 'Gestión de Promociones', icon: ShoppingBag },
        { id: 'blog', label: 'Gestión de Blog', icon: Activity },
        { id: 'settings', label: 'Ajustes de Contacto', icon: DollarSign },
    ];

    const StatCard = ({ title, value, icon: Icon, colorClass, desc }: any) => (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <p className="text-sm font-semibold text-gray-500 mb-1">{title}</p>
                    <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
                </div>
                <div className={`p-2.5 rounded-lg ${colorClass}`}>
                    <Icon size={20} />
                </div>
            </div>
            <p className="text-[11px] text-gray-400 line-clamp-1">{desc}</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
            {/* Sidebar */}
            <aside className="w-full md:w-64 bg-white border-r border-gray-200 flex flex-col md:fixed h-full z-10">
                <div className="p-6 border-b border-gray-100 flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-100 text-red-600 rounded-lg flex items-center justify-center">
                        <ShieldCheck size={24} />
                    </div>
                    <div>
                        <h2 className="font-bold text-gray-900 leading-tight">Admin Panel</h2>
                        <p className="text-xs text-gray-500 font-medium">Sushi de Maksim</p>
                    </div>
                </div>
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {navLinks.map(tab => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium text-sm transition-colors ${isActive
                                    ? 'bg-red-50 text-red-700'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <Icon
                                        size={18}
                                        className={isActive ? 'text-red-600' : 'text-gray-400'}
                                    />
                                    {tab.label}
                                </div>
                                {isActive && <ChevronRight size={16} className="text-red-400" />}
                            </button>
                        );
                    })}
                </nav>
                <div className="p-4 border-t border-gray-100 mt-auto">
                    <button
                        onClick={() => navigate('/menu')}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-50 text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-xl font-bold text-sm transition-colors border border-gray-200"
                    >
                        <ArrowLeft size={16} />
                        Volver a la tienda
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:ml-64 p-3 md:p-6">
                <div className="w-full">
                    {/* Top Bar */}
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            {navLinks.find(t => t.id === activeTab)?.label}
                        </h1>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setShowHelp(!showHelp)}
                                className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 font-medium transition"
                            >
                                <HelpCircle size={18} />
                                {showHelp ? 'Ocultar ayudas' : 'Mostrar ayudas'}
                            </button>
                        </div>
                    </div>

                    {/* Interactive Help Banner */}
                    {showHelp && (
                        <div className="mb-8 bg-blue-50 border border-blue-200 rounded-xl p-5 relative">
                            <button
                                onClick={() => setShowHelp(false)}
                                className="absolute top-4 right-4 text-blue-400 hover:text-blue-600 transition"
                            >
                                <X size={20} />
                            </button>
                            <div className="flex gap-4">
                                <div className="mt-1">
                                    <HelpCircle className="text-blue-500" size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-blue-900 mb-1">
                                        ¡Bienvenido al Panel de Administración!
                                    </h3>
                                    <p className="text-blue-800 text-sm leading-relaxed max-w-3xl">
                                        {activeTab === 'dashboard' &&
                                            'Esta es tu pantalla principal. Aquí verás un resumen rápido del estado de tu negocio: cuánto dinero has ganado hoy, cuántos pedidos están pendientes y las tendencias generales. Es ideal para tener una visión rápida al principio del día.'}
                                        {activeTab === 'orders' &&
                                            'Aquí gestionas los pedidos. Consejo: Presta atención a los pedidos con estado "Pendiente". Puedes cambiar su estado a "Preparando" para que el cliente sepa que ya estás en ello, y luego a "En camino" o "Entregado".'}
                                        {activeTab === 'menu' &&
                                            'Desde aquí puedes añadir nuevos platos, cambiar precios o marcar platos con promociones. Si un plato se agota, puedes ocultarlo temporalmente para que los clientes no puedan pedirlo.'}
                                        {activeTab === 'users' &&
                                            'Este es el directorio de tus clientes. Puedes ver quiénes son tus mejores compradores y analizar su historial de pedidos.'}
                                        {activeTab === 'promos' &&
                                            'Gestiona tus ofertas estáticas aquí. Crea banners promocionales con diferentes colores, iconos y ofertas.'}
                                        {activeTab === 'blog' &&
                                            'Maneja tu blog aquí. Crea artículos nuevos, edita los existentes o cambia su estado de publicación.'}
                                        {activeTab === 'settings' &&
                                            'Personaliza cómo te contactan tus clientes. Cambia tus teléfonos, emails y redes sociales en un solo lugar.'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tab Contents */}
                    {activeTab === 'dashboard' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-bold text-gray-900">Resumen hoy</h2>
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => navigate('/menu')}
                                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 transition shadow-sm"
                                    >
                                        <ExternalLink size={16} />
                                        Ver Tienda
                                    </button>
                                    <button
                                        onClick={() => loadStats()}
                                        className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition"
                                    >
                                        <RefreshCw
                                            size={14}
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
                                        value={`${(stats?.revenueToday ?? 0).toFixed(2).replace('.', ',')} €`}
                                        icon={DollarSign}
                                        colorClass="bg-green-100 text-green-600"
                                        desc="Total cobrado (Madrid)"
                                    />
                                    <StatCard
                                        title="Nuevos Pedidos"
                                        value={stats?.ordersToday ?? 0}
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
                                        value={stats?.usersToday ?? 0}
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
                                                        <p className="text-xs text-gray-500">
                                                            {order.user_name}
                                                        </p>
                                                    </div>
                                                    <div className="text-right flex flex-col items-end gap-1">
                                                        <p className="font-bold text-gray-900 text-sm">
                                                            {Number(order.total)
                                                                .toFixed(2)
                                                                .replace('.', ',')}{' '}
                                                            €
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
                                    <h3 className="font-bold text-gray-900 mb-4">
                                        Top Productos Mensuales
                                    </h3>

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
                                    <h3 className="font-bold text-gray-900">
                                        Historial de Reportes Diarios
                                    </h3>
                                    <span className="text-xs font-medium text-gray-500 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
                                        Últimos 30 días
                                    </span>
                                </div>

                                {loading ? (
                                    <div className="space-y-4">
                                        {[1, 2, 3].map(i => (
                                            <div
                                                key={i}
                                                className="h-10 bg-gray-50 rounded animate-pulse"
                                            ></div>
                                        ))}
                                    </div>
                                ) : !reports?.length ? (
                                    <div className="text-center py-12">
                                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Activity className="text-gray-300" size={32} />
                                        </div>
                                        <p className="text-gray-500 text-sm">
                                            Aún no se ha generado ningún informe diario.
                                        </p>
                                        <p className="text-gray-400 text-xs mt-1">
                                            El primer informe aparecerá mañana a las 00:00.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="border-b border-gray-50 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                                    <th className="px-4 py-3">Fecha</th>
                                                    <th className="px-4 py-3">Ingresos</th>
                                                    <th className="px-4 py-3">Pedi.</th>
                                                    <th className="px-4 py-3">Canc.</th>
                                                    <th className="px-4 py-3">Retra.</th>
                                                    <th className="px-4 py-3">Invi.</th>
                                                    <th className="px-4 py-3">Nuevos</th>
                                                    <th className="px-4 py-3">Ticket</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {reports.map(report => (
                                                    <tr
                                                        key={report.id}
                                                        className="hover:bg-gray-50 transition-colors"
                                                    >
                                                        <td className="px-4 py-4 text-sm font-bold text-gray-900">
                                                            {new Date(
                                                                report.date
                                                            ).toLocaleDateString('es-ES', {
                                                                day: 'numeric',
                                                                month: 'long',
                                                            })}
                                                        </td>
                                                        <td className="px-4 py-4 text-sm font-bold text-green-600">
                                                            {Number(report.total_revenue)
                                                                .toFixed(2)
                                                                .replace('.', ',')}{' '}
                                                            €
                                                        </td>
                                                        <td className="px-4 py-4 text-sm text-gray-600 font-medium">
                                                            {report.orders_count}
                                                        </td>
                                                        <td className="px-4 py-4 text-sm text-red-500 font-bold">
                                                            {report.cancelled_count || 0}
                                                        </td>
                                                        <td className="px-4 py-4 text-sm text-orange-500 font-bold">
                                                            {report.late_count || 0}
                                                        </td>
                                                        <td className="px-4 py-4 text-sm text-blue-500 font-bold">
                                                            {report.invitations_count || 0}
                                                        </td>
                                                        <td className="px-4 py-4 text-sm text-gray-600">
                                                            {report.new_users_count}
                                                        </td>
                                                        <td className="px-4 py-4 text-sm text-gray-600">
                                                            {Number(report.avg_ticket)
                                                                .toFixed(2)
                                                                .replace('.', ',')}{' '}
                                                            €
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'analytics' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-bold text-gray-900">Analítica de Comportamiento</h2>
                                <div className="text-xs text-gray-400 font-medium">Datos de los últimos 90 días</div>
                            </div>

                            {/* Device Analytics with Charts */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                                <h3 className="font-bold text-gray-900 mb-6 text-sm">
                                    Analítica de Dispositivos (Pedidos)
                                </h3>
                                {loading ? (
                                    <div className="h-48 bg-gray-50 rounded animate-pulse"></div>
                                ) : !stats?.analytics ||
                                    Object.keys(stats.analytics.devices).length === 0 ? (
                                    <div className="text-center py-10 text-gray-400 text-sm">
                                        No hay suficientes datos registrados
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {/* Device Types Pie Chart */}
                                        <div className="h-48 flex flex-col">
                                            <h4 className="text-[10px] uppercase font-bold text-gray-400 mb-2 text-center tracking-wider">
                                                Dispositivos
                                            </h4>
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie
                                                        data={Object.entries(
                                                            stats.analytics.devices
                                                        ).map(([name, value]) => ({
                                                            name,
                                                            value,
                                                        }))}
                                                        cx="50%"
                                                        cy="50%"
                                                        innerRadius={45}
                                                        outerRadius={65}
                                                        paddingAngle={5}
                                                        dataKey="value"
                                                    >
                                                        {[
                                                            '#EF4444',
                                                            '#3B82F6',
                                                            '#10B981',
                                                            '#F59E0B',
                                                        ].map((color, index) => (
                                                            <Cell
                                                                key={`cell-${index}`}
                                                                fill={color}
                                                            />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip />
                                                    <Legend wrapperStyle={{ fontSize: '9px' }} />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>

                                        {/* OS Distribution Bar Chart */}
                                        <div className="h-48 flex flex-col">
                                            <h4 className="text-[10px] uppercase font-bold text-gray-400 mb-2 text-center tracking-wider">
                                                Sistemas OP
                                            </h4>
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart
                                                    data={Object.entries(stats.analytics.os)
                                                        .sort((a: any, b: any) => b[1] - a[1])
                                                        .map(([name, count]) => ({ name, count }))}
                                                    layout="vertical"
                                                    margin={{ left: 0, right: 30 }}
                                                >
                                                    <CartesianGrid
                                                        strokeDasharray="3 3"
                                                        horizontal={true}
                                                        vertical={false}
                                                        stroke="#f0f0f0"
                                                    />
                                                    <XAxis type="number" hide />
                                                    <YAxis
                                                        dataKey="name"
                                                        type="category"
                                                        width={60}
                                                        fontSize={9}
                                                        axisLine={false}
                                                        tickLine={false}
                                                    />
                                                    <Tooltip />
                                                    <Bar
                                                        dataKey="count"
                                                        fill="#3B82F6"
                                                        radius={[0, 4, 4, 0]}
                                                        barSize={15}
                                                    />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>

                                        {/* Browser Distribution Bar Chart */}
                                        <div className="h-48 flex flex-col">
                                            <h4 className="text-[10px] uppercase font-bold text-gray-400 mb-2 text-center tracking-wider">
                                                Navegadores
                                            </h4>
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart
                                                    data={Object.entries(stats.analytics.browsers)
                                                        .sort((a: any, b: any) => b[1] - a[1])
                                                        .map(([name, count]) => ({ name, count }))}
                                                >
                                                    <CartesianGrid
                                                        strokeDasharray="3 3"
                                                        vertical={false}
                                                        stroke="#f0f0f0"
                                                    />
                                                    <XAxis
                                                        dataKey="name"
                                                        fontSize={9}
                                                        axisLine={false}
                                                        tickLine={false}
                                                        interval={0}
                                                        tickFormatter={(val) =>
                                                            val.replace('Mobile ', 'M. ')
                                                                .replace('Chrome', 'Chr')
                                                                .replace('Safari', 'Saf')
                                                        }
                                                    />
                                                    <YAxis
                                                        fontSize={9}
                                                        axisLine={false}
                                                        tickLine={false}
                                                    />
                                                    <Tooltip />
                                                    <Bar
                                                        dataKey="count"
                                                        fill="#F59E0B"
                                                        radius={[4, 4, 0, 0]}
                                                        barSize={20}
                                                    />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Peak Hours Heatmap */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                                    <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2 text-sm">
                                        <Activity size={16} className="text-red-500" />
                                        Horas Pico (90d)
                                    </h3>
                                    {loading ? (
                                        <div className="h-36 bg-gray-50 rounded animate-pulse"></div>
                                    ) : (
                                        <div className="h-36">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart
                                                    data={stats?.heatmap?.hourly?.map(
                                                        (val: number, hour: number) => ({
                                                            hour: `${hour}:00`,
                                                            pedidos: val,
                                                        })
                                                    )}
                                                >
                                                    <CartesianGrid
                                                        strokeDasharray="3 3"
                                                        vertical={false}
                                                        stroke="#f0f0f0"
                                                    />
                                                    <XAxis
                                                        dataKey="hour"
                                                        fontSize={9}
                                                        axisLine={false}
                                                        tickLine={false}
                                                        interval={3}
                                                    />
                                                    <YAxis
                                                        fontSize={9}
                                                        axisLine={false}
                                                        tickLine={false}
                                                    />
                                                    <Tooltip />
                                                    <Bar
                                                        dataKey="pedidos"
                                                        fill="#EF4444"
                                                        radius={[4, 4, 0, 0]}
                                                    />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    )}
                                </div>

                                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                                    <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2 text-sm">
                                        <TrendingUp size={16} className="text-blue-500" />
                                        Días Оcupados
                                    </h3>
                                    {loading ? (
                                        <div className="h-36 bg-gray-50 rounded animate-pulse"></div>
                                    ) : (
                                        <div className="h-36">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart
                                                    data={stats?.heatmap?.daily?.map(
                                                        (val: number, day: number) => ({
                                                            day: [
                                                                'Dom',
                                                                'Lun',
                                                                'Mar',
                                                                'Mié',
                                                                'Jue',
                                                                'Vie',
                                                                'Sáb',
                                                            ][day],
                                                            pedidos: val,
                                                        })
                                                    )}
                                                >
                                                    <CartesianGrid
                                                        strokeDasharray="3 3"
                                                        vertical={false}
                                                        stroke="#f0f0f0"
                                                    />
                                                    <XAxis
                                                        dataKey="day"
                                                        fontSize={9}
                                                        axisLine={false}
                                                        tickLine={false}
                                                    />
                                                    <YAxis
                                                        fontSize={9}
                                                        axisLine={false}
                                                        tickLine={false}
                                                    />
                                                    <Tooltip />
                                                    <Bar
                                                        dataKey="pedidos"
                                                        fill="#3B82F6"
                                                        radius={[4, 4, 0, 0]}
                                                    />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Growth & Retention */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                                    <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2 text-sm">
                                        <DollarSign size={16} className="text-emerald-500" />
                                        Ingresos (30d)
                                    </h3>
                                    {loading ? (
                                        <div className="h-48 bg-gray-50 rounded animate-pulse"></div>
                                    ) : (
                                        <div className="h-48">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <AreaChart data={stats?.growth}>
                                                    <defs>
                                                        <linearGradient
                                                            id="colorRevenue"
                                                            x1="0"
                                                            y1="0"
                                                            x2="0"
                                                            y2="1"
                                                        >
                                                            <stop
                                                                offset="5%"
                                                                stopColor="#10B981"
                                                                stopOpacity={0.1}
                                                            />
                                                            <stop
                                                                offset="95%"
                                                                stopColor="#10B981"
                                                                stopOpacity={0}
                                                            />
                                                        </linearGradient>
                                                    </defs>
                                                    <CartesianGrid
                                                        strokeDasharray="3 3"
                                                        vertical={false}
                                                        stroke="#f0f0f0"
                                                    />
                                                    <XAxis
                                                        dataKey="date"
                                                        fontSize={9}
                                                        axisLine={false}
                                                        tickLine={false}
                                                        tickFormatter={str => str.split('-')[2]}
                                                    />
                                                    <YAxis
                                                        fontSize={9}
                                                        axisLine={false}
                                                        tickLine={false}
                                                        tickFormatter={val => `${val}€`}
                                                    />
                                                    <Tooltip />
                                                    <Area
                                                        type="monotone"
                                                        dataKey="revenue"
                                                        stroke="#10B981"
                                                        fillOpacity={1}
                                                        fill="url(#colorRevenue)"
                                                        strokeWidth={2}
                                                    />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        </div>
                                    )}
                                </div>

                                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                                    <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2 text-sm">
                                        <Users size={16} className="text-violet-500" />
                                        Nuevos vs Recur.
                                    </h3>
                                    {loading ? (
                                        <div className="h-48 bg-gray-50 rounded animate-pulse"></div>
                                    ) : (
                                        <div className="h-48">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie
                                                        data={[
                                                            {
                                                                name: 'Nuevos',
                                                                value: stats?.retention?.new || 0,
                                                            },
                                                            {
                                                                name: 'Recur.',
                                                                value:
                                                                    stats?.retention?.returning ||
                                                                    0,
                                                            },
                                                        ]}
                                                        cx="50%"
                                                        cy="50%"
                                                        innerRadius={45}
                                                        outerRadius={65}
                                                        paddingAngle={5}
                                                        dataKey="value"
                                                    >
                                                        <Cell fill="#3B82F6" />
                                                        <Cell fill="#8B5CF6" />
                                                    </Pie>
                                                    <Tooltip />
                                                    <Legend wrapperStyle={{ fontSize: '9px' }} />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                    )}
                                    <p className="text-[10px] text-center text-gray-400 mt-4 px-4">
                                        Basado en pedidos realizados en los últimos 30 días.
                                    </p>
                                </div>
                            </div>

                            {/* Category Performance */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                                <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2 text-sm">
                                    <Activity size={16} className="text-red-500" />
                                    Performance por Categoría (30d)
                                </h3>
                                {loading ? (
                                    <div className="h-48 bg-gray-50 rounded animate-pulse"></div>
                                ) : (
                                    <div className="h-48">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={stats?.categoryStats}>
                                                <CartesianGrid
                                                    strokeDasharray="3 3"
                                                    vertical={false}
                                                    stroke="#f0f0f0"
                                                />
                                                <XAxis
                                                    dataKey="name"
                                                    fontSize={9}
                                                    axisLine={false}
                                                    tickLine={false}
                                                    tickFormatter={str =>
                                                        str.length > 10
                                                            ? str.substring(0, 8) + '..'
                                                            : str
                                                    }
                                                />
                                                <YAxis
                                                    yAxisId="left"
                                                    fontSize={9}
                                                    axisLine={false}
                                                    tickLine={false}
                                                    tickFormatter={val => `${val}€`}
                                                />
                                                <YAxis
                                                    yAxisId="right"
                                                    orientation="right"
                                                    fontSize={9}
                                                    axisLine={false}
                                                    tickLine={false}
                                                    tickFormatter={val => `${val}€`}
                                                />
                                                <Tooltip />
                                                <Legend wrapperStyle={{ fontSize: '9px' }} />
                                                <Bar
                                                    yAxisId="left"
                                                    name="Ventas"
                                                    dataKey="revenue"
                                                    fill="#3B82F6"
                                                    radius={[4, 4, 0, 0]}
                                                    barSize={20}
                                                />
                                                <Bar
                                                    yAxisId="right"
                                                    name="Ticket"
                                                    dataKey="avgPrice"
                                                    fill="#F59E0B"
                                                    radius={[4, 4, 0, 0]}
                                                    barSize={20}
                                                />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'menu' && <AdminMenu />}
                    {activeTab === 'users' && <AdminUsers />}
                    {activeTab === 'orders' && <AdminOrders />}
                    {activeTab === 'settings' && <AdminSettings />}
                    {activeTab === 'promos' && <AdminPromos />}
                    {activeTab === 'blog' && <AdminBlog />}
                </div>
            </main >
        </div >
    );
}
