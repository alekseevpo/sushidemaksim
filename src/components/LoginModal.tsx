import React, { useState, useEffect, memo } from 'react';
import { Mail, Lock, User, Phone, Eye, EyeOff, ArrowLeft, KeyRound, X } from 'lucide-react';
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
                className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500"
            >
                <div className="space-y-1">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                        Email
                    </label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-red-500 transition-colors">
                            <Mail size={18} strokeWidth={1.5} />
                        </div>
                        <input
                            type="email"
                            name="email"
                            required
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className="w-full pl-11 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-red-600 outline-none transition-all font-medium text-gray-900"
                            placeholder="tu@email.com"
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <div className="flex justify-between items-center ml-1">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest">
                            Contraseña
                        </label>
                        <button
                            type="button"
                            onClick={onSwitchForgot}
                            className="text-xs font-bold text-red-600 hover:text-red-700 transition"
                        >
                            ¿Olvidaste tu contraseña?
                        </button>
                    </div>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-red-500 transition-colors">
                            <Lock size={18} strokeWidth={1.5} />
                        </div>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            required
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="w-full pl-11 pr-12 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-red-600 outline-none transition-all font-medium text-gray-900"
                            placeholder="Tu contraseña"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition"
                        >
                            {showPassword ? <EyeOff size={18} strokeWidth={1.5} /> : <Eye size={18} strokeWidth={1.5} />}
                        </button>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-4 bg-red-600 text-white rounded-2xl font-black text-sm hover:bg-red-700 transition-all shadow-xl shadow-red-100 flex items-center justify-center gap-2 transform active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 mt-2"
                >
                    {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
                </button>

                <div className="pt-4 text-center">
                    <p className="text-sm font-medium text-gray-500">
                        ¿No tienes cuenta?{' '}
                        <button
                            type="button"
                            onClick={onSwitchRegister}
                            className="text-red-600 font-black hover:underline"
                        >
                            Regístrate gratis
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
                className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500"
            >
                <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-1">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                            Nombre completo
                        </label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-red-500 transition-colors">
                                <User size={18} strokeWidth={1.5} />
                            </div>
                            <input
                                type="text"
                                name="name"
                                required
                                className="w-full pl-11 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-red-600 outline-none transition-all font-medium text-gray-900"
                                placeholder="Tu nombre completo"
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                            Teléfono
                        </label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-red-500 transition-colors">
                                <Phone size={18} strokeWidth={1.5} />
                            </div>
                            <input
                                type="tel"
                                name="phone"
                                required
                                className="w-full pl-11 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-red-600 outline-none transition-all font-medium text-gray-900"
                                placeholder="+34 600 000 000"
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                        Email
                    </label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-red-500 transition-colors">
                            <Mail size={18} strokeWidth={1.5} />
                        </div>
                        <input
                            type="email"
                            name="email"
                            required
                            className="w-full pl-11 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-red-600 outline-none transition-all font-medium text-gray-900"
                            placeholder="tu@email.com"
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                        Contraseña
                    </label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-red-500 transition-colors">
                            <Lock size={18} strokeWidth={1.5} />
                        </div>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            required
                            className="w-full pl-11 pr-12 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-red-600 outline-none transition-all font-medium text-gray-900"
                            placeholder="Mínimo 6 caracteres"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition"
                        >
                            {showPassword ? <EyeOff size={18} strokeWidth={1.5} /> : <Eye size={18} strokeWidth={1.5} />}
                        </button>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-4 bg-red-600 text-white rounded-2xl font-black text-sm hover:bg-red-700 transition-all shadow-xl shadow-red-100 flex items-center justify-center gap-2 transform active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 mt-2"
                >
                    {isLoading ? 'Creando cuenta...' : 'Crear cuenta'}
                </button>

                <div className="pt-4 text-center">
                    <p className="text-sm font-medium text-gray-500">
                        ¿Ya tienes cuenta?{' '}
                        <button
                            type="button"
                            onClick={onSwitchLogin}
                            className="text-red-600 font-black hover:underline"
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
                    <p className="text-xs text-amber-700 font-medium leading-relaxed">
                        Introduce tu email y te enviaremos las instrucciones para restablecer tu
                        contraseña.
                    </p>
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                        Email
                    </label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-red-500 transition-colors">
                            <Mail size={18} strokeWidth={1.5} />
                        </div>
                        <input
                            type="email"
                            name="email"
                            required
                            className="w-full pl-11 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-red-600 outline-none transition-all font-medium text-gray-900"
                            placeholder="tu@email.com"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black text-sm hover:bg-black transition-all shadow-xl shadow-gray-100 flex items-center justify-center gap-2 mb-2"
                >
                    {isLoading ? 'Enviando email...' : 'Enviar instrucciones'}
                </button>

                <button
                    type="button"
                    onClick={onBack}
                    className="w-full py-4 bg-gray-50 text-gray-600 rounded-2xl font-black text-sm hover:bg-gray-100 transition-all flex items-center justify-center gap-2"
                >
                    <ArrowLeft size={18} strokeWidth={1.5} /> Volver al login
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
                className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500"
            >
                <input type="hidden" name="token" value={token} />
                <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl mb-2 flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                        <KeyRound size={20} strokeWidth={1.5} />
                    </div>
                    <p className="text-xs text-blue-700 font-medium leading-relaxed">
                        Crea una nueva contraseña fuerte para proteger tu cuenta.
                    </p>
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                        Nueva Contraseña
                    </label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-red-500 transition-colors">
                            <Lock size={18} strokeWidth={1.5} />
                        </div>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            required
                            className="w-full pl-11 pr-12 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-red-600 outline-none transition-all font-medium text-gray-900"
                            placeholder="Mínimo 6 caracteres"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition"
                        >
                            {showPassword ? <EyeOff size={18} strokeWidth={1.5} /> : <Eye size={18} strokeWidth={1.5} />}
                        </button>
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                        Confirmar Nueva Contraseña
                    </label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-red-500 transition-colors">
                            <Lock size={18} strokeWidth={1.5} />
                        </div>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            name="confirmPassword"
                            required
                            className="w-full pl-11 pr-12 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-red-600 outline-none transition-all font-medium text-gray-900"
                            placeholder="Repite la contraseña"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-4 bg-red-600 text-white rounded-2xl font-black text-sm hover:bg-red-700 transition-all shadow-xl shadow-red-100 flex items-center justify-center gap-2 mt-2"
                >
                    {isLoading ? 'Cambiando...' : 'Cambiar contraseña'}
                </button>
            </form>
        );
    }
);

