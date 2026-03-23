import React, { useState, useEffect, memo } from 'react';
import { Mail, Lock, User, Phone, Eye, EyeOff, ArrowLeft, KeyRound, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';
import { api } from '../utils/api';

// ========== SUB-COMPONENTS (Memoized for performance) ==========

const LoginForm = memo(
    ({
        onLogin,
        onSwitchRegister,
        onSwitchForgot,
        isLoading,
    }: {
        onLogin: (e: React.FormEvent) => void;
        onSwitchRegister: () => void;
        onSwitchForgot: () => void;
        isLoading: boolean;
    }) => {
        const [email, setEmail] = useState('');
        const [password, setPassword] = useState('');
        const [showPassword, setShowPassword] = useState(false);

        const handleSubmit = (e: React.FormEvent) => {
            e.preventDefault();
            onLogin(e);
        };

        return (
            <form
                onSubmit={handleSubmit}
                className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500"
            >
                <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                        Email
                    </label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-red-500 transition-colors">
                            <Mail size={16} strokeWidth={1.5} />
                        </div>
                        <input
                            type="email"
                            name="email"
                            required
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            autoComplete="email"
                            className="w-full pl-11 pr-4 py-3 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-red-600 outline-none transition-all font-medium text-sm text-gray-900"
                            placeholder="tu@email.com"
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <div className="flex justify-between items-center ml-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            Contraseña
                        </label>
                        <button
                            type="button"
                            onClick={onSwitchForgot}
                            className="text-[10px] font-bold text-red-600 hover:text-red-700 transition"
                        >
                            ¿Olvidaste?
                        </button>
                    </div>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-red-500 transition-colors">
                            <Lock size={16} strokeWidth={1.5} />
                        </div>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            required
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            autoComplete="current-password"
                            className="w-full pl-11 pr-12 py-3 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-red-600 outline-none transition-all font-medium text-sm text-gray-900"
                            placeholder="Tu contraseña"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition bg-transparent border-none p-0"
                        >
                            {showPassword ? (
                                <EyeOff size={16} strokeWidth={1.5} />
                            ) : (
                                <Eye size={16} strokeWidth={1.5} />
                            )}
                        </button>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 bg-red-600 text-white rounded-2xl font-black text-xs hover:bg-red-700 transition-all shadow-xl shadow-red-100 flex items-center justify-center gap-2 transform active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 mt-2 h-12"
                >
                    {isLoading ? 'Iniciando...' : 'Iniciar sesión'}
                </button>

                <div className="pt-2 text-center">
                    <p className="text-xs font-medium text-gray-500">
                        ¿No tienes cuenta?{' '}
                        <button
                            type="button"
                            onClick={onSwitchRegister}
                            className="text-red-600 font-black hover:underline bg-transparent border-none p-0 cursor-pointer"
                        >
                            Regístrate
                        </button>
                    </p>
                </div>
            </form>
        );
    }
);

const RegisterForm = memo(
    ({
        onRegister,
        onSwitchLogin,
        isLoading,
    }: {
        onRegister: (e: React.FormEvent) => void;
        onSwitchLogin: () => void;
        isLoading: boolean;
    }) => {
        const [showPassword, setShowPassword] = useState(false);

        return (
            <form
                onSubmit={onRegister}
                data-testid="register-form"
                className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500"
            >
                <div className="space-y-3">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                            Nombre completo
                        </label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-red-500 transition-colors">
                                <User size={16} strokeWidth={1.5} />
                            </div>
                            <input
                                type="text"
                                name="name"
                                required
                                autoComplete="name"
                                className="w-full pl-11 pr-4 py-3 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-red-600 outline-none transition-all font-medium text-sm text-gray-900"
                                placeholder="Tu nombre completo"
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                            Teléfono
                        </label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-red-500 transition-colors">
                                <Phone size={16} strokeWidth={1.5} />
                            </div>
                            <input
                                type="tel"
                                name="phone"
                                required
                                autoComplete="tel"
                                className="w-full pl-11 pr-4 py-3 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-red-600 outline-none transition-all font-medium text-sm text-gray-900"
                                placeholder="+34 600 000 000"
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                        Email
                    </label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-red-500 transition-colors">
                            <Mail size={16} strokeWidth={1.5} />
                        </div>
                        <input
                            type="email"
                            name="email"
                            required
                            autoComplete="email"
                            className="w-full pl-11 pr-4 py-3 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-red-600 outline-none transition-all font-medium text-sm text-gray-900"
                            placeholder="tu@email.com"
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                        Contraseña
                    </label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-red-500 transition-colors">
                            <Lock size={16} strokeWidth={1.5} />
                        </div>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            required
                            autoComplete="new-password"
                            className="w-full pl-11 pr-12 py-3 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-red-600 outline-none transition-all font-medium text-sm text-gray-900"
                            placeholder="Mínimo 6 caracteres"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition bg-transparent border-none p-0"
                        >
                            {showPassword ? (
                                <EyeOff size={16} strokeWidth={1.5} />
                            ) : (
                                <Eye size={16} strokeWidth={1.5} />
                            )}
                        </button>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 bg-red-600 text-white rounded-2xl font-black text-xs hover:bg-red-700 transition-all shadow-xl shadow-red-100 flex items-center justify-center gap-2 transform active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 mt-2 h-12"
                >
                    {isLoading ? 'Creando...' : 'Crear cuenta'}
                </button>

                <div className="pt-2 text-center">
                    <p className="text-xs font-medium text-gray-500">
                        ¿Ya tienes cuenta?{' '}
                        <button
                            type="button"
                            onClick={onSwitchLogin}
                            className="text-red-600 font-black hover:underline bg-transparent border-none p-0 cursor-pointer"
                        >
                            Inicia sesión
                        </button>
                    </p>
                </div>
            </form>
        );
    }
);

const ForgotPasswordForm = memo(
    ({
        onForgot,
        onBack,
        isLoading,
    }: {
        onForgot: (e: React.FormEvent) => void;
        onBack: () => void;
        isLoading: boolean;
    }) => {
        return (
            <form
                onSubmit={onForgot}
                className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500"
            >
                <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl mb-2">
                    <p className="text-[11px] text-amber-700 font-medium leading-relaxed">
                        Introduce tu email и te enviaremos las instrucciones.
                    </p>
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                        Email
                    </label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-red-500 transition-colors">
                            <Mail size={16} strokeWidth={1.5} />
                        </div>
                        <input
                            type="email"
                            name="email"
                            required
                            autoComplete="email"
                            className="w-full pl-11 pr-4 py-3 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-red-600 outline-none transition-all font-medium text-sm text-gray-900"
                            placeholder="tu@email.com"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 bg-gray-900 text-white rounded-2xl font-black text-xs hover:bg-black transition-all shadow-xl shadow-gray-100 flex items-center justify-center gap-2 mb-2 h-12"
                >
                    {isLoading ? 'Enviando...' : 'Enviar instrucciones'}
                </button>

                <button
                    type="button"
                    onClick={onBack}
                    className="w-full py-3 bg-gray-50 text-gray-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-100 transition-all flex items-center justify-center gap-2"
                >
                    <ArrowLeft size={16} strokeWidth={1.5} /> Volver
                </button>
            </form>
        );
    }
);

const ResetPasswordForm = memo(
    ({
        onReset,
        isLoading,
        token,
    }: {
        onReset: (e: React.FormEvent) => void;
        isLoading: boolean;
        token: string;
    }) => {
        const [showPassword, setShowPassword] = useState(false);

        return (
            <form
                onSubmit={onReset}
                className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500"
            >
                {token ? (
                    <input type="hidden" name="code" value={token} />
                ) : (
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                            Código de recuperación
                        </label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-red-500 transition-colors">
                                <KeyRound size={16} strokeWidth={1.5} />
                            </div>
                            <input
                                type="text"
                                name="code"
                                required
                                className="w-full pl-11 pr-4 py-3 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-red-600 outline-none transition-all font-medium text-sm text-gray-900 uppercase tracking-widest placeholder:tracking-normal placeholder:font-normal"
                                placeholder="Pega aquí tu código"
                            />
                        </div>
                    </div>
                )}

                <div className="bg-blue-50 border border-blue-100 p-3 rounded-2xl mb-1 flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg text-blue-600 shrink-0">
                        <Lock size={16} strokeWidth={1.5} />
                    </div>
                    <p className="text-[10px] text-blue-700 font-medium leading-relaxed">
                        Crea una nueva contraseña para proteger tu cuenta.
                    </p>
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                        Nueva Contraseña
                    </label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-red-500 transition-colors">
                            <Lock size={16} strokeWidth={1.5} />
                        </div>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            required
                            autoComplete="new-password"
                            className="w-full pl-11 pr-12 py-3 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-red-600 outline-none transition-all font-medium text-sm text-gray-900"
                            placeholder="Mínimo 6 caracteres"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition bg-transparent border-none p-0"
                        >
                            {showPassword ? (
                                <EyeOff size={16} strokeWidth={1.5} />
                            ) : (
                                <Eye size={16} strokeWidth={1.5} />
                            )}
                        </button>
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                        Confirmar
                    </label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-red-500 transition-colors">
                            <Lock size={16} strokeWidth={1.5} />
                        </div>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            name="confirmPassword"
                            required
                            autoComplete="new-password"
                            className="w-full pl-11 pr-12 py-3 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-red-600 outline-none transition-all font-medium text-sm text-gray-900"
                            placeholder="Repite la contraseña"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 bg-red-600 text-white rounded-2xl font-black text-xs hover:bg-red-700 transition-all shadow-xl shadow-red-100 flex items-center justify-center gap-2 mt-2 h-12"
                >
                    {isLoading ? 'Cambiando...' : 'Cambiar contraseña'}
                </button>
            </form>
        );
    }
);

// ========== MAIN COMPONENT ==========

export default function LoginModal({
    isOpen,
    onClose,
    initialMode = 'login',
}: {
    isOpen: boolean;
    onClose: () => void;
    initialMode?: 'login' | 'register' | 'forgot' | 'verify-sent' | 'reset-password';
}) {
    const [mode, setMode] = useState<
        'login' | 'register' | 'forgot' | 'verify-sent' | 'reset-password'
    >(initialMode);
    const [isLoading, setIsLoading] = useState(false);
    const [resetToken, setResetToken] = useState('');
    const [recoveryEmail, setRecoveryEmail] = useState('');
    const { login, register } = useAuth();
    const { success: showSuccess, error: showError } = useToast();
    const navigate = useNavigate();

    useEffect(() => {
        const handleOpen = (e: any) => {
            if (e.detail?.mode) setMode(e.detail.mode);
            if (e.detail?.token) {
                setMode('reset-password');
                setResetToken(e.detail.token);
            }
        };

        const handleForceOpen = () => {
            setMode('login');
        };

        document.addEventListener('custom:openLogin', handleOpen);
        document.addEventListener('custom:forceOpenLogin', handleForceOpen);
        return () => {
            document.removeEventListener('custom:openLogin', handleOpen);
            document.removeEventListener('custom:forceOpenLogin', handleForceOpen);
        };
    }, []);

    useEffect(() => {
        if (isOpen) {
            setMode(initialMode);
            document.body.classList.add('overflow-hidden');
        } else {
            document.body.classList.remove('overflow-hidden');
            setRecoveryEmail('');
        }

        return () => {
            document.body.classList.remove('overflow-hidden');
        };
    }, [isOpen, initialMode]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        const form = e.target as HTMLFormElement;
        const email = (form.elements.namedItem('email') as HTMLInputElement).value;
        const password = (form.elements.namedItem('password') as HTMLInputElement).value;

        try {
            const res = await login(email, password);
            if (res.success) {
                onClose();
                showSuccess('¡Bienvenido de nuevo! 🍣');
                navigate('/menu');
            } else {
                showError(res.error || 'Error al iniciar sesión');
            }
        } catch (err: any) {
            showError(err.message || 'Error inesperado');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const form = e.target as HTMLFormElement;
            const name = (form.elements.namedItem('name') as HTMLInputElement)?.value || '';
            const phone = (form.elements.namedItem('phone') as HTMLInputElement)?.value || '';
            const email = (form.elements.namedItem('email') as HTMLInputElement)?.value || '';
            const password = (form.elements.namedItem('password') as HTMLInputElement)?.value || '';

            const res = await register(name, email, phone, password);
            if (res.success) {
                onClose();
                showSuccess('¡Cuenta creada! Verifica tu email para tu descuento. 🍣');
                navigate('/menu');
            } else {
                showError(res.error || 'Error al registrarse');
            }
        } catch (err: any) {
            showError(err.message || 'Error inesperado');
        } finally {
            setIsLoading(false);
        }
    };

    const handleForgot = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        const form = e.target as HTMLFormElement;
        const email = (form.elements.namedItem('email') as HTMLInputElement).value;

        try {
            await api.post('/auth/forgot-password', { email });
            setRecoveryEmail(email);
            setMode('verify-sent');
            showSuccess('Email de recuperación enviado');
        } catch (err: any) {
            showError(err.message || 'Error al procesar la solicitud');
        } finally {
            setIsLoading(false);
        }
    };

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        const form = e.target as HTMLFormElement;
        const password = (form.elements.namedItem('password') as HTMLInputElement).value;
        const confirmPassword = (form.elements.namedItem('confirmPassword') as HTMLInputElement)
            .value;
        const code = (form.elements.namedItem('code') as HTMLInputElement).value;

        if (password !== confirmPassword) {
            showError('Las contraseñas no coinciden');
            setIsLoading(false);
            return;
        }

        try {
            await api.post('/auth/reset-password', {
                email: recoveryEmail,
                code,
                newPassword: password,
            });
            setMode('login');
            showSuccess('Contraseña actualizada con éxito. Ya puedes iniciar sesión.');
            setRecoveryEmail('');
        } catch (err: any) {
            showError(err.message || 'Error al actualizar la contraseña');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[11000] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div
                className="absolute inset-0 cursor-pointer"
                onClick={() => !isLoading && onClose()}
            />
            <div className="relative max-w-sm w-full bg-white rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-white/20 flex flex-col max-h-[92vh]">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-xl bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-all z-20"
                >
                    <X size={18} strokeWidth={1.5} />
                </button>

                <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar">
                    <div className="text-center mb-4 pt-1">
                        <img
                            src="/logo.svg"
                            alt="Sushi de Maksim"
                            className="h-9 w-auto object-contain brightness-0 mx-auto mb-3"
                        />
                        <h2 className="text-xl font-black text-gray-900 tracking-tight leading-tight">
                            {mode === 'login' && '¡Hola de nuevo!'}
                            {mode === 'register' && 'Crea tu cuenta'}
                            {mode === 'forgot' && 'Recuperar acceso'}
                            {mode === 'verify-sent' && 'Verifica tu email'}
                            {mode === 'reset-password' && 'Nueva contraseña'}
                        </h2>
                        <p className="text-[13px] text-gray-400 font-medium mt-1 leading-tight">
                            {mode === 'login' && 'Entra и disfruta del mejor sushi.'}
                            {mode === 'register' && 'Únete a la familia Maksim.'}
                            {mode === 'forgot' && 'Te ayudamos a volver.'}
                            {mode === 'verify-sent' && 'Hemos enviado un enlace.'}
                            {mode === 'reset-password' && 'Casi has terminado.'}
                        </p>
                    </div>

                    {mode === 'login' && (
                        <LoginForm
                            onLogin={handleLogin}
                            onSwitchRegister={() => setMode('register')}
                            onSwitchForgot={() => setMode('forgot')}
                            isLoading={isLoading}
                        />
                    )}

                    {mode === 'register' && (
                        <RegisterForm
                            onRegister={handleRegister}
                            onSwitchLogin={() => setMode('login')}
                            isLoading={isLoading}
                        />
                    )}

                    {mode === 'forgot' && (
                        <ForgotPasswordForm
                            onForgot={handleForgot}
                            onBack={() => setMode('login')}
                            isLoading={isLoading}
                        />
                    )}

                    {mode === 'verify-sent' && (
                        <div className="text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="bg-green-50 text-green-700 p-6 rounded-3xl border border-green-100 font-medium text-sm leading-relaxed">
                                <p>
                                    Hemos enviado un email de confirmación. Por favor, revisa tu
                                    bandеja de entrada и pulсa en el enlace para continuar.
                                </p>
                                <p className="mt-2 text-xs opacity-75 italic">
                                    (No olvides revisar la carpeta de SPAM)
                                </p>
                            </div>
                            <div className="grid grid-cols-1 gap-3">
                                <button
                                    onClick={() => {
                                        onClose();
                                        navigate('/menu');
                                    }}
                                    className="w-full py-4 bg-red-600 text-white rounded-2xl font-black text-sm hover:bg-red-700 transition-all shadow-xl shadow-red-100 flex items-center justify-center gap-2"
                                >
                                    Explorar Menú
                                </button>
                                <button
                                    onClick={() => setMode('reset-password')}
                                    className="w-full py-4 bg-white border-2 border-gray-100 text-gray-900 rounded-2xl font-black text-sm hover:border-red-600 hover:text-red-600 transition-all flex items-center justify-center gap-2"
                                >
                                    <KeyRound size={18} strokeWidth={1.5} /> Ya tengo el código
                                </button>
                                <button
                                    onClick={() => setMode('login')}
                                    className="w-full py-3 text-gray-400 font-bold hover:text-gray-600 transition-colors text-[10px] uppercase tracking-widest"
                                >
                                    Volver al login
                                </button>
                            </div>
                        </div>
                    )}

                    {mode === 'reset-password' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <ResetPasswordForm
                                onReset={handleReset}
                                isLoading={isLoading}
                                token={resetToken}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
