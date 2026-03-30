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
    HelpCircle,
    Info,
    X,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';

interface AdminDashboardProps {
    stats: any;
    reports: any[];
    loading: boolean;
    loadStats: (isPolling?: boolean) => Promise<void>;
    setActiveTab: (tab: any) => void;
    language?: 'ru' | 'es';
}

const DASHBOARD_TRANSLATIONS = {
    ru: {
        summary: 'Сводка за сегодня',
        viewStore: 'В ресторан',
        refresh: 'Обновить',
        storeParams: 'Параметры заведения',
        storeClosed: 'Заведение закрыто',
        storeOpen: 'Заведение открыто',
        openStore: 'ОТКРЫТЬ ЗАВЕДЕНИЕ',
        closeStore: 'ЗАКРЫТЬ (ЭКСТРЕННО)',
        deliveryTime: 'Время доставки',
        edit: 'ИЗМЕНИТЬ',
        emergencyTitle: 'Внимание! Кухня на паузе',
        emergencyDesc: 'Клиенты увидят сообщение о закрытии и не смогут оформить заказ.',
        activateNow: 'ВКЛЮЧИТЬ ЗАВЕДЕНИЕ',
        stats: {
            revenue: 'Выручка за сегодня',
            missed: 'Упущенная выручка',
            newOrders: 'Новые заказы',
            pending: 'Ожидающие',
            newUsers: 'Новые клиенты',
            revenueDesc: 'Всего получено (Мадрид)',
            missedDesc: 'Заказы в корзинах',
            ordersDesc: 'Получено сегодня',
            pendingDesc: 'Требуют внимания',
            usersDesc: 'Зарегистрировано сегодня',
            revenueHint:
                'Сумма всех заказов, которые не были отменены (статусы: получен, готовится, в пути, доставлен). Считается от 00:00 текущего дня.',
            missedHint:
                'Оценка выручки от товаров, которые пользователи добавили в корзину сегодня, но не завершили покупку. Данные из логов аналитики брошенных корзин.',
            ordersHint: 'Общее количество новых заказов за сегодня.',
            pendingHint:
                'Заказы со статусами "Ожидает" и "Получен", которые требуют подтверждения или начала приготовления.',
            usersHint: 'Количество уникальных клиентов, зарегистрировавшихся в системе за сегодня.',
        },
        recentOrders: 'Последние заказы',
        viewAll: 'Смотреть все',
        noOrders: 'Нет недавних заказов',
        guest: 'Гость',
        topProducts: 'ТОП-10 товаров за месяц',
        noSales: 'Нет данных о продажах',
        sold: 'прод.',
        reportHistory: 'История ежедневных отчетов',
        last30Days: 'История за все время',
        noReports: 'Отчетов пока нет.',
        table: {
            day: 'День',
            orders: 'Заказы',
            revenue: 'Доход',
            avgTicket: 'Средний чек',
            details: 'Детали',
            ordersLabel: 'зак.',
        },
        hints: {
            howCalculated: 'Как считается',
            hint: 'Подсказка',
        },
    },
    es: {
        summary: 'Resumen hoy',
        viewStore: 'Ver Restaurante',
        refresh: 'Actualizar',
        storeParams: 'Parámetros del Restaurante',
        storeClosed: 'Restaurante Cerrado Temporalmente',
        storeOpen: 'Restaurante Abierto y Operativo',
        openStore: 'ABRIR RESTAURANTE',
        closeStore: 'MARCAR CERRADA (EMERGENCIA)',
        deliveryTime: 'Tiempo Entrega',
        edit: 'EDITAR',
        emergencyTitle: '¡Atención! La cocina está pausada',
        emergencyDesc: 'Los clientes verán el mensaje de cierre y no podrán procesar el carrito.',
        activateNow: 'ACTIVAR RESTAURANTE AHORA',
        stats: {
            revenue: 'Ingresos de hoy',
            missed: 'Ingresos Perdidos',
            newOrders: 'Nuevos Pedidos',
            pending: 'Pedidos Pendientes',
            newUsers: 'Nuevos Clientes',
            revenueDesc: 'Total cobrado (Madrid)',
            missedDesc: 'Pedidos abandonados en carrito',
            ordersDesc: 'Pedidos recibidos hoy',
            pendingDesc: 'Atención inmediata',
            usersDesc: 'Registrados hoy',
            revenueHint:
                'Suma de todos los pedidos no cancelados hoy (estados: recibido, preparando, en camino, entregado). Desde las 00:00.',
            missedHint:
                'Ingresos estimados de productos que los usuarios añadieron al carrito hoy pero no finalizaron la compra.',
            ordersHint: 'Número total de nuevos pedidos recibidos hoy.',
            pendingHint:
                'Pedidos en estado "Pendiente" o "Recibido" que requieren atención o confirmación inmediata.',
            usersHint:
                'Número de clientes nuevos registrados en la plataforma durante el día de hoy.',
        },
        recentOrders: 'Últimos Pedidos',
        viewAll: 'Ver todos',
        noOrders: 'No hay pedidos recientes',
        guest: 'Invitado',
        topProducts: 'TOP 10 Productos Mensuales',
        noSales: 'No hay datos de ventas disponibles',
        sold: 'vend.',
        reportHistory: 'Historial de Reportes Diarios',
        last30Days: 'Historial completo',
        noReports: 'No hay reportes disponibles todavía.',
        table: {
            day: 'Día',
            orders: 'Pedidos',
            revenue: 'Ingresos',
            avgTicket: 'Ticket Medio',
            details: 'Detalles',
            ordersLabel: 'ped.',
        },
        hints: {
            howCalculated: 'Cómo se calcula',
            hint: 'Sugerencia',
        },
    },
} as const;

