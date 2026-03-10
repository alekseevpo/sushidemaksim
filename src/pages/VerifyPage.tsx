import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2, Home, LogIn } from 'lucide-react';
import { api } from '../utils/api';
import { useToast } from '../context/ToastContext';
import SEO from '../components/SEO';

export default function VerifyPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('');
    const { success: showSuccess, error: showError } = useToast();

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('El enlace de activación no es válido o está incompleto.');
            return;
        }

        const verifyToken = async () => {
            try {
                const response = await api.get(`/auth/verify/${token}`);
                setStatus('success');
                const msg = response.message || '¡Cuenta activada con éxito!';
                setMessage(msg);
                showSuccess(msg);
            } catch (err: any) {
                setStatus('error');
                const msg = err.message || 'El enlace ha expirado o no es válido.';
                setMessage(msg);
                showError(msg);
            }
        };

        verifyToken();
    }, [token, showSuccess, showError]);

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-6">
            <SEO title="Activar cuenta" description="Activación de cuenta de usuario" />

            <div className="max-w-md w-full bg-white rounded-[32px] p-8 md:p-12 shadow-2xl text-center border border-gray-100 animate-in fade-in zoom-in duration-500">
                {status === 'loading' && (
                    <div className="flex flex-col items-center">
                        <Loader2 size={64} strokeWidth={1.5} className="text-red-600 animate-spin mb-6" />
                        <h1 className="text-2xl font-black text-gray-900 mb-2">Verificando...</h1>
                        <p className="text-gray-500 font-medium">
                            Estamos validando tu enlace de activación.
                        </p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="flex flex-col items-center">
                        <div className="w-20 h-20 bg-green-50 rounded-3xl flex items-center justify-center mb-6 text-green-500 shadow-inner border-2 border-white">
                            <CheckCircle size={40} strokeWidth={1.5} />
                        </div>
                        <h1 className="text-2xl font-black text-gray-900 mb-4 tracking-tight">
                            ¡Cuenta Activada!
                        </h1>
                        <p className="text-gray-500 font-medium mb-10 leading-relaxed italic">
                            {message}
                        </p>
                        <div className="grid grid-cols-1 gap-4 w-full">
                            <button
                                onClick={() => {
                                    navigate('/');
                                    setTimeout(() => {
                                        document.dispatchEvent(new CustomEvent('custom:openLogin'));
                                    }, 100);
                                }}
                                className="w-full py-4 bg-red-600 text-white rounded-2xl font-black text-sm hover:bg-red-700 transition-all shadow-xl shadow-red-100 flex items-center justify-center gap-2"
                            >
                                <LogIn size={18} strokeWidth={1.5} /> Iniciar sesión
                            </button>
                            <Link
                                to="/"
                                className="w-full py-4 bg-gray-50 text-gray-700 rounded-2xl font-black text-sm hover:bg-gray-100 transition-all flex items-center justify-center gap-2"
                            >
                                <Home size={18} strokeWidth={1.5} /> Ir al inicio
                            </Link>
                        </div>
                    </div>
                )}

                {status === 'error' && (
                    <div className="flex flex-col items-center">
                        <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mb-6 text-red-500 shadow-inner border-2 border-white">
                            <XCircle size={40} strokeWidth={1.5} />
                        </div>
                        <h1 className="text-2xl font-black text-gray-900 mb-4 tracking-tight">
                            Error de Activación
                        </h1>
                        <p className="text-red-600 font-medium mb-10 leading-relaxed">{message}</p>
                        <button
                            onClick={() => navigate('/')}
                            className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black text-sm hover:bg-black transition-all shadow-xl shadow-gray-100 flex items-center justify-center gap-2"
                        >
                            <Home size={18} strokeWidth={1.5} /> Volver al Inicio
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
