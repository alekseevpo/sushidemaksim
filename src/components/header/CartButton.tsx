import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';
import { useRef, useEffect, useState } from 'react';

interface CartButtonProps {
    itemCount: number;
    total: number;
    cartLoading: boolean;
}

export default function CartButton({ itemCount, total, cartLoading }: CartButtonProps) {
    const [isCartBumping, setIsCartBumping] = useState(false);
    const prevCountRef = useRef(itemCount);

    useEffect(() => {
        if (itemCount > prevCountRef.current) {
            setIsCartBumping(true);
            const timer = setTimeout(() => setIsCartBumping(false), 500);
            return () => clearTimeout(timer);
        }
        prevCountRef.current = itemCount;
    }, [itemCount]);

    // Dynamic animation based on weight (itemCount)
    // The more items, the heavier it drops (y) and bulges (scaleX)
    const weightFactor = Math.min(itemCount, 10); // Cap the effect
    const dropAmount = isCartBumping ? [0, 2 + weightFactor * 0.5, 0] : 0;
    const squashScaleX = isCartBumping ? [1, 1.1 + weightFactor * 0.02, 0.95, 1] : 1;
    const squashScaleY = isCartBumping ? [1, 0.9 - weightFactor * 0.02, 1.05, 1] : 1;

    const remainingToFreeDelivery = 80 - total;
    const showFreeDeliveryHint = total >= 50 && total < 80;

    return (
        <div className="flex items-center gap-2 md:gap-3">
            <AnimatePresence>
                {showFreeDeliveryHint && !cartLoading && (
                    <motion.div
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="flex flex-col items-end justify-center text-right"
                    >
                        <span className="text-[10px] md:text-[11px] font-black text-orange-600 leading-none mb-[3px]">
                            Faltan {remainingToFreeDelivery.toFixed(2)} €
                        </span>
                        <span className="text-[8px] md:text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none">
                            Envío Gratis
                        </span>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div
                animate={{
                    y: dropAmount,
                    scaleX: squashScaleX,
                    scaleY: squashScaleY,
                    rotate: isCartBumping ? [0, -3, 3, 0] : 0,
                }}
                transition={{
                    duration: 0.4,
                    ease: 'easeInOut',
                }}
            >
                <Link
                    id="cart-icon"
                    to="/cart"
                    className="relative p-2.5 no-underline rounded-xl transition-all flex items-center justify-center min-w-[40px] min-h-[40px] text-white bg-orange-600 shadow-lg shadow-orange-600/20 active:scale-95"
                >
                    {/* Visual indicator of weight inside the bag icon can be simulated by adding a slight strokeWidth change or fill if supported, 
                    but just using ShoppingBag works well. */}
                    <ShoppingBag size={20} strokeWidth={2.5} />
                    {!cartLoading && total > 0 && (
                        <span className="hidden md:block ml-1.5 text-[13px] font-black whitespace-nowrap text-white">
                            {total.toFixed(2)} €
                        </span>
                    )}
                    <AnimatePresence>
                        {!cartLoading && itemCount > 0 && (
                            <motion.span
                                key={itemCount}
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{
                                    scale: [0.5, 1.3 + weightFactor * 0.05, 1],
                                    opacity: 1,
                                }}
                                exit={{ scale: 0, opacity: 0 }}
                                transition={{
                                    type: 'spring',
                                    stiffness: 500,
                                    damping: Math.max(15 - weightFactor * 0.5, 8), // Gets less bouncy as it's heavier
                                    mass: 1 + weightFactor * 0.1, // Heavier mass
                                }}
                                className="absolute -top-1.5 -right-1.5 bg-black text-white text-[10px] font-black rounded-lg min-w-[20px] h-[20px] flex items-center justify-center px-1 shadow-md border-2 border-white"
                            >
                                {itemCount}
                            </motion.span>
                        )}
                    </AnimatePresence>
                </Link>
            </motion.div>
        </div>
    );
}