const StatCard = ({ title, value, icon: Icon, colorClass, desc, hint, t }: any) => {
    const [showHint, setShowHint] = useState(false);
    const hintRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!showHint) return;
        const handler = (e: MouseEvent) => {
            if (hintRef.current && !hintRef.current.contains(e.target as Node)) {
                setShowHint(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [showHint]);

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col justify-between group hover:shadow-md transition-shadow relative overflow-visible">
            <div className="flex justify-between items-start mb-4">
                <div className="relative" ref={hintRef}>
                    <div className="flex items-center gap-1.5 mb-1">
                        <p className="text-[11px] font-black text-gray-400 uppercase tracking-wider">
                            {title}
                        </p>
                        {hint && (
                            <button
                                onClick={() => setShowHint(v => !v)}
                                className={`w-5 h-5 rounded-full flex items-center justify-center transition-all border-none cursor-pointer ${
                                    showHint
                                        ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30 scale-110'
                                        : 'bg-gray-100 text-gray-400 hover:bg-blue-50 hover:text-blue-500'
                                }`}
                                aria-label={t.hints.hint}
                            >
                                <HelpCircle size={12} strokeWidth={2.5} />
                            </button>
                        )}
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 leading-none">{value}</h3>

                    <AnimatePresence>
                        {showHint && hint && (
                            <motion.div
                                initial={{ opacity: 0, y: -4, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -4, scale: 0.95 }}
                                transition={{ duration: 0.2, ease: 'easeOut' }}
                                className="absolute left-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 overflow-hidden"
                            >
                                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-2.5 flex items-center justify-between border-b border-blue-100">
                                    <div className="flex items-center gap-2">
                                        <div className="w-5 h-5 rounded-lg bg-blue-500 flex items-center justify-center">
                                            <Info size={11} className="text-white" />
                                        </div>
                                        <span className="text-[10px] font-black text-blue-800 uppercase tracking-widest">
                                            {t.hints.howCalculated}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => setShowHint(false)}
                                        className="w-5 h-5 rounded-full bg-blue-100 hover:bg-blue-200 flex items-center justify-center text-blue-600 transition-colors border-none cursor-pointer"
                                    >
                                        <X size={10} strokeWidth={3} />
                                    </button>
                                </div>
                                <div className="px-4 py-3">
                                    <p className="text-[12px] text-gray-600 leading-relaxed font-medium">
                                        {hint}
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
                <div
                    className={`p-2.5 rounded-xl ${colorClass} shadow-inner group-hover:scale-110 transition-transform`}
                >
                    <Icon size={20} strokeWidth={2} />
                </div>
            </div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight line-clamp-1">
                {desc}
            </p>
        </div>
    );
};

export default function AdminDashboard({
    stats,
    reports,
    loading,
    loadStats,
    setActiveTab,
    language = 'es',
}: AdminDashboardProps) {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

    const t = DASHBOARD_TRANSLATIONS[language];
    const dateLocale = language === 'ru' ? 'ru-RU' : 'es-ES';

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
            alert('Error al actualizar el estado del restaurante');
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
                <h2 className="text-lg font-black text-gray-900 border-l-4 border-orange-600 pl-3 uppercase tracking-tight">
                    {t.summary}
                </h2>

                <div className="flex flex-wrap items-center gap-3">
                    <button
                        onClick={() => navigate('/menu')}
                        className="flex items-center gap-2 px-5 py-2.5 bg-orange-600 text-white rounded-xl text-xs font-black hover:bg-black transition shadow-lg active:scale-95 uppercase tracking-wider"
                    >
                        <ExternalLink size={16} strokeWidth={2} />
                        {t.viewStore}
                    </button>
                    <button
                        onClick={() => loadStats()}
                        className="flex items-center gap-2 text-xs font-black text-gray-500 hover:text-gray-900 transition bg-white border border-gray-100 px-5 py-2.5 rounded-xl uppercase tracking-wider shadow-sm hover:shadow-md"
                    >
                        <RefreshCw
                            size={14}
                            strokeWidth={2}
                            className={loading ? 'animate-spin' : ''}
                        />
                        {t.refresh}
                    </button>
                </div>
            </div>

            {/* Store Status Toggle Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:scale-110 transition-transform duration-700">
                        <Power size={120} strokeWidth={1} />
                    </div>

                    <div className="flex items-center gap-5 relative z-10 w-full md:w-auto">
                        <div
                            className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-inner border border-black/5
                            ${isClosed ? 'bg-orange-50 text-orange-600' : 'bg-green-50 text-green-600 animate-pulse'}`}
                        >
                            <Power
                                size={28}
                                strokeWidth={2.5}
                                className={isUpdatingStatus ? 'animate-spin' : ''}
                            />
                        </div>
                        <div>
                            <h3 className="font-black text-gray-900 text-lg leading-none mb-2">
                                {t.storeParams}
                            </h3>
                            <div className="flex items-center gap-2">
                                <span
                                    className={`flex h-2.5 w-2.5 rounded-full ${isClosed ? 'bg-orange-500' : 'bg-green-500 animate-pulse ring-4 ring-green-100'}`}
                                />
                                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">
                                    {isClosed ? t.storeClosed : t.storeOpen}
                                </p>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={toggleStoreStatus}
                        disabled={isUpdatingStatus || settingsLoading}
                        className={`w-full md:w-auto flex items-center justify-center gap-3 px-8 py-5 rounded-2xl text-[11px] font-black transition-all shadow-xl active:scale-95 uppercase tracking-widest
                            ${
                                isClosed
                                    ? 'bg-green-600 text-white hover:bg-black shadow-green-100'
                                    : 'bg-orange-600 text-white hover:bg-black shadow-orange-100'
                            }
                            ${isUpdatingStatus ? 'opacity-50 cursor-not-allowed' : ''}
                        `}
                    >
                        {isUpdatingStatus ? (
                            <RefreshCw size={20} className="animate-spin" />
                        ) : isClosed ? (
                            t.openStore
                        ) : (
                            t.closeStore
                        )}
                    </button>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col justify-center group hover:border-blue-100 transition-colors">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                            <Clock size={20} strokeWidth={2.5} />
                        </div>
                        <h3 className="font-black text-gray-900 uppercase tracking-tight text-sm">
                            {t.deliveryTime}
                        </h3>
                    </div>
                    <div className="relative">
                        <input
                            type="text"
                            defaultValue={storeSettings?.est_delivery_time || '30-60 min'}
                            onBlur={e => handleUpdateDeliveryTime(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-4 text-sm font-black text-gray-700 outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-300 transition-all text-center"
                            placeholder="Ej: 30-45 min"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all pointer-events-none">
                            <span className="text-[9px] font-black text-blue-500 bg-white px-2 py-1 rounded-lg shadow-sm border border-blue-100 uppercase tracking-widest">
                                {t.edit}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Emergency Alert if Store is Closed */}
            <AnimatePresence>
                {isClosed && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.98 }}
                    >
                        <div className="bg-orange-600 text-white p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-5 shadow-2xl shadow-orange-100 border-2 border-orange-500/50">
                            <div className="flex items-center gap-5">
                                <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-md shadow-inner">
                                    <AlertTriangle
                                        size={28}
                                        className="text-white animate-bounce"
                                    />
                                </div>
                                <div>
                                    <p className="font-black text-lg uppercase tracking-tight leading-none mb-1">
                                        {t.emergencyTitle}
                                    </p>
                                    <p className="text-xs text-white/80 font-bold uppercase tracking-wider">
                                        {t.emergencyDesc}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={toggleStoreStatus}
                                className="w-full md:w-auto bg-white text-orange-600 px-10 py-4 rounded-2xl text-[11px] font-black hover:bg-black hover:text-white transition-all shadow-xl active:scale-95 uppercase tracking-widest"
                            >
                                {t.activateNow}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div
                            key={i}
                            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-32 animate-pulse flex flex-col justify-between"
                        >
                            <div className="w-1/2 h-4 bg-gray-50 rounded"></div>
                            <div className="w-3/4 h-8 bg-gray-50 rounded"></div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <StatCard
                        title={t.stats.revenue}
                        value={`${Number(stats?.revenueToday || 0)
                            .toFixed(2)
                            .replace('.', ',')} €`}
                        icon={DollarSign}
                        colorClass="bg-green-50 text-green-600"
                        desc={t.stats.revenueDesc}
                        hint={t.stats.revenueHint}
                        t={t}
                    />
                    <StatCard
                        title={t.stats.missed}
                        value={`${Number(stats?.missedRevenueToday || 0)
                            .toFixed(2)
                            .replace('.', ',')} €`}
                        icon={AlertTriangle}
                        colorClass="bg-orange-50 text-orange-600"
                        desc={t.stats.missedDesc}
                        hint={t.stats.missedHint}
                        t={t}
                    />
                    <StatCard
                        title={t.stats.newOrders}
                        value={Number(stats?.ordersToday || 0)}
                        icon={ShoppingBag}
                        colorClass="bg-blue-50 text-blue-600"
                        desc={t.stats.ordersDesc}
                        hint={t.stats.ordersHint}
                        t={t}
                    />
                    <StatCard
                        title={t.stats.pending}
                        value={stats?.pendingOrders ?? 0}
                        icon={Activity}
                        colorClass="bg-amber-50 text-amber-600"
                        desc={t.stats.pendingDesc}
                        hint={t.stats.pendingHint}
                        t={t}
                    />
                    <StatCard
                        title={t.stats.newUsers}
                        value={stats?.usersToday || 0}
                        icon={TrendingUp}
                        colorClass="bg-purple-50 text-purple-600"
                        desc={t.stats.usersDesc}
                        hint={t.stats.usersHint}
                        t={t}
                    />
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-6 pb-2 border-b border-gray-50">
                        <h3 className="font-black text-gray-900 uppercase tracking-tight flex items-center gap-2">
                            <div className="w-1.5 h-6 bg-orange-600 rounded-full" />
                            {t.recentOrders}
                        </h3>
                        <button
                            onClick={() => setActiveTab('orders')}
                            className="text-orange-600 text-[10px] font-black hover:text-black transition-colors uppercase tracking-widest border-b-2 border-orange-100"
                        >
                            {t.viewAll}
                        </button>
                    </div>

                    {loading ? (
                        <div className="space-y-3">
                            {[1, 2, 3].map(i => (
                                <div
                                    key={i}
                                    className="h-16 bg-gray-50 rounded-2xl animate-pulse"
                                ></div>
                            ))}
                        </div>
                    ) : !stats?.recentOrders?.length ? (
                        <div className="text-center py-16 text-gray-400 font-bold uppercase text-[11px] tracking-widest">
                            {t.noOrders}
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {stats.recentOrders.map((order: any) => (
                                <div
                                    key={order.id}
                                    className="p-3 bg-gray-50/50 rounded-2xl flex items-center justify-between text-left hover:bg-gray-100/80 transition-colors border border-transparent hover:border-gray-100"
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={`w-11 h-11 rounded-2xl flex items-center justify-center text-white font-black text-xs overflow-hidden shrink-0 shadow-sm border border-white
                                                ${order.user_avatar?.startsWith('http') ? 'bg-white' : order.user_avatar ? 'bg-gray-100 text-[18px]' : 'bg-orange-600'}`}
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
                                                    <span className="select-none text-xl">
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
                                            <p className="font-black text-gray-900 text-[13px] leading-none mb-1">
                                                #{String(order.id).padStart(5, '0')}
                                            </p>
                                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-tight truncate max-w-[140px]">
                                                {order.user_name || t.guest}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-black text-gray-900 text-sm">
                                            {Number(order.total).toFixed(2).replace('.', ',')} €
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
                    <h3 className="font-black text-gray-900 uppercase tracking-tight mb-6 pb-2 border-b border-gray-50 flex items-center gap-2">
                        <div className="w-1.5 h-6 bg-orange-600 rounded-full" />
                        {t.topProducts}
                    </h3>

                    {loading ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => (
                                <div
                                    key={i}
                                    className="h-16 bg-gray-50 rounded-2xl animate-pulse"
                                ></div>
                            ))}
                        </div>
                    ) : !stats?.topItems?.length ? (
                        <div className="text-center py-16 text-gray-400 font-bold uppercase text-[11px] tracking-widest">
                            {t.noSales}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {stats.topItems.map((item: any, idx: number) => (
                                <div key={idx} className="flex items-center gap-4 group">
                                    <div className="w-10 h-10 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center font-black text-[14px] shadow-inner group-hover:scale-110 transition-transform">
                                        #{idx + 1}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center mb-1.5">
                                            <span className="text-[13px] font-black text-gray-800 uppercase tracking-tight">
                                                {item.name}
                                            </span>
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-2 py-0.5 rounded-lg">
                                                {item.sold} {t.sold}
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-50 h-2.5 rounded-full overflow-hidden border border-gray-100 shadow-inner p-0.5">
                                            <div
                                                className="bg-orange-600 h-full rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(242,101,34,0.3)]"
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
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mt-6 overflow-hidden hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-8 pb-3 border-b border-gray-100">
                    <h3 className="font-black text-gray-900 uppercase tracking-tight flex items-center gap-2">
                        <div className="w-1.5 h-6 bg-orange-600 rounded-full" />
                        {t.reportHistory}
                    </h3>
                    <span className="text-[10px] font-black text-gray-400 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100 uppercase tracking-widest shadow-inner">
                        {t.last30Days}
                    </span>
                </div>

                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div
                                key={i}
                                className="h-12 bg-gray-50 rounded-2xl animate-pulse"
                            ></div>
                        ))}
                    </div>
                ) : !reports?.length ? (
                    <div className="text-center py-20">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner animate-pulse">
                            <RefreshCw className="text-gray-200" size={40} strokeWidth={1} />
                        </div>
                        <p className="text-gray-400 font-bold uppercase text-[11px] tracking-widest">
                            {t.noReports}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto no-scrollbar">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-50">
                                    <th className="px-4 py-4">{t.table.day}</th>
                                    <th className="px-4 py-4">{t.table.orders}</th>
                                    <th className="px-4 py-4">{t.table.revenue}</th>
                                    <th className="px-4 py-4">{t.table.avgTicket}</th>
                                    <th className="px-4 py-4 text-right">{t.table.details}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {reports.map((report: any) => (
                                    <tr
                                        key={report.date}
                                        className="hover:bg-gray-50/80 transition-all group active:scale-[0.99]"
                                    >
                                        <td className="px-4 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-white border border-gray-100 flex flex-col items-center justify-center shadow-sm group-hover:bg-orange-600 group-hover:border-orange-600 transition-colors">
                                                    <span className="text-[9px] font-black text-gray-400 uppercase leading-none mb-1 group-hover:text-white/80">
                                                        {new Date(report.date).toLocaleDateString(
                                                            dateLocale,
                                                            {
                                                                month: 'short',
                                                            }
                                                        )}
                                                    </span>
                                                    <span className="text-lg font-black text-gray-900 leading-none group-hover:text-white">
                                                        {new Date(report.date).getDate()}
                                                    </span>
                                                </div>
                                                <span className="text-xs font-black text-gray-700 uppercase tracking-tight group-hover:text-orange-600 transition-colors">
                                                    {new Date(report.date).toLocaleDateString(
                                                        dateLocale,
                                                        {
                                                            weekday: 'long',
                                                        }
                                                    )}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-5">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[15px] font-black text-gray-900">
                                                    {report.orders_count ?? report.orderCount ?? 0}
                                                </span>
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-tight">
                                                    {t.table.ordersLabel}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-5">
                                            <span className="text-sm font-black text-green-600 bg-green-50 px-3 py-1.5 rounded-xl border border-green-100 shadow-sm">
                                                {Number(report.total_revenue ?? report.total ?? 0)
                                                    .toFixed(2)
                                                    .replace('.', ',')}{' '}
                                                €
                                            </span>
                                        </td>
                                        <td className="px-4 py-5">
                                            <span className="text-xs font-black text-gray-600 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100 uppercase tracking-tight">
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
                                        <td className="px-4 py-5 text-right">
                                            <ChevronRight
                                                size={18}
                                                strokeWidth={2.5}
                                                className="text-gray-200 group-hover:text-orange-500 group-hover:translate-x-1.5 transition-all inline-block"
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
