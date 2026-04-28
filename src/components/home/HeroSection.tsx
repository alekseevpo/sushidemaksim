import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import SafeImage from '../common/SafeImage';
import { getOptimizedImageUrl } from '../../utils/images';

export function HeroSection() {
    return (
        <section className="relative h-[100svh] w-full px-4 md:px-6 flex flex-col items-center justify-center text-center overflow-hidden bg-black">
            {/* Visual context for SEO */}
            <h1 className="sr-only">
                Sushi de Maksim: El mejor sushi artesanal a domicilio en Madrid
            </h1>
            <h2 className="sr-only">Bienvenido a nuestro restaurante japonés premium</h2>

            {/* Background Image with optimized loading */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-black/60 z-10" />
                <motion.div
                    initial={{ scale: 1, opacity: 0 }}
                    animate={{ scale: 1, opacity: 0.4 }}
                    transition={{ duration: 1.5, ease: 'easeOut' }}
                    className="w-full h-full"
                >
                    <SafeImage
                        src="https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&auto=format&fit=crop"
                        alt="Premium Sushi Background"
                        className="w-full h-full object-cover sm:object-center object-[65%_center]"
                        loading="eager"
                        getOptimizedUrl={url => getOptimizedImageUrl(url, 1080)}
                        {...({ fetchpriority: 'high' } as any)}
                    />
                </motion.div>
            </div>

            <div className="relative z-20 flex flex-col items-center max-w-4xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="space-y-6"
                >
                    <span className="inline-block px-4 py-1.5 bg-orange-600/10 border border-orange-600/20 text-orange-500 text-[10px] md:text-xs font-black uppercase tracking-[0.3em] rounded-full backdrop-blur-sm">
                        Artesanía japonesa en tu mesa
                    </span>

                    <h2 className="text-[42px] leading-[0.9] md:text-8xl font-black text-white tracking-tighter">
                        Sabor que <br />
                        <span className="text-orange-600 italic">Despierta</span> Sentidos
                    </h2>

                    <p className="text-sm md:text-lg text-gray-300 max-w-md mx-auto leading-relaxed font-medium">
                        Descubre la perfección en cada bocado. Sushi artesanal preparado con los
                        ingredientes más frescos del mercado.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                        <Link
                            to="/menu"
                            className="group relative w-full sm:w-auto px-10 py-5 bg-orange-600 text-white rounded-2xl font-black text-[13px] tracking-widest transition-all duration-300 hover:bg-orange-700 hover:scale-105 active:scale-95 flex items-center justify-center gap-2 shadow-2xl shadow-orange-600/20 no-underline"
                        >
                            EXPLORAR MENÚ
                            <ArrowRight
                                className="transition-transform group-hover:translate-x-1"
                                size={18}
                            />
                        </Link>

                        <button
                            onClick={() =>
                                window.dispatchEvent(new CustomEvent('open:reservation'))
                            }
                            className="w-full sm:w-auto px-10 py-5 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black text-[13px] tracking-widest transition-all duration-300 border border-white/10 hover:border-white/20 active:scale-95 flex items-center justify-center no-underline cursor-pointer backdrop-blur-sm"
                        >
                            RESERVAR MESA
                        </button>
                    </div>
                </motion.div>
            </div>

            {/* Scroll Down Indicator — CSS-only for perf (avoid FM infinite loop) */}
            <div className="absolute bottom-10 inset-x-0 flex flex-col items-center justify-center gap-1.5 text-white/40 pointer-events-none animate-pulse">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-center ml-[0.3em]">
                    Scrollea
                </span>
                <ArrowRight className="rotate-90" size={16} />
            </div>
        </section>
    );
}
