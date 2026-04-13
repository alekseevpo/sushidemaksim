import { useState, useRef, useCallback } from 'react';
import {
    Plus,
    Edit2,
    Trash2,
    CheckCircle,
    XCircle,
    RefreshCw,
    Clock,
    HelpCircle,
    Upload,
    Image as ImageIcon,
    X,
    PlusCircle,
    Info,
    Layout,
    ArrowDown,
    UserPlus,
    Cake,
    Star,
    Gift,
    Sparkles,
    Tag,
    GripVertical,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../utils/api';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface AdminPromosProps {
    language?: 'ru' | 'es';
}

const PROMOS_TRANSLATIONS = {
    ru: {
        title: 'Управление Акциями',
        newPromo: 'Добавить акцию',
        editPromo: 'Редактировать акцию',
        addPromo: 'Создать акцию',
        loading: 'Загрузка...',
        noPromos: 'Акций нет.',
        fields: {
            title: 'Заголовок',
            discount: 'Текст выгоды (напр: -20%, Подарок)',
            description: 'Описание',
            validUntil: 'Действие (текст)',
            icon: 'Emoji',
            color: 'Цвет (HEX)',
            gradient: 'Tailwind градиент',
            active: 'Активна',
            save: 'Сохранить',
            type: 'Тип блока',
            subtitle: 'Подзаголовок',
            ctaText: 'Текст кнопки',
            ctaLink: 'Ссылка кнопки',
            image: 'Изображение (WebP)',
            secondaryImages: 'Доп. фото (для сетки)',
        },
        types: {
            card: 'Карточка',
            banner: 'Баннер',
        },
        table: {
            promo: 'Акция',
            status: 'Статус',
            actions: 'Действия',
        },
        status: {
            active: 'Активна',
            inactive: 'Черновик',
        },
        modals: {
            deleteTitle: 'Удалить акцию?',
            deleteDesc: 'Вы собираетесь удалить "{name}". Это нельзя отменить.',
            yesDelete: 'УДАЛИТЬ',
            cancel: 'ОТМЕНА',
            uploading: 'Загрузка...',
            uploadBtn: 'Загрузить фото',
            addUrl: 'Или вставьте URL',
        },
        alerts: {
            updated: 'Обновлено',
            created: 'Создано',
            deleted: 'Удалено',
            errorSaving: 'Ошибка сохранения: ',
            errorDeleting: 'Ошибка удаления',
        },
        refresh: 'Обновить',
        hints: {
            title: 'Название акции',
            discount: '-20%, Подарок, Тест...',
            description: 'Условия акции',
            validUntil: 'До конца месяца/года',
            icon: 'Эмодзи для карточки',
            color: 'Цвет бренда (HEX)',
            gradient: 'Tailwind классы для фона баннера. Пример: "from-orange-500 to-amber-500"',
            type: 'Карточка (в сетке) или Баннер (на всю ширину с доп. фото и кнопкой)',
            subtitle:
                'Короткий текст над основным заголовком баннера. Пример: "ТОЛЬКО ДЛЯ НОВЫХ КЛИЕНТОВ"',
            ctaText: 'Текст на кнопке действия. Пример: "ЗАКАЗАТЬ", "ПЕРЕЙТИ В МЕНЮ"',
            ctaLink:
                'Куда перейдет пользователь (URL). Пример: "/menu", "/cart" или внешняя ссылка',
            secondaryImages:
                'URL дополнительных фото для сетки баннера. Добавьте 3-4 фото для лучшего вида.',
        },
    },
    es: {
        title: 'Gestión de Promos',
        newPromo: 'Añadir Promo',
        editPromo: 'Editar Promo',
        addPromo: 'Crear Promo',
        loading: 'Cargando...',
        noPromos: 'No hay promociones.',
        fields: {
            title: 'Título',
            discount: 'Descuento (ej: -20%, Regalo)',
            description: 'Descripción',
            validUntil: 'Válidez (texto)',
            icon: 'Emoji',
            color: 'Color (HEX)',
            gradient: 'Gradiente Tailwind',
            active: 'Activa',
            save: 'Guardar',
            type: 'Tipo de bloque',
            subtitle: 'Subtítulo',
            ctaText: 'Texto botón',
            ctaLink: 'Link botón',
            image: 'Imagen (WebP)',
            secondaryImages: 'Fotos extra (grid)',
        },
        types: {
            card: 'Tarjeta',
            banner: 'Banner',
        },
        table: {
            promo: 'Promo',
            status: 'Estado',
            actions: 'Acciones',
        },
        status: {
            active: 'Activa',
            inactive: 'Borrador',
        },
        modals: {
            deleteTitle: '¿Eliminar?',
            deleteDesc: 'Vas a borrar "{name}". No se puede deshacer.',
            yesDelete: 'ELIMINAR',
            cancel: 'CANCELAR',
            uploading: 'Subiendo...',
            uploadBtn: 'Subir Foto',
            addUrl: 'O pega una URL',
        },
        alerts: {
            updated: 'Actualizado',
            created: 'Creado',
            deleted: 'Eliminado',
            errorSaving: 'Error al guardar: ',
            errorDeleting: 'Error al borrar',
        },
        refresh: 'Actualizar',
        hints: {
            title: 'Nombre de la promoción',
            discount: '-20%, Regalo...',
            description: 'Términos de la promo',
            validUntil: 'Hasta fin de mes',
            icon: 'Emoji para la tarjeta',
            color: 'Color de marca (HEX)',
            gradient:
                'Clases Tailwind para el fondo del banner. Ej: "from-orange-500 to-amber-500"',
            type: 'Tarjeta (en rejilla) o Banner (ancho completo con fotos extra y botón)',
            subtitle: 'Texto corto sobre el título del banner. Ej: "SOLO PARA TI"',
            ctaText: 'Texto del botón de acción. Ej: "PEDIR AHORA", "VER MENÚ"',
            ctaLink: 'A dónde lleva el botón (URL). Ej: "/menu", "/cart" o link externo',
            secondaryImages:
                'Vínculos de fotos extra para el grid del banner. Se recomiendan 3-4 fotos.',
        },
    },
};

