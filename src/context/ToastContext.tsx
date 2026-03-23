import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
    duration?: number;
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType, duration?: number) => void;
    success: (message: string) => void;
    error: (message: string) => void;
    info: (message: string) => void;
    warning: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const showToast = useCallback(
        (message: string, type: ToastType = 'info', duration = 4000) => {
            const id = Math.random().toString(36).substring(2, 11);
            setToasts(prev => [...prev, { id, message, type, duration }]);

            if (duration !== Infinity) {
                setTimeout(() => removeToast(id), duration);
            }
        },
        [removeToast]
    );

    const success = (msg: string) => showToast(msg, 'success');
    const error = (msg: string) => showToast(msg, 'error');
    const info = (msg: string) => showToast(msg, 'info');
    const warning = (msg: string) => showToast(msg, 'warning');

    return (
        <ToastContext.Provider value={{ showToast, success, error, info, warning }}>
            {children}
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </ToastContext.Provider>
    );
};

const ToastContainer: React.FC<{ toasts: Toast[]; removeToast: (id: string) => void }> = ({
    toasts,
    removeToast,
}) => {
    return createPortal(
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 md:left-auto md:right-6 md:translate-x-0 z-[99999] flex flex-col gap-3 w-[calc(100%-32px)] md:w-full md:max-w-[400px] pointer-events-none">
            <AnimatePresence mode="popLayout">
                {toasts.map(toast => (
                    <motion.div
                        key={toast.id}
                        layout
                        initial={{ opacity: 0, y: 50, scale: 0.8, filter: 'blur(10px)' }}
                        animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
                        className="pointer-events-auto"
                    >
                        <ToastItem toast={toast} onClose={() => removeToast(toast.id)} />
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>,
        document.body
    );
};

const ToastItem: React.FC<{ toast: Toast; onClose: () => void }> = ({ toast, onClose }) => {
    const icons = {
        success: <CheckCircle className="text-emerald-500" size={20} strokeWidth={1.5} />,
        error: <AlertCircle className="text-red-500" size={20} strokeWidth={1.5} />,
        info: <Info className="text-blue-500" size={20} strokeWidth={1.5} />,
        warning: <AlertTriangle className="text-amber-500" size={20} strokeWidth={1.5} />,
    };

    const bgColors = {
        success: 'bg-emerald-50 border-emerald-100',
        error: 'bg-red-50 border-red-100',
        info: 'bg-blue-50 border-blue-100',
        warning: 'bg-amber-50 border-amber-100',
    };

    return (
        <div
            className={`flex items-center gap-4 p-4 rounded-2xl border shadow-2xl ${bgColors[toast.type]} overflow-hidden relative group`}
        >
            <div className="flex-shrink-0">{icons[toast.type]}</div>
            <div className="flex-1">
                <p className="text-sm font-bold text-gray-900 leading-tight m-0">{toast.message}</p>
            </div>
            <button
                onClick={onClose}
                className="p-1 hover:bg-black/5 rounded-full transition-colors border-none bg-transparent cursor-pointer"
            >
                <X
                    size={16}
                    strokeWidth={1.5}
                    className="text-gray-400 group-hover:text-gray-600"
                />
            </button>

            {/* Progress bar countdown */}
            {toast.duration !== Infinity && (
                <motion.div
                    initial={{ width: '100%' }}
                    animate={{ width: '0%' }}
                    transition={{ duration: (toast.duration || 4000) / 1000, ease: 'linear' }}
                    className={`absolute bottom-0 left-0 h-1 opacity-40 ${
                        toast.type === 'success'
                            ? 'bg-emerald-500'
                            : toast.type === 'error'
                              ? 'bg-red-500'
                              : toast.type === 'info'
                                ? 'bg-blue-500'
                                : 'bg-amber-500'
                    }`}
                />
            )}
        </div>
    );
};
