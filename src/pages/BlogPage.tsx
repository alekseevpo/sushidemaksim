import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, ChevronRight, ArrowLeft, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../utils/api';

interface BlogPost {
    id: number;
    title: string;
    slug: string;
    excerpt: string;
    image_url: string;
    author: string;
    read_time: string;
    category: string;
    created_at: string;
}

export default function BlogPage() {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const data = await api.get('/blog');
                setPosts(data);
            } catch (err) {
                console.error('Error fetching blog posts:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Hero Section */}
            <section className="relative h-[40vh] overflow-hidden flex items-center justify-center bg-black">
                <div className="absolute inset-0 z-0">
                    <img
                        src="/blog_post_sushi_art.png"
                        alt="Mundo Sushi de Maksim"
                        fetchPriority="high"
                        decoding="async"
                        className="w-full h-full object-cover opacity-40 scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent" />
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="relative z-10 text-center px-4"
                >
                    <span className="inline-block px-3 py-1 bg-red-600 text-white text-[11px] font-bold rounded-full mb-4 tracking-widest uppercase">
                        Nuestra bitácora
                    </span>
                    <h1 className="text-4xl md:text-6xl font-black text-white mb-4 drop-shadow-lg">
                        Blog & <span className="text-red-500 italic">Estilo</span>
                    </h1>
                    <p className="text-gray-300 max-w-xl mx-auto text-sm md:text-base font-medium">
                        Historias, recetas y secretos del mundo del sushi artesanal.
                    </p>
                </motion.div>
            </section>

            {/* Container */}
            <div className="max-w-7xl mx-auto px-4 -mt-10 relative z-20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {loading ? (
                        <div className="col-span-full py-20 flex justify-center text-gray-500">
                            <RefreshCw className="animate-spin mr-2" /> Cargando artículos...
                        </div>
                    ) : posts.length > 0 ? (
                        posts.map((post, index) => (
                            <motion.article
                                key={post.id}
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300 border border-gray-100 flex flex-col group h-full relative"
                            >
                                {/* Link overlay for the whole card */}
                                <Link
                                    to={`/blog/${post.slug}`}
                                    className="absolute inset-0 z-10"
                                    aria-label={`Leer más sobre ${post.title}`}
                                ></Link>

                                {/* Image Wrapper */}
                                <div className="relative h-64 overflow-hidden">
                                    <img
                                        src={post.image_url || '/sushi-hero.jpg'}
                                        alt={`Imagen del articulo ${post.title}`}
                                        loading="lazy"
                                        decoding="async"
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute top-4 left-4 z-20">
                                        <span className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg text-[11px] font-bold text-gray-900 uppercase shadow-sm">
                                            {post.category}
                                        </span>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-6 flex-1 flex flex-col">
                                    <div className="flex items-center gap-4 text-gray-400 text-[11px] font-medium mb-3">
                                        <span className="flex items-center gap-1.5 line-clamp-1">
                                            <Calendar size={12} className="text-red-500" />{' '}
                                            {new Date(post.created_at).toLocaleDateString()}
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <Clock size={12} className="text-red-500" />{' '}
                                            {post.read_time || '5 min'}
                                        </span>
                                    </div>

                                    <h2 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-red-600 transition-colors line-clamp-2 leading-snug">
                                        {post.title}
                                    </h2>

                                    <p className="text-gray-500 text-sm mb-6 line-clamp-3 leading-relaxed">
                                        {post.excerpt}
                                    </p>

                                    <div className="mt-auto pt-6 border-t border-gray-50 flex items-center justify-between z-20">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-[10px] font-bold text-red-600">
                                                {post.author ? post.author.charAt(0) : 'E'}
                                            </div>
                                            <span className="text-xs font-bold text-gray-700">
                                                {post.author || 'Equipo Editorial'}
                                            </span>
                                        </div>

                                        <button className="text-[12px] font-black uppercase tracking-tighter text-red-600 flex items-center gap-1 hover:gap-2 transition-all">
                                            Leer más <ChevronRight size={14} />
                                        </button>
                                    </div>
                                </div>
                            </motion.article>
                        ))
                    ) : (
                        <div className="col-span-full py-20 text-center text-gray-500 font-medium">
                            No hay artículos publicados aún.
                        </div>
                    )}
                </div>

                {/* Newsletter Subscription (SEO Boost) */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="mt-20 bg-black rounded-[2rem] p-8 md:p-12 text-center relative overflow-hidden shadow-2xl"
                >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-red-600/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />

                    <div className="relative z-10 max-w-2xl mx-auto">
                        <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
                            ¿Quieres recibir ofertas{' '}
                            <span className="text-red-500">exclusivas</span>?
                        </h2>
                        <p className="text-gray-400 mb-8 text-sm md:text-base leading-relaxed">
                            Únete a nuestro club de amantes del sushi y recibe historias del blog y
                            promociones directamente en tu email.
                        </p>
                        <form
                            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
                            onSubmit={e => e.preventDefault()}
                        >
                            <input
                                type="email"
                                placeholder="Tu mejor email..."
                                className="flex-1 bg-white/10 border border-white/20 rounded-xl px-5 py-3.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                            />
                            <button className="bg-red-600 hover:bg-red-700 text-white font-black px-8 py-3.5 rounded-xl text-sm transition-all shadow-lg active:scale-95">
                                ¡SUSCRIBIRME!
                            </button>
                        </form>
                    </div>
                </motion.div>

                <div className="mt-12 text-center">
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 text-gray-500 hover:text-red-600 font-bold text-sm transition-colors"
                    >
                        <ArrowLeft size={16} /> Volver a la tienda
                    </Link>
                </div>
            </div>
        </div>
    );
}
