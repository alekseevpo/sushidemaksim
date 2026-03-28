import { useState, useMemo, useEffect } from 'react';
import { useMenu } from '../hooks/queries/useMenu';
import { CATEGORIES, EMOJI } from '../constants/menu';
import { Search, Plus, Minus, Check, ShoppingBag, Loader2, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../utils/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import SEO from '../components/SEO';

export default function WaiterOrderPage() {
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedItems, setSelectedItems] = useState<Record<number, number>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const toast = useToast();
    const { user, isLoading: authLoading, logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!authLoading && (!user || (user.role !== 'waiter' && user.role !== 'admin'))) {
            navigate('/');
        }
    }, [user, authLoading, navigate]);

    const { data: menuItems = [], isLoading: menuLoading } = useMenu('all', '');

    const filteredItems = useMemo(() => {
        return menuItems.filter(item => {
            const matchesCategory =
                selectedCategory === 'all' || item.category === selectedCategory;
            const matchesSearch =
                item.name.toLowerCase().includes(search.toLowerCase()) ||
                item.description.toLowerCase().includes(search.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [menuItems, selectedCategory, search]);

    if (authLoading) {
        return (
            <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
                <Loader2 className="animate-spin text-red-600" size={32} />
            </div>
        );
    }

    const handleQuantityChange = (itemId: number, delta: number) => {
        setSelectedItems(prev => {
            const current = prev[itemId] || 0;
            const next = Math.max(0, current + delta);
            if (next === 0) {
                const newState = { ...prev };
                delete newState[itemId];
                return newState;
            }
            return { ...prev, [itemId]: next };
        });
    };

    const totalCount = Object.values(selectedItems).reduce((a, b) => a + b, 0);
    const totalPrice = Object.entries(selectedItems).reduce((sum, [id, qty]) => {
        const item = menuItems.find(i => i.id === Number(id));
        return sum + (item?.price || 0) * qty;
    }, 0);

    const handleSubmitOrder = async () => {
        if (totalCount === 0) return;

        setIsSubmitting(true);
        try {
            const orderData = {
                items: Object.entries(selectedItems).map(([id, qty]) => {
                    const item = menuItems.find(i => i.id === Number(id));
                    return {
                        id: Number(id),
                        name: item?.name,
                        price: item?.price,
                        quantity: qty,
                        image: item?.image || '', // Ensure image is passed for the admin view
                    };
                }),
                totalValue: totalPrice,
                itemsCount: totalCount,
                waiterId: 'local-waiter', // Could be dynamic later
                metadata: {
                    timestamp: new Date().toISOString(),
                    location: 'restaurant-floor',
                },
            };

            await api.post('/analytics/waiter-order', orderData);

            toast.success('¡Pedido enviado al sistema!');

            // Success Haptic
            if (navigator.vibrate) navigator.vibrate([40, 40, 40]);

            setSelectedItems({});
            setSearch('');
        } catch (error) {
            console.error('Submit error:', error);
            toast.error('Error al enviar el pedido');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FDFBF7] pb-24">
            <SEO title="Panel de Camarero" description="Gestión rápida de pedidos en sala" />

            {/* Minimal Sticky Header */}
            <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-100 px-3 py-2">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center shadow-lg shadow-red-100">
                            <ShoppingBag size={16} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-sm font-black text-gray-900 leading-none">
                                Nueva Comanda
                            </h1>
                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none">
                                {user?.name || 'Mesa'}
                            </span>
                        </div>
                    </div>

                    <button
                        onClick={logout}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        title="Cerrar Sesión"
                    >
                        <LogOut size={18} />
                    </button>
                </div>

                <div className="relative">
                    <Search
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                        size={16}
                    />
                    <input
                        type="text"
                        placeholder="Buscar sushi... "
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full bg-gray-50 border-none rounded-xl pl-10 pr-4 py-2 text-xs font-bold focus:ring-2 ring-red-500/20 transition-all outline-none"
                    />
                </div>
            </div>

            {/* Horizontal Category Bar */}
            <div className="sticky top-[88px] z-20 bg-white/50 backdrop-blur-sm border-b border-gray-100/50 py-2 mb-1 overflow-x-auto scrollbar-hide">
                <div className="flex px-3 gap-1.5 whitespace-nowrap">
                    <button
                        onClick={() => setSelectedCategory('all')}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                            selectedCategory === 'all'
                                ? 'bg-gray-900 text-white shadow-lg shadow-gray-200'
                                : 'bg-white text-gray-500 border border-gray-100'
                        }`}
                    >
                        Todos
                    </button>
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                                selectedCategory === cat.id
                                    ? 'bg-gray-900 text-white shadow-lg shadow-gray-200'
                                    : 'bg-white text-gray-500 border border-gray-100'
                            }`}
                        >
                            <span className="text-xs">{EMOJI[cat.id] || '🍣'}</span>
                            {cat.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Product List */}
            <div className="px-3 space-y-1.5 mt-2">
                {menuLoading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="animate-spin text-red-600 mb-4" size={32} />
                        <p className="text-xs font-bold text-gray-500">Cargando menú...</p>
                    </div>
                ) : filteredItems.length > 0 ? (
                    filteredItems.map(item => (
                        <motion.div
                            layout
                            key={item.id}
                            className={`bg-white p-2 rounded-2xl border transition-all flex items-center gap-3 ${
                                selectedItems[item.id]
                                    ? 'border-red-100 bg-red-50/10'
                                    : 'border-gray-50'
                            }`}
                        >
                            <div className="w-12 h-12 rounded-xl bg-gray-50 overflow-hidden flex-shrink-0 border border-gray-50">
                                <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                    onError={e =>
                                        (e.currentTarget.src =
                                            'https://sushidemaksim.com/logo192.png')
                                    }
                                />
                            </div>

                            <div className="flex-1 min-w-0">
                                <h3 className="text-xs font-black text-gray-900 leading-tight mb-0.5 truncate">
                                    {item.name}
                                </h3>
                                <p className="text-[10px] font-bold text-red-600 leading-none">
                                    {item.price.toFixed(2)} €
                                </p>
                            </div>

                            <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-xl border border-gray-100">
                                {selectedItems[item.id] > 0 && (
                                    <>
                                        <button
                                            onClick={() => handleQuantityChange(item.id, -1)}
                                            className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-900 active:bg-gray-50 transition"
                                        >
                                            <Minus size={12} strokeWidth={3} />
                                        </button>
                                        <div className="w-6 text-center text-[10px] font-black text-gray-900">
                                            {selectedItems[item.id]}
                                        </div>
                                    </>
                                )}
                                <button
                                    onClick={() => handleQuantityChange(item.id, 1)}
                                    className={`w-7 h-7 rounded-lg flex items-center justify-center transition active:scale-95 ${
                                        selectedItems[item.id]
                                            ? 'bg-red-600 text-white shadow-lg shadow-red-100'
                                            : 'bg-white border border-gray-200 text-gray-900'
                                    }`}
                                >
                                    <Plus size={12} strokeWidth={3} />
                                </button>
                            </div>
                        </motion.div>
                    ))
                ) : (
                    <div className="py-20 text-center">
                        <p className="text-sm font-bold text-gray-500">
                            No se encontraron productos
                        </p>
                    </div>
                )}
            </div>

            {/* Sticky Action Footer */}
            <AnimatePresence>
                {totalCount > 0 && (
                    <motion.div
                        initial={{ y: 100 }}
                        animate={{ y: 0 }}
                        exit={{ y: 100 }}
                        className="fixed bottom-4 left-3 right-3 z-50"
                    >
                        <div className="bg-gray-900 rounded-2xl p-3 shadow-2xl shadow-gray-900/40 border border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center relative">
                                    <ShoppingBag size={18} className="text-white" />
                                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 border border-gray-900 text-[8px] font-black rounded-full flex items-center justify-center text-white">
                                        {totalCount}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-[8px] font-black uppercase text-white/40 tracking-widest leading-none mb-0.5">
                                        Comanda
                                    </p>
                                    <p className="text-lg font-black text-white leading-none">
                                        {totalPrice.toFixed(2)}
                                        <span className="text-xs text-red-500 ml-0.5">€</span>
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={handleSubmitOrder}
                                disabled={isSubmitting}
                                className={`h-10 px-4 rounded-xl font-black text-xs transition-all flex items-center gap-1.5 ${
                                    isSubmitting
                                        ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                        : 'bg-red-600 text-white hover:bg-red-700 active:scale-95 shadow-lg shadow-red-500/20'
                                }`}
                            >
                                {isSubmitting ? (
                                    <Loader2 className="animate-spin" size={14} />
                                ) : (
                                    <>
                                        Confirmar
                                        <Check size={16} strokeWidth={3} />
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
