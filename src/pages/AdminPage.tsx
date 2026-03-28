import { useState, useEffect, useRef, useMemo, lazy, Suspense } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
    CalendarDays,
    ShoppingCart,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { api } from '../utils/api';
const AdminMenu = lazy(() => import('../components/admin/AdminMenu'));
const AdminUsers = lazy(() => import('../components/admin/AdminUsers'));
const AdminOrders = lazy(() => import('../components/admin/AdminOrders'));
const AdminPromos = lazy(() => import('../components/admin/AdminPromos'));
const AdminBlog = lazy(() => import('../components/admin/AdminBlog'));
const AdminSettings = lazy(() => import('../components/admin/AdminSettings'));
const AdminDashboard = lazy(() => import('../components/admin/AdminDashboard'));
const AdminAnalytics = lazy(() => import('../components/admin/AdminAnalytics'));
const AdminAbandonedCarts = lazy(() => import('../components/admin/AdminAbandonedCarts'));
const AdminDeliveryZones = lazy(() => import('../components/admin/AdminDeliveryZones'));
const AdminReservations = lazy(() => import('../components/admin/AdminReservations'));
import { AdminSkeleton, AdminContentSkeleton } from '../components/skeletons/AdminSkeleton';
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
    | 'abandoned'
    | 'delivery'
    | 'reservations';

export type AdminLanguage = 'ru' | 'es';

export const ADMIN_TRANSLATIONS = {
    ru: {
        nav: {
            dashboard: 'Дашборд',
            analytics: 'Продвинутая аналитика',
            abandoned: 'Брошенные корзины',
            orders: 'Управление заказами',
            menu: 'Управление меню',
            users: 'Пользователи и клиенты',
            promos: 'Управление акциями',
            blog: 'Управление блогом',
            settings: 'Настройки контактов',
            reservations: 'Бронирование столов',
            delivery: 'Зоны доставки',
        },
        ui: {
            backToShop: 'В ресторан',
            hideHelp: 'Скрыть подсказки',
            showHelp: 'Показать подсказки',
            welcome: 'Добро пожаловать в панель администратора!',
            restricted: 'Доступ ограничен',
            restrictedDesc:
                'Извините, но для просмотра этой страницы требуются права администратора.',
            backToHome: 'Вернуться на главную',
            developedBy: 'Разработано с',
            by: 'от',
            rights: 'Все права защищены.',
        },
        help: {
            dashboard:
                'Это ваш главный экран. Здесь вы увидите краткий обзор состояния вашего бизнеса: сколько денег вы заработали сегодня, сколько заказов ожидают обработки и общие тенденции.',
            orders: 'Здесь вы управляете заказами. Совет: обращайте внимание на заказы со статусом "В ожидании". Вы можете изменить их статус на "Готовится", "В пути" или "Доставлен".',
            menu: 'Отсюда вы можете добавлять новые блюда, менять цены или помечать блюда акциями. Если блюдо закончилось, вы можете временно скрыть его.',
            users: 'Это справочник ваших клиентов. Вы можете видеть, кто ваши лучшие покупатели, и анализировать их историю заказов.',
            promos: 'Управляйте вашими статическими предложениями здесь. Создавайте рекламные баннеры с разными цветами и иконками.',
            blog: 'Управляйте своим блогом здесь. Создавайте новые статьи, редактируйте существующие или меняйте статус их публикации.',
            analytics:
                'Это ваш интеллектуальный центр. Здесь вы можете увидеть, какие устройства используют клиенты, в какое время они заказывают и пиковые нагрузки.',
            abandoned:
                'Возвращайте потерянные продажи. Здесь вы увидите клиентов, которые не завершили заказ. Попробуйте написать им в WhatsApp!',
            settings:
                'Настройте контакты: меняйте свои телефоны, электронную почту и социальные сети в одном месте.',
            delivery:
                'Нарисуйте свои зоны доставки на карте. Вы можете определить разные цены и минимальные суммы заказа.',
            reservations:
                'Управляйте бронированием столиков. Просматривайте входящие запросы и подтверждайте их.',
        },
    },
    es: {
        nav: {
            dashboard: 'Dashboard',
            analytics: 'Analítica Avanzada',
            abandoned: 'Carritos Abandonados',
            orders: 'Gestión de Pedidos',
            menu: 'Gestión de Menú',
            users: 'Usuarios y Clientes',
            promos: 'Gestión de Promociones',
            blog: 'Gestión de Blog',
            settings: 'Ajustes de Contacto',
            reservations: 'Reservas de Mesas',
            delivery: 'Zonas de Entrega',
        },
        ui: {
            backToShop: 'Al restaurante',
            hideHelp: 'Ocultar ayudas',
            showHelp: 'Mostrar ayudas',
            welcome: '¡Bienvenido al Panel de Administración!',
            restricted: 'Acceso Restringido',
            restrictedDesc:
                'Lo sentimos, pero necesitas permisos de administrador para ver esta página.',
            backToHome: 'Volver al inicio',
            developedBy: 'Desarrollado con',
            by: 'por',
            rights: 'Todos los derechos reservados.',
        },
        help: {
            dashboard:
                'Esta es tu pantalla principal. Aquí verás un resumen rápido del estado de tu negocio: cuánto dinero has ganado hoy, cuántos pedidos están pendientes y las tendencias generales.',
            orders: 'Aquí gestionas los pedidos. Consejo: Presta atención a los pedidos con estado "Pendiente". Puedes cambiar su estado a "Preparando", "En camino" o "Entregado".',
            menu: 'Desde aquí puedes añadir nuevos platos, cambiar precios o marcar platos con promociones. Si un plato se agota, puedes ocultarlo temporalmente.',
            users: 'Este es el directorio de tus clientes. Puedes ver quiénes son tus mejores compradores y analizar su historial de pedidos.',
            promos: 'Gestiona tus ofertas estáticas aquí. Crea banners promocionales con diferentes colores, iconos y ofertas.',
            blog: 'Maneja tu blog aquí. Crea artículos nuevos, edita los existentes o cambia su estado de publicación.',
            analytics:
                'Este es tu centro de inteligencia. Aquí puedes ver qué dispositivos usan más tus clientes, a qué horas prefieren pedir y qué días de la semana tienes más trabajo.',
            abandoned:
                'Recupera ventas perdidas. Aquí verás clientes que añadieron platos al carrito pero no terminaron el pedido. ¡Pruéba a escribirles por WhatsApp!',
            settings:
                'Personaliza cómo te contactan tus clientes. Cambia tus teléfonos, emails y redes sociales en un solo lugar.',
            delivery:
                'Dibuja tus zonas de entrega en el mapa. Puedes definir diferentes precios y pedidos mínimos para cada zona.',
            reservations:
                'Gestiona las reservas de mesa. Revisa las solicitudes entrantes y confírmalas.',
        },
    },
} as const;

