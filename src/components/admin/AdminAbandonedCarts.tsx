import { useQuery } from '@tanstack/react-query';
import { ShoppingCart, User, Phone, Mail, Clock, MessageSquare, RefreshCw } from 'lucide-react';
import { api } from '../../utils/api';
import { motion, AnimatePresence } from 'framer-motion';

interface AdminAbandonedCartsProps {
    language?: 'ru' | 'es';
}

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
        },
        cart: 'Корзина',
        waMessage:
            'Привет, {name}! Мы заметили, что ты оставил суши в корзине... 🍣 Помочь завершить заказ?',
        noCarts: 'Недавних брошенных корзин нет',
        noCartsSubtitle: 'Отличная работа! Или нам нужно больше трафика.',
        loading: 'Загрузка корзин...',
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
        },
        cart: 'Carrito',
        waMessage:
            '¡Hola {name}! Hemos visto que dejaste unos sushis en el carrito... 🍣 ¿Te ayudamos a terminar el pedido?',
        noCarts: 'No hay carritos abandonados recientes',
        noCartsSubtitle: '¡Buen trabajo! O tal vez necesitamos más tráfico.',
        loading: 'Cargando carritos...',
    },
} as const;

export default function AdminAbandonedCarts({ language = 'es' }: AdminAbandonedCartsProps) {
    const t = ABANDONED_TRANSLATIONS[language];
    const { data, isLoading, refetch, isFetching } = useQuery({
        queryKey: ['admin-abandoned-carts'],
        queryFn: () => api.get('/admin/abandoned-carts'),
        refetchInterval: 60000,
    });

    const abandoned = data?.abandoned || [];

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-gray-100 shadow-sm animate-in fade-in">
                <RefreshCw className="animate-spin text-red-600 mb-6" size={48} strokeWidth={2} />
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
                    <span className="flex-1 sm:flex-none text-center bg-red-600 text-white px-6 py-4 rounded-[18px] text-[10px] font-black uppercase tracking-widest border-2 border-red-500 shadow-xl shadow-red-100">
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
                            className="bg-white border border-gray-100 rounded-[36px] p-8 shadow-sm hover:shadow-md hover:border-red-100 transition-all group"
                        >
                            <div className="flex flex-col lg:flex-row gap-8">
                                {/* Left Info */}
                                <div className="flex-1 space-y-6">
                                    <div className="flex items-center gap-5">
                                        <div className="w-16 h-16 bg-red-50 text-red-600 rounded-[22px] flex items-center justify-center shadow-inner border border-red-100/50">
                                            <User size={30} strokeWidth={2.5} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-4 mb-1">
                                                <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">
                                                    {cart.contact.name || t.anonymous}
                                                </h3>
                                                <span
                                                    className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border shadow-sm ${
                                                        cart.stage === 'Payment'
                                                            ? 'bg-amber-50 text-amber-600 border-amber-100'
                                                            : cart.stage === 'Contact Info'
                                                              ? 'bg-blue-50 text-blue-600 border-blue-100'
                                                              : 'bg-gray-50 text-gray-500 border-gray-100'
                                                    }`}
                                                >
                                                    {t.stageLabel}{' '}
                                                    {t.stages[
                                                        cart.stage as keyof typeof t.stages
                                                    ] || cart.stage}
                                                </span>
                                            </div>
                                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest flex items-center gap-2">
                                                <Clock
                                                    size={12}
                                                    strokeWidth={3}
                                                    className="text-gray-300"
                                                />
                                                ID: {cart.sessionId.slice(0, 8)} •{' '}
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
                                                className="flex items-center gap-3 text-[10px] font-black text-gray-600 hover:text-red-600 transition-all bg-gray-50 px-5 py-3 rounded-2xl border border-gray-100 uppercase tracking-widest active:scale-95"
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
                                                <MessageSquare size={14} strokeWidth={3} /> WhatsApp
                                            </a>
                                        )}
                                    </div>
                                </div>

                                {/* Items Info */}
                                <div className="lg:w-80 bg-gray-50 group-hover:bg-red-50/30 rounded-[28px] p-6 border border-gray-100 shadow-inner transition-colors">
                                    <div className="flex items-center justify-between mb-4 border-b border-gray-200/50 pb-4">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                            <ShoppingCart size={14} strokeWidth={3} /> {t.cart} (
                                            {cart.items.length})
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
                                                <span className="text-[11px] font-black text-red-400 tabular-nums bg-white px-2 py-0.5 rounded-lg border border-red-50 shadow-sm">
                                                    {(item.price * item.quantity).toFixed(2)}€
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
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
