import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, Mail, ArrowRight } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function AdminLoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { login, isAuthenticated, user } = useAuth();
    const navigate = useNavigate();

    // Redirect if already logged in
    useEffect(() => {
        if (isAuthenticated && user) {
            if (user.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/profile');
            }
        }
    }, [isAuthenticated, user, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        const result = await login(email, password);

        if (!result.success) {
            setError(result.error || 'Credenciales inválidas');
            setIsLoading(false);
        }
        // If successful, the useEffect hook will handle the redirect once user state updates
    };

    return (
        <div className="flex-1 bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                        <ShieldCheck size={32} strokeWidth={1.5} className="text-red-600" />
                    </div>
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Admin Login
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Acceso exclusivo para el personal de Sushi de Maksim
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-gray-100">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <span className="text-red-500">⚠️</span>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm text-red-700 font-medium">{error}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Email administrativo
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail size={20} strokeWidth={1.5} className="text-gray-400" />
                                </div>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    className="focus:ring-red-500 focus:border-red-500 block w-full pl-10 py-3 sm:text-sm border-gray-300 rounded-xl bg-gray-50 border text-gray-900 transition"
                                    placeholder="admin@sushidemaksim.es"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Contraseña
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock size={20} strokeWidth={1.5} className="text-gray-400" />
                                </div>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    className="focus:ring-red-500 focus:border-red-500 block w-full pl-10 py-3 sm:text-sm border-gray-300 rounded-xl bg-gray-50 border text-gray-900 transition"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-end">
                            <div className="text-sm">
                                <a
                                    href="#"
                                    onClick={e => {
                                        e.preventDefault();
                                        alert(
                                            'Por favor, contacta con el administrador principal (DBA) para restablecer la contraseña.'
                                        );
                                    }}
                                    className="font-medium text-red-600 hover:text-red-500 transition"
                                >
                                    ¿Olvidaste la contraseña?
                                </a>
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition disabled:opacity-50 disabled:cursor-not-allowed items-center gap-2"
                            >
                                {isLoading ? (
                                    <span>Autenticando...</span>
                                ) : (
                                    <>
                                        Entrar al panel seguro <ArrowRight size={18} strokeWidth={1.5} />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