const FieldLabel = ({ title, hint, language, align = 'left', className = '' }: any) => {
    const [showHint, setShowHint] = useState(false);
    const infoLabel = language === 'ru' ? 'Подсказка' : 'Ayuda';

    return (
        <div className={`w-full relative flex items-center justify-between mb-1 pl-1 ${className}`}>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none pointer-events-none">
                {title}
            </label>
            <div className="relative">
                <button
                    type="button"
                    onMouseEnter={() => setShowHint(true)}
                    onMouseLeave={() => setShowHint(false)}
                    onClick={() => setShowHint(!showHint)}
                    className={`w-4 h-4 rounded-full flex items-center justify-center transition-all border-none cursor-pointer ${
                        showHint
                            ? 'bg-orange-500 text-white shadow-lg'
                            : 'bg-gray-100 text-gray-400 hover:bg-orange-50 hover:text-orange-500'
                    }`}
                >
                    <HelpCircle size={10} strokeWidth={3} />
                </button>

                <AnimatePresence>
                    {showHint && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 5 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 5 }}
                            className={`absolute ${
                                align === 'right' ? 'right-0' : 'left-0 sm:left-auto sm:right-0'
                            } bottom-full mb-3 w-64 bg-white/95 rounded-2xl shadow-2xl border border-gray-100 z-[100] overflow-hidden backdrop-blur-md pointer-events-none`}
                        >
                            <div className="bg-gray-900 px-4 py-2 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                                    <span className="text-[9px] font-black text-white uppercase tracking-widest">
                                        {infoLabel}
                                    </span>
                                </div>
                            </div>
                            <div className="p-4">
                                <p className="text-[11px] font-bold text-gray-600 leading-relaxed uppercase tracking-tight">
                                    {hint}
                                </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

// ─── Sortable Promo Row (DnD-Kit) ─────────────────────────────────────────────
const SortablePromoRow = ({ promo: p, index, onEdit, onDelete, t }: any) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: p.id,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 'auto',
        opacity: isDragging ? 0.8 : 1,
    } as React.CSSProperties;

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`flex items-center px-8 py-6 hover:bg-gray-50/50 transition-colors group ${
                isDragging ? 'bg-orange-50/60 shadow-xl rounded-2xl ring-2 ring-orange-200' : ''
            }`}
        >
            {/* Drag Handle */}
            <button
                {...attributes}
                {...listeners}
                className="w-10 flex items-center justify-center text-gray-300 hover:text-orange-500 cursor-grab active:cursor-grabbing transition-colors shrink-0 touch-none"
                aria-label="Перетащите для изменения порядка"
            >
                <GripVertical size={20} strokeWidth={2} />
            </button>

            {/* Promo Info */}
            <div className="flex-1 flex items-center gap-5 min-w-0">
                <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 transition-transform duration-300 relative overflow-hidden shrink-0"
                    style={{ backgroundColor: p.color }}
                >
                    {p.type === 'banner' && p.image_url ? (
                        <img
                            src={p.image_url}
                            className="absolute inset-0 w-full h-full object-cover opacity-50"
                            alt=""
                        />
                    ) : (
                        <div className={`absolute inset-0 bg-gradient-to-br ${p.bg} opacity-30`} />
                    )}
                    <span className="relative z-10">{p.icon}</span>
                </div>
                <div className="min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                        <span className="text-[9px] font-black text-gray-300 bg-gray-50 w-6 h-6 rounded-lg flex items-center justify-center border border-gray-100 shrink-0">
                            {index + 1}
                        </span>
                        <h4 className="font-black text-gray-900 text-lg tracking-tight truncate max-w-[200px]">
                            {p.title}
                        </h4>
                        <span className="text-[10px] font-black bg-gray-900 text-white px-3 py-1 rounded-xl shadow-sm uppercase tracking-tighter shrink-0">
                            {p.discount}
                        </span>
                    </div>
                    <p className="text-xs text-gray-400 font-bold line-clamp-1 max-w-[300px] uppercase">
                        {p.description}
                    </p>
                    {p.type === 'banner' && (
                        <div className="flex items-center gap-2 mt-2">
                            <span className="text-[9px] font-black bg-orange-100 text-orange-600 px-2 py-0.5 rounded-lg uppercase tracking-tighter">
                                BANNER
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Status */}
            <div className="w-32 flex justify-center shrink-0">
                {p.is_active ? (
                    <span className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-green-100 shadow-sm transition-all group-hover:bg-green-100">
                        <CheckCircle size={14} strokeWidth={3} /> {t.status.active}
                    </span>
                ) : (
                    <span className="flex items-center gap-2 text-gray-400 bg-gray-50 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-gray-100">
                        <XCircle size={14} strokeWidth={3} /> {t.status.inactive}
                    </span>
                )}
            </div>

            {/* Actions */}
            <div className="w-32 flex items-center justify-end gap-3 opacity-40 group-hover:opacity-100 transition-opacity shrink-0">
                <button
                    onClick={() => onEdit(p)}
                    className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:bg-black hover:text-white transition-all border border-gray-100 shadow-sm active:scale-95"
                >
                    <Edit2 size={18} strokeWidth={2} />
                </button>
                <button
                    onClick={() => onDelete(p)}
                    className="p-3 bg-orange-50 text-orange-400 rounded-xl hover:bg-orange-600 hover:text-white transition-all border border-orange-100 shadow-sm active:scale-95"
                    title={t.alerts.deleted}
                >
                    <Trash2 size={18} strokeWidth={2} />
                </button>
            </div>
        </div>
    );
};