export default function AdminPage() {
    const { user, isAuthenticated, isLoading } = useAuth();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = (searchParams.get('tab') as TabId) || 'dashboard';

    // Language State
    const [language, setLanguage] = useState<AdminLanguage>(() => {
        const saved = localStorage.getItem('admin_language');
        return (saved as AdminLanguage) || 'ru';
    });

    useEffect(() => {
        localStorage.setItem('admin_language', language);
    }, [language]);

    const t = ADMIN_TRANSLATIONS[language];

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
            (user?.role === 'admin' || user?.isSuperadmin) &&
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
            (user?.role === 'admin' || user?.isSuperadmin) &&
            activeTab === 'dashboard',
        refetchInterval: 60000,
    });

    // Pending Orders Query (Global Monitoring)
    const { data: pendingData } = useQuery({
        queryKey: ['admin-pending-monitor'],
        queryFn: () => api.get('/admin/orders?status=pending&limit=100'),
        enabled: isAuthenticated && (user?.role === 'admin' || user?.isSuperadmin),
        refetchInterval: 30000,
    });

    // Pending Reservations Query
    const { data: pendingResData } = useQuery({
        queryKey: ['admin-pending-res-monitor'],
        queryFn: () => api.get('/admin/reservations?status=pending'),
        enabled: isAuthenticated && (user?.role === 'admin' || user?.isSuperadmin),
        refetchInterval: 60000,
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
            { id: 'dashboard', label: t.nav.dashboard, icon: LayoutDashboard },
            { id: 'analytics', label: t.nav.analytics, icon: BarChart3 },
            { id: 'abandoned', label: t.nav.abandoned, icon: ShoppingCart },
            {
                id: 'orders',
                label: t.nav.orders,
                icon: Package,
                badge: pendingCount > 0 ? pendingCount : null,
            },
            { id: 'menu', label: t.nav.menu, icon: MenuIcon },
            { id: 'users', label: t.nav.users, icon: Users },
            { id: 'promos', label: t.nav.promos, icon: ShoppingBag },
            { id: 'blog', label: t.nav.blog, icon: Activity },
            { id: 'settings', label: t.nav.settings, icon: DollarSign },
            {
                id: 'reservations',
                label: t.nav.reservations,
                icon: CalendarDays,
                badge: pendingResData?.total > 0 ? pendingResData.total : null,
            },
            { id: 'delivery', label: t.nav.delivery, icon: MapIcon },
        ],
        [pendingCount, pendingResData?.total, t]
    );

    // Authorization Check
    useEffect(() => {
        if (!isLoading && isAuthenticated && user) {
            if (user.role === 'waiter') {
                navigate('/waiter');
            } else if (user.role !== 'admin' && !user.isSuperadmin) {
                navigate('/profile');
            }
        }
    }, [isLoading, isAuthenticated, user, navigate]);

    const handleRefetchStats = async (isPolling?: boolean) => {
        if (!isPolling) {
            await Promise.all([refetchStats(), refetchReports()]);
        }
    };

    // While waiting for auth status, show the skeleton to prevent layout shift and "restricted" flash
    const hasToken = typeof window !== 'undefined' && !!localStorage.getItem('sushi_token');
    if (isLoading || (hasToken && !user)) {
        return <AdminSkeleton />;
    }

    if (!isAuthenticated || (user?.role !== 'admin' && !user?.isSuperadmin)) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl shadow-xl p-10 max-w-md w-full text-center border border-gray-100">
                    <div className="shrink-0 flex items-center justify-center mx-auto mb-10 overflow-hidden">
                        <img
                            src="/logo.svg"
                            alt="Sushi de Maksim"
                            className="h-14 w-auto object-contain"
                        />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 mb-2">{t.ui.restricted}</h2>
                    <p className="text-gray-500 mb-8 font-medium">{t.ui.restrictedDesc}</p>
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
                        {t.ui.backToHome}
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
            <aside className="w-full md:w-72 bg-white border-r border-gray-200 flex flex-col md:fixed h-full z-10 transition-all duration-300">
                <div className="p-6 border-b border-gray-100">
                    <div className="flex flex-col gap-3">
                        <img
                            src="/logo.svg"
                            alt="Sushi de Maksim"
                            className="h-10 w-auto object-contain brightness-0"
                        />
                    </div>
                </div>
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto no-scrollbar">
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
                                className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl font-bold text-sm transition-all relative group
                                    ${
                                        isActive
                                            ? 'text-red-700 bg-red-50/50'
                                            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
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
                                <div className="flex items-center gap-3.5 relative z-10 w-full">
                                    <Icon
                                        size={20}
                                        strokeWidth={isActive ? 2.5 : 2}
                                        className={`shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-red-600' : 'text-gray-400'}`}
                                    />
                                    <span className="flex-1 text-left leading-[1.2] py-0.5">
                                        {tab.label}
                                    </span>
                                    {(tab as any).badge && (
                                        <span className="ml-auto bg-red-600 text-white text-[10px] h-5 w-5 flex items-center justify-center rounded-full font-bold animate-pulse shadow-sm border border-white">
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
                        className="w-full flex items-center justify-center gap-2 px-4 py-4 bg-gray-50 text-gray-700 hover:bg-gray-900 hover:text-white rounded-xl font-black text-xs md:text-sm transition-all border border-gray-200 active:scale-[0.98]"
                    >
                        <ArrowLeft size={16} strokeWidth={2} />
                        {t.ui.backToShop}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:ml-72 p-3 md:p-6 flex flex-col min-h-screen">
                <div className="w-full flex-1 flex flex-col">
                    {/* Top Bar */}
                    <div className="flex justify-between items-center mb-10 pb-4 border-b border-gray-100">
                        <h1 className="text-2xl font-black text-gray-900 flex items-center gap-3 group">
                            <div className="w-2 h-8 bg-red-600 rounded-full group-hover:h-10 transition-all duration-300" />
                            {navLinks.find(t_link => t_link.id === activeTab)?.label}
                        </h1>
                        <div className="flex items-center gap-2 md:gap-4">
                            {/* Language Switcher */}
                            <div className="flex p-1 bg-gray-100 rounded-xl border border-gray-200 shadow-inner">
                                <button
                                    onClick={() => setLanguage('ru')}
                                    className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all ${
                                        language === 'ru'
                                            ? 'bg-white text-red-600 shadow-md transform scale-105'
                                            : 'text-gray-400 hover:text-gray-600'
                                    }`}
                                >
                                    RU
                                </button>
                                <button
                                    onClick={() => setLanguage('es')}
                                    className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all ${
                                        language === 'es'
                                            ? 'bg-white text-red-600 shadow-md transform scale-105'
                                            : 'text-gray-400 hover:text-gray-600'
                                    }`}
                                >
                                    ES
                                </button>
                            </div>

                            <button
                                onClick={() => setShowHelp(!showHelp)}
                                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:text-blue-600 font-bold transition-all bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md active:scale-95"
                            >
                                <HelpCircle size={18} strokeWidth={2} />
                                <span className="hidden md:inline uppercase tracking-tight text-[11px]">
                                    {showHelp ? t.ui.hideHelp : t.ui.showHelp}
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* Interactive Help Banner */}
                    <AnimatePresence>
                        {showHelp && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: -20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                                className="mb-8 bg-blue-50/50 border border-blue-100 rounded-2xl p-6 relative backdrop-blur-sm"
                            >
                                <button
                                    onClick={() => setShowHelp(false)}
                                    className="absolute top-4 right-4 text-blue-300 hover:text-blue-600 transition-colors p-1"
                                >
                                    <X size={20} strokeWidth={2} />
                                </button>
                                <div className="flex gap-5">
                                    <div className="mt-1">
                                        <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center shadow-inner">
                                            <HelpCircle size={26} strokeWidth={2} />
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-black text-blue-900 mb-1.5 text-lg">
                                            {t.ui.welcome}
                                        </h3>
                                        <p className="text-blue-700/80 text-sm font-medium leading-relaxed max-w-4xl">
                                            {(t.help as any)[activeTab]}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Tab Contents */}
                    <Suspense fallback={<AdminContentSkeleton />}>
                        {activeTab === 'dashboard' && (
                            <AdminDashboard
                                stats={stats}
                                reports={reports}
                                loading={statsLoading || reportsLoading}
                                loadStats={handleRefetchStats}
                                setActiveTab={setActiveTab}
                                language={language}
                            />
                        )}

                        {activeTab === 'analytics' && (
                            <AdminAnalytics
                                stats={stats}
                                loading={statsLoading}
                                language={language}
                            />
                        )}

                        {activeTab === 'abandoned' && <AdminAbandonedCarts language={language} />}

                        {activeTab === 'menu' && <AdminMenu language={language} />}
                        {activeTab === 'users' && <AdminUsers language={language} />}
                        {activeTab === 'orders' && (
                            <AdminOrders
                                isGlobalSoundEnabled={isSoundEnabled}
                                setIsGlobalSoundEnabled={setIsSoundEnabled}
                                globalPendingCount={pendingCount}
                                language={language}
                            />
                        )}
                        {activeTab === 'settings' && <AdminSettings language={language} />}
                        {activeTab === 'delivery' && <AdminDeliveryZones language={language} />}
                        {activeTab === 'promos' && <AdminPromos language={language} />}
                        {activeTab === 'blog' && <AdminBlog language={language} />}
                        {activeTab === 'reservations' && <AdminReservations language={language} />}
                    </Suspense>

                    {/* Developer Footer */}
                    <footer className="mt-auto py-10 border-t border-gray-100">
                        <p className="text-gray-400 text-[10px] md:text-[11px] font-bold flex items-center justify-center gap-2 flex-wrap text-center uppercase tracking-widest">
                            {t.ui.developedBy}{' '}
                            <Heart size={14} className="text-red-500 fill-current animate-pulse" />{' '}
                            {t.ui.by}{' '}
                            <span className="text-gray-700 font-black">
                                SelenIT / alekseevpo@gmail.com
                            </span>{' '}
                            — 2026. {t.ui.rights}
                        </p>
                    </footer>
                </div>
            </main>
        </div>
    );
}
