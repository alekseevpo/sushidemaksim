import { useState, useEffect, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Mail,
    Lock,
    User,
    Phone,
    Eye,
    EyeOff,
    CheckCircle,
    ArrowLeft,
    KeyRound,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { api } from '../utils/api';

// ========== SUB-COMPONENTS (Memoized for performance) ==========

const LoginForm = memo(
    ({
        onLogin,
        onSwitchRegister,
        onSwitchForgot,
        isLoading,
    }: {
        onLogin: (e: React.FormEvent, email: string, pass: string) => void;
        onSwitchRegister: () => void;
        onSwitchForgot: () => void;
        isLoading: boolean;
    }) => {
        const [email, setEmail] = useState('');
        const [password, setPassword] = useState('');
        const [showPassword, setShowPassword] = useState(false);

        return (
            <>
                <form onSubmit={e => onLogin(e, email, password)} className="mb-4">
                    <div className="mb-3">
                        <label className="block mb-1 text-xs font-semibold text-gray-700">Email</label>
                        <div className="relative">
                            <Mail
                                size={15}
                                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                            />
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="tu@email.com"
                                required
                                className="modal-input"
                            />
                        </div>
                    </div>

                    <div className="mb-2">
                        <label className="block mb-1 text-xs font-semibold text-gray-700">
                            Contraseña
                        </label>
                        <div className="relative">
                            <Lock
                                size={15}
                                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                            />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="Tu contraseña"
                                required
                                autoComplete="current-password"
                                className="modal-input-pwd"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 border-none bg-transparent cursor-pointer p-0.5 text-gray-400"
                            >
                                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>
                        </div>
                    </div>

                    <div className="text-right mb-3">
                        <button
                            type="button"
                            onClick={onSwitchForgot}
                            className="border-none bg-transparent text-red-600 text-xs cursor-pointer p-0 font-medium hover:underline"
                        >
                            ¿Olvidaste tu contraseña?
                        </button>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full text-white py-2.5 px-4 rounded-lg font-bold text-[13px] border-none cursor-pointer transition-all duration-200
                ${isLoading ? 'bg-gray-400 cursor-wait' : 'bg-red-600 hover:bg-red-700'}`}
                    >
                        {isLoading ? '...' : 'Iniciar sesión'}
                    </button>
                </form>

                <div className="text-center">
                    <span className="text-gray-500 text-xs">¿No tienes cuenta?</span>
                    <button
                        onClick={onSwitchRegister}
                        className="border-none bg-transparent text-red-600 font-bold cursor-pointer ml-1 text-xs"
                    >
                        Regístrate
                    </button>
                </div>
            </>
        );
    }
);

const RegisterForm = memo(
    ({
        onRegister,
        onSwitchLogin,
        isLoading,
    }: {
        onRegister: (e: React.FormEvent, data: any) => void;
        onSwitchLogin: () => void;
        isLoading: boolean;
    }) => {
        const [email, setEmail] = useState('');
        const [password, setPassword] = useState('');
        const [name, setName] = useState('');
        const [phone, setPhone] = useState('');
        const [showPassword, setShowPassword] = useState(false);

        return (
            <>
                <form
                    onSubmit={e => onRegister(e, { email, password, name, phone })}
                    className="mb-4"
                >
                    <div className="mb-3">
                        <label className="block mb-1 text-xs font-semibold text-gray-700">Nombre</label>
                        <div className="relative">
                            <User
                                size={15}
                                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                            />
                            <input
                                type="text"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                placeholder="Tu nombre completo"
                                required
                                className="modal-input"
                            />
                        </div>
                    </div>
                    <div className="mb-3">
                        <label className="block mb-1 text-xs font-semibold text-gray-700">
                            Teléfono
                        </label>
                        <div className="relative">
                            <Phone
                                size={15}
                                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                            />
                            <input
                                type="tel"
                                value={phone}
                                onChange={e => setPhone(e.target.value)}
                                placeholder="+34 600 000 000"
                                required
                                className="modal-input"
                            />
                        </div>
                    </div>
                    <div className="mb-3">
                        <label className="block mb-1 text-xs font-semibold text-gray-700">Email</label>
                        <div className="relative">
                            <Mail
                                size={15}
                                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                            />
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="tu@email.com"
                                required
                                className="modal-input"
                            />
                        </div>
                    </div>
                    <div className="mb-4">
                        <label className="block mb-1 text-xs font-semibold text-gray-700">
                            Contraseña
                        </label>
                        <div className="relative">
                            <Lock
                                size={15}
                                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                            />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="Mínimo 6 caracteres"
                                required
                                minLength={6}
                                autoComplete="new-password"
                                className="modal-input-pwd"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 border-none bg-transparent cursor-pointer p-0.5 text-gray-400"
                            >
                                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full text-white py-2.5 px-4 rounded-lg font-bold text-[13px] border-none cursor-pointer transition-all duration-200
                ${isLoading ? 'bg-gray-400 cursor-wait' : 'bg-red-600 hover:bg-red-700'}`}
                    >
                        {isLoading ? '...' : 'Crear cuenta'}
                    </button>
                </form>

                <div className="text-center">
                    <span className="text-gray-500 text-xs">¿Ya tienes cuenta?</span>
                    <button
                        onClick={onSwitchLogin}
                        className="border-none bg-transparent text-red-600 font-bold cursor-pointer ml-1 text-xs"
                    >
                        Inicia sesión
                    </button>
                </div>
            </>
        );
    }
);

