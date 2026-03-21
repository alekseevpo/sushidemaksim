import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
    LayoutDashboard,
    Package,
    Users,
    Menu as MenuIcon,
    HelpCircle,
    ShoppingBag,
    DollarSign,
    Activity,
    X,
    ArrowLeft,
    BarChart3,
    Heart,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { api } from '../utils/api';
import AdminMenu from '../components/admin/AdminMenu';
import AdminUsers from '../components/admin/AdminUsers';
import AdminOrders from '../components/admin/AdminOrders';
import AdminPromos from '../components/admin/AdminPromos';
import AdminBlog from '../components/admin/AdminBlog';
import AdminSettings from '../components/admin/AdminSettings';
import AdminDashboard from '../components/admin/AdminDashboard';
import AdminAnalytics from '../components/admin/AdminAnalytics';
import AdminDeliveryZones from '../components/admin/AdminDeliveryZones';
import { AdminSkeleton } from '../components/skeletons/AdminSkeleton';
import { Map as MapIcon } from 'lucide-react';

type TabId =
    | 'dashboard'
    | 'orders'
    | 'menu'
    | 'users'
    | 'promos'
    | 'blog'
    | 'settings'
    | 'analytics'
    | 'delivery';

export default function AdminPage() {
    const { user, isAuthenticated, isLoading } = useAuth();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = (searchParams.get('tab') as TabId) || 'dashboard';

    const setActiveTab = (tab: TabId) => {
        setSearchParams({ tab });
    };

    const [showHelp, setShowHelp] = useState(true);

    // Global Sound & Pending Orders Monitoring
    const [isSoundEnabled, setIsSoundEnabled] = useState(() => {
        const saved = localStorage.getItem('admin_sound_enabled');
        return saved === null ? true : saved === 'true';
    });

    useEffect(() => {
        localStorage.setItem('admin_sound_enabled', String(isSoundEnabled));
    }, [isSoundEnabled]);
    const pendingReminders = useRef<Map<number, number>>(new Map());
    const isFirstLoad = useRef(true);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Stats Query
    const {
        data: stats,
        isLoading: statsLoading,
        refetch: refetchStats,
    } = useQuery({
        queryKey: ['admin-stats'],
        queryFn: () => api.get('/admin/stats'),
        enabled:
            isAuthenticated &&
            (user?.role === 'admin' || user?.is_superadmin) &&
            (activeTab === 'dashboard' || activeTab === 'analytics'),
        refetchInterval: 60000,
    });

    // Reports Query
    const {
        data: reports,
        isLoading: reportsLoading,
        refetch: refetchReports,
    } = useQuery({
        queryKey: ['admin-reports'],
        queryFn: () => api.get('/admin/reports'),
        enabled:
            isAuthenticated &&
            (user?.role === 'admin' || user?.is_superadmin) &&
            activeTab === 'dashboard',
        refetchInterval: 60000,
    });

    // Pending Orders Query (Global Monitoring)
    const { data: pendingData } = useQuery({
        queryKey: ['admin-pending-monitor'],
        queryFn: () => api.get('/admin/orders?status=pending&limit=100'),
        enabled: isAuthenticated && (user?.role === 'admin' || user?.is_superadmin),
        refetchInterval: 30000,
    });

    const pendingOrders = useMemo(() => pendingData?.orders || [], [pendingData]);
    const pendingCount = pendingData?.pagination?.total || pendingOrders.length;

    // Audio Alert Effect
    useEffect(() => {
        if (!pendingOrders.length) {
            // Cleanup reminders if no pending orders
            if (pendingReminders.current.size > 0) {
                pendingReminders.current.clear();
            }
            isFirstLoad.current = false;
            return;
        }

        let shouldPlaySound = false;
        const now = Date.now();

        pendingOrders.forEach((order: any) => {
            const lastNotified = pendingReminders.current.get(order.id);
            if (!lastNotified) {
                if (!isFirstLoad.current && isSoundEnabled) shouldPlaySound = true;
                pendingReminders.current.set(order.id, now);
            } else if (now - lastNotified >= 120000) {
                if (isSoundEnabled) shouldPlaySound = true;
                pendingReminders.current.set(order.id, now);
            }
        });

        // Cleanup stale reminders
        const pendingIds = new Set(pendingOrders.map((o: any) => o.id));
        for (const id of pendingReminders.current.keys()) {
            if (!pendingIds.has(id)) pendingReminders.current.delete(id);
        }

        if (shouldPlaySound && audioRef.current) {
            audioRef.current.play().catch(e => console.error('Sound alert failed:', e));
        }

        isFirstLoad.current = false;
    }, [pendingOrders, isSoundEnabled]);

    const navLinks = useMemo(
        () => [
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'analytics', label: 'Analítica Avanzada', icon: BarChart3 },
            {
                id: 'orders',
                label: 'Gestión de Pedidos',
                icon: Package,
                badge: pendingCount > 0 ? pendingCount : null,
            },
            { id: 'menu', label: 'Gestión de Menú', icon: MenuIcon },
            { id: 'users', label: 'Usuarios y Clientes', icon: Users },
            { id: 'promos', label: 'Gestión de Promociones', icon: ShoppingBag },
            { id: 'blog', label: 'Gestión de Blog', icon: Activity },
            { id: 'settings', label: 'Ajustes de Contacto', icon: DollarSign },
            { id: 'delivery', label: 'Zonas de Entrega', icon: MapIcon },
        ],
        [pendingCount]
    );

    // Authorization Check
    useEffect(() => {
        if (!isLoading && isAuthenticated && user && user.role !== 'admin' && !user.is_superadmin) {
            navigate('/profile');
        }
    }, [isLoading, isAuthenticated, user, navigate]);

    const handleRefetchStats = async (isPolling?: boolean) => {
        if (!isPolling) {
            await Promise.all([refetchStats(), refetchReports()]);
        }
    };

    // While waiting for auth status, show the skeleton to prevent layout shift and "restricted" flash
    if (isLoading) {
        return <AdminSkeleton />;
    }

    if (!isAuthenticated || (user?.role !== 'admin' && !user?.is_superadmin)) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl shadow-xl p-10 max-w-md w-full text-center border border-gray-100">
                    <div className="w-24 h-24 bg-red-600 rounded-3xl shrink-0 flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-red-900/20">
                        <img
                            src="/logo-icon.svg"
                            alt="Logo"
                            className="w-14 h-auto brightness-0 invert"
                        />
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
                <div className="p-6 border-b border-gray-100 flex items-center gap-4">
                    <div className="bg-red-600 w-11 h-11 min-w-[44px] flex items-center justify-center rounded-xl shadow-lg shadow-red-900/10 shrink-0">
                        <img
                            src="/logo-icon.svg"
                            alt="Logo"
                            className="w-7 h-auto brightness-0 invert"
                        />
                    </div>
                    <div>
                        <h2 className="font-black text-gray-900 leading-tight text-lg tracking-tight">Admin</h2>
                        <p className="text-[10px] text-red-500 font-black uppercase tracking-widest">
                            Sushi de Maksim
                        </p>
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
                                    ${
                                        isActive
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
                                        strokeWidth={1.5}
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
                        <ArrowLeft size={16} strokeWidth={1.5} />
                        Volver a la tienda
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:ml-64 p-3 md:p-6 flex flex-col min-h-screen">
                <div className="w-full flex-1 flex flex-col">
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
                                <HelpCircle size={18} strokeWidth={1.5} />
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
                                <X size={20} strokeWidth={1.5} />
                            </button>
                            <div className="flex gap-4">
                                <div className="mt-1">
                                    <HelpCircle
                                        className="text-blue-500"
                                        size={24}
                                        strokeWidth={1.5}
                                    />
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
                                        {activeTab === 'analytics' &&
                                            'Este es tu centro de inteligencia. Aquí puedes ver qué dispositivos usan más tus clientes (móviles vs ordenador), a qué horas prefieren pedir y qué días de la semana tienes más trabajo. Úsalo para planificar turnos de personal o lanzar promociones en horas bajas.'}
                                        {activeTab === 'settings' &&
                                            'Personaliza cómo te contactan tus clientes. Cambia tus teléfonos, emails y redes sociales en un solo lugar.'}
                                        {activeTab === 'delivery' &&
                                            'Dibuja tus zonas de entrega en el mapa. Puedes definir diferentes precios y pedidos mínimos para cada zona.'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tab Contents */}
                    {activeTab === 'dashboard' && (
                        <AdminDashboard
                            stats={stats}
                            reports={reports}
                            loading={statsLoading || reportsLoading}
                            loadStats={handleRefetchStats}
                            setActiveTab={setActiveTab}
                        />
                    )}

                    {activeTab === 'analytics' && (
                        <AdminAnalytics stats={stats} loading={statsLoading} />
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
                    {activeTab === 'delivery' && <AdminDeliveryZones />}
                    {activeTab === 'promos' && <AdminPromos />}
                    {activeTab === 'blog' && <AdminBlog />}

                    {/* Developer Footer */}
                    <footer className="mt-auto py-8 border-t border-gray-100">
                        <p className="text-gray-400 text-[10px] md:text-xs font-medium flex items-center justify-center gap-1.5 flex-wrap text-center">
                            Desarrollado con{' '}
                            <Heart size={12} className="text-red-500 fill-current" /> por{' '}
                            <span className="text-gray-600">SelenIT / alekseevpo@gmail.com</span> en
                            2026. Todos los derechos reservados.
                        </p>
                    </footer>
                </div>
            </main>
        </div>
    );
}
