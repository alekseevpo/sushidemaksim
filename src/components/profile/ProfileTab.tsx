import { useState } from 'react';
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
    AlertCircle,
    CheckCircle,
} from 'lucide-react';
import { User as UserType } from '../../types';

interface Props {
    user: UserType;
    updateProfile: (
        data: Partial<Pick<UserType, 'name' | 'email' | 'phone' | 'avatar' | 'birthDate'>>
    ) => Promise<void>;
    onSuccess: (msg: string) => void;
}

const AVATARS = [
    '🍣',
    '🍱',
    '🍙',
    '🍘',
    '🍥',
    '🥢',
    '🧑',
    '👧',
    '👨‍🍳',
    '🥷',
    '🐶',
    '🐱',
    '🐼',
    '🦊',
    '🐉',
];

export default function ProfileTab({ user, updateProfile, onSuccess }: Props) {
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
    const [pwdError, setPwdError] = useState('');
    const [pwdSuccess, setPwdSuccess] = useState('');

    const startEditing = () => {
        setEditName(user.name);
        setEditPhone(user.phone);
        setEditEmail(user.email);
        setEditAvatar(user.avatar || '');

        // Format birthDate to YYYY-MM-DD safely for input type="date"
        if (user.birthDate) {
            // If it's already YYYY-MM-DD (standard DATE from Postgres), use it directly
            const dateStr = user.birthDate.split('T')[0];
            setEditBirthDate(dateStr);
        } else {
            setEditBirthDate('');
        }
        setIsEditing(true);
    };

    const saveProfile = async () => {
        try {
            await updateProfile({
                name: editName,
                phone: editPhone,
                email: editEmail,
                avatar: editAvatar,
                birthDate: editBirthDate,
            });
            setIsEditing(false);
            onSuccess('Perfil actualizado');
        } catch {
            alert('Error al actualizar el perfil');
        }
    };

    const handleChangePassword = async () => {
        setPwdError('');
        setPwdSuccess('');
        if (newPassword.length < 6) {
            setPwdError('La contraseña debe tener al menos 6 caracteres');
            return;
        }
        if (newPassword !== confirmNewPassword) {
            setPwdError('Las contraseñas no coinciden');
            return;
        }
        try {
            const { api } = await import('../../utils/api');
            await api.put('/user/change-password', { currentPassword, newPassword });
            setPwdSuccess('¡Contraseña actualizada correctamente!');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmNewPassword('');
            setTimeout(() => {
                setShowChangePassword(false);
                setPwdSuccess('');
            }, 2000);
        } catch (err: any) {
            setPwdError(err.message || 'Error al cambiar la contraseña');
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10 px-4 md:px-0">
            {/* Header with Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-6">
                <div className="text-center sm:text-left">
                    <h2 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight m-0">
                        {isEditing ? 'Editar Perfil' : 'Datos Personales'}
                    </h2>
                    <p className="text-gray-500 text-[11px] md:text-sm mt-1">
                        Gestiona tu información básica y seguridad
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
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 md:py-2.5 bg-gray-100 text-gray-500 rounded-xl font-black text-xs md:text-sm hover:bg-gray-200 hover:text-gray-900 transition-all active:scale-95"
                            >
                                <X size={16} /> <span className="hidden sm:inline">Cancelar</span>
                            </button>
                            <button
                                onClick={saveProfile}
                                className="flex-2 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 md:py-2.5 bg-red-600 text-white rounded-xl font-black text-xs md:text-sm hover:bg-red-700 transition-all shadow-lg shadow-red-100 active:scale-95"
                            >
                                <Save size={16} /> Guardar
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
                <div className="p-6 bg-gray-900 rounded-[32px] text-white overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-600 rounded-full blur-[60px] opacity-20 -mr-16 -mt-16" />
                    <h3 className="text-sm font-black uppercase tracking-widest text-white/50 mb-6 flex items-center gap-2">
                        <User size={14} className="text-red-500" /> Elige tu Avatar
                    </h3>
                    <div className="flex flex-wrap gap-3 relative z-10">
                        <button
                            type="button"
                            onClick={() => setEditAvatar('')}
                            className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xs font-black transition-all border-2
                                ${editAvatar === '' ? 'bg-red-600 border-white scale-110 shadow-lg' : 'bg-white/10 border-transparent text-white/50 hover:bg-white/20'}`}
                        >
                            {editName.substring(0, 2).toUpperCase() || '??'}
                        </button>
                        {AVATARS.map(avatar => (
                            <button
                                key={avatar}
                                type="button"
                                onClick={() => setEditAvatar(avatar)}
                                className={`w-12 h-12 rounded-2xl text-2xl flex items-center justify-center transition-all border-2
                                    ${editAvatar === avatar ? 'bg-red-600 border-white scale-110 shadow-lg' : 'bg-white/10 border-transparent hover:bg-white/20'}`}
                            >
                                {avatar}
                            </button>
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

                        {(pwdError || pwdSuccess) && (
                            <div
                                className={`p-4 rounded-2xl mb-6 text-sm font-bold flex items-center gap-2 ${pwdError ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-600 border border-green-100'}`}
                            >
                                {pwdError ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
                                {pwdError || pwdSuccess}
                            </div>
                        )}

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
        </div>
    );
}
