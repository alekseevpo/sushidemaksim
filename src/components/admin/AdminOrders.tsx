import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Package,
    Search,
    RefreshCw,
    Smartphone,
    Monitor,
    Globe,
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
    Activity,
} from 'lucide-react';
import { api, ApiError } from '../../utils/api';
import { Order, OrderItem } from '../../types';

interface AdminOrdersProps {
    isGlobalSoundEnabled: boolean;
    setIsGlobalSoundEnabled: (enabled: boolean) => void;
    globalPendingCount: number;
    language?: 'ru' | 'es';
}

const ORDERS_TRANSLATIONS = {
    ru: {
        searchPlaceholder: 'Поиск ID, Тел, Промо...',
        soundOn: 'Выключить звук',
        soundOff: 'Включить звук',
        refresh: 'Обновить',
        filters: {
            active: 'К ВЫПОЛНЕНИЮ',
            unpaid: 'Ожидание оплаты',
            preparing: 'Готовятся',
            on_the_way: 'В пути',
            delivered: 'Доставлены',
            cancelled: 'Отменены',
            all: 'Все',
        },
        errorLoading: 'Ошибка при загрузке заказов',
        noOrders: 'Заказы не найдены.',
        loadingOrders: 'Загрузка заказов...',
        orderId: 'Заказ #',
        total: 'Итого',
        clientContact: 'Клиент и контакт',
        regDate: 'РЕГ.',
        guest: 'Гость',
        whatsapp: 'WHATSAPP',
        userStats: {
            orders: 'Заказов',
            invested: 'Вложено',
            avgTicket: 'Ср. чек',
            frequency: 'Частота',
            favorite: 'Любимое блюдо',
            firstOrder: 'Первый заказ',
        },
        deliveryAddress: 'Адрес доставки',
        types: {
            recogida: 'САМОВЫВОЗ',
            domicilio: 'ДОСТАВКА',
            scheduled: 'ЗАКАЗ КО ВРЕМЕНИ',
            noCall: 'БЕЗ ЗВОНКА',
            noBuzzer: 'В ТЕЛЕФОН (НЕ ЗВОНОК)',
        },
        clientMessage: 'Сообщение от клиента',
        products: 'Товары',
        deliveryFee: 'Доставка',
        orderStatus: 'Статус заказа',
        origin: 'Источник',
        webDirect: 'Веб-сайт',
        statusNames: {
            waiting_payment: 'Ожидание оплаты',
            pending: 'Принят',
            received: 'Получен',
            confirmed: 'Подтвержден',
            preparing: 'Готовится',
            on_the_way: 'В пути',
            delivered: 'Доставлен',
            cancelled: 'Отменен',
        },
    },
    es: {
        searchPlaceholder: 'Buscar ID, Teléfono, Promo...',
        soundOn: 'Desactivar sonido',
        soundOff: 'Activar sonido',
        refresh: 'Actualizar',
        filters: {
            active: 'POR HACER (TODO)',
            unpaid: 'Por Pagar',
            preparing: 'Cocinando',
            on_the_way: 'En Camino',
            delivered: 'Entregados',
            cancelled: 'Cancelados',
            all: 'Todos',
        },
        errorLoading: 'Error al cargar los pedidos',
        noOrders: 'No se encontraron pedidos.',
        loadingOrders: 'Cargando pedidos...',
        orderId: 'Pedido #',
        total: 'Total',
        clientContact: 'Cliente y Contacto',
        regDate: 'REG.',
        guest: 'Invitado',
        whatsapp: 'WHATSAPP',
        userStats: {
            orders: 'Pedidos',
            invested: 'Invertido',
            avgTicket: 'Ticket Medio',
            frequency: 'Frecuencia',
            favorite: 'Plato Favorito',
            firstOrder: 'Primer pedido',
        },
        deliveryAddress: 'Dirección de Entrega',
        types: {
            recogida: 'RECOGIDA',
            domicilio: 'DOMICILIO',
            scheduled: 'ENTREGA PROGRAMADA',
            noCall: 'SIN LLAMADA',
            noBuzzer: 'MÓVIL (NO TIMBRE)',
        },
        clientMessage: 'Mensaje del Cliente',
        products: 'Productos',
        deliveryFee: 'Gastos de Envío',
        orderStatus: 'Estado del Pedido',
        origin: 'Origen',
        webDirect: 'Web Directa',
        statusNames: {
            waiting_payment: 'Esperando Pago',
            pending: 'Enviado',
            received: 'Recibido',
            confirmed: 'Aceptado',
            preparing: 'Preparando',
            on_the_way: 'En camino',
            delivered: 'Entregado',
            cancelled: 'Cancelado',
        },
    },
} as const;