// ========== MAIN COMPONENT ==========

export default function LoginModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const [mode, setMode] = useState<
        'login' | 'register' | 'forgot' | 'verify-sent' | 'reset-password'
    >('login');
    const [isLoading, setIsLoading] = useState(false);
    const [resetToken, setResetToken] = useState('');
    const { login, register } = useAuth();
    const { success: showSuccess, error: showError } = useToast();

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
        const form = e.target as HTMLFormElement;
        const name = (form.elements.namedItem('name') as HTMLInputElement).value;
        const phone = (form.elements.namedItem('phone') as HTMLInputElement).value;
        const email = (form.elements.namedItem('email') as HTMLInputElement).value;
        const password = (form.elements.namedItem('password') as HTMLInputElement).value;

        try {
            const res = await register(name, email, phone, password);
            if (res.success) {
                setMode('verify-sent');
                showSuccess('¡Cuenta creada! Verifica tu email.');
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
        const token = (form.elements.namedItem('token') as HTMLInputElement).value;

        if (password !== confirmPassword) {
            showError('Las contraseñas no coinciden');
            setIsLoading(false);
            return;
        }

        try {
            await api.post('/auth/reset-password', { token, newPassword: password });
            setMode('login');
            showSuccess('Contraseña actualizada con éxito. Ya puedes iniciar sesión.');
        } catch (err: any) {
            showError(err.message || 'Error al actualizar la contraseña');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div
                className="absolute inset-0 cursor-pointer"
                onClick={() => !isLoading && onClose()}
            />
            <div className="relative max-w-md w-full bg-white rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-white/20">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 rounded-2xl bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-all z-20"
                >
                    <X size={20} strokeWidth={1.5} />
                </button>

                <div className="p-8 md:p-10">
                    <div className="text-center mb-8 pt-2">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-50 rounded-[28px] mb-6 text-red-600 shadow-inner border-2 border-white">
                            {mode === 'login' && <User size={32} strokeWidth={1.5} />}
                            {mode === 'register' && <Mail size={32} strokeWidth={1.5} />}
                            {mode === 'forgot' && <Mail size={32} strokeWidth={1.5} />}
                            {mode === 'verify-sent' && <Mail size={32} strokeWidth={1.5} />}
                            {mode === 'reset-password' && <KeyRound size={32} strokeWidth={1.5} />}
                        </div>
                        <h2 className="text-3xl font-black text-gray-900 tracking-tight leading-tight">
                            {mode === 'login' && '¡Hola de nuevo!'}
                            {mode === 'register' && 'Crea tu cuenta'}
                            {mode === 'forgot' && 'Recuperar acceso'}
                            {mode === 'verify-sent' && 'Verifica tu email'}
                            {mode === 'reset-password' && 'Nueva contraseña'}
                        </h2>
                        <p className="text-gray-500 font-medium mt-2">
                            {mode === 'login' && 'Entra y disfruta del mejor sushi'}
                            {mode === 'register' && 'Únete a la familia Maksim'}
                            {mode === 'forgot' && 'Te ayudamos a volver'}
                            {mode === 'verify-sent' && 'Te hemos enviado un enlace'}
                            {mode === 'reset-password' && 'Casi has terminado'}
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
                                    bandeja de entrada y pulsa en el enlace para continuar.
                                </p>
                                <p className="mt-2 text-xs opacity-75 italic">
                                    (No olvides revisar la carpeta de SPAM)
                                </p>
                            </div>
                            <button
                                onClick={() => setMode('login')}
                                className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black text-sm hover:bg-black transition-all flex items-center justify-center gap-2"
                            >
                                <ArrowLeft size={18} strokeWidth={1.5} /> Volver al login
                            </button>
                        </div>
                    )}

                    {mode === 'reset-password' && (
                        <ResetPasswordForm
                            onReset={handleReset}
                            isLoading={isLoading}
                            token={resetToken}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
