import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    User,
    Edit3,
    Save,
    X,
    Phone,
    Mail,
    Shield,
    Eye,
    EyeOff,
    Calendar,
    Trash2,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';
import { User as UserType } from '../../types';

interface Props {
    user: UserType;
    updateProfile: (
        data: Partial<Pick<UserType, 'name' | 'email' | 'phone' | 'avatar' | 'birthDate'>>
    ) => Promise<void>;
}

const AVATAR_CATEGORIES = [
    {
        name: 'Sushi & Food',
        icons: ['🍣', '🍱', '🍙', '🍥', '🍜', '🥟', '🍤', '🥢', '🍵', '🍶', '🍱', '🍢', '🍡'],
    },
    {
        name: 'Personajes',
        icons: [
            '🥷',
            '🧑‍🍳',
            '🦹',
            '🦸',
            '🧙',
            '🧙',
            '🧛',
            '👹',
            '👺',
            '👻',
            '👾',
            '🤖',
            '👽',
            '💀',
            '🤡',
        ],
    },
    {
        name: 'Animales Cool',
        icons: ['🐼', '🦊', '🐱', '🐶', '🐉', '🦖', '🦄', '🦁', '🐯', '🐻', '🐒', '🦉', '🦋', '🐟'],
    },
    {
        name: 'Estilo & Japan',
        icons: [
            '🏮',
            '⛩️',
            '🏯',
            '🗻',
            '🚀',
            '💎',
            '🔥',
            '⚡',
            '🌈',
            '👑',
            '🕶️',
            '🎸',
            '🎮',
            '🛹',
            '🧘',
        ],
    },
];

