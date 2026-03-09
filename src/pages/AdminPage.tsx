import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
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
    Monitor,
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

type TabId =
    | 'dashboard'
    | 'orders'
    | 'menu'
    | 'users'
    | 'promos'
    | 'blog'
    | 'settings'
    | 'analytics';

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

    // Global Sound & Pending Orders Monitoring
    const [isSoundEnabled, setIsSoundEnabled] = useState(false);
    const [pendingCount, setPendingCount] = useState(0);
    const pendingReminders = useRef<Map<number, number>>(new Map());
    const isFirstLoad = useRef(true);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const navLinks = useMemo(
        () => [
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'analytics', label: 'Analítica Avanzada', icon: BarChart3 },
            {
                id: 'orders',
                label: 'Gestión de Pedidos', // Renaming happens in the component tab, this is sidebar
                icon: Package,
                badge: pendingCount > 0 ? pendingCount : null,
            },
            { id: 'menu', label: 'Gestión de Menú', icon: MenuIcon },
            { id: 'users', label: 'Usuarios y Clientes', icon: Users },
            { id: 'promos', label: 'Gestión de Promociones', icon: ShoppingBag },
            { id: 'blog', label: 'Gestión de Blog', icon: Activity },
            { id: 'settings', label: 'Ajustes de Contacto', icon: DollarSign },
        ],
        [pendingCount]
    );

    const checkGlobalOrders = async () => {
        try {
            // Fetch all pending orders for global alert
            const data = await api.get('/admin/orders?status=pending&limit=100');
            const pendingOrders = data.orders || [];
            const totalPending = data.pagination?.total || pendingOrders.length;
            setPendingCount(totalPending);

            if (isSoundEnabled) {
                let shouldPlaySound = false;
                const now = Date.now();

                pendingOrders.forEach((order: any) => {
                    const lastNotified = pendingReminders.current.get(order.id);
                    if (!lastNotified) {
                        if (!isFirstLoad.current) shouldPlaySound = true;
                        pendingReminders.current.set(order.id, now);
                    } else if (now - lastNotified >= 120000) {
                        shouldPlaySound = true;
                        pendingReminders.current.set(order.id, now);
                    }
                });

                // Cleanup
                const pendingIds = new Set(pendingOrders.map((o: any) => o.id));
                for (const id of pendingReminders.current.keys()) {
                    if (!pendingIds.has(id)) pendingReminders.current.delete(id);
                }

                if (shouldPlaySound && audioRef.current) {
                    audioRef.current.play().catch(e => console.error('Sound alert failed:', e));
                }
            } else {
                pendingOrders.forEach((order: any) => {
                    if (!pendingReminders.current.has(order.id)) {
                        pendingReminders.current.set(order.id, Date.now());
                    }
                });
            }
            isFirstLoad.current = false;
        } catch (err) {
            console.error('Global orders check failed', err);
        }
    };

    useEffect(() => {
        checkGlobalOrders();
        const interval = setInterval(checkGlobalOrders, 30000);
        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isSoundEnabled]);

    // Authorization Check
    useEffect(() => {
        if (isAuthenticated && user && user.role !== 'admin' && !user.is_superadmin) {
            navigate('/profile'); // Redirect normal users away
        }
    }, [isAuthenticated, user, navigate]);

    useEffect(() => {
        const authorized = user?.role === 'admin' || user?.is_superadmin;
        const needsStats = activeTab === 'dashboard' || activeTab === 'analytics';

        if (authorized && needsStats) {
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
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl shadow-xl p-10 max-w-md w-full text-center border border-gray-100">
                    <div className="w-20 h-20 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <ShieldCheck size={40} />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 mb-2">Acceso Restringido</h2>
                    <p className="text-gray-500 mb-8 font-medium">
                        Lo sentimos, pero necesitas permisos de administrador para ver esta página.
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

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
            <audio
                ref={audioRef}
                src="https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3"
                preload="auto"
            />
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
                                onClick={() => {
                                    setActiveTab(tab.id as TabId);
                                    if (typeof navigator !== 'undefined' && navigator.vibrate) {
                                        navigator.vibrate(5);
                                    }
                                }}
                                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium text-sm transition-colors relative group
                                    ${isActive
                                        ? 'text-red-700'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="admin-nav-active"
                                        className="absolute inset-0 bg-red-50 rounded-xl"
                                        transition={{
                                            type: 'spring',
                                            bounce: 0.2,
                                            duration: 0.6,
                                        }}
                                    />
                                )}
                                <div className="flex items-center gap-3 relative z-10">
                                    <Icon
                                        size={18}
                                        className={isActive ? 'text-red-600' : 'text-gray-400'}
                                    />
                                    {tab.label}
                                    {(tab as any).badge && (
                                        <span className="ml-auto bg-red-600 text-white text-[10px] h-5 w-5 flex items-center justify-center rounded-full font-bold animate-pulse">
                                            {(tab as any).badge}
                                        </span>
                                    )}
                                </div>
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
                                            'Aquí gestionas los pedidos. Consejo: Preста atención a los pedidos con estado "Pendiente". Puedes cambiar su estado a "Preparando" para que el cliente sepa que ya estás en ello, y luego a "En camino" o "Entregado".'}
                                        {activeTab === 'menu' &&
                                            'Desde aquí puedes añadir nuevos platos, cambiar precios o marcar platos con promociones. Si un plato se agota, puedes ocultarlo temporalmente para que los clientes no puedan pedirlo.'}
                                        {activeTab === 'users' &&
                                            'Este es el directorio de tus clientes. Puedes ver quiénes son tus mejores compradores и analizar su historial de pedidos.'}
                                        {activeTab === 'promos' &&
                                            'Gestiona tus ofertas estáticas aquí. Crea banners promocionales con diferentes colores, iconos и ofertas.'}
                                        {activeTab === 'blog' &&
                                            'Maneja tu blog aquí. Crea artículos nuevos, edita los existentes o cambia su estado de publicación.'}
                                        {activeTab === 'analytics' &&
                                            'Este es tu centro de inteligencia. Aquí puedes ver qué dispositivos usan más tus clientes (móviles vs ordenador), a qué horas prefieren pedir и qué días de la semana tienes más trabajo. Úsalo para planificar turnos de personal o lanzar promociones en horas bajas.'}
                                        {activeTab === 'settings' &&
                                            'Personaliza cómo te contactan tus clientes. Cambia tus teléfonos, emails и redes sociales en un solo lugar.'}
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
                                        {[1, 2, 3, 4, 5].map(i => (
                                            <div
                                                key={i}
                                                className="h-10 bg-gray-50 rounded animate-pulse"
                                            ></div>
                                        ))}
                                    </div>
                                ) : !reports?.length ? (
                                    <div className="text-center py-12">
                                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <RefreshCw className="text-gray-300" size={32} />
                                        </div>
                                        <p className="text-gray-500">
                                            No hay reportes disponibles todavía.
                                        </p>
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
                                                    <th className="px-4 py-3 pb-4 text-right">
                                                        Detalles
                                                    </th>
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
                                                                        {new Date(
                                                                            report.date
                                                                        ).toLocaleDateString(
                                                                            'es-ES',
                                                                            {
                                                                                month: 'short',
                                                                            }
                                                                        )}
                                                                    </span>
                                                                    <span className="text-sm font-black text-gray-900 leading-none">
                                                                        {new Date(
                                                                            report.date
                                                                        ).getDate()}
                                                                    </span>
                                                                </div>
                                                                <span className="text-xs font-bold text-gray-700 capitalize">
                                                                    {new Date(
                                                                        report.date
                                                                    ).toLocaleDateString('es-ES', {
                                                                        weekday: 'long',
                                                                    })}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-4">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-sm font-black text-gray-900">
                                                                    {report.order_count}
                                                                </span>
                                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                                                    pedidos
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-4">
                                                            <span className="text-sm font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-lg border border-green-100/50">
                                                                {Number(report.total_revenue)
                                                                    .toFixed(2)
                                                                    .replace('.', ',')}{' '}
                                                                €
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-4">
                                                            <span className="text-xs font-bold text-gray-600">
                                                                {Number(report.average_ticket)
                                                                    .toFixed(2)
                                                                    .replace('.', ',')}{' '}
                                                                €
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-4 text-right">
                                                            <ChevronRight
                                                                size={16}
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
                    )}

                    {activeTab === 'analytics' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
                            <h2 className="text-lg font-bold text-gray-900">Analítica Avanzada</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {/* Device Distribution */}
                                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                                    <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2 text-sm">
                                        <Monitor size={16} className="text-blue-500" />
                                        Dispositivo Principal (30d)
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
                                                                name: 'Móvil',
                                                                value:
                                                                    stats?.deviceStats?.mobile || 0,
                                                            },
                                                            {
                                                                name: 'Escritorio',
                                                                value:
                                                                    stats?.deviceStats?.desktop ||
                                                                    0,
                                                            },
                                                            {
                                                                name: 'Tablet',
                                                                value:
                                                                    stats?.deviceStats?.tablet || 0,
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
                                                        <Cell fill="#10B981" />
                                                        <Cell fill="#F59E0B" />
                                                    </Pie>
                                                    <Tooltip />
                                                    <Legend wrapperStyle={{ fontSize: '9px' }} />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                    )}
                                </div>

                                {/* Customer Retention */}
                                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                                    <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2 text-sm">
                                        <Users size={16} className="text-purple-500" />
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
                        </div>
                    )}

                    {activeTab === 'menu' && <AdminMenu />}
                    {activeTab === 'users' && <AdminUsers />}
                    {activeTab === 'orders' && (
                        <AdminOrders
                            isGlobalSoundEnabled={isSoundEnabled}
                            setIsGlobalSoundEnabled={setIsSoundEnabled}
                            globalPendingCount={pendingCount}
                        />
                    )}
                    {activeTab === 'settings' && <AdminSettings />}
                    {activeTab === 'promos' && <AdminPromos />}
                    {activeTab === 'blog' && <AdminBlog />}
                </div>
            </main>
        </div>
    );
}
