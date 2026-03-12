import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, CheckCircle2 } from 'lucide-react';

export default function Newsletter() {
    const [email, setEmail] = useState('');
    const [isSubscribed, setIsSubscribed] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Simulation of subscription
        setIsSubscribed(true);
        // In a real app, you would send this to your API
        console.log('Subscribing email:', email);
    };

    return (
        <section className="py-24 px-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] }}
                style={{ willChange: 'opacity, transform', backfaceVisibility: 'hidden' }}
                className="max-w-7xl mx-auto bg-black rounded-[2.5rem] md:rounded-[3.5rem] p-8 md:p-16 text-center relative overflow-hidden shadow-2xl"
            >
                {/* Background Decorations */}
                <div className="absolute top-0 right-0 w-80 h-80 bg-red-600/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-[100px]" />
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-red-600/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-[100px]" />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/asfalt-dark.png')] opacity-5" />

                <div className="relative z-10 max-w-2xl mx-auto">
                    {!isSubscribed ? (
                        <>
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                <span className="inline-block px-4 py-1.5 bg-red-600/20 backdrop-blur-md border border-red-500/30 text-red-500 text-[10px] md:text-xs font-black uppercase tracking-widest rounded-full mb-6">
                                    Sushi Club
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black text-white mb-6 leading-tight tracking-tighter">
                                    Únete al Club y recibe <br />
                                    <span className="text-red-500 italic">Ofertas Exclusivas</span>
                                </h2>
                                <p className="text-gray-400 mb-10 text-sm md:text-lg leading-relaxed font-medium">
                                    No te pierdas nuestras promociones secretas, nuevos lanzamientos
                                    y secretos de la cocina japonesa directamente en tu email.
                                </p>
                            </motion.div>

                            <form
                                className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto"
                                onSubmit={handleSubmit}
                            >
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Tu mejor email..."
                                    className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white text-base md:text-sm focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all placeholder:text-gray-600"
                                />
                                <button
                                    type="submit"
                                    className="bg-red-600 hover:bg-red-700 text-white font-black px-10 py-4 rounded-2xl text-xs tracking-widest transition-all shadow-lg shadow-red-600/20 active:scale-95 flex items-center justify-center gap-2 uppercase"
                                >
                                    Suscribirme
                                    <Send size={16} />
                                </button>
                            </form>
                            <p className="text-[10px] text-gray-600 mt-6 font-medium uppercase tracking-tighter">
                                * Sin spam, solo cosas ricas. Puedes darte de baja cuando quieras.
                            </p>
                        </>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="py-10"
                        >
                            <div className="w-20 h-20 bg-green-500/20 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-green-500/30">
                                <CheckCircle2 size={40} className="text-green-500" />
                            </div>
                            <h3 className="text-3xl font-black text-white mb-4 tracking-tighter">
                                ¡Bienvenido al Club!
                            </h3>
                            <p className="text-gray-400 text-lg">
                                Gracias por unirte. Revisa tu bandeja de entrada pronto, <br />
                                tenemos una sorpresa para ti. 🍣
                            </p>
                        </motion.div>
                    )}
                </div>
            </motion.div>
        </section>
    );
}
