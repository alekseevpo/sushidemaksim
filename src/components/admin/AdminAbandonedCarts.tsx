import { useQuery } from '@tanstack/react-query';
import {
    ShoppingCart,
    User,
    Phone,
    Mail,
    Clock,
    MessageSquare,
    RefreshCw,
    AlertCircle,
    MapPin,
    Tag,
    ChevronDown,
    ChevronUp,
    History,
    CreditCard,
    Plus,
    Minus,
    Package,
} from 'lucide-react';
import { api } from '../../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../../context/ToastContext';
import { useState } from 'react';

interface AdminAbandonedCartsProps {
    language?: 'ru' | 'es';
}

const HUMAN_KEYS_RU: Record<string, string> = {
    totalValue: 'Сумма корзины',
    itemCount: 'Товаров в корзине',
    deliveryType: 'Способ доставки',
    paymentMethod: 'Метод оплаты',
    address: 'Адрес',
    phone: 'Телефон',
    email: 'Эл. почта',
    name: 'Имя клиента',
    zone: 'Зона доставки',
    code: 'Промокод',
    discount: 'Скидка',
    error: 'Сообщение об ошибке',
    type: 'Тип',
    field: 'Поле',
    utmSource: 'Источник (UTM)',
    step: 'Этап',
    message: 'Сообщение',
};

const HUMAN_KEYS_ES: Record<string, string> = {
    totalValue: 'Total del carrito',
    itemCount: 'Artículos en el carrito',
    deliveryType: 'Tipo de envío',
    paymentMethod: 'Método de pago',
    address: 'Dirección',
    phone: 'Teléfono',
    email: 'Email',
    name: 'Nombre del cliente',
    zone: 'Zona de envío',
    code: 'Código',
    discount: 'Descuento',
    error: 'Mensaje de error',
    type: 'Tipo',
    field: 'Campo',
    utmSource: 'Origen (UTM)',
    step: 'Paso',
    message: 'Mensaje',
};

const ABANDONED_TRANSLATIONS = {
    ru: {
        title: 'Брошенные корзины',
        subtitle: 'Последние 7 дней. Неактивные сессии с товарами или контактами.',
        potentialCaptures: 'Потенциальных клиентов',
        refresh: 'Обновить',
        anonymous: 'Анонимный клиент',
        stageLabel: 'Этап:',
        stages: {
            Payment: 'Оплата',
            'Contact Info': 'Контакты',
            Shipping: 'Доставка',
            Selection: 'Выбор',
            'Zone Error': 'Ошибка зоны',
        },
        cart: 'Корзина',
        waMessage:
            'Привет, {name}! Мы заметили, что ты оставил суши в корзине... 🍣 Помочь завершить заказ?',
        noCarts: 'Недавних брошенных корзин нет',
        noCartsSubtitle: 'Отличная работа! Или нам нужно больше трафика.',
        loading: 'Загрузка корзин...',
        timeline: 'История активности',
        events: {
            page_view: 'Просмотр страницы',
            cart_view: 'Просмотр корзины',
            add_to_cart: 'Добавил в корзину',
            remove_from_cart: 'Удалил из корзины',
            checkout_start: 'Начало оформления',
            promo_apply: 'Применен промокод',
            promo_code_error: 'Ошибка промокода',
            delivery_zone_error: 'Ошибка зоны доставки',
            delivery_info_filled: 'Данные заполнены',
            payment_method_selected: 'Выбран метод оплаты',
            checkout_step_change: 'Действие в чекауте',
            error_notice: 'Ошибка валидации',
        },
        emptyMetadata: 'Нет дополнительных деталей',
    },
    es: {
        title: 'Carritos Abandonados',
        subtitle: 'Últimos 7 días. Sesiones inactivas con artículos o contacto.',
        potentialCaptures: 'Potenciales capturas',
        refresh: 'Actualizar',
        anonymous: 'Cliente Anónimo',
        stageLabel: 'Etapa:',
        stages: {
            Payment: 'Pago',
            'Contact Info': 'Contacto',
            Shipping: 'Envío',
            Selection: 'Selección',
            'Zone Error': 'Error de Zona',
        },
        cart: 'Carrito',
        waMessage:
            '¡Hola {name}! Hemos visto que dejaste unos sushis en el carrito... 🍣 ¿Te ayudamos a terminar el pedido?',
        noCarts: 'No hay carritos abandonados recientes',
        noCartsSubtitle: '¡Buen trabajo! O tal vez necesitamos más tráfico.',
        loading: 'Cargando carritos...',
        timeline: 'Historial de actividad',
        events: {
            page_view: 'Vio la página',
            cart_view: 'Vio el carrito',
            add_to_cart: 'Añadió al carrito',
            remove_from_cart: 'Quitó del carrito',
            checkout_start: 'Inició checkout',
            promo_apply: 'Aplicó promo',
            promo_code_error: 'Error de promo',
            delivery_zone_error: 'Error de zona',
            delivery_info_filled: 'Datos rellenados',
            payment_method_selected: 'Método de pago',
            checkout_step_change: 'Acción en checkout',
            error_notice: 'Error de validación',
        },
        emptyMetadata: 'Sin detalles adicionales',
    },
} as const;