const ForgotForm = memo(
    ({
        onForgot,
        onSwitchLogin,
        isLoading,
    }: {
        onForgot: (e: React.FormEvent, email: string) => void;
        onSwitchLogin: () => void;
        isLoading: boolean;
    }) => {
        const [email, setEmail] = useState('');
        return (
            <>
                <form onSubmit={e => onForgot(e, email)} className="mb-4">
                    <div className="mb-4">
                        <label className="block mb-1 text-xs font-semibold text-gray-700">
                            Email de tu cuenta
                        </label>
                        <div className="relative">
                            <Mail
                                size={15}
                                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                            />
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="tu@email.com"
                                required
                                autoComplete="email"
                                autoFocus
                                className="modal-input"
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full text-white py-2.5 px-4 rounded-lg font-bold text-[13px] border-none cursor-pointer transition-all duration-200 flex items-center justify-center gap-2
                ${isLoading ? 'bg-gray-400 cursor-wait' : 'bg-amber-500 hover:bg-amber-600'}`}
                    >
                        {isLoading ? 'Verificando...' : <><KeyRound size={15} /> Recuperar acceso</>}
                    </button>
                </form>
                <div className="text-center">
                    <span className="text-gray-500 text-xs">¿Ya recuerdas tu contraseña?</span>
                    <button
                        onClick={onSwitchLogin}
                        className="border-none bg-transparent text-red-600 font-bold cursor-pointer ml-1 text-xs"
                    >
                        Inicia sesión
                    </button>
                </div>
            </>
        );
    }
);

const ResetForm = memo(
    ({
        onReset,
        onSwitchLogin,
        isLoading,
    }: {
        onReset: (e: React.FormEvent, code: string, pass: string) => void;
        onSwitchLogin: () => void;
        isLoading: boolean;
    }) => {
        const [code, setCode] = useState('');
        const [password, setPassword] = useState('');
        const [confirm, setConfirm] = useState('');
        const [showPass, setShowPass] = useState(false);

        return (
            <>
                <form onSubmit={e => onReset(e, code, password)} className="mb-4">
                    <div className="mb-3">
                        <label className="block mb-1 text-xs font-semibold text-gray-700">
                            Código de 6 dígitos
                        </label>
                        <input
                            type="text"
                            value={code}
                            onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            placeholder="000000"
                            required
                            maxLength={6}
                            autoFocus
                            className="w-full py-2 px-3 border border-gray-200 rounded-lg text-center text-xl font-bold tracking-[0.3em] outline-none transition-all duration-200 bg-gray-50 focus:border-red-600 focus:ring-[3px] focus:ring-red-600/10 focus:bg-white"
                        />
                    </div>
                    <div className="mb-3">
                        <label className="block mb-1 text-xs font-semibold text-gray-700">
                            Nueva contraseña
                        </label>
                        <div className="relative">
                            <Lock
                                size={15}
                                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                            />
                            <input
                                type={showPass ? 'text' : 'password'}
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="Mínimo 6 caracteres"
                                required
                                minLength={6}
                                autoComplete="new-password"
                                className="modal-input-pwd"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPass(!showPass)}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 border-none bg-transparent cursor-pointer p-0.5 text-gray-400"
                            >
                                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>
                        </div>
                    </div>
                    <div className="mb-4">
                        <label className="block mb-1 text-xs font-semibold text-gray-700">
                            Confirmar contraseña
                        </label>
                        <div className="relative">
                            <Lock
                                size={15}
                                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                            />
                            <input
                                type={showPass ? 'text' : 'password'}
                                value={confirm}
                                onChange={e => setConfirm(e.target.value)}
                                placeholder="Repite la contraseña"
                                required
                                minLength={6}
                                className="modal-input"
                            />
                        </div>
                        {confirm && password !== confirm && (
                            <p className="text-red-600 text-xs mt-1">Las contraseñas no coinciden</p>
                        )}
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading || (confirm !== '' && password !== confirm)}
                        className={`w-full text-white py-2.5 px-4 rounded-lg font-bold text-[13px] border-none cursor-pointer transition-all duration-200
                ${isLoading ? 'bg-gray-400 cursor-wait' : 'bg-green-600 hover:bg-green-700'}`}
                    >
                        {isLoading ? '...' : 'Cambiar contraseña'}
                    </button>
                </form>
                <div className="text-center">
                    <span className="text-gray-500 text-xs">¿Ya recuerdas tu contraseña?</span>
                    <button
                        onClick={onSwitchLogin}
                        className="border-none bg-transparent text-red-600 font-bold cursor-pointer ml-1 text-xs"
                    >
                        Inicia sesión
                    </button>
                </div>
            </>
        );
    }
);

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type ModalMode = 'login' | 'register' | 'forgot' | 'reset';

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
    const { login, register, user } = useAuth();
    const navigate = useNavigate();
    const [mode, setMode] = useState<ModalMode>('login');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [recoveryEmail, setRecoveryEmail] = useState('');

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const resetMessages = () => {
        setError('');
        setSuccess('');
    };

    const handleLogin = async (e: React.FormEvent, email: string, pass: string) => {
        e.preventDefault();
        resetMessages();
        setIsLoading(true);
        await new Promise(r => setTimeout(r, 400));
        const result = await login(email, pass);
        if (result.success) {
            setSuccess(`¡Hola${user ? ' ' + user.name : ''}! Bienvenido de vuelta.`);
            setTimeout(() => {
                onClose();
                setMode('login');
                navigate('/menu');
            }, 1200);
        } else {
            setError(result.error || 'Error de inicio de sesión');
            setIsLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent, data: any) => {
        e.preventDefault();
        resetMessages();
        setIsLoading(true);
        await new Promise(r => setTimeout(r, 400));
        const result = await register(data.name, data.email, data.phone, data.password);
        if (result.success) {
            setSuccess('Проверьте пожалуйста почту для подтверждения регистрации. 🤍');
            setTimeout(() => {
                onClose();
                setMode('login');
            }, 3000);
        } else {
            setError(result.error || 'Error de registro');
            setIsLoading(false);
        }
    };

    const handleForgot = async (e: React.FormEvent, email: string) => {
        e.preventDefault();
        resetMessages();
        setIsLoading(true);
        try {
            await api.post('/auth/forgot-password', { email });
            setRecoveryEmail(email);
            setSuccess('¡Código enviado! Revisa tu bandeja de entrada.');
            setTimeout(() => {
                resetMessages();
                setMode('reset');
                setIsLoading(false);
            }, 1500);
        } catch (err: any) {
            setError(err.message || 'Error al enviar el código');
            setIsLoading(false);
        }
    };

    const handleReset = async (e: React.FormEvent, code: string, pass: string) => {
        e.preventDefault();
        resetMessages();
        setIsLoading(true);
        try {
            await api.post('/auth/reset-password', {
                email: recoveryEmail,
                code,
                newPassword: pass,
            });
            setSuccess('¡Contraseña actualizada! Ya puedes iniciar sesión.');
            setTimeout(() => {
                resetMessages();
                setMode('login');
                setIsLoading(false);
            }, 1500);
        } catch (err: any) {
            setError(err.message || 'Código inválido o expirado');
            setIsLoading(false);
        }
    };

    const switchMode = (newMode: ModalMode) => {
        setMode(newMode);
        resetMessages();
    };

    const getTitle = () => {
        switch (mode) {
            case 'login':
                return 'Iniciar sesión';
            case 'register':
                return 'Crear cuenta';
            case 'forgot':
                return 'Recuperar contraseña';
            case 'reset':
                return 'Nueva contraseña';
        }
    };

    const getSubtitle = () => {
        switch (mode) {
            case 'login':
                return 'Accede a tu cuenta de Sushi de Maksim';
            case 'register':
                return 'Únete a Sushi de Maksim';
            case 'forgot':
                return 'Introduce tu email para recuperar el acceso';
            case 'reset':
                return `Establece una nueva contraseña para ${recoveryEmail}`;
        }
    };

    const isForgotOrReset = mode === 'forgot' || mode === 'reset';

    return (
        <div
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-[1000] backdrop-blur-sm animate-[fadeIn_0.2s_ease]"
            onClick={e => e.target === e.currentTarget && onClose()}
        >
            <div className="bg-white rounded-[20px] p-7 w-[90%] max-w-[380px] max-h-[90vh] overflow-y-auto relative shadow-2xl animate-[slideUp_0.3s_ease]">
                {/* Back button for forgot/reset */}
                {isForgotOrReset && (
                    <button
                        onClick={() => switchMode('login')}
                        className="absolute top-4 left-4 border-none bg-transparent cursor-pointer p-1.5 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-1 text-[13px] text-gray-500"
                    >
                        <ArrowLeft size={16} />
                    </button>
                )}

                {/* Header */}
                <div className="text-center mb-5">
                    <div className="w-[120px] h-[120px] rounded-2xl flex items-center justify-center mx-auto -mt-4 mb-3 bg-white">
                        {isForgotOrReset ? (
                            <span className="text-[44px]">{mode === 'forgot' ? '🔑' : '🔒'}</span>
                        ) : (
                            <button
                                onClick={() => {
                                    onClose();
                                    navigate('/');
                                }}
                                className="border-none bg-transparent cursor-pointer p-0 hover:scale-105 transition-transform"
                            >
                                <img
                                    src="/logo.svg"
                                    alt="Sushi de Maksim"
                                    className="w-[120px] h-[120px] object-contain"
                                />
                            </button>
                        )}
                    </div>
                    <h2 className="text-xl font-bold mb-1 text-gray-900">{getTitle()}</h2>
                    <p className="text-sm text-gray-500">{getSubtitle()}</p>
                </div>

                {/* Error */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4 text-red-600 text-xs flex items-center gap-2">
                        <span>⚠️</span> {error}
                    </div>
                )}

                {/* Success */}
                {success && (
                    <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 mb-4 text-green-600 text-xs flex items-center gap-2">
                        <CheckCircle size={14} /> {success}
                    </div>
                )}

                {/* ========== RENDER ACTIVE FORM ========== */}
                {mode === 'login' && (
                    <LoginForm
                        onLogin={handleLogin}
                        onSwitchRegister={() => switchMode('register')}
                        onSwitchForgot={() => switchMode('forgot')}
                        isLoading={isLoading}
                    />
                )}
                {mode === 'register' && (
                    <RegisterForm
                        onRegister={handleRegister}
                        onSwitchLogin={() => switchMode('login')}
                        isLoading={isLoading}
                    />
                )}
                {mode === 'forgot' && (
                    <ForgotForm
                        onForgot={handleForgot}
                        onSwitchLogin={() => switchMode('login')}
                        isLoading={isLoading}
                    />
                )}
                {mode === 'reset' && (
                    <ResetForm
                        onReset={handleReset}
                        onSwitchLogin={() => switchMode('login')}
                        isLoading={isLoading}
                    />
                )}
            </div>
        </div>
    );
}