export default function AdminOrders({
    isGlobalSoundEnabled,
    setIsGlobalSoundEnabled,
    globalPendingCount,
    language = 'es',
}: AdminOrdersProps) {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState<string>('active');
    const [page, setPage] = useState(1);
    const [debouncedSearch, setDebouncedSearch] = useState('');

    const t = ORDERS_TRANSLATIONS[language];
    const dateLocale = language === 'ru' ? 'ru-RU' : 'es-ES';

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
        onMutate: async () => {
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
            label: t.statusNames.waiting_payment,
            color: 'bg-gray-50 text-gray-500 border-gray-200',
        },
        {
            value: 'pending',
            label: t.statusNames.pending,
            color: 'bg-amber-50 text-amber-700 border-amber-200',
        },
        {
            value: 'received',
            label: t.statusNames.received,
            color: 'bg-blue-50 text-blue-700 border-blue-200',
        },
        {
            value: 'confirmed',
            label: t.statusNames.confirmed,
            color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        },
        {
            value: 'preparing',
            label: t.statusNames.preparing,
            color: 'bg-purple-50 text-purple-700 border-purple-200',
        },
        {
            value: 'on_the_way',
            label: t.statusNames.on_the_way,
            color: 'bg-pink-50 text-pink-700 border-pink-200',
        },
        {
            value: 'delivered',
            label: t.statusNames.delivered,
            color: 'bg-green-50 text-green-700 border-green-200',
        },
        {
            value: 'cancelled',
            label: t.statusNames.cancelled,
            color: 'bg-red-50 text-red-700 border-red-200',
        },
    ];

    const formatCurrency = (amount: number) => {
        return Number(amount).toFixed(2).replace('.', ',') + ' €';
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Top Controls */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6 space-y-4">
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="relative flex-1 sm:w-96">
                            <Search
                                size={18}
                                strokeWidth={2}
                                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                            />
                            <input
                                type="text"
                                placeholder={t.searchPlaceholder}
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full pl-11 pr-10 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold focus:bg-white focus:border-red-400 focus:ring-4 focus:ring-red-50 focus:outline-none transition-all placeholder:text-gray-400"
                            />
                            {search && (
                                <button
                                    onClick={() => setSearch('')}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-900 transition-colors p-1"
                                >
                                    <X size={16} strokeWidth={2} />
                                </button>
                            )}
                        </div>
                        <button
                            onClick={() => setIsGlobalSoundEnabled(!isGlobalSoundEnabled)}
                            className={`p-3 rounded-xl transition-all border shadow-sm active:scale-95 ${
                                isGlobalSoundEnabled
                                    ? 'bg-green-50 text-green-600 border-green-100 hover:bg-green-600 hover:text-white'
                                    : 'bg-gray-50 text-gray-400 border-gray-100 hover:bg-gray-200 hover:text-gray-900'
                            }`}
                            title={isGlobalSoundEnabled ? t.soundOn : t.soundOff}
                        >
                            {isGlobalSoundEnabled ? (
                                <Volume2 size={20} strokeWidth={2} />
                            ) : (
                                <VolumeX size={20} strokeWidth={2} />
                            )}
                        </button>
                    </div>
                    <button
                        onClick={() => refetch()}
                        className="w-full sm:w-auto p-3 text-gray-500 hover:text-gray-900 bg-gray-50 hover:bg-white border border-gray-100 hover:border-gray-200 rounded-xl transition-all shadow-sm active:scale-95"
                        title={t.refresh}
                    >
                        <RefreshCw
                            size={20}
                            strokeWidth={2}
                            className={isFetching ? 'animate-spin' : ''}
                        />
                    </button>
                </div>

                {/* Filter Tabs */}
                <div className="flex bg-gray-50/50 p-1.5 rounded-2xl w-full overflow-x-auto no-scrollbar border border-gray-50 shadow-inner">
                    <div className="flex gap-1 min-w-max">
                        {[
                            {
                                id: 'active',
                                label: t.filters.active,
                                badge: globalPendingCount > 0,
                            },
                            { id: 'unpaid', label: t.filters.unpaid },
                            { id: 'preparing', label: t.filters.preparing },
                            { id: 'on_the_way', label: t.filters.on_the_way },
                            { id: 'delivered', label: t.filters.delivered },
                            { id: 'cancelled', label: t.filters.cancelled },
                            { id: 'all', label: t.filters.all },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => {
                                    setFilter(tab.id);
                                    setPage(1);
                                }}
                                className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap relative active:scale-95 ${
                                    filter === tab.id
                                        ? 'bg-white text-red-600 shadow-sm border border-red-100 font-black'
                                        : 'text-gray-400 hover:text-gray-600'
                                }`}
                            >
                                {tab.label}
                                {tab.badge && (
                                    <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-600 border-2 border-white shadow-sm"></span>
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {fetchError && (
                <div className="bg-red-50 text-red-600 p-5 rounded-2xl mb-6 border-2 border-red-100 flex items-center gap-4 animate-in shake duration-500 shadow-xl shadow-red-50">
                    <div className="bg-red-600 p-2 rounded-lg">
                        <RefreshCw className="animate-spin text-white" size={20} strokeWidth={2} />
                    </div>
                    <p className="font-black uppercase tracking-tight text-sm">
                        {fetchError instanceof ApiError ? fetchError.message : t.errorLoading}
                    </p>
                </div>
            )}

            {!isLoading && orders.length === 0 ? (
                <div className="bg-white rounded-3xl border-2 border-dashed border-gray-100 p-20 text-center shadow-inner">
                    <div className="w-20 h-20 bg-gray-50 text-gray-300 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                        <Package size={40} strokeWidth={1} />
                    </div>
                    <h3 className="text-gray-400 font-black uppercase tracking-widest text-xs">
                        {t.noOrders}
                    </h3>
                </div>
            ) : (
                <div className="grid gap-6">
                    {isLoading && orders.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-gray-100 shadow-sm">
                            <RefreshCw
                                className="animate-spin text-red-600 mb-6"
                                size={48}
                                strokeWidth={2}
                            />
                            <p className="text-gray-400 font-black uppercase tracking-[0.2em] text-[10px]">
                                {t.loadingOrders}
                            </p>
                        </div>
                    ) : (
                        orders.map((order: Order) => (
                            <div
                                key={order.id}
                                className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden group border-b-4 border-b-gray-100"
                            >
                                {/* Header del pedido */}
                                <div className="p-5 sm:p-6 border-b border-gray-50 bg-gray-50/20 flex flex-wrap items-center justify-between gap-6 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
                                            <Package
                                                className="text-red-500"
                                                size={24}
                                                strokeWidth={2}
                                            />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <h4 className="font-black text-gray-900 text-lg tracking-tight">
                                                    {t.orderId}
                                                    {String(order.id).padStart(5, '0')}
                                                </h4>
                                                <span
                                                    className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] border shadow-sm ${
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
                                                        className="bg-amber-50 text-amber-600 p-1.5 rounded-xl border border-amber-100 shadow-sm"
                                                        title="Содержит примечания"
                                                    >
                                                        <MessageSquare
                                                            size={16}
                                                            strokeWidth={2.5}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                            <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest">
                                                {new Date(order.createdAt).toLocaleString(
                                                    dateLocale,
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

                                    <div className="flex items-center gap-6 ml-auto sm:ml-0">
                                        <div className="text-right">
                                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1.5 leading-none">
                                                {t.total}
                                            </p>
                                            <p className="text-2xl font-black text-gray-900 leading-none">
                                                {formatCurrency(order.total)}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Cuerpo del pedido */}
                                <div className="p-5 sm:p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 overflow-hidden">
                                    {/* Info Cliente & Stats */}
                                    <div className="space-y-8">
                                        <div>
                                            <div className="flex items-center gap-3 text-gray-400 mb-4 border-l-4 border-red-100 pl-3">
                                                <Smartphone size={16} strokeWidth={2} />
                                                <span className="text-[11px] font-black uppercase tracking-widest leading-none">
                                                    {t.clientContact}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-4 mb-4">
                                                <div
                                                    className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-xs overflow-hidden shrink-0 shadow-sm border-2 border-white
                                                        ${order.users?.avatar?.startsWith('http') ? 'bg-white' : order.users?.avatar ? 'bg-gray-100 text-[24px]' : 'bg-red-600'}`}
                                                >
                                                    {order.users?.avatar ? (
                                                        order.users.avatar.startsWith('http') ? (
                                                            <img
                                                                src={`${order.users.avatar}${order.users.avatar.includes('?') ? '&' : '?'}t=${Date.now()}`}
                                                                alt={order.users.name}
                                                                className="w-full h-full object-cover"
                                                                onError={e => {
                                                                    (
                                                                        e.currentTarget as HTMLImageElement
                                                                    ).style.display = 'none';
                                                                    e.currentTarget.parentElement!.innerText =
                                                                        (order.users?.name || '?')
                                                                            .split(' ')
                                                                            .filter(Boolean)
                                                                            .map(n => n[0])
                                                                            .join('')
                                                                            .toUpperCase()
                                                                            .slice(0, 2);
                                                                }}
                                                            />
                                                        ) : (
                                                            <span className="select-none text-2xl">
                                                                {order.users.avatar}
                                                            </span>
                                                        )
                                                    ) : (
                                                        <span className="select-none text-xl">
                                                            {(order.users?.name || t.guest)
                                                                .split(' ')
                                                                .filter(Boolean)
                                                                .map(n => n[0])
                                                                .join('')
                                                                .toUpperCase()
                                                                .slice(0, 2)}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-black text-gray-900 text-[16px] truncate leading-tight mb-1">
                                                        {order.users?.name || t.guest}
                                                    </p>
                                                    {order.userStats && (
                                                        <div className="flex items-center gap-2 px-2 py-1 bg-blue-50 text-blue-600 rounded-lg text-[9px] font-black border border-blue-100 w-fit uppercase tracking-tighter">
                                                            <Calendar size={12} strokeWidth={2.5} />
                                                            {t.regDate}{' '}
                                                            {new Date(
                                                                order.userStats.registrationDate
                                                            ).toLocaleDateString(dateLocale)}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <p className="text-sm text-gray-900 font-black tabular-nums">
                                                    {order.phoneNumber}
                                                </p>
                                                <a
                                                    href={`https://wa.me/${order.phoneNumber.replace(/\D/g, '')}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-1 px-3 bg-green-50 text-green-700 rounded-xl text-[10px] font-black border border-green-200 hover:bg-green-600 hover:text-white transition-all flex items-center gap-2 shadow-sm active:scale-95 uppercase tracking-widest"
                                                >
                                                    <MessageSquare size={12} strokeWidth={2.5} />
                                                    {t.whatsapp}
                                                </a>
                                            </div>
                                            {order.users?.email && (
                                                <p className="text-[11px] font-bold text-gray-400 mt-2 bg-gray-50 px-2 py-1 rounded-lg w-fit border border-gray-100">
                                                    {order.users.email}
                                                </p>
                                            )}
                                        </div>

                                        {order.userStats && (
                                            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50/50 rounded-3xl border border-gray-100 shadow-inner">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2 text-gray-400">
                                                        <ShoppingCart size={12} strokeWidth={2} />
                                                        <span className="text-[9px] font-black uppercase tracking-widest">
                                                            {t.userStats.orders}
                                                        </span>
                                                    </div>
                                                    <p className="text-[13px] font-black text-gray-900">
                                                        {order.userStats.orderCount || 0}
                                                    </p>
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2 text-gray-400">
                                                        <Wallet size={12} strokeWidth={2} />
                                                        <span className="text-[9px] font-black uppercase tracking-widest">
                                                            {t.userStats.invested}
                                                        </span>
                                                    </div>
                                                    <p className="text-[13px] font-black text-gray-900">
                                                        {formatCurrency(
                                                            order.userStats.totalSpent || 0
                                                        )}
                                                    </p>
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2 text-gray-400">
                                                        <TrendingUp size={12} strokeWidth={2} />
                                                        <span className="text-[9px] font-black uppercase tracking-widest">
                                                            {t.userStats.avgTicket}
                                                        </span>
                                                    </div>
                                                    <p className="text-[13px] font-black text-gray-900">
                                                        {formatCurrency(
                                                            order.userStats.avgCheck || 0
                                                        )}
                                                    </p>
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2 text-gray-400">
                                                        <Clock size={12} strokeWidth={2} />
                                                        <span className="text-[9px] font-black uppercase tracking-widest">
                                                            {t.userStats.frequency}
                                                        </span>
                                                    </div>
                                                    <p className="text-[10px] font-black text-gray-900 leading-none uppercase tracking-tight">
                                                        {order.userStats.frequency ||
                                                            t.userStats.firstOrder}
                                                    </p>
                                                </div>
                                                <div className="col-span-2 pt-3 border-t border-gray-200 mt-1 space-y-1.5">
                                                    <div className="flex items-center gap-2 text-red-500">
                                                        <Heart
                                                            size={12}
                                                            strokeWidth={3}
                                                            fill="currentColor"
                                                        />
                                                        <span className="text-[9px] font-black uppercase tracking-widest">
                                                            {t.userStats.favorite}
                                                        </span>
                                                    </div>
                                                    <p className="text-[11px] font-black text-gray-900 line-clamp-1 uppercase tracking-tight">
                                                        {order.userStats.favoriteDish || 'N/A'}
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        <div className="max-w-[300px]">
                                            <div className="flex items-center gap-3 text-gray-400 mb-3 border-l-4 border-blue-100 pl-3">
                                                <Monitor size={16} strokeWidth={2} />
                                                <span className="text-[11px] font-black uppercase tracking-widest">
                                                    {t.deliveryAddress}
                                                </span>
                                            </div>
                                            <p className="text-[14px] text-gray-700 leading-relaxed font-black break-words bg-gray-50/30 p-3 rounded-2xl border border-dashed border-gray-100">
                                                {order.deliveryAddress}
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
                                                    if (
                                                        part.includes('[MÉTODO DE PAGO:') ||
                                                        part.includes('[PAGO:')
                                                    ) {
                                                        paymentMethod = part
                                                            .replace('[MÉTODO DE PAGO: ', '')
                                                            .replace('[MÉTODO DE PAGO:', '')
                                                            .replace('[PAGO: ', '')
                                                            .replace('[PAGO:', '')
                                                            .replace(']', '');
                                                    } else if (part.includes('[TIPO:')) {
                                                        deliveryType = part
                                                            .replace('[TIPO: ', '')
                                                            .replace('[TIPO:', '')
                                                            .replace(']', '');
                                                    } else if (
                                                        part.includes('[ENTREGA PROGRAMADA:') ||
                                                        part.includes('[PROGRAMADO:')
                                                    ) {
                                                        scheduled = part
                                                            .replace('[ENTREGA PROGRAMADA: ', '')
                                                            .replace('[ENTREGA PROGRAMADA:', '')
                                                            .replace('[PROGRAMADO: ', '')
                                                            .replace('[PROGRAMADO:', '')
                                                            .replace(']', '');
                                                    } else if (
                                                        part.includes(
                                                            '[NO LLAMAR PARA CONFIRMACIÓN]'
                                                        ) ||
                                                        part.includes('[SIN CONFIRMACIÓN LLAMADA]')
                                                    ) {
                                                        noCall = true;
                                                    } else if (
                                                        part.includes(
                                                            '[NO LLAMAR AL TELEFONILLO - LLAMAR AL MÓVIL]'
                                                        ) ||
                                                        part.includes('[NO LLAMAR TIMBRE]')
                                                    ) {
                                                        noBuzzer = true;
                                                    } else {
                                                        actualNote +=
                                                            (actualNote ? ' | ' : '') + part;
                                                    }
                                                });

                                                return (
                                                    <div className="space-y-4">
                                                        <div className="flex flex-wrap gap-2.5 mb-2">
                                                            {deliveryType && (
                                                                <div
                                                                    className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-sm border ${deliveryType === 'RECOGIDA EN LOCAL' ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-gray-100 text-gray-700 border-gray-200'}`}
                                                                >
                                                                    {deliveryType ===
                                                                    'RECOGIDA EN LOCAL' ? (
                                                                        <Store size={14} />
                                                                    ) : (
                                                                        <Truck size={14} />
                                                                    )}
                                                                    {deliveryType ===
                                                                    'RECOGIDA EN LOCAL'
                                                                        ? t.types.recogida
                                                                        : t.types.domicilio}
                                                                </div>
                                                            )}
                                                            {paymentMethod && (
                                                                <div
                                                                    className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-sm border ${paymentMethod.includes('TARJETA') ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}
                                                                >
                                                                    <Wallet size={14} />
                                                                    {paymentMethod.includes(
                                                                        'TARJETA'
                                                                    )
                                                                        ? '💳 '
                                                                        : '💵 '}
                                                                    {paymentMethod.toUpperCase()}
                                                                </div>
                                                            )}
                                                            {scheduled && (
                                                                <div className="px-4 py-3 rounded-2xl bg-red-600 text-white border-2 border-red-700/50 text-[11px] font-black uppercase tracking-widest flex items-center gap-3 shadow-md">
                                                                    <Clock
                                                                        size={18}
                                                                        strokeWidth={3}
                                                                    />
                                                                    <div className="flex flex-col leading-none">
                                                                        <span className="mb-1">
                                                                            {t.types.scheduled}
                                                                        </span>
                                                                        <span className="text-[10px] opacity-90 font-mono tracking-tight">
                                                                            {scheduled}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            )}
                                                            {noCall && (
                                                                <div className="px-3 py-1.5 rounded-xl bg-gray-50 text-gray-500 border border-gray-200 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                                                    <VolumeX size={14} />
                                                                    {t.types.noCall}
                                                                </div>
                                                            )}
                                                            {noBuzzer && (
                                                                <div className="px-3 py-1.5 rounded-xl bg-gray-50 text-gray-500 border border-gray-200 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                                                    <Smartphone size={14} />
                                                                    {t.types.noBuzzer}
                                                                </div>
                                                            )}
                                                        </div>

                                                        {actualNote && (
                                                            <div className="bg-amber-50 border-2 border-amber-200/40 rounded-3xl p-5 shadow-inner">
                                                                <div className="flex items-center gap-3 text-amber-600 mb-3">
                                                                    <MessageSquare
                                                                        size={16}
                                                                        strokeWidth={3}
                                                                    />
                                                                    <span className="text-[11px] font-black uppercase tracking-[0.2em]">
                                                                        {t.clientMessage}
                                                                    </span>
                                                                </div>
                                                                <p className="text-[15px] text-amber-900 font-black leading-relaxed relative z-10">
                                                                    {actualNote}
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })()}
                                    </div>

                                    {/* Items del pedido (Receipt Style) */}
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3 text-gray-400 mb-4 border-l-4 border-purple-100 pl-3">
                                            <ShoppingCart size={16} strokeWidth={2} />
                                            <span className="text-[11px] font-black uppercase tracking-widest">
                                                {t.products} ({order.items?.length || 0})
                                            </span>
                                        </div>
                                        <div className="space-y-1 bg-gray-50/50 p-4 rounded-3xl border border-gray-100 shadow-inner">
                                            {order.items?.map((item: OrderItem, idx: number) => (
                                                <div
                                                    key={idx}
                                                    className="flex items-center justify-between gap-3 py-2.5 border-b border-gray-100 last:border-0 hover:bg-white px-3 rounded-xl transition-all group/item"
                                                >
                                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                                        <span className="text-[13px] font-black text-red-600 bg-red-50 w-7 h-7 flex items-center justify-center rounded-lg shadow-inner group-hover/item:bg-red-600 group-hover/item:text-white transition-colors">
                                                            {item.quantity}
                                                        </span>
                                                        <span className="text-[13px] font-black text-gray-800 uppercase tracking-tight line-clamp-1">
                                                            {item.name}
                                                        </span>
                                                    </div>
                                                    <span className="text-[12px] font-black text-gray-400 tabular-nums">
                                                        {formatCurrency(
                                                            item.priceAtTime * item.quantity
                                                        )}
                                                    </span>
                                                </div>
                                            ))}

                                            {order.deliveryFee && order.deliveryFee > 0 ? (
                                                <div className="flex items-center justify-between gap-3 py-3 border-t-2 border-dashed border-gray-200 mt-2 px-3">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-[11px] font-black text-gray-500 uppercase tracking-widest">
                                                            {t.deliveryFee}
                                                        </span>
                                                    </div>
                                                    <span className="text-[12px] font-black text-gray-900 tabular-nums">
                                                        {formatCurrency(order.deliveryFee)}
                                                    </span>
                                                </div>
                                            ) : null}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="lg:border-l-2 border-dashed border-gray-100 lg:pl-10 flex flex-col justify-start">
                                        <div className="flex items-center gap-3 text-gray-400 mb-5 border-l-4 border-green-100 pl-3">
                                            <Activity size={16} strokeWidth={2} />
                                            <span className="text-[11px] font-black uppercase tracking-widest">
                                                {t.orderStatus}
                                            </span>
                                        </div>
                                        <div className="relative group/status">
                                            <select
                                                value={order.status}
                                                onChange={e =>
                                                    handleUpdateStatus(
                                                        Number(order.id),
                                                        e.target.value
                                                    )
                                                }
                                                disabled={statusMutation.isPending}
                                                className={`w-full px-5 py-4 rounded-2xl text-[13px] font-black uppercase tracking-widest border-2 transition-all appearance-none cursor-pointer focus:outline-none focus:ring-8 focus:ring-gray-100 shadow-md ${
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
                                                        className="bg-white text-gray-900 font-black uppercase tracking-widest"
                                                    >
                                                        {opt.label}
                                                    </option>
                                                ))}
                                            </select>
                                            <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
                                                <RefreshCw
                                                    size={18}
                                                    strokeWidth={3}
                                                    className={
                                                        statusMutation.isPending
                                                            ? 'animate-spin'
                                                            : 'text-current opacity-40'
                                                    }
                                                />
                                            </div>
                                        </div>

                                        <div className="mt-8 pt-6 border-t border-gray-50 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <Globe
                                                    size={18}
                                                    strokeWidth={2}
                                                    className="text-gray-300"
                                                />
                                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                                                    {t.origin}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2.5 bg-green-50 px-3 py-1.5 rounded-xl border border-green-100 shadow-sm">
                                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse ring-4 ring-green-100"></span>
                                                <p className="text-[10px] font-black text-green-700 uppercase tracking-widest">
                                                    {t.webDirect}
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
                <div className="mt-10 flex flex-wrap justify-center gap-2 pb-10">
                    {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(pageNum => (
                        <button
                            key={pageNum}
                            onClick={() => {
                                setPage(pageNum);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className={`w-12 h-12 flex items-center justify-center rounded-2xl font-black text-sm transition-all shadow-sm active:scale-90 border ${
                                pageNum === pagination.page
                                    ? 'bg-red-600 text-white border-red-600 shadow-md font-black italic'
                                    : 'bg-white text-gray-400 border-gray-100 hover:border-red-400 hover:text-red-500'
                            }`}
                        >
                            {pageNum}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
