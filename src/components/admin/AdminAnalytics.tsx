import {
    Monitor,
    Users,
    Activity,
    ExternalLink,
    TrendingUp,
    Clock,
    Heart,
    Share2,
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
    AreaChart,
    Area,
} from 'recharts';

interface AdminAnalyticsProps {
    stats: any;
    loading: boolean;
}

export default function AdminAnalytics({ stats, loading }: AdminAnalyticsProps) {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-900">Analítica Avanzada</h2>
                <div className="flex gap-2">
                    <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-[10px] font-bold border border-blue-100 uppercase tracking-wider">
                        Últimos 90 días
                    </span>
                </div>
            </div>

            {/* Top Insight Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                        LTV Promedio
                    </p>
                    <div className="flex items-end gap-2">
                        <span className="text-xl font-black text-gray-900">
                            {loading ? '...' : `${stats?.ltv || 0}€`}
                        </span>
                        <TrendingUp size={14} className="text-green-500 mb-1" />
                    </div>
                    <p className="text-[9px] text-gray-400 mt-1">Valor de vida del cliente</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                        Ticket Medio
                    </p>
                    <div className="flex items-end gap-2">
                        <span className="text-xl font-black text-gray-900">
                            {loading
                                ? '...'
                                : `${Math.round((stats?.stats?.revenue / stats?.stats?.totalOrders || 0) * 100) / 100}€`}
                        </span>
                    </div>
                    <p className="text-[9px] text-gray-400 mt-1">Promedio por pedido</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                        Tasa de Retención
                    </p>
                    <div className="flex items-end gap-2">
                        <span className="text-xl font-black text-gray-900">
                            {loading
                                ? '...'
                                : `${Math.round((stats?.retention?.returning / (stats?.retention?.new + stats?.retention?.returning || 1)) * 100)}%`}
                        </span>
                    </div>
                    <p className="text-[9px] text-gray-400 mt-1">Clientes recurrentes (30d)</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                        Margen Estimado
                    </p>
                    <div className="flex items-end gap-2">
                        <span className="text-xl font-black text-green-600">65%</span>
                    </div>
                    <p className="text-[9px] text-gray-400 mt-1">
                        Promedio sobre coste ingredientes
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Device Distribution */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                    <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2 text-sm">
                        <Monitor size={16} strokeWidth={1.5} className="text-blue-500" />
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
                                                    stats?.analytics?.devices?.mobile ||
                                                    stats?.analytics?.devices?.Mobile ||
                                                    0,
                                            },
                                            {
                                                name: 'Escritorio',
                                                value:
                                                    stats?.analytics?.devices?.desktop ||
                                                    stats?.analytics?.devices?.Desktop ||
                                                    stats?.analytics?.devices?.Unknown ||
                                                    0,
                                            },
                                            {
                                                name: 'Tablet',
                                                value:
                                                    stats?.analytics?.devices?.tablet ||
                                                    stats?.analytics?.devices?.Tablet ||
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
                                        <Cell fill="#10B981" />
                                        <Cell fill="#F59E0B" />
                                    </Pie>
                                    <Tooltip />
                                    <Legend wrapperStyle={{ fontSize: '9px' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                    <p className="text-[10px] text-gray-400 mt-4 leading-relaxed border-t border-gray-50 pt-3">
                        **Зачем это нужно:** Показывает, как клиенты делают заказы. Если 90% заказов
                        с мобильных, сайт должен быть идеально удобен для телефона. Если высок %
                        компьютеров, значит люди часто заказывают из офисов или дома на ужин.
                    </p>
                </div>

                {/* Customer Retention */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                    <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2 text-sm">
                        <Users size={16} strokeWidth={1.5} className="text-purple-500" />
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
                                                value: stats?.retention?.returning || 0,
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
                    <p className="text-[10px] text-gray-400 mt-4 leading-relaxed border-t border-gray-50 pt-3">
                        **Зачем это нужно:** Отражает лояльность. Если много повторных заказов —
                        кухня отличная. Если почти все новые — вам нужно работать над тем, чтобы
                        клиенты возвращались (бонусы, рассылки).
                    </p>
                </div>

                {/* Category Performance */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                    <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2 text-sm">
                        <Activity size={16} strokeWidth={1.5} className="text-red-500" />
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
                                            str.length > 10 ? str.substring(0, 8) + '..' : str
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
                    <p className="text-[10px] text-gray-400 mt-4 leading-relaxed border-t border-gray-50 pt-3">
                        **Зачем это нужно:** Помогает понять, какие разделы меню приносят основную
                        прибыль, а какие — высокий средний чек. Используйте это для изменения цен
                        или поиска более дешевых поставщиков для популярных групп.
                    </p>
                </div>

                {/* Browser Distribution */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                    <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2 text-sm">
                        <ExternalLink size={16} strokeWidth={1.5} className="text-gray-500" />
                        Navegadores (30d)
                    </h3>
                    {loading ? (
                        <div className="h-48 bg-gray-50 rounded animate-pulse"></div>
                    ) : (
                        <div className="h-48">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={Object.entries(stats?.analytics?.browsers || {}).map(
                                            ([name, value]) => ({
                                                name,
                                                value,
                                            })
                                        )}
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
                                            '#8B5CF6',
                                        ].map((color, index) => (
                                            <Cell key={index} fill={color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend wrapperStyle={{ fontSize: '9px' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                    <p className="text-[10px] text-gray-400 mt-4 leading-relaxed border-t border-gray-50 pt-3">
                        **Зачем это нужно:** Техническая статистика. Помогает разработчикам
                        убедиться, что сайт работает быстро во всех популярных браузерах, которыми
                        пользуются ваши клиенты.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-20">
                {/* Sales Growth Area Chart */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <TrendingUp size={18} strokeWidth={1.5} className="text-green-500" />
                        Crecimiento de Ventas (30d)
                    </h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stats?.growth}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    vertical={false}
                                    stroke="#f0f0f0"
                                />
                                <XAxis
                                    dataKey="date"
                                    fontSize={10}
                                    axisLine={false}
                                    tickLine={false}
                                    tickFormatter={str =>
                                        str && typeof str === 'string' ? str.split('-')[2] : ''
                                    }
                                />
                                <YAxis
                                    fontSize={10}
                                    axisLine={false}
                                    tickLine={false}
                                    tickFormatter={val => `${val}€`}
                                />
                                <Tooltip />
                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#ef4444"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorRevenue)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                    <p className="text-xs text-gray-400 mt-6 leading-relaxed bg-gray-50 p-3 rounded-lg border border-dashed border-gray-200">
                        **Зачем это нужно:** Визуальный тренд вашего бизнеса. Позволяет увидеть
                        влияние праздников, выходных или рекламных акций на реальную выручку в
                        динамике. Идеально для оценки "здоровья" ресторана за месяц.
                    </p>
                </div>

                {/* Activity Heatmap (Hourly) */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <Clock size={18} strokeWidth={1.5} className="text-blue-500" />
                        Picos de Actividad (Horario)
                    </h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={
                                    (stats?.heatmap?.hourly || []).map((v: number, i: number) => ({
                                        hour: `${i}h`,
                                        pedidos: v,
                                    })) || []
                                }
                            >
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    vertical={false}
                                    stroke="#f0f0f0"
                                />
                                <XAxis
                                    dataKey="hour"
                                    fontSize={10}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis fontSize={10} axisLine={false} tickLine={false} />
                                <Tooltip />
                                <Bar dataKey="pedidos" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <p className="text-xs text-gray-400 mt-6 leading-relaxed bg-gray-50 p-3 rounded-lg border border-dashed border-gray-200">
                        **Зачем это нужно:** Определяет часы пиковой нагрузки на кухню. Если в 19:00
                        всегда всплеск, повара должны быть полностью готовы к этому времени и иметь
                        все заготовки.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Promo Performance */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <TrendingUp size={18} strokeWidth={1.5} className="text-purple-500" />
                        Efectividad de Promociones (90d)
                    </h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg border border-purple-100">
                            <span className="text-sm font-medium text-purple-900">
                                Pedidos con Descuento
                            </span>
                            <span className="text-lg font-black text-purple-700">
                                {stats?.promoStats?.count || 0}
                            </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                                <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">
                                    Ahorro Total Cliente
                                </p>
                                <p className="text-lg font-bold text-gray-900">
                                    {stats?.promoStats?.totalDiscount || 0}€
                                </p>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                                <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">
                                    Descuento Promedio
                                </p>
                                <p className="text-lg font-bold text-gray-900">
                                    {stats?.promoStats?.avgDiscount || 0}€
                                </p>
                            </div>
                        </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-6 leading-relaxed border-t border-gray-50 pt-4">
                        **Зачем это нужно:** Оценивает, сколько выручки приносят акции и насколько
                        велик средний дисконт. Помогает понять, не слишком ли много вы раздаете
                        скидок и стоит ли игра свеч.
                    </p>
                </div>

                {/* Area Distribution */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <ExternalLink size={18} strokeWidth={1.5} className="text-indigo-500" />
                        Zonas de Entrega Populares
                    </h3>
                    <div className="space-y-2">
                        {(stats?.areaStats || []).slice(0, 5).map((area: any, idx: number) => (
                            <div key={idx} className="flex flex-col gap-1">
                                <div className="flex justify-between text-xs font-bold">
                                    <span className="text-gray-700">{area.name}</span>
                                    <span className="text-gray-400">
                                        {area.count} ped. / {area.revenue}€
                                    </span>
                                </div>
                                <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                                    <div
                                        className="bg-indigo-500 h-full rounded-full transition-all duration-1000"
                                        style={{
                                            width: `${Math.min(100, (area.revenue / (stats?.areaStats?.[0]?.revenue || 1)) * 100)}%`,
                                        }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <p className="text-xs text-gray-400 mt-6 leading-relaxed border-t border-gray-50 pt-4">
                        **Зачем это нужно:** Показывает основные районы доставки. Помогает
                        оптимизировать логистику и понять, где живет ваша основная аудитория для
                        точечной рекламы.
                    </p>
                </div>
            </div>

            {/* Engagement Analytics (Favorites & Shares) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Top Favorited */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2 text-sm">
                        <Heart size={16} strokeWidth={1.5} className="text-red-500 fill-red-50" />
                        Productos más deseados (Favoritos)
                    </h3>
                    <div className="space-y-4">
                        {loading ? (
                            Array(5)
                                .fill(0)
                                .map((_, i) => <div key={i} className="h-8 skeleton rounded-lg" />)
                        ) : (stats?.topFavorited || []).length > 0 ? (
                            stats.topFavorited.map((item: any, idx: number) => (
                                <div key={idx} className="flex items-center justify-between group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-5 h-5 rounded bg-red-50 flex items-center justify-center text-[10px] font-black text-red-600">
                                            {idx + 1}
                                        </div>
                                        <span className="text-xs font-bold text-gray-700 group-hover:text-red-600 transition-colors truncate max-w-[150px]">
                                            {item.name}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-xs font-black text-gray-900">
                                            {item.count}
                                        </span>
                                        <Heart size={10} className="text-red-400 fill-red-400" />
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-[10px] text-gray-400 text-center py-4 italic font-medium">
                                No hay datos de favoritos aún
                            </p>
                        )}
                    </div>
                    <p className="text-[10px] text-gray-500 mt-6 leading-relaxed bg-red-50/50 p-3 rounded-lg border border-red-100/50">
                        <span className="font-bold text-red-700">Что это значит:</span> Это товары с
                        высоким "скрытым" спросом. Люди добавляют их в избранное, чтобы купить позже
                        или не забыть.
                        <br />
                        <br />
                        <span className="font-bold text-red-700">Совет:</span> Запустите временную
                        акцию на эти позиции, чтобы превратить "хотелки" в реальные заказы.
                    </p>
                </div>

                {/* Top Shared */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2 text-sm">
                        <Share2 size={16} strokeWidth={1.5} className="text-blue-500" />
                        Productos virales (Compartidos)
                    </h3>
                    <div className="space-y-4">
                        {loading ? (
                            Array(5)
                                .fill(0)
                                .map((_, i) => <div key={i} className="h-8 skeleton rounded-lg" />)
                        ) : (stats?.topShared || []).length > 0 ? (
                            stats.topShared.map((item: any, idx: number) => (
                                <div key={idx} className="flex items-center justify-between group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-5 h-5 rounded bg-blue-50 flex items-center justify-center text-[10px] font-black text-blue-600">
                                            {idx + 1}
                                        </div>
                                        <span className="text-xs font-bold text-gray-700 group-hover:text-blue-600 transition-colors truncate max-w-[150px]">
                                            {item.name}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-xs font-black text-gray-900">
                                            {item.count}
                                        </span>
                                        <Share2 size={10} className="text-blue-400" />
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-[10px] text-gray-400 text-center py-4 italic font-medium">
                                No hay datos de compartidos aún
                            </p>
                        )}
                    </div>
                    <p className="text-[10px] text-gray-500 mt-6 leading-relaxed bg-blue-50/50 p-3 rounded-lg border border-blue-100/50">
                        <span className="font-bold text-blue-700">Что это значит:</span> Эти товары
                        чаще всего пересылают друзьям в мессенджерах. Они визуально привлекательны
                        или имеют "виральный" потенциал.
                        <br />
                        <br />
                        <span className="font-bold text-blue-700">Совет:</span> Используйте фото
                        именно этих блюд в своей рекламе в Instagram и Facebook — они лучше всего
                        привлекают новых клиентов.
                    </p>
                </div>
            </div>

            {/* ABC Analysis Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                        <Activity size={18} strokeWidth={1.5} className="text-emerald-500" />
                        Análisis ABC del Menú (Rentabilidad 90d)
                    </h3>
                    <div className="flex gap-2">
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[9px] font-black rounded uppercase">
                            Cat A (80%)
                        </span>
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[9px] font-black rounded uppercase">
                            Cat B (15%)
                        </span>
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[9px] font-black rounded uppercase">
                            Cat C (5%)
                        </span>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-50">
                                <th className="pb-3 text-[10px] font-bold text-gray-400 uppercase">
                                    Producto
                                </th>
                                <th className="pb-3 text-[10px] font-bold text-gray-400 uppercase text-right">
                                    Uds
                                </th>
                                <th className="pb-3 text-[10px] font-bold text-gray-400 uppercase text-right">
                                    Ingresos
                                </th>
                                <th className="pb-3 text-[10px] font-bold text-gray-400 uppercase text-right">
                                    % Rev
                                </th>
                                <th className="pb-3 text-[10px] font-bold text-gray-400 uppercase text-center">
                                    ABC
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {(stats?.abcAnalysis || [])
                                .slice(0, 15)
                                .map((item: any, idx: number) => (
                                    <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="py-2.5 text-xs font-bold text-gray-800">
                                            {item.name}
                                        </td>
                                        <td className="py-2.5 text-xs text-gray-500 text-right font-medium">
                                            {item.sold}
                                        </td>
                                        <td className="py-2.5 text-xs font-bold text-gray-900 text-right">
                                            {item.revenue}€
                                        </td>
                                        <td className="py-2.5 text-xs text-gray-400 text-right">
                                            {Math.round(item.revenueShare * 10) / 10}%
                                        </td>
                                        <td className="py-2.5 text-center">
                                            <span
                                                className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-black ${
                                                    item.category === 'A'
                                                        ? 'bg-emerald-100 text-emerald-700'
                                                        : item.category === 'B'
                                                          ? 'bg-blue-100 text-blue-700'
                                                          : 'bg-gray-100 text-gray-500'
                                                }`}
                                            >
                                                {item.category}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
                <p className="text-xs text-gray-400 mt-6 leading-relaxed bg-emerald-50/50 p-4 rounded-xl border border-emerald-100/50">
                    **Зачем это нужно:** Золотой стандарт управления меню. Позволяет мгновенно
                    увидеть хиты (**Группа A**), которые приносят 80% выручки — их нельзя трогать.
                    **Группа B** — стабильные блюда. **Группа C** — кандидаты на замену, так как они
                    нагружают склад и кухню, но почти не приносят денег.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-6 pb-20">
                {/* Weekly Heatmap Matrix */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 overflow-hidden">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-gray-900 flex items-center gap-2">
                            <Activity size={18} strokeWidth={1.5} className="text-orange-500" />
                            Mapa de Calor Semanal (Día vs Hora)
                        </h3>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-orange-50"></span>
                                <span className="text-[9px] text-gray-400 font-bold uppercase">
                                    Bajo
                                </span>
                            </div>
                            <div className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-orange-600"></span>
                                <span className="text-[9px] text-gray-400 font-bold uppercase">
                                    Pico
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <div className="min-w-[800px]">
                            {/* Matrix Header (Hours) */}
                            <div className="flex mb-2 ml-16">
                                {Array.from({ length: 24 }).map((_, i) => (
                                    <div
                                        key={i}
                                        className="flex-1 text-[9px] text-gray-400 font-bold text-center"
                                    >
                                        {i === 0 || i === 12 || i === 23 ? `${i}h` : ''}
                                        {i !== 0 && i !== 12 && i !== 23 && i % 3 === 0
                                            ? `${i}`
                                            : ''}
                                    </div>
                                ))}
                            </div>

                            {/* Matrix Rows */}
                            {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(
                                (day, dayIdx) => (
                                    <div key={day} className="flex items-center mb-1 group">
                                        <div className="w-16 text-[10px] font-bold text-gray-500 pr-4 text-right">
                                            {day}
                                        </div>
                                        <div className="flex-1 flex gap-0.5 h-8">
                                            {Array.from({ length: 24 }).map((_, hourIdx) => {
                                                const value =
                                                    stats?.heatmap?.matrix?.[dayIdx]?.[hourIdx] ||
                                                    0;
                                                // Scale intensity (Max assumption 8 for coloring)
                                                const intensity = Math.min(1, value / 8);
                                                return (
                                                    <div
                                                        key={hourIdx}
                                                        title={`${day} ${hourIdx}h: ${value} pedidos`}
                                                        className="flex-1 rounded-sm transition-all hover:ring-2 hover:ring-orange-400 cursor-help"
                                                        style={{
                                                            backgroundColor: `rgba(234, 88, 12, ${Math.max(0.05, intensity)})`,
                                                        }}
                                                    />
                                                );
                                            })}
                                        </div>
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                    <p className="text-[10px] text-gray-500 mt-6 bg-orange-50/50 p-3 rounded-lg border border-orange-100 leading-relaxed italic">
                        **Зачем это нужно:** Самый мощный инструмент планирования. Показывает точные
                        окна перегрузок и простоев по дням недели. Используйте его для гибкого
                        графика курьеров и персонала — выводите больше людей в темные зоны и
                        отпускайте раньше в светлые.
                    </p>
                </div>
            </div>
        </div>
    );
}