export default function AdminPromos({ language = 'es' }: AdminPromosProps) {
    const queryClient = useQueryClient();
    const t = PROMOS_TRANSLATIONS[language];

    const [activeTab, setActiveTab] = useState<'banners' | 'loyalty'>('banners');
    const [isEditing, setIsEditing] = useState<any>(null);
    const [form, setForm] = useState({
        title: '',
        description: '',
        discount: '',
        valid_until: '',
        icon: '🎁',
        color: '#F59E0B',
        bg: 'from-amber-500 to-amber-400',
        is_active: true,
        type: 'card',
        subtitle: '',
        cta_text: '',
        cta_link: '',
        image: '',
        secondary_images: [] as string[],
        sort_order: 0,
    });
    const [promoToDelete, setPromoToDelete] = useState<any>(null);

    // Dynamic Site Settings (Loyalty Program)
    const { data: settings = {}, refetch: refetchSettings } = useQuery({
        queryKey: ['admin-settings'],
        queryFn: () => api.get('/admin/settings'),
    });

    const updateSettingsMutation = useMutation({
        mutationFn: (values: Record<string, any>) => api.put('/admin/settings', values),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
            refetchSettings();
        },
    });

    const handleToggleLoyalty = (key: string, currentValue: any) => {
        // Robust handling of string/boolean types from DB
        const isTrue = String(currentValue) === 'true' || currentValue === true;
        updateSettingsMutation.mutate({ [key]: isTrue ? 'false' : 'true' });
    };

    const handleUpdateLoyaltyValue = (key: string, value: string | number) => {
        updateSettingsMutation.mutate({ [key]: String(value) });
    };

    const {
        data: promosData,
        isLoading,
        refetch,
        isFetching,
    } = useQuery({
        queryKey: ['admin-promos'],
        queryFn: () => api.get('/admin/promos'),
    });

    const promos = promosData?.promos || [];

    const upsertMutation = useMutation({
        mutationFn: (payload: any) => {
            if (isEditing) {
                return api.put(`/admin/promos/${isEditing.id}`, payload);
            }
            return api.post('/admin/promos', payload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-promos'] });
            setIsEditing(null);
            setForm({
                title: '',
                description: '',
                discount: '',
                valid_until: '',
                icon: '🎁',
                color: '#F59E0B',
                bg: 'from-amber-500 to-amber-400',
                is_active: true,
                type: 'card',
                subtitle: '',
                cta_text: '',
                cta_link: '',
                image: '',
                secondary_images: [],
                sort_order: 0,
            });
            console.log(isEditing ? t.alerts.updated : t.alerts.created);
        },
        onError: (err: any) => {
            alert(t.alerts.errorSaving + (err?.message || 'Error'));
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => api.delete(`/admin/promos/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-promos'] });
            setPromoToDelete(null);
            console.log(t.alerts.deleted);
        },
        onError: () => {
            alert(t.alerts.errorDeleting);
        },
    });

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        upsertMutation.mutate(form);
    };

    // ─── DnD-Kit: Drag-and-drop Reorder ───────────────────────────
    const reorderMutation = useMutation({
        mutationFn: (items: { id: string; sort_order: number }[]) =>
            api.put('/admin/promos/reorder', { items }),
        onSuccess: (data: any) => {
            queryClient.setQueryData(['admin-promos'], data);
            queryClient.invalidateQueries({ queryKey: ['admin-promos'] });
        },
    });

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleDragEnd = useCallback(
        (event: DragEndEvent) => {
            const { active, over } = event;
            if (!over || active.id === over.id) return;

            const oldIndex = promos.findIndex((p: any) => p.id === active.id);
            const newIndex = promos.findIndex((p: any) => p.id === over.id);
            if (oldIndex === -1 || newIndex === -1) return;

            const reordered = arrayMove([...promos], oldIndex, newIndex);

            // Optimistic update
            queryClient.setQueryData(['admin-promos'], { promos: reordered });

            // Persist new order
            const items = reordered.map((p: any, idx: number) => ({
                id: p.id,
                sort_order: idx,
            }));
            reorderMutation.mutate(items);
        },
        [promos, queryClient, reorderMutation]
    );

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
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm gap-6 mb-8">
                <div className="flex flex-col gap-1">
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase flex items-center gap-3">
                        <Layout className="text-orange-600" size={24} strokeWidth={3} />
                        {t.title}
                    </h2>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] pl-9">
                        управление контентом и бонусами
                    </p>
                </div>

                <div className="flex items-center gap-2 p-1.5 bg-gray-50 rounded-2xl border border-gray-100">
                    <button
                        onClick={() => setActiveTab('banners')}
                        className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                            activeTab === 'banners'
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-400 hover:text-gray-600'
                        }`}
                    >
                        Акции
                    </button>
                    <button
                        onClick={() => setActiveTab('loyalty')}
                        className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                            activeTab === 'loyalty'
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-400 hover:text-gray-600'
                        }`}
                    >
                        Лояльность
                    </button>
                    <div className="w-px h-6 bg-gray-200 mx-2" />
                    <button
                        onClick={() => refetch()}
                        className="p-3 text-gray-400 hover:text-gray-900 bg-white border border-gray-100 rounded-xl transition-all shadow-sm active:scale-95"
                        title={t.refresh}
                    >
                        <RefreshCw
                            size={16}
                            strokeWidth={3}
                            className={isFetching ? 'animate-spin' : ''}
                        />
                    </button>
                </div>
            </div>

            {activeTab === 'banners' ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Form Column */}
                    <div className="lg:col-span-1">
                        <div className="flex items-center justify-between mb-4 px-2">
                            <div className="flex items-center gap-2">
                                <PlusCircle className="text-orange-500" size={20} />
                                <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest">
                                    {isEditing ? t.editPromo : t.newPromo}
                                </span>
                            </div>
                            {isEditing && (
                                <button
                                    onClick={() => {
                                        setIsEditing(null);
                                        setForm({
                                            title: '',
                                            description: '',
                                            discount: '',
                                            valid_until: '',
                                            icon: '🎁',
                                            color: '#F59E0B',
                                            bg: 'from-amber-500 to-amber-400',
                                            is_active: true,
                                            type: 'card',
                                            subtitle: '',
                                            cta_text: '',
                                            cta_link: '',
                                            image: '',
                                            secondary_images: [],
                                            sort_order: 0,
                                        });
                                    }}
                                    className="p-2 text-gray-400 hover:text-orange-600 transition-colors"
                                >
                                    <X size={16} strokeWidth={3} />
                                </button>
                            )}
                        </div>
                        <form
                            onSubmit={handleSave}
                            className="sticky top-8 bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 space-y-6"
                        >
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <FieldLabel
                                        title={t.fields.type}
                                        hint={t.hints.type}
                                        language={language}
                                    />
                                    <div className="grid grid-cols-2 gap-2 p-1 bg-gray-50 rounded-2xl">
                                        <button
                                            type="button"
                                            onClick={() => setForm({ ...form, type: 'card' })}
                                            className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                                form.type === 'card'
                                                    ? 'bg-white text-gray-900 shadow-sm'
                                                    : 'text-gray-400'
                                            }`}
                                        >
                                            {t.types.card}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setForm({ ...form, type: 'banner' })}
                                            className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                                form.type === 'banner'
                                                    ? 'bg-white text-gray-900 shadow-sm'
                                                    : 'text-gray-400'
                                            }`}
                                        >
                                            {t.types.banner}
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <FieldLabel
                                        title={t.fields.title}
                                        hint={t.hints.title}
                                        language={language}
                                    />
                                    <input
                                        required
                                        value={form.title}
                                        onChange={e => setForm({ ...form, title: e.target.value })}
                                        className="w-full bg-white border border-gray-100 rounded-2xl px-5 py-3.5 text-sm font-black text-gray-900 outline-none focus:bg-white focus:border-orange-400 transition-all shadow-inner"
                                    />
                                </div>

                                {form.type === 'banner' && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="space-y-4"
                                    >
                                        <div className="space-y-1">
                                            <FieldLabel
                                                title={t.fields.subtitle}
                                                hint={t.hints.subtitle}
                                                language={language}
                                            />
                                            <input
                                                value={form.subtitle}
                                                onChange={e =>
                                                    setForm({ ...form, subtitle: e.target.value })
                                                }
                                                className="w-full bg-white border border-gray-100 rounded-2xl px-5 py-3.5 text-sm font-black text-gray-900 outline-none focus:bg-white focus:border-orange-400 transition-all shadow-inner"
                                            />
                                        </div>
                                    </motion.div>
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <FieldLabel
                                            title={t.fields.discount}
                                            hint={t.hints.discount}
                                            language={language}
                                        />
                                        <input
                                            required
                                            value={form.discount}
                                            onChange={e =>
                                                setForm({ ...form, discount: e.target.value })
                                            }
                                            className="w-full bg-white border border-gray-100 rounded-2xl px-5 py-3.5 text-sm font-black text-gray-900 outline-none focus:bg-white focus:border-orange-400 transition-all shadow-inner"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <FieldLabel
                                            title={t.fields.validUntil}
                                            hint={t.hints.validUntil}
                                            language={language}
                                        />
                                        <input
                                            value={form.valid_until}
                                            onChange={e =>
                                                setForm({ ...form, valid_until: e.target.value })
                                            }
                                            className="w-full bg-white border border-gray-100 rounded-2xl px-5 py-3.5 text-sm font-black text-gray-900 outline-none focus:bg-white focus:border-orange-400 transition-all shadow-inner"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <FieldLabel
                                        title={t.fields.description}
                                        hint={t.hints.description}
                                        language={language}
                                    />
                                    <textarea
                                        required
                                        rows={2}
                                        value={form.description}
                                        onChange={e =>
                                            setForm({ ...form, description: e.target.value })
                                        }
                                        className="w-full bg-white border border-gray-100 rounded-2xl px-5 py-3.5 text-sm font-black text-gray-900 outline-none focus:bg-white focus:border-orange-400 transition-all shadow-inner resize-none"
                                    />
                                </div>

                                {form.type === 'banner' && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="space-y-4 pt-2"
                                    >
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <FieldLabel
                                                    title={t.fields.ctaText}
                                                    hint={t.hints.ctaText}
                                                    language={language}
                                                />
                                                <input
                                                    value={form.cta_text}
                                                    onChange={e =>
                                                        setForm({
                                                            ...form,
                                                            cta_text: e.target.value,
                                                        })
                                                    }
                                                    className="w-full bg-white border border-gray-100 rounded-2xl px-5 py-3.5 text-sm font-black text-gray-900 outline-none focus:bg-white focus:border-orange-400 transition-all shadow-inner"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <FieldLabel
                                                    title={t.fields.ctaLink}
                                                    hint={t.hints.ctaLink}
                                                    language={language}
                                                />
                                                <input
                                                    value={form.cta_link}
                                                    onChange={e =>
                                                        setForm({
                                                            ...form,
                                                            cta_link: e.target.value,
                                                        })
                                                    }
                                                    className="w-full bg-white border border-gray-100 rounded-2xl px-5 py-3.5 text-sm font-black text-gray-900 outline-none focus:bg-white focus:border-orange-400 transition-all shadow-inner"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <FieldLabel
                                                title={t.fields.image}
                                                language={language}
                                            />
                                            <div className="flex gap-2">
                                                <input
                                                    value={form.image}
                                                    onChange={e =>
                                                        setForm({ ...form, image: e.target.value })
                                                    }
                                                    className="flex-1 bg-white border border-gray-100 rounded-2xl px-5 py-3.5 text-xs font-black text-gray-900 outline-none focus:border-orange-400 transition-all"
                                                    placeholder="URL изображения"
                                                />
                                                <button
                                                    type="button"
                                                    className="p-4 bg-gray-50 text-gray-400 rounded-2xl hover:bg-orange-50 hover:text-orange-600 transition-all"
                                                >
                                                    <Upload size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <FieldLabel
                                            title={t.fields.icon}
                                            hint={t.hints.icon}
                                            language={language}
                                        />
                                        <input
                                            required
                                            value={form.icon}
                                            onChange={e =>
                                                setForm({ ...form, icon: e.target.value })
                                            }
                                            className="w-full bg-white border border-gray-100 rounded-2xl px-5 py-3.5 text-xl font-black text-gray-900 text-center outline-none focus:border-orange-400 transition-all shadow-inner"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <FieldLabel
                                            title={t.fields.color}
                                            hint={t.hints.color}
                                            language={language}
                                        />
                                        <div className="relative">
                                            <input
                                                required
                                                value={form.color}
                                                onChange={e =>
                                                    setForm({ ...form, color: e.target.value })
                                                }
                                                className="w-full bg-white border border-gray-100 rounded-2xl pl-12 pr-5 py-3.5 text-sm font-black text-gray-900 outline-none focus:border-orange-400 transition-all shadow-inner"
                                            />
                                            <div
                                                className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 rounded-md border border-gray-200"
                                                style={{ backgroundColor: form.color }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <FieldLabel
                                        title={t.fields.gradient}
                                        hint={t.hints.gradient}
                                        language={language}
                                    />
                                    <input
                                        required
                                        value={form.bg}
                                        onChange={e => setForm({ ...form, bg: e.target.value })}
                                        className="w-full bg-white border border-gray-100 rounded-2xl px-5 py-3.5 text-xs font-black text-gray-500 outline-none focus:border-orange-400 transition-all shadow-inner"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-4 gap-4">
                                <label className="flex items-center gap-3 cursor-pointer group/check">
                                    <div
                                        className={`w-10 h-6 rounded-full transition-all relative ${
                                            form.is_active ? 'bg-green-500' : 'bg-gray-200'
                                        }`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={form.is_active}
                                            onChange={e =>
                                                setForm({ ...form, is_active: e.target.checked })
                                            }
                                            className="hidden"
                                        />
                                        <div
                                            className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${
                                                form.is_active ? 'left-5' : 'left-1'
                                            }`}
                                        />
                                    </div>
                                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest group-hover/check:text-gray-900 transition-colors">
                                        {t.fields.active}
                                    </span>
                                </label>

                                <button
                                    type="submit"
                                    disabled={upsertMutation.isPending}
                                    className="flex-1 bg-gray-900 text-white px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-orange-600 transition-all disabled:opacity-50 flex items-center justify-center gap-3 active:scale-95 shadow-lg shadow-gray-200"
                                >
                                    {upsertMutation.isPending ? (
                                        <RefreshCw size={16} className="animate-spin" />
                                    ) : (
                                        <CheckCircle size={16} />
                                    )}
                                    {t.fields.save}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Table Column — Drag-and-Drop Sortable */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
                            <div className="bg-gray-50/50 border-b border-gray-100 px-8 py-5 flex items-center">
                                <div className="w-10" />
                                <span className="flex-1 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                    {t.table.promo}
                                </span>
                                <span className="w-32 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                    {t.table.status}
                                </span>
                                <span className="w-32 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                    {t.table.actions}
                                </span>
                            </div>
                            <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={handleDragEnd}
                            >
                                <SortableContext
                                    items={promos.map((p: any) => p.id)}
                                    strategy={verticalListSortingStrategy}
                                >
                                    <div className="divide-y divide-gray-50">
                                        {promos.map((p: any, idx: number) => (
                                            <SortablePromoRow
                                                key={p.id}
                                                promo={p}
                                                index={idx}
                                                onEdit={(promo: any) => {
                                                    setIsEditing(promo);
                                                    setForm(promo);
                                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                                }}
                                                onDelete={(promo: any) => setPromoToDelete(promo)}
                                                t={t}
                                            />
                                        ))}
                                    {promos.length === 0 && (
                                        <div className="px-8 py-20 text-center">
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="w-16 h-16 bg-gray-50 text-gray-200 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
                                                    <Plus size={32} />
                                                </div>
                                                <p className="text-gray-400 font-black uppercase tracking-widest text-xs">
                                                    {t.noPromos}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                    </div>
                                </SortableContext>
                            </DndContext>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="animate-in fade-in zoom-in-95 duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <LoyaltyCard
                            title="Скидка за регистрацию"
                            description="Автоматически применяется к первому заказу после подтверждения почты"
                            icon={<UserPlus size={24} />}
                            color="bg-purple-500"
                            value={settings.loyalty_registration_bonus_percent || '0'}
                            enabled={
                                String(settings.loyalty_registration_bonus_enabled) === 'true' ||
                                settings.loyalty_registration_bonus_enabled === true
                            }
                            onToggle={() =>
                                handleToggleLoyalty(
                                    'loyalty_registration_bonus_enabled',
                                    settings.loyalty_registration_bonus_enabled
                                )
                            }
                            onChange={val =>
                                handleUpdateLoyaltyValue('loyalty_registration_bonus_percent', val)
                            }
                        />

                        <LoyaltyCard
                            title="С днём рождения"
                            description="Скидка действует 3 дня до и 3 дня после праздника"
                            icon={<Cake size={24} />}
                            color="bg-pink-500"
                            value={settings.loyalty_birthday_bonus_percent || '0'}
                            enabled={
                                String(settings.loyalty_birthday_bonus_enabled) === 'true' ||
                                settings.loyalty_birthday_bonus_enabled === true
                            }
                            onToggle={() =>
                                handleToggleLoyalty(
                                    'loyalty_birthday_bonus_enabled',
                                    settings.loyalty_birthday_bonus_enabled
                                )
                            }
                            onChange={val =>
                                handleUpdateLoyaltyValue('loyalty_birthday_bonus_percent', val)
                            }
                        />

                        <LoyaltyCard
                            title="Каждый 5-й заказ"
                            description="Бонусная скидка на каждый пятый заказ клиента"
                            icon={<Star size={24} />}
                            color="bg-amber-500"
                            value={settings.loyalty_every_5th_bonus_percent || '0'}
                            enabled={
                                String(settings.loyalty_every_5th_bonus_enabled) === 'true' ||
                                settings.loyalty_every_5th_bonus_enabled === true
                            }
                            onToggle={() =>
                                handleToggleLoyalty(
                                    'loyalty_every_5th_bonus_enabled',
                                    settings.loyalty_every_5th_bonus_enabled
                                )
                            }
                            onChange={val =>
                                handleUpdateLoyaltyValue('loyalty_every_5th_bonus_percent', val)
                            }
                        />

                        <LoyaltyCard
                            title="Каждый 10-й заказ"
                            description="Особый подарок или повышенная скидка"
                            icon={<Gift size={24} />}
                            color="bg-emerald-500"
                            isGiftOnly={true}
                            enabled={
                                String(settings.loyalty_every_10th_gift_enabled) === 'true' ||
                                settings.loyalty_every_10th_gift_enabled === true
                            }
                            onToggle={() =>
                                handleToggleLoyalty(
                                    'loyalty_every_10th_gift_enabled',
                                    settings.loyalty_every_10th_gift_enabled
                                )
                            }
                        />

                        <LoyaltyCard
                            title="Newsletter Подписка"
                            description="Скидка за подписку на новости в футере"
                            icon={<Sparkles size={24} />}
                            color="bg-blue-500"
                            value={settings.newsletter_bonus_percent || '0'}
                            enabled={
                                String(settings.newsletter_bonus_enabled) === 'true' ||
                                settings.newsletter_bonus_enabled === true
                            }
                            onToggle={() =>
                                handleToggleLoyalty(
                                    'newsletter_bonus_enabled',
                                    settings.newsletter_bonus_enabled
                                )
                            }
                            onChange={val =>
                                handleUpdateLoyaltyValue('newsletter_bonus_percent', val)
                            }
                        />
                    </div>

                    <div className="mt-8 bg-black/5 rounded-[40px] p-10 border border-black/5 flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-black/5">
                            <Sparkles className="text-orange-500" size={32} />
                        </div>
                        <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight mb-2">
                            Автоматизация лояльности
                        </h3>
                        <p className="max-w-xl text-xs font-bold text-gray-400 uppercase leading-relaxed tracking-widest">
                            Все изменения вступают в силу мгновенно. Система автоматически
                            рассылает письма и применяет скидки в корзине пользователей.
                        </p>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {promoToDelete && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300"
                        onClick={() => setPromoToDelete(null)}
                    />
                    <div className="relative bg-white rounded-[32px] p-10 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200 border border-white">
                        <div className="text-center">
                            <div className="w-20 h-20 bg-orange-100 text-orange-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner border border-orange-50">
                                <Trash2 size={36} strokeWidth={2.5} />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 mb-3 tracking-tight uppercase">
                                {t.modals.deleteTitle}
                            </h3>
                            <p className="text-[11px] text-gray-400 font-bold mb-10 leading-relaxed uppercase tracking-widest">
                                {t.modals.deleteDesc.replace('{name}', '')}
                                <span className="text-orange-600 font-black block mt-2 text-base">
                                    "{promoToDelete.title}"
                                </span>
                            </p>
                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={() => deleteMutation.mutate(promoToDelete.id)}
                                    disabled={deleteMutation.isPending}
                                    className="w-full py-5 bg-orange-600 text-white rounded-2xl font-black text-[10px] tracking-[0.2em] hover:bg-black transition-all shadow-xl shadow-orange-100 active:scale-95 flex items-center justify-center gap-3"
                                >
                                    {deleteMutation.isPending && (
                                        <RefreshCw size={16} className="animate-spin" />
                                    )}
                                    {t.modals.yesDelete}
                                </button>
                                <button
                                    onClick={() => setPromoToDelete(null)}
                                    className="w-full py-5 bg-gray-50 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-2xl font-black text-[10px] tracking-[0.2em] transition-all active:scale-95"
                                >
                                    {t.modals.cancel}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// LoyaltyCard Component
function LoyaltyCard({
    title,
    description,
    icon,
    color,
    value,
    enabled,
    onToggle,
    onChange,
    isGiftOnly = false,
}: any) {
    return (
        <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 group relative overflow-hidden flex flex-col h-full">
            <div className={`absolute top-0 right-0 w-32 h-32 ${color} opacity-[0.03] rounded-bl-[100px] transition-all group-hover:w-36 group-hover:h-36`} />
            
            <div className="flex justify-between items-start mb-8 relative z-10">
                <div className={`w-14 h-14 rounded-2xl ${color} text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                    {icon}
                </div>
                <button 
                    onClick={onToggle}
                    className={`w-12 h-7 rounded-full transition-all relative cursor-pointer ${enabled ? 'bg-green-500' : 'bg-gray-200'}`}
                >
                    <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all shadow-md ${enabled ? 'left-6' : 'left-1'}`} />
                </button>
            </div>

            <h4 className="text-sm font-black text-gray-900 uppercase tracking-tight mb-2 relative z-10">{title}</h4>
            <p className="text-[10px] font-bold text-gray-400 uppercase leading-relaxed tracking-wider mb-8 flex-grow relative z-10">{description}</p>

            {!isGiftOnly && (
                <div className="relative z-10 space-y-4 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                    <div className="flex justify-between items-end">
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Величина скидки</span>
                        <span className="text-xl font-black text-gray-900 tracking-tighter">-{value}%</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <ArrowDown size={14} className="text-gray-300" />
                        <input 
                            type="range"
                            min="0"
                            max="50"
                            step="1"
                            value={value || 0}
                            onChange={(e) => onChange?.(e.target.value)}
                            className="flex-1 accent-orange-500 h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer"
                        />
                    </div>
                </div>
            )}

            {isGiftOnly && (
                <div className="relative z-10 flex items-center gap-3 bg-orange-50 p-4 rounded-2xl border border-orange-100">
                    <div className="w-8 h-8 rounded-xl bg-orange-500 text-white flex items-center justify-center shadow-sm">
                        <Gift size={16} />
                    </div>
                    <span className="text-[9px] font-black text-orange-600 uppercase tracking-widest">Статус: Подарок активно</span>
                </div>
            )}
        </div>
    );
}
