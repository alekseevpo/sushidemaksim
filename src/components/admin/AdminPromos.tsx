import { useState } from 'react';
import {
    Plus,
    Edit2,
    Trash2,
    CheckCircle,
    XCircle,
    RefreshCw,
    Clock,
    HelpCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, ApiError } from '../../utils/api';

interface AdminPromosProps {
    language?: 'ru' | 'es';
}

const PROMOS_TRANSLATIONS = {
    ru: {
        title: 'Статические акции',
        newPromo: 'Новая акция',
        editPromo: 'Редактировать акцию',
        addPromo: 'Добавить акцию',
        loading: 'Загрузка акций...',
        noPromos: 'Акций нет.',
        fields: {
            title: 'Заголовок',
            discount: 'Скидка (напр: -20%, Подарок)',
            description: 'Описание',
            validUntil: 'Действительно до (текст)',
            icon: 'Иконка (Emoji)',
            color: 'Основной цвет (HEX)',
            gradient: 'Градиент Tailwind',
            active: 'Активна (видна пользователям)',
            save: 'Сохранить',
        },
        table: {
            promo: 'Акция',
            status: 'Статус',
            actions: 'Действия',
        },
        status: {
            active: 'Активна',
            inactive: 'Неактивна',
        },
        modals: {
            deleteTitle: 'Удалить акцию?',
            deleteDesc: 'Вы собираетесь удалить "{name}". Это действие нельзя отменить.',
            yesDelete: 'ДА, УДАЛИТЬ',
            cancel: 'ОТМЕНА',
        },
        alerts: {
            updated: 'Акция обновлена',
            created: 'Акция создана',
            deleted: 'Акция удалена',
            errorSaving: 'Ошибка при сохранении: ',
            errorDeleting: 'Ошибка при удалении',
        },
        refresh: 'Обновить',
        hints: {
            title: 'Название акции (например, "Комбо Дня")',
            discount: 'Текст выгоды: процент ( -20% ) или просто "Подарок"',
            description: 'Кратко опишите условия или состав предложения',
            validUntil: 'Текст о сроке действия (например, "До конца марта")',
            icon: 'Emoji-символ, который будет виден на карточке',
            color: 'Основной цвет в формате HEX (например, #F2BC00)',
            gradient: 'Настройка градиента Tailwind (from-color to-color)',
            info: 'Подсказка',
        },
    },
    es: {
        title: 'Promociones Estáticas',
        newPromo: 'Nueva Promoción',
        editPromo: 'Editar Promoción',
        addPromo: 'Añadir Promoción',
        loading: 'Cargando promociones...',
        noPromos: 'No hay promociones.',
        fields: {
            title: 'Título',
            discount: 'Descuento (ej: -20%, Regalo)',
            description: 'Descripción',
            validUntil: 'Válido hasta (texto)',
            icon: 'Icono (Emoji)',
            color: 'Color Principal (HEX)',
            gradient: 'Gradiente Tailwind',
            active: 'Activa (visible al público)',
            save: 'Guardar',
        },
        table: {
            promo: 'Promo',
            status: 'Estado',
            actions: 'Acciones',
        },
        status: {
            active: 'Acitiva',
            inactive: 'Inactiva',
        },
        modals: {
            deleteTitle: '¿Eliminar promoción?',
            deleteDesc: 'Estás a punto de borrar "{name}". Esta acción no se puede deshacer.',
            yesDelete: 'SÍ, ELIMINAR',
            cancel: 'CANCELAR',
        },
        alerts: {
            updated: 'Promoción actualizada',
            created: 'Promoción creada',
            deleted: 'Promoción eliminada',
            errorSaving: 'Error al guardar: ',
            errorDeleting: 'Error al eliminar',
        },
        refresh: 'Actualizar',
        hints: {
            title: 'Nombre de la promo (ej: "Combo del Día")',
            discount: 'Texto del beneficio: porcentaje ( -20% ) o "Regalo"',
            description: 'Breve descripción de los términos o contenido',
            validUntil: 'Texto sobre la validez (ej: "Hasta final de marzo")',
            icon: 'Símbolo Emoji que aparecerá en la tarjeta',
            color: 'Color principal en formato HEX (ej: #F2BC00)',
            gradient: 'Estilo de gradiente Tailwind (from-color to-color)',
            info: 'Ayuda',
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

export default function AdminPromos({ language = 'es' }: AdminPromosProps) {
    const queryClient = useQueryClient();
    const t = PROMOS_TRANSLATIONS[language];

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
    });
    const [promoToDelete, setPromoToDelete] = useState<any>(null);

    const {
        data: promos = [],
        isLoading,
        refetch,
        isFetching,
    } = useQuery({
        queryKey: ['admin-promos'],
        queryFn: () => api.get('/admin/promos'),
    });

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
            });
            // Using a simple alert for now as consistent with previous feedback
            // but in a more premium UI we might use a toast
            console.log(isEditing ? t.alerts.updated : t.alerts.created);
        },
        onError: (err: any) => {
            alert(t.alerts.errorSaving + (err instanceof ApiError ? err.message : 'Error'));
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
            <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-6 rounded-3xl border border-gray-100 shadow-sm gap-4 mb-8">
                <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase">
                    {t.title}
                </h2>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button
                        onClick={() => refetch()}
                        className="p-3 text-gray-400 hover:text-gray-900 bg-gray-50 border border-gray-100 rounded-xl transition-all shadow-sm active:scale-95"
                        title={t.refresh}
                    >
                        <RefreshCw
                            size={20}
                            strokeWidth={2}
                            className={isFetching ? 'animate-spin' : ''}
                        />
                    </button>
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
                            });
                        }}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-orange-600 text-white px-6 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-orange-100 active:scale-95"
                    >
                        <Plus size={16} strokeWidth={3} /> {t.newPromo}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form Column */}
                <div className="lg:col-span-1">
                    <form
                        onSubmit={handleSave}
                        className="sticky top-8 bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 space-y-6"
                    >
                        <div className="flex items-center gap-3 text-orange-600 border-l-4 border-orange-100 pl-4 mb-2">
                            <h3 className="font-black text-xs uppercase tracking-widest">
                                {isEditing ? t.editPromo : t.addPromo}
                            </h3>
                        </div>

                        <div className="space-y-4">
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
                            <div className="space-y-1">
                                <FieldLabel
                                    title={t.fields.discount}
                                    hint={t.hints.discount}
                                    language={language}
                                />
                                <input
                                    required
                                    value={form.discount}
                                    onChange={e => setForm({ ...form, discount: e.target.value })}
                                    className="w-full bg-white border border-gray-100 rounded-2xl px-5 py-3.5 text-sm font-black text-gray-900 outline-none focus:bg-white focus:border-orange-400 transition-all shadow-inner"
                                />
                            </div>
                            <div className="space-y-1">
                                <FieldLabel
                                    title={t.fields.description}
                                    hint={t.hints.description}
                                    language={language}
                                />
                                <textarea
                                    required
                                    rows={3}
                                    value={form.description}
                                    onChange={e =>
                                        setForm({ ...form, description: e.target.value })
                                    }
                                    className="w-full bg-white border border-gray-100 rounded-2xl px-5 py-3.5 text-sm font-black text-gray-900 outline-none focus:bg-white focus:border-orange-400 transition-all shadow-inner resize-none"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                                <FieldLabel
                                    title={t.fields.validUntil}
                                    hint={t.hints.validUntil}
                                    language={language}
                                />
                                <FieldLabel
                                    title={t.fields.icon}
                                    hint={t.hints.icon}
                                    language={language}
                                    align="right"
                                />
                                <input
                                    value={form.valid_until}
                                    onChange={e =>
                                        setForm({ ...form, valid_until: e.target.value })
                                    }
                                    className="w-full bg-white border border-gray-100 rounded-2xl px-5 py-3.5 text-sm font-black text-gray-900 outline-none focus:bg-white focus:border-orange-400 transition-all shadow-inner"
                                />
                                <input
                                    required
                                    value={form.icon}
                                    onChange={e => setForm({ ...form, icon: e.target.value })}
                                    className="w-full bg-white border border-gray-100 rounded-2xl px-5 py-3.5 text-sm font-black text-gray-900 text-center outline-none focus:bg-white focus:border-orange-400 transition-all shadow-inner"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                                <FieldLabel
                                    title={t.fields.color}
                                    hint={t.hints.color}
                                    language={language}
                                />
                                <FieldLabel
                                    title={t.fields.gradient}
                                    hint={t.hints.gradient}
                                    language={language}
                                    align="right"
                                />
                                <div className="relative">
                                    <input
                                        required
                                        value={form.color}
                                        onChange={e => setForm({ ...form, color: e.target.value })}
                                        className="w-full bg-white border border-gray-100 rounded-2xl pl-12 pr-5 py-3.5 text-sm font-black text-gray-900 outline-none focus:bg-white focus:border-orange-400 transition-all shadow-inner lowercase"
                                    />
                                    <div
                                        className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 rounded-md border border-gray-200 shadow-sm"
                                        style={{ backgroundColor: form.color }}
                                    />
                                </div>
                                <input
                                    required
                                    value={form.bg}
                                    onChange={e => setForm({ ...form, bg: e.target.value })}
                                    className="w-full bg-white border border-gray-100 rounded-2xl px-5 py-3.5 text-sm font-black text-gray-900 outline-none focus:bg-white focus:border-orange-400 transition-all shadow-inner"
                                    placeholder="from-amber-500 to-amber-400"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 gap-4">
                            <label className="flex items-center gap-3 cursor-pointer group/check">
                                <div
                                    className={`w-10 h-6 rounded-full transition-all relative ${form.is_active ? 'bg-green-500' : 'bg-gray-200'}`}
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
                                        className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${form.is_active ? 'left-5' : 'left-1'}`}
                                    />
                                </div>
                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest group-hover/check:text-gray-900 transition-colors">
                                    {t.fields.active}
                                </span>
                            </label>

                            <button
                                type="submit"
                                disabled={upsertMutation.isPending}
                                className="flex-1 bg-gray-900 text-white px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-orange-600 transition-all disabled:opacity-50 flex items-center justify-center gap-3 active:scale-95 shadow-lg"
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

                {/* Table Column */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-100">
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                        {t.table.promo}
                                    </th>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">
                                        {t.table.status}
                                    </th>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">
                                        {t.table.actions}
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {promos.map((p: any) => (
                                    <tr
                                        key={p.id}
                                        className="hover:bg-gray-50/50 transition-colors group"
                                    >
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-5">
                                                <div
                                                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 transition-transform duration-300"
                                                    style={{ backgroundColor: p.color }}
                                                >
                                                    {p.icon}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <h4 className="font-black text-gray-900 text-lg tracking-tight truncate max-w-[200px]">
                                                            {p.title}
                                                        </h4>
                                                        <span className="text-[10px] font-black bg-gray-900 text-white px-3 py-1 rounded-xl shadow-sm uppercase tracking-tighter">
                                                            {p.discount}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-gray-400 font-bold line-clamp-2 max-w-[300px]">
                                                        {p.description}
                                                    </p>
                                                    {p.valid_until && (
                                                        <div className="mt-2 text-[9px] font-black text-orange-400 uppercase tracking-widest flex items-center gap-1.5">
                                                            <Clock size={10} strokeWidth={3} />{' '}
                                                            {p.valid_until}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex justify-center">
                                                {p.is_active ? (
                                                    <span className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-green-100 shadow-sm">
                                                        <CheckCircle size={14} strokeWidth={3} />{' '}
                                                        {t.status.active}
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-2 text-gray-400 bg-gray-50 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-gray-100">
                                                        <XCircle size={14} strokeWidth={3} />{' '}
                                                        {t.status.inactive}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center justify-end gap-3">
                                                <button
                                                    onClick={() => {
                                                        setIsEditing(p);
                                                        setForm(p);
                                                        window.scrollTo({
                                                            top: 0,
                                                            behavior: 'smooth',
                                                        });
                                                    }}
                                                    className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:bg-black hover:text-white transition-all border border-gray-100 shadow-sm active:scale-95"
                                                >
                                                    <Edit2 size={18} strokeWidth={2} />
                                                </button>
                                                <button
                                                    onClick={() => setPromoToDelete(p)}
                                                    className="p-3 bg-orange-50 text-orange-400 rounded-xl hover:bg-orange-600 hover:text-white transition-all border border-orange-100 shadow-sm active:scale-95"
                                                    title={t.alerts.deleted}
                                                >
                                                    <Trash2 size={18} strokeWidth={2} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {promos.length === 0 && (
                                    <tr>
                                        <td colSpan={3} className="px-8 py-20 text-center">
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="w-16 h-16 bg-gray-50 text-gray-200 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
                                                    <Plus size={32} />
                                                </div>
                                                <p className="text-gray-400 font-black uppercase tracking-widest text-xs">
                                                    {t.noPromos}
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

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
