import { CheckCircle, Clock, Package, Truck, CheckCircle2, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const STEPS = [
    { status: 'received', label: 'Recibido', icon: Clock, color: 'text-blue-500' },
    { status: 'confirmed', label: 'Confirmado', icon: CheckCircle, color: 'text-indigo-500' },
    { status: 'preparing', label: 'En Cocina', icon: Package, iconLabel: '👨‍🍳', color: 'text-purple-500' },
    { status: 'on_the_way', label: 'En Camino', icon: Truck, color: 'text-pink-500' },
    { status: 'delivered', label: 'Entregado', icon: CheckCircle2, color: 'text-green-500' },
];

interface OrderStepperProps {
    currentStatus: string;
}

export default function OrderStepper({ currentStatus }: OrderStepperProps) {
    if (currentStatus === 'cancelled') {
        return (
            <div className="flex flex-col items-center gap-4 py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                    <XCircle size={32} />
                </div>
                <div className="text-center">
                    <h3 className="text-xl font-black text-gray-900">Pedido cancelado</h3>
                    <p className="text-gray-500 text-sm">Este pedido no pudo ser procesado.</p>
                </div>
            </div>
        );
    }

    if (currentStatus === 'waiting_payment') {
        return (
            <div className="flex flex-col items-center gap-4 py-8">
                <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center text-amber-500 animate-pulse">
                    <Clock size={32} />
                </div>
                <div className="text-center">
                    <h3 className="text-xl font-black text-gray-900">Esperando pago</h3>
                    <p className="text-gray-500 text-sm">Completa el pago para empezar a cocinar.</p>
                </div>
            </div>
        );
    }

    // Handle 'pending' which is equivalent to 'received' or before 'received'
    const statusIdx = STEPS.findIndex(s => s.status === currentStatus);
    const normalizedIdx = currentStatus === 'pending' ? 0 : statusIdx;

    return (
        <div className="relative w-full py-8">
            {/* Connection Lines */}
            <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -translate-y-1/2 z-0 hidden md:block" />
            <div
                className="absolute top-1/2 left-0 h-1 bg-red-600 -translate-y-1/2 z-0 transition-all duration-1000 hidden md:block"
                style={{ width: `${(normalizedIdx / (STEPS.length - 1)) * 100}%` }}
            />

            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-0">
                {STEPS.map((step, idx) => {
                    const isActive = idx <= normalizedIdx;
                    const isCurrent = idx === normalizedIdx;
                    const Icon = step.icon;

                    return (
                        <div key={idx} className="flex flex-row md:flex-col items-center gap-4 md:gap-3 flex-1">
                            <motion.div
                                animate={isCurrent ? { scale: [1, 1.15, 1] } : {}}
                                transition={isCurrent ? { repeat: Infinity, duration: 2 } : {}}
                                className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-colors border-2 ${isCurrent
                                        ? 'bg-red-600 text-white border-red-200'
                                        : isActive
                                            ? 'bg-white text-red-600 border-red-600'
                                            : 'bg-white text-gray-300 border-gray-100'
                                    }`}
                            >
                                {step.iconLabel ? <span className="text-lg">{step.iconLabel}</span> : <Icon size={20} />}
                            </motion.div>

                            <div className="text-left md:text-center">
                                <span className={`block font-black text-[10px] uppercase tracking-widest ${isActive ? 'text-gray-900' : 'text-gray-400'
                                    }`}>
                                    {step.label}
                                </span>
                                {isCurrent && (
                                    <span className="text-[10px] font-bold text-red-600 animate-pulse">
                                        Ahora
                                    </span>
                                )}
                            </div>

                            {/* Mobile connection line */}
                            {idx < STEPS.length - 1 && (
                                <div className="absolute left-6 top-[48px] w-0.5 h-6 bg-gray-100 md:hidden" />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
