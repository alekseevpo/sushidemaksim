import { useState } from 'react';
import { User, Edit3, Save, X, Clock, Phone, Mail, Shield, Lock, Eye, EyeOff, Calendar, AlertCircle, CheckCircle } from 'lucide-react';
import { User as UserType } from '../../types';
import { cardStyle, inputStyle, handleInputFocus, handleInputBlur } from './profileStyles';

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
        setEditBirthDate(user.birthDate || '');
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
        <div>
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '20px',
                }}
            >
                <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#111827' }}>
                    Mi Perfil
                </h1>
                {!isEditing ? (
                    <button
                        onClick={startEditing}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '8px 16px',
                            border: '1px solid #E5E7EB',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            backgroundColor: 'white',
                            fontSize: '14px',
                            color: '#374151',
                            fontWeight: 'bold',
                        }}
                    >
                        <Edit3 size={14} /> Editar
                    </button>
                ) : (
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                            onClick={() => setIsEditing(false)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '8px 16px',
                                border: '1px solid #E5E7EB',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                backgroundColor: 'white',
                                fontSize: '14px',
                                color: '#6B7280',
                            }}
                        >
                            <X size={14} /> Cancelar
                        </button>
                        <button
                            onClick={saveProfile}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '8px 16px',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                backgroundColor: '#DC2626',
                                fontSize: '14px',
                                color: 'white',
                                fontWeight: 'bold',
                            }}
                        >
                            <Save size={14} /> Guardar
                        </button>
                    </div>
                )}
            </div>

            {/* Personal Info */}
            <div style={cardStyle}>
                <h3
                    style={{
                        fontSize: '16px',
                        fontWeight: 'bold',
                        marginBottom: '20px',
                        color: '#111827',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                    }}
                >
                    <User size={18} color="#DC2626" /> Información personal
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                        <label
                            style={{
                                display: 'block',
                                fontSize: '13px',
                                fontWeight: '600',
                                color: '#6B7280',
                                marginBottom: '6px',
                            }}
                        >
                            Nombre
                        </label>
                        {isEditing ? (
                            <input
                                value={editName}
                                onChange={e => setEditName(e.target.value)}
                                style={inputStyle}
                                onFocus={handleInputFocus}
                                onBlur={handleInputBlur}
                            />
                        ) : (
                            <p
                                style={{
                                    margin: 0,
                                    fontSize: '15px',
                                    color: '#111827',
                                    fontWeight: '500',
                                }}
                            >
                                {user.name}
                            </p>
                        )}
                    </div>
                    <div>
                        <label
                            style={{
                                display: 'block',
                                fontSize: '13px',
                                fontWeight: '600',
                                color: '#6B7280',
                                marginBottom: '6px',
                            }}
                        >
                            Email
                        </label>
                        {isEditing ? (
                            <input
                                type="email"
                                value={editEmail}
                                onChange={e => setEditEmail(e.target.value)}
                                style={inputStyle}
                                onFocus={handleInputFocus}
                                onBlur={handleInputBlur}
                            />
                        ) : (
                            <p
                                style={{
                                    margin: 0,
                                    fontSize: '15px',
                                    color: '#111827',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                }}
                            >
                                <Mail size={14} color="#6B7280" /> {user.email}
                            </p>
                        )}
                    </div>
                    <div>
                        <label
                            style={{
                                display: 'block',
                                fontSize: '13px',
                                fontWeight: '600',
                                color: '#6B7280',
                                marginBottom: '6px',
                            }}
                        >
                            Teléfono
                        </label>
                        {isEditing ? (
                            <input
                                type="tel"
                                value={editPhone}
                                onChange={e => setEditPhone(e.target.value)}
                                style={inputStyle}
                                onFocus={handleInputFocus}
                                onBlur={handleInputBlur}
                            />
                        ) : (
                            <p
                                style={{
                                    margin: 0,
                                    fontSize: '15px',
                                    color: '#111827',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                }}
                            >
                                <Phone size={14} color="#6B7280" /> {user.phone || 'No añadido'}
                            </p>
                        )}
                    </div>
                    <div>
                        <label
                            style={{
                                display: 'block',
                                fontSize: '13px',
                                fontWeight: '600',
                                color: '#6B7280',
                                marginBottom: '6px',
                            }}
                        >
                            Miembro desde
                        </label>
                        <p
                            style={{
                                margin: 0,
                                fontSize: '15px',
                                color: '#111827',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                            }}
                        >
                            <Clock size={14} color="#6B7280" />
                            {new Date(
                                user.createdAt?.replace(' ', 'T') || Date.now()
                            ).toLocaleDateString('es-ES', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                            })}
                        </p>
                    </div>
                    <div>
                        <label
                            style={{
                                display: 'block',
                                fontSize: '13px',
                                fontWeight: '600',
                                color: '#6B7280',
                                marginBottom: '6px',
                            }}
                        >
                            Fecha de nacimiento
                        </label>
                        {isEditing && !user.birthDateVerified ? (
                            <div>
                                <input
                                    type="date"
                                    value={editBirthDate}
                                    onChange={e => setEditBirthDate(e.target.value)}
                                    style={inputStyle}
                                    onFocus={handleInputFocus}
                                    onBlur={handleInputBlur}
                                />
                                <p style={{ fontSize: '11px', color: '#6B7280', marginTop: '4px' }}>
                                    Recibirás nuestra regalo sorpresa el día de tu cumpleaños.
                                </p>
                            </div>
                        ) : (
                            <div>
                                <p
                                    style={{
                                        margin: 0,
                                        fontSize: '15px',
                                        color: '#111827',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        marginBottom: '4px'
                                    }}
                                >
                                    <Calendar size={14} color="#6B7280" />
                                    {user.birthDate ? new Date(user.birthDate).toLocaleDateString('es-ES') : 'No añadida'}
                                </p>
                                {user.birthDate && !user.birthDateVerified && (
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '10px', backgroundColor: '#FEF9C3', color: '#854D0E', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold' }}>
                                        <AlertCircle size={10} /> Pendiente de revisar (muestra ID al repartidor)
                                    </span>
                                )}
                                {user.birthDateVerified && (
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '10px', backgroundColor: '#DCFCE7', color: '#166534', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold' }}>
                                        <CheckCircle size={10} /> Confirmada
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {isEditing && (
                    <div
                        style={{
                            marginTop: '20px',
                            borderTop: '1px solid #F3F4F6',
                            paddingTop: '20px',
                        }}
                    >
                        <label
                            style={{
                                display: 'block',
                                fontSize: '13px',
                                fontWeight: '600',
                                color: '#6B7280',
                                marginBottom: '10px',
                            }}
                        >
                            Elige tu avatar
                        </label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {/* Empty avatar option to allow resetting it */}
                            <button
                                type="button"
                                onClick={() => setEditAvatar('')}
                                style={{
                                    width: '40px',
                                    height: '40px',
                                    fontSize: '18px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border:
                                        editAvatar === ''
                                            ? '2px solid #DC2626'
                                            : '1px solid #E5E7EB',
                                    borderRadius: '50%',
                                    backgroundColor: editAvatar === '' ? '#FEE2E2' : 'white',
                                    cursor: 'pointer',
                                    color: '#6B7280',
                                    fontWeight: 'bold',
                                }}
                            >
                                {editName.substring(0, 2).toUpperCase() || 'AB'}
                            </button>

                            {AVATARS.map(avatar => (
                                <button
                                    key={avatar}
                                    type="button"
                                    onClick={() => setEditAvatar(avatar)}
                                    style={{
                                        width: '40px',
                                        height: '40px',
                                        fontSize: '22px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        border:
                                            editAvatar === avatar
                                                ? '2px solid #DC2626'
                                                : '1px solid #E5E7EB',
                                        borderRadius: '50%',
                                        backgroundColor:
                                            editAvatar === avatar ? '#FEE2E2' : 'white',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        transform:
                                            editAvatar === avatar ? 'scale(1.1)' : 'scale(1)',
                                    }}
                                >
                                    {avatar}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Security */}
            <div style={cardStyle}>
                <h3
                    style={{
                        fontSize: '16px',
                        fontWeight: 'bold',
                        marginBottom: '16px',
                        color: '#111827',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                    }}
                >
                    <Shield size={18} color="#DC2626" /> Seguridad
                </h3>
                {!showChangePassword ? (
                    <button
                        onClick={() => setShowChangePassword(true)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '10px 20px',
                            border: '1px solid #E5E7EB',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            backgroundColor: 'white',
                            fontSize: '14px',
                            color: '#374151',
                        }}
                    >
                        <Lock size={14} /> Cambiar contraseña
                    </button>
                ) : (
                    <div>
                        {pwdError && (
                            <div
                                style={{
                                    backgroundColor: '#FEF2F2',
                                    border: '1px solid #FECACA',
                                    borderRadius: '8px',
                                    padding: '10px 14px',
                                    marginBottom: '12px',
                                    color: '#DC2626',
                                    fontSize: '13px',
                                }}
                            >
                                ⚠️ {pwdError}
                            </div>
                        )}
                        {pwdSuccess && (
                            <div
                                style={{
                                    backgroundColor: '#F0FDF4',
                                    border: '1px solid #BBF7D0',
                                    borderRadius: '8px',
                                    padding: '10px 14px',
                                    marginBottom: '12px',
                                    color: '#16A34A',
                                    fontSize: '13px',
                                }}
                            >
                                ✓ {pwdSuccess}
                            </div>
                        )}
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '12px',
                                maxWidth: '400px',
                            }}
                        >
                            {[
                                {
                                    label: 'Contraseña actual',
                                    val: currentPassword,
                                    set: setCurrentPassword,
                                    show: showCurrPwd,
                                    toggle: () => setShowCurrPwd(p => !p),
                                },
                                {
                                    label: 'Nueva contraseña',
                                    val: newPassword,
                                    set: setNewPassword,
                                    show: showNewPwd,
                                    toggle: () => setShowNewPwd(p => !p),
                                },
                                {
                                    label: 'Confirmar nueva contraseña',
                                    val: confirmNewPassword,
                                    set: setConfirmNewPassword,
                                    show: showNewPwd,
                                    toggle: () => { },
                                },
                            ].map(({ label, val, set, show, toggle }) => (
                                <div key={label}>
                                    <label
                                        style={{
                                            display: 'block',
                                            fontSize: '13px',
                                            fontWeight: '600',
                                            color: '#6B7280',
                                            marginBottom: '4px',
                                        }}
                                    >
                                        {label}
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            type={show ? 'text' : 'password'}
                                            value={val}
                                            onChange={e => set(e.target.value)}
                                            style={{ ...inputStyle, paddingRight: '40px' }}
                                            onFocus={handleInputFocus}
                                            onBlur={handleInputBlur}
                                        />
                                        <button
                                            type="button"
                                            onClick={toggle}
                                            style={{
                                                position: 'absolute',
                                                right: '10px',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                border: 'none',
                                                background: 'none',
                                                cursor: 'pointer',
                                                color: '#9CA3AF',
                                            }}
                                        >
                                            {show ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>
                            ))}
                            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                                <button
                                    onClick={() => {
                                        setShowChangePassword(false);
                                        setPwdError('');
                                        setPwdSuccess('');
                                    }}
                                    style={{
                                        padding: '8px 16px',
                                        border: '1px solid #E5E7EB',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        backgroundColor: 'white',
                                        fontSize: '14px',
                                        color: '#6B7280',
                                    }}
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleChangePassword}
                                    style={{
                                        padding: '8px 16px',
                                        border: 'none',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        backgroundColor: '#DC2626',
                                        fontSize: '14px',
                                        color: 'white',
                                        fontWeight: 'bold',
                                    }}
                                >
                                    Guardar
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