export default function AdminAbandonedCarts({ language = 'es' }: AdminAbandonedCartsProps) {
    const t = ABANDONED_TRANSLATIONS[language];
    const { success } = useToast();
    const [expandedTimelines, setExpandedTimelines] = useState<Set<string>>(new Set());

    const { data, isLoading, refetch, isFetching } = useQuery({
        queryKey: ['admin-abandoned-carts'],
        queryFn: () => api.get('/admin/abandoned-carts'),
        refetchInterval: 60000,
    });

    const toggleTimeline = (sid: string) => {
        const next = new Set(expandedTimelines);
        if (next.has(sid)) next.delete(sid);
        else next.add(sid);
        setExpandedTimelines(next);
    };

    const abandoned = data?.abandoned || [];

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-gray-100 shadow-sm animate-in fade-in">
                <RefreshCw
                    className="animate-spin text-orange-600 mb-6"
                    size={48}
                    strokeWidth={2}
                />
                <p className="text-gray-400 font-black uppercase tracking-[0.2em] text-[10px]">
                    {t.loading}
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm gap-6">
                <div>
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase">
                        {t.title}
                    </h2>
                    <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mt-1">
                        {t.subtitle}
                    </p>
                </div>
                <div className="flex items-center gap-4 w-full sm:w-auto">
                    <span className="flex-1 sm:flex-none text-center bg-orange-600 text-white px-6 py-4 rounded-[18px] text-[10px] font-black uppercase tracking-widest border-2 border-orange-500 shadow-xl shadow-orange-100">
                        {abandoned.length} {t.potentialCaptures}
                    </span>
                    <button
                        onClick={() => refetch()}
                        className="p-4 bg-gray-50 text-gray-400 hover:text-gray-900 border border-gray-100 rounded-[18px] transition-all hover:bg-white active:scale-95 shadow-sm"
                        title={t.refresh}
                    >
                        <RefreshCw
                            size={20}
                            strokeWidth={3}
                            className={isFetching ? 'animate-spin' : ''}
                        />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                <AnimatePresence mode="popLayout">
                    {abandoned.map((cart: any, idx: number) => (
                        <motion.div
                            key={cart.sessionId}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="bg-white border border-gray-100 rounded-[36px] overflow-hidden shadow-sm hover:shadow-md hover:border-orange-100 transition-all group"
                        >
                            <div className="p-8">
                                <div className="flex flex-col lg:flex-row gap-8">
                                    {/* Left Info */}
                                    <div className="flex-1 space-y-6">
                                        <div className="flex items-center gap-5">
                                            <div className="w-16 h-16 bg-orange-50 text-orange-600 rounded-[22px] flex items-center justify-center shadow-inner border border-orange-100/50">
                                                <User size={30} strokeWidth={2.5} />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-4 mb-1">
                                                    <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight flex items-center gap-2">
                                                        {cart.contact.name || t.anonymous}
                                                        {cart.userId && (
                                                            <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-600 text-[9px] px-2 py-0.5 rounded-lg border border-indigo-100 font-black tracking-widest shadow-sm">
                                                                {language === 'ru'
                                                                    ? 'ПРОФИЛЬ'
                                                                    : 'PERFIL'}
                                                            </span>
                                                        )}
                                                    </h3>
                                                    <span
                                                        className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border shadow-sm ${
                                                            cart.stage === 'Payment'
                                                                ? 'bg-amber-50 text-amber-600 border-amber-100'
                                                                : cart.stage === 'Contact Info'
                                                                  ? 'bg-blue-50 text-blue-600 border-blue-100'
                                                                  : cart.stage === 'Zone Error'
                                                                    ? 'bg-red-50 text-red-600 border-red-100'
                                                                    : 'bg-gray-50 text-gray-500 border-gray-100'
                                                        }`}
                                                    >
                                                        {t.stageLabel}{' '}
                                                        {t.stages[
                                                            cart.stage as keyof typeof t.stages
                                                        ] || cart.stage}
                                                    </span>
                                                </div>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-2">
                                                    <Clock
                                                        size={12}
                                                        strokeWidth={3}
                                                        className="text-gray-300"
                                                    />
                                                    <span
                                                        className="bg-gray-50 px-2 py-0.5 rounded-lg border border-gray-100 tabular-nums cursor-pointer active:scale-95 transition-transform"
                                                        title={cart.sessionId}
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(
                                                                cart.sessionId
                                                            );
                                                            success(
                                                                language === 'ru'
                                                                    ? 'ID сессии скопирован'
                                                                    : 'Sesión ID copiado'
                                                            );
                                                        }}
                                                    >
                                                        #{cart.sessionId.slice(0, 8).toUpperCase()}
                                                        ...
                                                    </span>
                                                    •{' '}
                                                    {new Date(cart.lastActivity).toLocaleString(
                                                        language === 'ru' ? 'ru-RU' : 'es-ES',
                                                        {
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                            day: '2-digit',
                                                            month: 'short',
                                                        }
                                                    )}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-3">
                                            {cart.contact.phone && (
                                                <a
                                                    href={`tel:${cart.contact.phone}`}
                                                    className="flex items-center gap-3 text-[10px] font-black text-gray-600 hover:text-orange-600 transition-all bg-gray-50 px-5 py-3 rounded-2xl border border-gray-100 uppercase tracking-widest active:scale-95"
                                                >
                                                    <Phone size={14} strokeWidth={3} />{' '}
                                                    {cart.contact.phone}
                                                </a>
                                            )}
                                            {cart.contact.email && (
                                                <a
                                                    href={`mailto:${cart.contact.email}`}
                                                    className="flex items-center gap-3 text-[10px] font-black text-gray-600 hover:text-blue-600 transition-all bg-gray-50 px-5 py-3 rounded-2xl border border-gray-100 uppercase tracking-widest active:scale-95"
                                                >
                                                    <Mail size={14} strokeWidth={3} />{' '}
                                                    {cart.contact.email}
                                                </a>
                                            )}
                                            {cart.contact.phone && (
                                                <a
                                                    href={`https://wa.me/${cart.contact.phone.replace(/\+/g, '')}?text=${encodeURIComponent(t.waMessage.replace('{name}', cart.contact.name || ''))}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="flex items-center gap-3 text-[10px] font-black text-white bg-green-500 hover:bg-black transition-all px-6 py-3 rounded-2xl border-2 border-green-400 shadow-xl shadow-green-100 uppercase tracking-[0.15em] active:scale-95"
                                                >
                                                    <MessageSquare size={14} strokeWidth={3} />{' '}
                                                    WhatsApp
                                                </a>
                                            )}
                                        </div>
                                    </div>

                                    {/* Items Info */}
                                    <div className="lg:w-80 bg-gray-50 group-hover:bg-orange-50/30 rounded-[28px] p-6 border border-gray-100 shadow-inner transition-colors">
                                        <div className="flex items-center justify-between mb-4 border-b border-gray-200/50 pb-4">
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                                <ShoppingCart size={14} strokeWidth={3} /> {t.cart}{' '}
                                                ({cart.items.length})
                                            </span>
                                            <span className="text-lg font-black text-gray-900 tabular-nums">
                                                {cart.totalValue.toFixed(2)}€
                                            </span>
                                        </div>
                                        <div className="space-y-3 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                                            {cart.items.map((item: any) => (
                                                <div
                                                    key={item.id}
                                                    className="flex justify-between items-start gap-4"
                                                >
                                                    <span className="text-xs font-black text-gray-600 flex-1 leading-tight uppercase tracking-tighter">
                                                        {item.quantity}x {item.name}
                                                    </span>
                                                    <span className="text-[11px] font-black text-orange-400 tabular-nums bg-white px-2 py-0.5 rounded-lg border border-orange-50 shadow-sm">
                                                        {(item.price * item.quantity).toFixed(2)}€
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Timeline Toggle */}
                                <button
                                    onClick={() => toggleTimeline(cart.sessionId)}
                                    className="mt-6 w-full flex items-center justify-center gap-2 py-4 bg-gray-50/50 hover:bg-white border-2 border-dashed border-gray-100 hover:border-orange-200 rounded-[20px] transition-all active:scale-[0.99] group/btn"
                                >
                                    <History
                                        size={16}
                                        className="text-gray-400 group-hover/btn:text-orange-600"
                                    />
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover/btn:text-orange-600">
                                        {t.timeline}
                                    </span>
                                    {expandedTimelines.has(cart.sessionId) ? (
                                        <ChevronUp size={16} className="text-gray-300" />
                                    ) : (
                                        <ChevronDown size={16} className="text-gray-300" />
                                    )}
                                </button>
                            </div>

                            <AnimatePresence>
                                {expandedTimelines.has(cart.sessionId) && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="bg-gray-50/50 border-t border-gray-100 overflow-hidden"
                                    >
                                        <div className="p-8 space-y-4">
                                            {cart.timeline?.map((event: any, evIdx: number) => (
                                                <div
                                                    key={event.id || evIdx}
                                                    className="flex gap-4 relative"
                                                >
                                                    {evIdx < cart.timeline.length - 1 && (
                                                        <div className="absolute left-[15px] top-8 bottom-[-16px] w-[2px] bg-gray-200" />
                                                    )}
                                                    <div
                                                        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-4 border-white shadow-sm z-10 ${
                                                            event.name.includes('error')
                                                                ? 'bg-red-500 text-white'
                                                                : 'bg-white text-gray-400'
                                                        }`}
                                                    >
                                                        {renderEventIcon(event.name)}
                                                    </div>
                                                    <div className="flex-1 pb-4">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <span className="text-[11px] font-black text-gray-900 uppercase tracking-tight">
                                                                {t.events[
                                                                    event.name as keyof typeof t.events
                                                                ] || event.name}
                                                            </span>
                                                            <span className="text-[10px] font-bold text-gray-400 tabular-nums">
                                                                {new Date(
                                                                    event.time
                                                                ).toLocaleTimeString(
                                                                    language === 'ru'
                                                                        ? 'ru-RU'
                                                                        : 'es-ES',
                                                                    {
                                                                        hour: '2-digit',
                                                                        minute: '2-digit',
                                                                        second: '2-digit',
                                                                    }
                                                                )}
                                                            </span>
                                                        </div>
                                                        {renderMetadata(event, language)}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                    {abandoned.length === 0 && (
                        <div className="text-center py-24 bg-white rounded-[48px] border-2 border-dashed border-gray-100 animate-in zoom-in-95">
                            <div className="w-24 h-24 bg-gray-50 text-gray-100 rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-inner">
                                <ShoppingCart size={48} strokeWidth={1} />
                            </div>
                            <h3 className="text-xl font-black text-gray-400 uppercase tracking-widest">
                                {t.noCarts}
                            </h3>
                            <p className="text-xs font-bold text-gray-300 mt-2 uppercase tracking-tight">
                                {t.noCartsSubtitle}
                            </p>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

function renderEventIcon(name: string) {
    if (name.includes('error')) return <AlertCircle size={14} strokeWidth={3} />;
    if (name === 'cart_view') return <ShoppingCart size={14} strokeWidth={3} />;
    if (name === 'promo_apply') return <Tag size={14} strokeWidth={3} />;
    if (name === 'delivery_info_filled') return <User size={14} strokeWidth={3} />;
    if (name === 'payment_method_selected') return <CreditCard size={14} strokeWidth={3} />;
    if (name === 'delivery_zone_error') return <MapPin size={14} strokeWidth={3} />;
    if (name === 'checkout_start') return <Package size={14} strokeWidth={3} />;
    if (name === 'checkout_step_change') return <RefreshCw size={14} strokeWidth={3} />;
    if (name === 'page_view') return <Clock size={14} strokeWidth={3} />;
    if (name === 'add_to_cart') return <Plus size={14} strokeWidth={3} />;
    if (name === 'remove_from_cart') return <Minus size={14} strokeWidth={3} />;
    return <ShoppingCart size={14} strokeWidth={3} />;
}

function renderMetadata(event: any, lang: 'ru' | 'es') {
    const { metadata } = event;
    const isRu = lang === 'ru';
    const humanKeys = isRu ? HUMAN_KEYS_RU : HUMAN_KEYS_ES;

    // Technical fields to hide
    const hiddenFields = [
        'screen',
        'userAgent',
        'referer',
        'timestamp',
        'language',
        'atSource',
        'user_agent',
        'is_test',
    ];

    const formatValue = (key: string, val: any): React.ReactNode => {
        if (val === null || val === undefined || val === '') return null;

        // Currency formatting
        if (key.toLowerCase().includes('value') || key.toLowerCase().includes('price')) {
            return <b className="text-gray-900">{Number(val).toFixed(2)}€</b>;
        }

        // List of items
        if (key === 'items' && Array.isArray(val)) {
            return (
                <div className="space-y-1 mt-1 border-l-2 border-gray-100 pl-3">
                    {val.map((item: any, i: number) => (
                        <div
                            key={i}
                            className="flex items-center gap-2 text-gray-900 leading-tight"
                        >
                            <Package size={10} className="text-gray-400" />
                            <span>
                                {item.quantity}x {item.name}
                            </span>
                            <span className="ml-auto opacity-50">{item.price?.toFixed(2)}€</span>
                        </div>
                    ))}
                </div>
            );
        }

        return <span className="text-gray-900 font-bold">{String(val)}</span>;
    };

    if (event.name === 'page_view') {
        const title = metadata.title?.split('—')[0] || metadata.path || '/';
        return (
            <div className="text-[10px] bg-white/80 border border-gray-100 rounded-xl p-3 mt-1.5 flex items-center gap-2 text-gray-900">
                <span className="opacity-50 font-normal">{isRu ? 'Страница:' : 'Página:'}</span>
                <span className="font-bold">{title}</span>
            </div>
        );
    }

    // Filter metadata
    const displayableKeys = Object.keys(metadata || {}).filter(k => !hiddenFields.includes(k));
    if (displayableKeys.length === 0) return null;

    return (
        <div className="text-[10px] bg-white/80 border border-gray-100 rounded-xl p-3 mt-1.5 space-y-2">
            {displayableKeys.map(key => {
                const val = formatValue(key, metadata[key]);
                if (!val) return null;

                const label = humanKeys[key] || key;

                return (
                    <div key={key} className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <span className="opacity-50 uppercase text-[9px] font-black flex items-center gap-1">
                                {label}:
                            </span>
                            {key !== 'items' && val}
                        </div>
                        {key === 'items' && val}
                    </div>
                );
            })}
        </div>
    );
}
