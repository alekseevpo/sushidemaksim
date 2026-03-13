import { CheckCircle, Clock, Package, Truck, CheckCircle2, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const STEPS = [
    { status: 'received', label: 'Recibido', icon: Clock, color: 'text-blue-500' },
    { status: 'confirmed', label: 'Confirmado', icon: CheckCircle, color: 'text-indigo-500' },
    {
        status: 'preparing',
        label: 'En Cocina',
        icon: Package,
        iconLabel: '👨‍🍳',
        color: 'text-purple-500',
    },
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
                    <XCircle size={32} strokeWidth={1.5} />
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
                    <Clock size={32} strokeWidth={1.5} />
                </div>
                <div className="text-center">
                    <h3 className="text-xl font-black text-gray-900">Esperando pago</h3>
                    <p className="text-gray-500 text-sm">
                        Completa el pago para empezar a cocinar.
                    </p>
                </div>
            </div>
        );
    }

    // Handle 'pending' which is equivalent to 'received' or before 'received'
    const statusIdx = STEPS.findIndex(s => s.status === currentStatus);
    const normalizedIdx = currentStatus === 'pending' ? 0 : statusIdx;

    return (
        <div className="relative w-full py-4 md:py-8">
            {/* Connection Lines */}
            <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -translate-y-1/2 z-0 hidden md:block" />
            <div
                className="absolute top-1/2 left-0 h-1 bg-red-600 -translate-y-1/2 z-0 transition-all duration-1000 hidden md:block"
                style={{ width: `${(normalizedIdx / (STEPS.length - 1)) * 100}%` }}
            />

            <div className="relative z-10 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-2 md:gap-0">
                {STEPS.map((step, idx) => {
                    const isActive = idx <= normalizedIdx;
                    const isCurrent = idx === normalizedIdx;
                    const Icon = step.icon;

                    return (
                        <div
                            key={idx}
                            className={`flex flex-row md:flex-col items-center gap-3 md:gap-3 flex-1 p-2 rounded-2xl transition-all duration-500 ${
                                isCurrent ? 'bg-red-50/50 border border-red-100/50' : ''
                            }`}
                        >
                            <motion.div
                                animate={isCurrent ? { scale: [1, 1.05, 1] } : {}}
                                transition={isCurrent ? { repeat: Infinity, duration: 2 } : {}}
                                className={`w-8 h-8 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center shadow-sm transition-colors border ${
                                    isCurrent
                                        ? 'bg-red-600 text-white border-red-400'
                                        : isActive
                                          ? 'bg-red-50 text-red-600 border-red-100'
                                          : 'bg-white text-gray-200 border-gray-100'
                                }`}
                            >
                                {step.iconLabel ? (
                                    <span className="text-sm md:text-lg">{step.iconLabel}</span>
                                ) : (
                                    <Icon
                                        size={isActive ? 16 : 14}
                                        strokeWidth={isCurrent ? 2.5 : 1.5}
                                    />
                                )}
                            </motion.div>

                            <div className="flex-1 md:text-center flex flex-row md:flex-col items-center justify-between md:justify-center w-full">
                                <span
                                    className={`block font-black text-[9px] md:text-[10px] uppercase tracking-wider md:tracking-widest ${
                                        isActive ? 'text-gray-900' : 'text-gray-300'
                                    }`}
                                >
                                    {step.label}
                                </span>
                                {isCurrent && (
                                    <span className="text-[9px] font-black text-red-600 animate-pulse bg-red-100 px-2 py-0.5 rounded-full md:mt-1">
                                        Ahora
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
