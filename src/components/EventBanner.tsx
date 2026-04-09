import { motion } from 'framer-motion';
import { Calendar, Clock, Beer, Coffee, Info, ArrowRight } from 'lucide-react';
import { getOptimizedImageUrl } from '../utils/images';

export default function EventBanner() {
    const handleReserve = () => {
        window.dispatchEvent(new CustomEvent('open:reservation'));
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full bg-black rounded-[2rem] overflow-hidden shadow-2xl relative mt-0 mb-16 flex flex-col md:flex-row group"
        >
            {/* Background Texture/Pattern */}
            {/* No transition pattern - solid black */}

            {/* Content Section */}
            <div className="relative z-10 p-8 md:p-12 md:w-3/5 flex flex-col justify-center">
                <div className="flex flex-wrap items-center gap-3 mb-6">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-600/20 text-orange-500 text-xs font-black rounded-full border border-orange-500/30 uppercase tracking-widest">
                        <Calendar size={12} strokeWidth={2.5} />
                        11 de Abril
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-black rounded-full border border-emerald-500/30 uppercase tracking-widest animate-pulse">
                        ¡Solo 25€!
                    </span>
                </div>

                <h2 className="text-3xl md:text-5xl font-black text-white mb-4 leading-tight">
                    Buffet Libre <br className="hidden md:block" />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-500 drop-shadow-sm">
                        Sushi & Bar
                    </span>
                </h2>

                <p className="text-gray-200 text-sm md:text-base mb-8 max-w-lg font-medium leading-relaxed drop-shadow-md">
                    Un día especial celebrando con un <strong>Buffet Abierto todo incluido</strong>.
                    Disfruta sin límite de nuestros mejores sushis, rollos, ensaladas y aperitivos
                    fríos o calientes.
                    <br />
                    <em>* Incluye 1 bebida de tu elección.</em>
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                    <div className="bg-[#111111] border border-white/5 rounded-2xl p-4 flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-orange-400 mb-1">
                            <Coffee size={16} strokeWidth={2.5} />
                            <h4 className="text-xs font-black uppercase tracking-wider">
                                Primer Turno
                            </h4>
                        </div>
                        <div className="flex items-center gap-2 text-white">
                            <Clock size={16} className="text-gray-400" />
                            <span className="font-bold text-sm">13:00 - 17:00</span>
                        </div>
                        <p className="text-gray-400 text-[11px] font-medium mt-1">
                            Acompañado de degustación de té.
                        </p>
                    </div>

                    <div className="bg-[#111111] border border-white/5 rounded-2xl p-4 flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-amber-400 mb-1">
                            <Beer size={16} strokeWidth={2.5} />
                            <h4 className="text-xs font-black uppercase tracking-wider">
                                Segundo Turno
                            </h4>
                        </div>
                        <div className="flex items-center gap-2 text-white">
                            <Clock size={16} className="text-gray-400" />
                            <span className="font-bold text-sm">19:00 - 00:00</span>
                        </div>
                        <p className="text-gray-400 text-[11px] font-medium mt-1">
                            Degustación de cerveza 100% artesanal.
                        </p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                    <button
                        onClick={handleReserve}
                        className="w-full sm:w-auto bg-orange-600 text-white px-8 py-4 rounded-xl font-black tracking-tight hover:bg-orange-500 transition-colors shadow-lg shadow-orange-600/30 flex items-center justify-center gap-2 active:scale-95"
                    >
                        RESERVAR MI PLAZA
                        <ArrowRight size={18} strokeWidth={2.5} />
                    </button>
                    <div className="flex items-center gap-2 text-gray-400 text-[10px] uppercase font-bold tracking-widest max-w-[200px] text-center sm:text-left leading-tight">
                        <Info size={14} className="shrink-0" />
                        Plazas muy limitadas
                    </div>
                </div>
            </div>

            {/* Desktop Image Section */}
            <div className="relative h-64 md:h-auto md:w-2/5 overflow-hidden hidden md:block">
                <div className="absolute inset-0 bg-gradient-to-r from-gray-900 to-transparent z-10 w-24"></div>
                <img
                    src={getOptimizedImageUrl('/sushi-hero.webp', 800)}
                    alt="Buffet Libre Sushi de Maksim"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
                    loading="lazy"
                    decoding="async"
                />
            </div>

            {/* Pure black background for mobile */}
            <div className="absolute inset-0 md:hidden z-0 bg-black">
            </div>
        </motion.div>
    );
}