export default function ProfileTab({ user, updateProfile }: Props) {
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState('');
    const [editPhone, setEditPhone] = useState('');
    const [editEmail, setEditEmail] = useState('');
    const [editAvatar, setEditAvatar] = useState('');
    const [editBirthDate, setEditBirthDate] = useState('');

    // Change password state
    const [showChangePassword, setShowChangePassword] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [showCurrPwd, setShowCurrPwd] = useState(false);
    const [showNewPwd, setShowNewPwd] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const { deleteAccount } = useAuth();
    const { success, error } = useToast();

    const startEditing = () => {
        setEditName(user.name);
        setEditPhone(user.phone);
        setEditEmail(user.email);
        setEditAvatar(user.avatar || '');

        if (user.birthDate) {
            const dateStr = user.birthDate.split('T')[0];
            setEditBirthDate(dateStr);
        } else {
            setEditBirthDate('');
        }
        setIsEditing(true);
    };

    const saveProfile = async () => {
        try {
            const res = (await updateProfile({
                name: editName,
                phone: editPhone,
                email: editEmail,
                avatar: editAvatar,
                birthDate: editBirthDate,
            })) as any;
            setIsEditing(false);
            success(res?.message || '¡Perfil actualizado con éxito! 🍣');
        } catch (err: any) {
            error(err.message || 'Error al actualizar el perfil');
        }
    };

    const handleChangePassword = async () => {
        if (newPassword.length < 6) {
            error('La contraseña debe tener al menos 6 caracteres');
            return;
        }
        if (newPassword !== confirmNewPassword) {
            error('Las contraseñas no coinciden');
            return;
        }
        try {
            const { api } = await import('../../utils/api');
            await api.put('/user/change-password', { currentPassword, newPassword });
            success('¡Contraseña actualizada correctamente! 🔐');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmNewPassword('');
            setShowChangePassword(false);
        } catch (err: any) {
            error(err.message || 'Error al cambiar la contraseña');
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10 px-0 md:px-0">
            {/* Header with Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-6">
                <div className="text-center sm:text-left">
                    <h2 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight m-0">
                        {isEditing ? 'Editar Perfil' : 'Datos Personales'}
                    </h2>
                    <p className="text-gray-500 text-[11px] md:text-sm mt-1">
                        Gestiona tu información básica и seguridad
                    </p>
                </div>

                <div className="flex items-center gap-2 md:gap-3 w-full sm:w-auto">
                    {!isEditing ? (
                        <button
                            onClick={startEditing}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-gray-900 text-white rounded-xl font-black text-xs md:text-sm hover:bg-red-600 transition-all shadow-lg shadow-gray-200 active:scale-95"
                        >
                            <Edit3 size={16} /> Editar
                        </button>
                    ) : (
                        <>
                            <button
                                onClick={() => setIsEditing(false)}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-3 md:py-2.5 bg-gray-100 text-gray-500 rounded-xl font-black text-[10px] md:text-sm hover:bg-gray-200 transition-all active:scale-95"
                            >
                                <X size={14} /> <span>CANCELAR</span>
                            </button>
                            <button
                                onClick={saveProfile}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-3 md:py-2.5 bg-red-600 text-white rounded-xl font-black text-[10px] md:text-sm hover:bg-red-700 transition-all shadow-lg shadow-red-100 active:scale-95"
                            >
                                <Save size={14} /> GUARDAR
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                    {
                        label: 'Nombre Completo',
                        value: user.name,
                        editedValue: editName,
                        setter: setEditName,
                        icon: User,
                        type: 'text',
                    },
                    {
                        label: 'Correo Electrónico',
                        value: user.email,
                        editedValue: editEmail,
                        setter: setEditEmail,
                        icon: Mail,
                        type: 'email',
                    },
                    {
                        label: 'Teléfono',
                        value: user.phone || 'No añadido',
                        editedValue: editPhone,
                        setter: setEditPhone,
                        icon: Phone,
                        type: 'tel',
                    },
                    {
                        label: 'Fecha de Cumpleaños',
                        value: user.birthDate
                            ? (() => {
                                  const [y, m, d] = user.birthDate.split('T')[0].split('-');
                                  return `${d}/${m}/${y}`;
                              })()
                            : 'No añadida',
                        editedValue: editBirthDate,
                        setter: setEditBirthDate,
                        icon: Calendar,
                        type: 'date',
                    },
                ].map(field => (
                    <div
                        key={field.label}
                        className="group p-4 rounded-2xl border border-gray-50 bg-gray-50/50 hover:bg-white hover:border-red-100 hover:shadow-xl hover:shadow-gray-100 transition-all duration-300 flex flex-col min-h-[110px]"
                    >
                        <label className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-gray-400 mb-3 group-hover:text-red-500 transition-colors">
                            <field.icon size={12} />
                            {field.label}
                        </label>

                        {isEditing ? (
                            <div className="flex flex-col gap-1 flex-1">
                                <input
                                    type={field.type}
                                    value={field.editedValue}
                                    onChange={e => field.setter(e.target.value)}
                                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-red-600/20 focus:border-red-600 outline-none transition-all shadow-sm h-[46px]"
                                    placeholder={`Introduce tu ${field.label.toLowerCase()}`}
                                />
                                {field.label.includes('Cumpleaños') && (
                                    <p className="text-[10px] text-gray-500 mt-1 font-medium animate-in fade-in slide-in-from-top-1">
                                        🎁 ¡Te enviaremos un regalo especial en tu día!
                                    </p>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center justify-between min-h-[46px]">
                                <p className="text-sm font-black text-gray-900 m-0">
                                    {field.value}
                                </p>
                                {field.label === 'Fecha de Cumpleaños' && user.birthDate && (
                                    <div
                                        className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter ${user.birthDateVerified ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'} border-none`}
                                    >
                                        {user.birthDateVerified ? 'Verificado' : 'Pendiente'}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Avatar Selection (Only when editing) */}
            {isEditing && (
                <div className="px-4 py-8 md:p-10 bg-gray-900 rounded-[40px] text-white overflow-hidden relative shadow-2xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-red-600 rounded-full blur-[100px] opacity-20 -mr-32 -mt-32" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600 rounded-full blur-[100px] opacity-10 -ml-32 -mb-32" />

                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white/50 mb-8 flex items-center gap-3">
                        <div className="w-2 h-2 bg-red-600 rounded-full animate-ping" />
                        Personaliza tu Identidad
                    </h3>

                    <div className="space-y-8 relative z-10">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-3 ml-1">
                                Original
                            </p>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                type="button"
                                onClick={() => setEditAvatar('')}
                                className={`w-14 h-14 rounded-2xl flex items-center justify-center text-sm font-black transition-all border-2
                                    ${editAvatar === '' ? 'bg-red-600 border-white shadow-[0_0_20px_rgba(239,68,68,0.4)]' : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'}`}
                            >
                                {editName.substring(0, 2).toUpperCase() || '??'}
                            </motion.button>
                        </div>

                        {AVATAR_CATEGORIES.map(category => (
                            <div key={category.name}>
                                <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-4 ml-1">
                                    {category.name}
                                </p>
                                <div className="flex flex-wrap gap-2 sm:gap-3">
                                    {category.icons.map(avatar => (
                                        <motion.button
                                            key={`${category.name}-${avatar}`}
                                            whileHover={{ scale: 1.15, rotate: 5 }}
                                            whileTap={{ scale: 0.9 }}
                                            type="button"
                                            onClick={() => setEditAvatar(avatar)}
                                            className={`w-14 h-14 rounded-2xl text-2xl flex items-center justify-center transition-all border-2
                                                ${
                                                    editAvatar === avatar
                                                        ? 'bg-red-600 border-white shadow-[0_0_20px_rgba(239,68,68,0.5)] scale-110 z-10'
                                                        : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/30'
                                                }`}
                                        >
                                            {avatar}
                                        </motion.button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Security Section */}
            <div className="pt-8 border-t border-gray-100">
                {!showChangePassword ? (
                    <div className="bg-amber-50 rounded-[32px] p-6 flex flex-col sm:flex-row items-center justify-between gap-6 border border-amber-100">
                        <div className="flex items-center gap-4 text-center sm:text-left">
                            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600">
                                <Shield size={24} />
                            </div>
                            <div>
                                <h4 className="text-sm font-black text-amber-900 uppercase tracking-tight m-0">
                                    Seguridad de la cuenta
                                </h4>
                                <p className="text-xs text-amber-700 mt-0.5 m-0 opacity-80">
                                    Tu contraseña se actualizó hace tiempo
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowChangePassword(true)}
                            className="w-full sm:w-auto px-8 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-black text-sm transition-all shadow-lg shadow-amber-200"
                        >
                            Cambiar Contraseña
                        </button>
                    </div>
                ) : (
                    <div className="bg-gray-50 rounded-[32px] p-8 border border-gray-100">
                        <div className="flex items-center justify-between mb-8">
                            <h4 className="text-lg font-black text-gray-900 m-0">
                                Cambio de Contraseña
                            </h4>
                            <button
                                onClick={() => setShowChangePassword(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
                            {[
                                {
                                    label: 'Contraseña Actual',
                                    value: currentPassword,
                                    setter: setCurrentPassword,
                                    show: showCurrPwd,
                                    toggle: setShowCurrPwd,
                                },
                                {
                                    label: 'Nueva Contraseña',
                                    value: newPassword,
                                    setter: setNewPassword,
                                    show: showNewPwd,
                                    toggle: setShowNewPwd,
                                },
                                {
                                    label: 'Confirmar Nueva Contraseña',
                                    value: confirmNewPassword,
                                    setter: setConfirmNewPassword,
                                    show: showNewPwd,
                                    toggle: () => {},
                                },
                            ].map(f => (
                                <div key={f.label}>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 px-1">
                                        {f.label}
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={f.show ? 'text' : 'password'}
                                            value={f.value}
                                            onChange={e => f.setter(e.target.value)}
                                            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-red-600/20 outline-none transition-all"
                                        />
                                        {f.label !== 'Confirmar Nueva Contraseña' && (
                                            <button
                                                type="button"
                                                onClick={() => f.toggle(!f.show)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                            >
                                                {f.show ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 mt-8">
                            <button
                                onClick={handleChangePassword}
                                className="flex-1 sm:flex-none px-8 py-3.5 bg-red-600 text-white rounded-xl font-black text-xs md:text-sm hover:bg-red-700 transition-all shadow-xl shadow-red-100 active:scale-95"
                            >
                                ACTUALIZAR
                            </button>
                            <button
                                onClick={() => setShowChangePassword(false)}
                                className="flex-1 sm:flex-none px-8 py-3.5 bg-gray-100 text-gray-500 rounded-xl font-black text-xs md:text-sm hover:bg-gray-200 hover:text-gray-900 transition-all active:scale-95"
                            >
                                CANCELAR
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Danger Zone */}
            <div className="pt-12 border-t border-gray-100">
                <div className="bg-red-50 rounded-[32px] p-8 border border-red-100 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="text-center md:text-left">
                        <h4 className="text-lg font-black text-red-900 m-0 flex items-center gap-2 justify-center md:justify-start">
                            <Trash2 size={20} /> ZONA DE PELIGRO
                        </h4>
                        <p className="text-sm text-red-700 mt-2 m-0 font-medium">
                            Tu cuenta se marcará para eliminación. Tienes 30 días para recuperarla
                            simplemente iniciando sesión.
                        </p>
                    </div>
                    <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="w-full md:w-auto px-8 py-3.5 bg-white text-red-600 border-2 border-red-200 hover:border-red-600 hover:bg-red-600 hover:text-white rounded-xl font-black text-xs md:text-sm transition-all shadow-lg shadow-red-100 active:scale-95 whitespace-nowrap"
                    >
                        Eliminar mi cuenta
                    </button>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowDeleteConfirm(false)}
                        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="relative bg-white rounded-[40px] p-8 md:p-10 max-w-md w-full shadow-2xl overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 w-full h-2 bg-red-600" />
                        <div className="text-center">
                            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <Trash2 size={32} />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 mb-2">
                                ¿Estás seguro?
                            </h3>
                            <p className="text-gray-500 font-medium mb-8">
                                Tu cuenta no se borrará hoy. Tendrás{' '}
                                <span className="text-red-600 font-black">30 días</span> para
                                reactivarla. Si no lo haces, tus datos se perderán para siempre.
                            </p>
                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={async () => {
                                        try {
                                            await deleteAccount();
                                        } catch {
                                            error('Error al procesar la solicitud');
                                        }
                                    }}
                                    className="w-full py-4 bg-red-600 text-white rounded-2xl font-black text-sm hover:bg-red-700 transition-all shadow-xl shadow-red-200 active:scale-95"
                                >
                                    SÍ, ELIMINAR CUENTA
                                </button>
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="w-full py-4 bg-gray-100 text-gray-500 rounded-2xl font-black text-sm hover:bg-gray-200 transition-all active:scale-95"
                                >
                                    CANCELAR
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
