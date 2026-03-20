import { Star, Quote } from 'lucide-react';
import { motion } from 'framer-motion';

const REVIEWS = [
    {
        name: 'Carlos Ruiz',
        date: '2024-03-15',
        text: 'El mejor sushi de Madrid centro. El atún Balfegó es increíble y la frescura se nota en cada bocado. Imprescindible para los amantes del buen sushi.',
        rating: 5,
    },
    {
        name: 'Marta S.',
        date: '2024-03-10',
        text: 'Entrega rapidísima и presentación impecable. Muy recomendado el rollo frito y las gyozas. Repetiremos sin duda.',
        rating: 5,
    },
    {
        name: 'Javier Gomez',
        date: '2024-02-28',
        text: 'Calidad premium a un precio justo. Mi sitio favorito para pedir sushi el fin de semana. El arroz tiene el punto perfecto.',
        rating: 5,
    },
];

export default function ReviewsSEO() {
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

    return (
        <section className="py-24 bg-white overflow-hidden">
            <div className="max-w-7xl mx-auto px-4">
                <div className="text-center mb-16">
                    <span className="text-red-600 font-black text-xs uppercase tracking-widest mb-4 block">
                        Opiniones de Clientes
                    </span>
                    <h2 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tighter">
                        Lo que dicen <span className="text-red-600">de nosotros</span>
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {REVIEWS.map((review, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-gray-50 p-8 rounded-[2.5rem] relative group border border-transparent hover:border-red-100 hover:bg-white hover:shadow-2xl transition-all duration-500"
                        >
                            <Quote
                                className="absolute top-6 right-8 text-gray-200 group-hover:text-red-100 transition-colors"
                                size={40}
                            />
                            <div className="flex gap-1 mb-4">
                                {[...Array(review.rating)].map((_, i) => (
                                    <Star
                                        key={i}
                                        size={16}
                                        fill="currentColor"
                                        className="text-amber-400"
                                    />
                                ))}
                            </div>
                            <p className="text-gray-700 font-medium italic mb-6 leading-relaxed relative z-10">
                                "{review.text}"
                            </p>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                    {review.name.charAt(0)}
                                </div>
                                <div>
                                    <div className="font-black text-gray-900 text-sm uppercase">
                                        {review.name}
                                    </div>
                                    <div className="text-[10px] text-gray-400 font-bold">
                                        CLIENTE VERIFICADO
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
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
