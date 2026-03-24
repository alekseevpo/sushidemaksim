import { useQuery } from '@tanstack/react-query';
import { ShoppingCart, User, Phone, Mail, Clock, MessageSquare } from 'lucide-react';
import { api } from '../../utils/api';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminAbandonedCarts() {
    const { data, isLoading, refetch } = useQuery({
        queryKey: ['admin-abandoned-carts'],
        queryFn: () => api.get('/admin/abandoned-carts'),
        refetchInterval: 60000,
    });

    const abandoned = data?.abandoned || [];

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                <div>
                    <h2 className="text-xl font-black text-gray-900">Carritos Abandonados</h2>
                    <p className="text-sm text-gray-500">
                        Últimos 7 días. Sesiones inactivas con artículos o contacto.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="bg-red-50 text-red-600 px-4 py-2 rounded-xl text-sm font-black border border-red-100">
                        {abandoned.length} Potenciales capturas
                    </span>
                    <button
                        onClick={() => refetch()}
                        className="bg-gray-50 p-2 rounded-xl hover:bg-gray-100 transition border border-gray-200"
                    >
                        Actualizar
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                <AnimatePresence mode="popLayout">
                    {abandoned.map((cart: any, idx: number) => (
                        <motion.div
                            key={cart.sessionId}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition group"
                        >
                            <div className="flex flex-col md:flex-row gap-6">
                                {/* Left Info */}
                                <div className="flex-1 space-y-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-600 shrink-0">
                                            <User size={24} strokeWidth={1.5} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-black text-gray-900 tracking-tight">
                                                    {cart.contact.name || 'Cliente Anónimo'}
                                                </h3>
                                                <span
                                                    className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                                        cart.stage === 'Payment'
                                                            ? 'bg-amber-100 text-amber-700'
                                                            : cart.stage === 'Contact Info'
                                                              ? 'bg-blue-100 text-blue-700'
                                                              : 'bg-gray-100 text-gray-700'
                                                    }`}
                                                >
                                                    Etapa: {cart.stage}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-400 font-medium flex items-center gap-1.5 mt-0.5">
                                                <Clock size={12} /> ID: {cart.sessionId.slice(0, 8)}
                                                ... •{' '}
                                                {new Date(cart.lastActivity).toLocaleString(
                                                    'es-ES',
                                                    {
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                        day: '2-digit',
                                                        month: 'short',
                                                    }
                                                )}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-4 pt-2">
                                        {cart.contact.phone && (
                                            <a
                                                href={`tel:${cart.contact.phone}`}
                                                className="flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-red-600 transition bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100"
                                            >
                                                <Phone size={14} /> {cart.contact.phone}
                                            </a>
                                        )}
                                        {cart.contact.email && (
                                            <a
                                                href={`mailto:${cart.contact.email}`}
                                                className="flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-blue-600 transition bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100"
                                            >
                                                <Mail size={14} /> {cart.contact.email}
                                            </a>
                                        )}
                                        {cart.contact.phone && (
                                            <a
                                                href={`https://wa.me/${cart.contact.phone.replace(/\+/g, '')}?text=${encodeURIComponent(`¡Hola ${cart.contact.name || ''}! Hemos visto que dejaste unos sushis en el carrito... 🍣 ¿Te ayudamos a terminar el pedido?`)}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="flex items-center gap-2 text-sm font-black text-white bg-green-500 hover:bg-green-600 transition px-3 py-1.5 rounded-xl border border-green-600 shadow-sm"
                                            >
                                                <MessageSquare size={14} /> WhatsApp
                                            </a>
                                        )}
                                    </div>
                                </div>

                                {/* Items Info */}
                                <div className="md:w-72 bg-gray-50/50 rounded-2xl p-4 border border-gray-100">
                                    <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-2">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                                            <ShoppingCart size={12} /> Carrito ({cart.items.length})
                                        </span>
                                        <span className="text-sm font-black text-gray-900">
                                            {cart.totalValue.toFixed(2)}€
                                        </span>
                                    </div>
                                    <div className="space-y-2 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
                                        {cart.items.map((item: any) => (
                                            <div
                                                key={item.id}
                                                className="flex justify-between items-start gap-4"
                                            >
                                                <span className="text-xs font-bold text-gray-600 flex-1 leading-tight">
                                                    {item.quantity}x {item.name}
                                                </span>
                                                <span className="text-[11px] font-black text-gray-400">
                                                    {(item.price * item.quantity).toFixed(2)}€
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                    {abandoned.length === 0 && (
                        <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100">
                            <ShoppingCart
                                size={48}
                                className="mx-auto text-gray-200 mb-4"
                                strokeWidth={1}
                            />
                            <h3 className="text-lg font-black text-gray-400">
                                No hay carritos abandonados recientes
                            </h3>
                            <p className="text-sm text-gray-300 mt-1">
                                ¡Buen trabajo! O tal vez necesitamos más tráfico.
                            </p>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
