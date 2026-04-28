import { motion } from 'framer-motion';
import SafeImage from '../common/SafeImage';
import { getOptimizedImageUrl } from '../../utils/images';

interface ReservationSectionProps {
    onOpenModal: () => void;
}

export function ReservationSection({ onOpenModal }: ReservationSectionProps) {
    return (
        <section className="py-10 md:py-20 px-4 bg-white overflow-hidden">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="relative h-[300px] md:h-[500px] rounded-[3rem] overflow-hidden order-last lg:order-first"
                >
                    <SafeImage
                        src="/blog_post_chef_hands.webp"
                        getOptimizedUrl={(url: string) => getOptimizedImageUrl(url, 1000)}
                        alt="Reserva tu mesa — Sushi de Maksim Madrid"
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute bottom-10 left-10">
                        <p className="text-white font-black text-2xl uppercase tracking-tighter">
                            Ambiente <span className="text-orange-500">Exclusivo</span>
                        </p>
                    </div>
                </motion.div>

                <div className="text-center lg:text-left">
                    <span className="text-orange-600 font-black text-xs uppercase tracking-widest mb-4 block">
                        Vive la experiencia completa
                    </span>
                    <h2 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tighter leading-tight mb-6">
                        Reserva tu <span className="text-orange-600">Mesa</span>
                    </h2>
                    <p className="text-gray-500 text-lg mb-10 max-w-lg mx-auto lg:mx-0 font-medium">
                        Disfruta de nuestro sushi recién preparado en un ambiente diseñado para
                        deleitar todos tus sentidos. Ideal para cenas románticas, reuniones o
                        celebraciones especiales.
                    </p>
                    <button
                        onClick={onOpenModal}
                        className="w-full sm:w-auto px-12 py-6 bg-gray-900 text-white rounded-2xl font-black text-xs tracking-widest hover:bg-orange-600 transition-all shadow-xl active:scale-95"
                    >
                        SOLICITAR RESERVA
                    </button>
                </div>
            </div>
        </section>
    );
}
