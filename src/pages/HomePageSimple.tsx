import { Link } from 'react-router-dom';
import { ArrowRight, Star, Clock, MapPin, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import SEO from '../components/SEO';
import Newsletter from '../components/Newsletter';

const FeatureCard = ({ icon: Icon, title, desc, colorClass, index }: any) => (
    <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6, delay: index * 0.1, ease: [0.21, 0.47, 0.32, 0.98] }}
        style={{ willChange: 'opacity, transform', backfaceVisibility: 'hidden' }}
        className="premium-card p-8 text-center group"
    >
        <div
            className={`${colorClass} w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 transform group-hover:rotate-6 transition-transform duration-300`}
        >
            <Icon size={32} strokeWidth={1.5} className="text-gray-900" />
        </div>
        <h3 className="text-xl font-bold mb-3 text-gray-900">{title}</h3>
        <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
    </motion.div>
);

export default function HomePageSimple() {
    return (
        <div className="overflow-hidden">
            <SEO
                title="Sushibar en Madrid centro"
                description="El mejor sushi artesanal de Madrid. Entrega rápida, atún Balfegó y salmón noruego. Pide online ahora y disfruta de la experiencia Maksim en tu casa."
                keywords="sushi, madrid, delivery, pedido a domicilio, rollo, maksim, atun balfego"
                schema={{
                    '@context': 'https://schema.org',
                    '@type': 'FoodEstablishment',
                    name: 'Sushi de Maksim',
                    image: 'https://sushidemaksim.com/sushi-hero.jpg',
                    '@id': 'https://sushidemaksim.com',
                    url: 'https://sushidemaksim.com',
                    telephone: '+34600000000',
                    priceRange: '$$',
                    address: {
                        '@type': 'PostalAddress',
                        streetAddress: 'Calle de la Infanta Mercedes, 62',
                        addressLocality: 'Madrid',
                        postalCode: '28020',
                        addressCountry: 'ES',
                    },
                    geo: {
                        '@type': 'GeoCoordinates',
                        latitude: 40.4571,
                        longitude: -3.7037,
                    },
                    openingHoursSpecification: [
                        {
                            '@type': 'OpeningHoursSpecification',
                            dayOfWeek: [
                                'Monday',
                                'Tuesday',
                                'Wednesday',
                                'Thursday',
                                'Friday',
                                'Saturday',
                                'Sunday',
                            ],
                            opens: '12:00',
                            closes: '22:00',
                        },
                    ],
                    servesCuisine: 'Japanese, Sushi',
                    acceptsReservations: 'false',
                }}
            />

            {/* Hero Section */}
            <section className="relative min-h-[70vh] md:min-h-[85vh] flex items-center justify-center px-4 pt-32 md:pt-40 -mt-20 pb-20 md:pb-32 bg-[url('/sushi-hero.jpg')] bg-cover bg-center">
                {/* Background Overlay (Filter) */}
                <div className="absolute inset-0 z-0 bg-black/50"></div>
                <div className="absolute inset-0 z-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent"></div>
                <div className="absolute inset-0 z-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
                <div className="absolute inset-0 z-0 backdrop-blur-[2px] md:backdrop-blur-none"></div>

                <div className="max-w-7xl mx-auto w-full relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className="text-center lg:text-left"
                    >
                        <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="inline-block px-4 py-1.5 bg-red-600/20 backdrop-blur-md border border-red-500/30 text-red-500 text-[10px] md:text-xs font-black uppercase tracking-widest rounded-full mb-6"
                        >
                            Artesanía Japonesa en tu Mesa
                        </motion.span>

                        <h1 className="text-4xl md:text-7xl font-black text-white mb-6 leading-[1.1] tracking-tight">
                            Sabor que <br className="hidden md:block" />
                            <span className="text-red-500 italic">Despierta</span> Sentidos
                        </h1>

                        <p className="text-base md:text-xl text-gray-300 mb-10 max-w-lg mx-auto lg:mx-0 leading-relaxed font-medium">
                            Descubre la perfección en cada bocado. Sushi artesanal preparado con los
                            ingredientes más frescos del mercado.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center lg:justify-start">
                            <Link
                                to="/menu"
                                className="w-full sm:w-auto group btn-premium bg-red-600 text-white px-10 py-5 rounded-2xl font-black text-xs tracking-widest flex items-center justify-center gap-3 shadow-[0_20px_40px_-15px_rgba(220,38,38,0.5)] transition-all"
                            >
                                EXPLORAR MENÚ
                                <motion.div
                                    animate={{ x: 0 }}
                                    whileHover={{ x: 5 }}
                                    transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                                >
                                    <ArrowRight size={18} strokeWidth={2} />
                                </motion.div>
                            </Link>
                            <Link
                                to="/blog"
                                className="w-full sm:w-auto btn-premium glass-dark text-white border border-white/20 px-10 py-5 rounded-2xl font-black text-xs tracking-widest flex items-center justify-center gap-3 hover:bg-white/10 transition-all uppercase"
                            >
                                NUESTRO BLOG
                            </Link>
                        </div>
                    </motion.div>

                    {/* Visual element for desktop */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                        transition={{ duration: 1, delay: 0.3 }}
                        className="hidden lg:block relative"
                    >
                        <div className="relative z-10 w-full aspect-square max-w-md mx-auto rounded-[3rem] overflow-hidden border-8 border-white/10 premium-shadow">
                            <img
                                src="/blog_post_chef_hands.png"
                                alt="Experiencia Chef en Sushi de Maksim"
                                fetchPriority="high"
                                decoding="async"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        {/* Decoration */}
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-red-600/30 blur-[80px] rounded-full"></div>
                        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-red-600/20 blur-[80px] rounded-full"></div>
                    </motion.div>
                </div>
            </section>

            {/* Stats/Badge Banner */}
            <section className="bg-white/50 backdrop-blur-sm py-8 md:py-10 border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 grid grid-cols-3 gap-4 md:flex md:justify-between items-center md:gap-8">
                    <div className="flex flex-col md:flex-row items-center gap-2 md:gap-3 text-center md:text-left">
                        <div className="text-xl md:text-3xl font-black text-gray-900 italic">
                            9.8
                        </div>
                        <div className="text-[8px] md:text-[10px] font-bold text-gray-400 uppercase tracking-tighter leading-tight">
                            Valoración
                            <br className="hidden md:block" />
                            Media
                        </div>
                    </div>
                    <div className="h-4 w-px bg-gray-200 hidden md:block"></div>
                    <div className="flex flex-col md:flex-row items-center gap-2 md:gap-3 text-center md:text-left">
                        <div className="text-xl md:text-3xl font-black text-gray-900 italic">
                            +2k
                        </div>
                        <div className="text-[8px] md:text-[10px] font-bold text-gray-400 uppercase tracking-tighter leading-tight">
                            Pedidos
                            <br className="hidden md:block" />
                            Hoy
                        </div>
                    </div>
                    <div className="h-4 w-px bg-gray-200 hidden md:block"></div>
                    <div className="flex flex-col md:flex-row items-center gap-2 md:gap-3 text-center md:text-left">
                        <div className="text-xl md:text-3xl font-black text-gray-900 italic">
                            100%
                        </div>
                        <div className="text-[8px] md:text-[10px] font-bold text-gray-400 uppercase tracking-tighter leading-tight">
                            Pescado
                            <br className="hidden md:block" />
                            Fresco
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-24 px-4 bg-transparent">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-4 tracking-tighter">
                            La Experiencia <span className="text-red-600">Maksim</span>
                        </h2>
                        <p className="text-gray-500 max-w-2xl mx-auto text-sm md:text-base font-medium">
                            No solo vendemos comida, entregamos una tradición familiar perfeccionada
                            durante años.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                        <FeatureCard
                            index={0}
                            icon={Clock}
                            title="Entrega Express"
                            desc="Nuestros repartidores conocen Madrid como nadie. Tu pedido llega siempre a la temperatura ideal en menos de 45 min."
                            colorClass="bg-amber-100/50"
                        />
                        <FeatureCard
                            index={1}
                            icon={Star}
                            title="Calidad Premium"
                            desc="Seleccionamos el Atún Rojo y el Salmón Noruego cada mañana en MercaMadrid para garantizar frescura absoluta."
                            colorClass="bg-red-100/50"
                        />
                        <FeatureCard
                            index={2}
                            icon={MapPin}
                            title="Localización Ideal"
                            desc="Situados en el corazón de Tetuán, listos para que pases a recoger tu pedido con un 10% de descuento adicional."
                            colorClass="bg-blue-100/50"
                        />
                    </div>
                </div>
            </section>

            {/* Blog Teaser / SEO Section */}
            <section className="py-24 bg-transparent px-4 border-t border-gray-100">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] }}
                        style={{ willChange: 'opacity, transform', backfaceVisibility: 'hidden' }}
                        className="relative px-4"
                    >
                        <div className="rounded-[2rem] md:rounded-[2.5rem] overflow-hidden shadow-2xl skew-y-1">
                            <img
                                src="/blog_post_chef_hands.png"
                                alt="Preparación artesanal de sushi"
                                loading="lazy"
                                decoding="async"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        {/* Floating Badge */}
                        <div className="absolute -bottom-4 -right-2 md:-bottom-6 md:-right-6 bg-white p-4 md:p-6 rounded-2xl md:rounded-3xl shadow-2xl border border-gray-100 max-w-[160px] md:max-w-[200px] animate-bounce duration-[3000ms]">
                            <div className="flex gap-1 mb-1 md:mb-2">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <Star
                                        key={i}
                                        size={10}
                                        strokeWidth={1.5}
                                        className="text-amber-400"
                                    />
                                ))}
                            </div>
                            <p className="text-[9px] md:text-[11px] font-bold text-gray-800 italic leading-tight">
                                "El mejor sushi que he probado en todo Madrid."
                            </p>
                            <p className="text-[7px] md:text-[9px] text-gray-400 mt-1 uppercase font-black">
                                Pablo G. - Cliente Verificado
                            </p>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ duration: 0.8, delay: 0.2, ease: [0.21, 0.47, 0.32, 0.98] }}
                        style={{ willChange: 'opacity, transform', backfaceVisibility: 'hidden' }}
                        className="text-center lg:text-left pt-10 lg:pt-0"
                    >
                        <span className="text-red-600 font-black text-[10px] md:text-xs uppercase tracking-[0.2em] mb-4 block">
                            Nuestra Historia
                        </span>
                        <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-6 leading-tight tracking-tighter">
                            Más que una Cocina, <br className="hidden md:block" />
                            Una{' '}
                            <span className="italic underline decoration-red-600 decoration-4 underline-offset-8">
                                Pasión
                            </span>
                        </h2>
                        <p className="text-gray-500 mb-8 leading-relaxed font-medium">
                            En Sushi de Maksim, cada corte de pescado es un homenaje a la técnica
                            milenaria. Nos esforzamos por llevarte no solo una cena, sino un momento
                            de placer gastronómico inolvidable.
                        </p>
                        <div className="space-y-4 mb-10">
                            {[
                                'Pescado Fresco del Día',
                                'Arroz Premium de Grano Corto',
                                'Recetas Originales del Chef',
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className="w-5 h-5 rounded-full bg-red-600 flex items-center justify-center">
                                        <ChevronRight
                                            size={12}
                                            strokeWidth={1.5}
                                            className="text-white"
                                        />
                                    </div>
                                    <span className="font-bold text-gray-800 text-sm">{item}</span>
                                </div>
                            ))}
                        </div>
                        <Link
                            to="/blog"
                            className="text-gray-900 font-black text-sm group flex items-center gap-2 hover:text-red-600 transition-colors"
                        >
                            LEER MÁS EN NUESTRO BLOG
                            <ArrowRight
                                size={16}
                                strokeWidth={1.5}
                                className="group-hover:translate-x-1 transition-transform"
                            />
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* Call to Action */}
            <section className="py-20 px-2 md:px-4">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] }}
                    style={{ willChange: 'opacity, transform', backfaceVisibility: 'hidden' }}
                    className="max-w-5xl mx-auto bg-red-600 rounded-[2.5rem] md:rounded-[3rem] p-8 md:p-12 text-center text-white relative overflow-hidden shadow-[0_20px_50px_rgba(220,38,38,0.3)]"
                >
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/asfalt-dark.png')] opacity-10"></div>
                    <h2 className="text-2xl md:text-5xl font-black mb-6 relative z-10 leading-tight">
                        ¿Hambre de Verdad?
                    </h2>
                    <p className="text-red-100 mb-10 text-base md:text-xl font-medium relative z-10 max-w-xl mx-auto">
                        Haz tu primer pedido hoy y descubre por qué somos los favoritos del barrio.
                    </p>
                    <Link
                        to="/menu"
                        className="inline-block w-full sm:w-auto bg-white text-red-600 px-12 py-6 rounded-2xl font-black text-xs tracking-widest shadow-[0_20px_40px_-10px_rgba(0,0,0,0.3)] hover:scale-105 active:scale-95 transition-all duration-300 relative z-10"
                    >
                        ORDENAR AHORA
                    </Link>
                </motion.div>
            </section>

            {/* Newsletter Section */}
            <Newsletter />
        </div>
    );
}
