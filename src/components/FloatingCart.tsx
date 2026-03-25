import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { motion, AnimatePresence } from 'framer-motion';

export default function FloatingCart() {
    const { itemCount, total } = useCart();
    const location = useLocation();

    // Don't show on cart page or if empty
    if (location.pathname === '/cart' || itemCount === 0) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                className="fixed bottom-6 right-6 z-[90] md:hidden"
            >
                <Link
                    to="/cart"
                    className="flex items-center gap-2 bg-red-600 text-white px-4 py-3 rounded-2xl shadow-[0_15px_30px_-5px_rgba(220,38,38,0.4)] no-underline active:scale-95 transition-all border-none"
                >
                    <div className="relative">
                        <ShoppingCart size={20} strokeWidth={1.5} />
                        <span className="absolute -top-1.5 -right-1.5 bg-white text-red-600 text-[10px] font-black min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center shadow-sm">
                            {itemCount}
                        </span>
                    </div>
                    <div className="flex flex-col items-start leading-none pr-1">
                        <span className="text-[9px] font-black uppercase tracking-wider opacity-80 mb-0.5">
                            Tu Cesta
                        </span>
                        <span className="text-sm font-black">
                            {total.toFixed(2).replace('.', ',')} €
                        </span>
                    </div>
                </Link>
            </motion.div>
        </AnimatePresence>
    );
}
