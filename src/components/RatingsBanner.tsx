import { Star } from 'lucide-react';
import { motion } from 'framer-motion';

const GoogleRatingBar = ({
    label,
    percentage,
    delay,
}: {
    label: string;
    percentage: number;
    delay: number;
}) => (
    <div className="flex items-center gap-2 w-full group">
        <span className="text-gray-400 font-medium text-[10px] w-1">{label}</span>
        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden relative">
            <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${percentage}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay, ease: 'easeOut' }}
                className="absolute inset-0 bg-[#FBBC04] rounded-full"
            />
        </div>
    </div>
);

const ForkRatingBar = ({
    label,
    score,
    delay,
}: {
    label: string;
    score: number;
    delay: number;
}) => (
    <div className="flex items-center gap-2 w-full">
        <span className="text-gray-600 font-medium text-[10px] w-12">{label}</span>
        <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden relative">
            <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${(score / 10) * 100}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay, ease: 'easeOut' }}
                className="absolute inset-0 bg-[#006450] rounded-full"
            />
        </div>
        <span className="text-gray-900 font-bold text-[10px] w-4">{score}</span>
    </div>
);

const RatingsBanner = () => {
    return (
        <section className="bg-white py-8 border-y border-gray-100">
            <div className="max-w-6xl mx-auto px-4 md:px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-stretch divide-y md:divide-y-0 md:divide-x divide-gray-100">
                    {/* Google Section */}
                    <div className="flex items-center gap-6 pb-8 md:pb-0">
                        <div className="shrink-0 flex flex-col items-center">
                            <div className="text-5xl font-bold text-gray-900 leading-none mb-1">
                                4,8
                            </div>
                            <div className="flex gap-0.5 mb-1">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <Star key={i} size={14} fill="#FBBC04" stroke="#FBBC04" />
                                ))}
                            </div>
                            <div className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">
                                Google
                            </div>
                            <div className="text-gray-500 text-[10px] mt-0.5">534 reseñas</div>
                        </div>

                        <div className="flex-1 space-y-1">
                            <GoogleRatingBar label="5" percentage={92} delay={0.1} />
                            <GoogleRatingBar label="4" percentage={8} delay={0.2} />
                            <GoogleRatingBar label="3" percentage={2} delay={0.3} />
                            <GoogleRatingBar label="2" percentage={1} delay={0.4} />
                            <GoogleRatingBar label="1" percentage={4} delay={0.5} />
                        </div>
                    </div>

                    {/* The Fork Section */}
                    <div className="flex items-center gap-6 pt-8 md:pt-0 md:pl-12">
                        <div className="shrink-0 flex flex-col items-center">
                            <div className="relative w-20 h-20 flex items-center justify-center">
                                <svg className="w-full h-full -rotate-90">
                                    <circle
                                        cx="40"
                                        cy="40"
                                        r="36"
                                        fill="none"
                                        stroke="#f3f4f6"
                                        strokeWidth="4"
                                    />
                                    <motion.circle
                                        cx="40"
                                        cy="40"
                                        r="36"
                                        fill="none"
                                        stroke="#006450"
                                        strokeWidth="4"
                                        strokeDasharray="226.2"
                                        initial={{ strokeDashoffset: 226.2 }}
                                        whileInView={{ strokeDashoffset: 226.2 * (1 - 8.9 / 10) }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 1.5, ease: 'easeOut' }}
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <div className="text-2xl font-black text-gray-900 leading-none">
                                        8.9
                                    </div>
                                    <div className="text-[8px] text-gray-500 font-medium">
                                        of 10
                                    </div>
                                </div>
                            </div>
                            <div className="mt-2 px-2 py-0.5 bg-[#e6f4f2] text-[#006450] text-[9px] font-black rounded-full uppercase tracking-tighter">
                                Fabulous
                            </div>
                            <div className="text-gray-500 text-[9px] mt-1 font-medium">
                                453 reviews
                            </div>
                        </div>

                        <div className="flex-1 space-y-2">
                            <div className="text-[10px] font-black text-[#006450] uppercase tracking-widest mb-1 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-[#006450] rounded-full"></span>
                                The Fork
                            </div>
                            <ForkRatingBar label="Ambience" score={8.5} delay={0.1} />
                            <ForkRatingBar label="Food" score={9.1} delay={0.2} />
                            <ForkRatingBar label="Service" score={9.1} delay={0.3} />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default RatingsBanner;
