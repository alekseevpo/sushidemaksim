import { useState, useEffect, useCallback } from 'react';
import { Star, ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const REVIEWS = [
    {
        name: 'Carlos Ruiz',
        date: '2024-03-15',
        text: 'El mejor sushi de Madrid centro. El atún Balfegó es increíble y la frescura se nota en cada bocado. Imprescindible para los amantes del buen sushi.',
        rating: 5,
        location: 'Madrid Centro',
    },
    {
        name: 'Marta S.',
        date: '2024-03-10',
        text: 'Entrega rapidísima y presentación impecable. Muy recomendado el rollo frito y las gyozas. Repetiremos sin duda.',
        rating: 5,
        location: 'Chamberí',
    },
    {
        name: 'Javier Gomez',
        date: '2024-02-28',
        text: 'Calidad premium a un precio justo. Mi sitio favorito para pedir sushi el fin de semana. El arroz tiene el punto perfecto.',
        rating: 5,
        location: 'Salamanca',
    },
    {
        name: 'Elena B.',
        date: '2024-03-20',
        text: 'Sencillamente espectacular. Las piezas son generosas y el sabor es auténtico. Se nota el cariño en la preparación. 10/10.',
        rating: 5,
        location: 'Retiro',
    },
    {
        name: 'Sofia L.',
        date: '2024-03-22',
        text: '¡El mejor nigiri de salmón que he probado! El corte es perfecto y el arroz no se deshace. Un descubrimiento total en Madrid.',
        rating: 5,
        location: 'Argüelles',
    },
    {
        name: 'Ricardo M.',
        date: '2024-03-18',
        text: 'Servicio de entrega impecable. Llegó antes de lo esperado y todo estaba fresquísimo. Muy profesionales.',
        rating: 5,
        location: 'Tetuán',
    },
    {
        name: 'Juan P.',
        date: '2024-03-24',
        text: 'Recomendado por un amigo y no defraudó. El nigiri de anguila es de otro planeta. Calidad insuperable en Madrid.',
        rating: 5,
        location: 'Moncloa',
    },
    {
        name: 'Lucía R.',
        date: '2024-03-25',
        text: 'La selección de mochis es la mejor que he probado. El de té verde y sésamo son exquisitos. El sushi, como siempre, de 10.',
        rating: 5,
        location: 'La Latina',
    },
    {
        name: 'David G.',
        date: '2024-03-26',
        text: 'El Chef Maksim es muy atento y se nota que cuida cada detalle. Una experiencia gastronómica única incluso pidiendo a domicilio.',
        rating: 5,
        location: 'Castellana',
    },
    {
        name: 'Marina S.',
        date: '2024-03-27',
        text: 'Sushi de calidad de restaurante en la comodidad de tu casa. El packaging es elegante y los sabores son muy auténticos.',
        rating: 5,
        location: 'Malasaña',
    },
];

export default function ReviewsSEO() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState(0); // -1 for left, 1 for right
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);

    const nextReview = useCallback(() => {
        setDirection(1);
        setCurrentIndex(prev => (prev + 1) % REVIEWS.length);
    }, []);

    const prevReview = useCallback(() => {
        setDirection(-1);
        setCurrentIndex(prev => (prev - 1 + REVIEWS.length) % REVIEWS.length);
    }, []);

    useEffect(() => {
        if (!isAutoPlaying) return;
        const interval = setInterval(nextReview, 8000);
        return () => clearInterval(interval);
    }, [isAutoPlaying, nextReview]);

    const schema = REVIEWS.map(r => ({
        '@context': 'https://schema.org',
        '@type': 'Review',
        author: {
            '@type': 'Person',
            name: r.name,
        },
        datePublished: r.date,
        reviewBody: r.text,
        reviewRating: {
            '@type': 'Rating',
            ratingValue: r.rating,
            bestRating: 5,
        },
        itemReviewed: {
            '@type': 'Restaurant',
            name: 'Sushi de Maksim',
            image: 'https://sushidemaksim.vercel.app/og-image.jpg',
            address: {
                '@type': 'PostalAddress',
                streetAddress: 'Calle de la Infanta Mercedes, 62',
                addressLocality: 'Madrid',
                postalCode: '28020',
                addressCountry: 'ES',
            },
        },
    }));

    const variants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 50 : -50,
            opacity: 0,
            filter: 'blur(10px)',
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1,
            filter: 'blur(0px)',
        },
        exit: (direction: number) => ({
            zIndex: 0,
            x: direction < 0 ? 50 : -50,
            opacity: 0,
            filter: 'blur(10px)',
        }),
    };

    return (
        <section className="py-24 bg-white overflow-hidden relative border-y border-gray-50">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex flex-col items-center text-center mb-16">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="text-red-600 font-black text-[10px] uppercase tracking-[0.2em]">
                            Reseñas Reales
                        </span>
                        <div className="h-px w-8 bg-red-100 hidden md:block" />
                        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-gray-50 rounded-full border border-gray-100">
                            <svg className="w-3 h-3" viewBox="0 0 24 24">
                                <path
                                    fill="#4285F4"
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                />
                                <path
                                    fill="#34A853"
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                />
                                <path
                                    fill="#FBBC05"
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                                />
                                <path
                                    fill="#EA4335"
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                />
                            </svg>
                            <span className="text-[10px] font-bold text-gray-500">Google</span>
                        </div>
                    </div>
                    <h2 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tighter leading-tight">
                        Lo que dicen <span className="text-red-600">de nosotros</span>
                    </h2>
                </div>

                <div className="relative min-h-[320px] md:min-h-[280px]">
                    <AnimatePresence initial={false} custom={direction}>
                        <motion.div
                            key={currentIndex}
                            custom={direction}
                            variants={variants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{
                                x: { type: 'spring', stiffness: 200, damping: 25 },
                                opacity: { duration: 0.8 },
                                filter: { duration: 0.8 },
                            }}
                            className="absolute inset-0 px-2"
                        >
                            <div className="bg-gray-50 p-8 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] h-full flex flex-col justify-center border border-gray-100/50 hover:bg-white hover:shadow-2xl hover:border-red-100 transition-all duration-700">
                                <div className="flex gap-1 mb-6">
                                    {[...Array(REVIEWS[currentIndex].rating)].map((_, i) => (
                                        <Star
                                            key={i}
                                            size={20}
                                            fill="currentColor"
                                            className="text-amber-400"
                                        />
                                    ))}
                                </div>

                                <blockquote className="text-xl md:text-3xl font-bold text-gray-800 italic mb-8 leading-[1.3] md:leading-[1.4] tracking-tight">
                                    "{REVIEWS[currentIndex].text}"
                                </blockquote>

                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-lg shadow-red-200">
                                        {REVIEWS[currentIndex].name.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="font-black text-gray-900 text-sm uppercase tracking-wider">
                                            {REVIEWS[currentIndex].name}
                                        </div>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <div className="text-[10px] text-red-500 font-bold tracking-widest uppercase">
                                                Cliente Verificado
                                            </div>
                                            <div className="w-1 h-1 bg-gray-300 rounded-full" />
                                            <div className="flex items-center gap-1 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                                                <MapPin size={10} className="text-red-400" />
                                                {REVIEWS[currentIndex].location}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                <div className="mt-12 flex items-center justify-center gap-8">
                    <button
                        onClick={() => {
                            setIsAutoPlaying(false);
                            prevReview();
                        }}
                        className="w-10 h-10 rounded-xl bg-gray-50 text-gray-400 flex items-center justify-center hover:bg-red-600 hover:text-white transition-all border border-gray-100 shadow-sm"
                        aria-label="Previous review"
                    >
                        <ChevronLeft size={18} strokeWidth={2.5} />
                    </button>

                    <div className="flex gap-2">
                        {REVIEWS.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => {
                                    setIsAutoPlaying(false);
                                    setDirection(idx > currentIndex ? 1 : -1);
                                    setCurrentIndex(idx);
                                }}
                                className={`h-1.5 transition-all duration-500 rounded-full ${
                                    idx === currentIndex ? 'w-8 bg-red-600' : 'w-2 bg-gray-200'
                                }`}
                                aria-label={`Go to review ${idx + 1}`}
                            />
                        ))}
                    </div>

                    <button
                        onClick={() => {
                            setIsAutoPlaying(false);
                            nextReview();
                        }}
                        className="w-10 h-10 rounded-xl bg-gray-50 text-gray-400 flex items-center justify-center hover:bg-red-600 hover:text-white transition-all border border-gray-100 shadow-sm"
                        aria-label="Next review"
                    >
                        <ChevronRight size={18} strokeWidth={2.5} />
                    </button>
                </div>

                {/* Schema.org integration */}
                {schema.map((s, i) => (
                    <script key={i} type="application/ld+json">
                        {JSON.stringify(s)}
                    </script>
                ))}
            </div>
        </section>
    );
}
