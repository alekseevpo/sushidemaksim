import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, ChevronRight, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../utils/api';
import SEO from '../components/SEO';
import Newsletter from '../components/Newsletter';
import { BlogSkeleton } from '../components/skeletons/BlogSkeleton';

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

    if (loading) return <BlogSkeleton />;

    return (
        <div className="min-h-screen bg-transparent pb-20">
            <SEO
                title="Blog"
                description="Historias, recetas y secretos del mundo del sushi artesanal. Aprende más sobre la comida japonesa con Sushi de Maksim."
                keywords="blog sushi, recetas japonesas, cultura japonesa, maksim sushi, historia del sushi"
            />

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
            <div className="max-w-7xl mx-auto px-2 md:px-4 -mt-10 relative z-20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {posts.length > 0 ? (
                        posts.map((post, index) => (
                            <motion.article
                                key={post.id}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, amount: 0.2 }}
                                transition={{
                                    duration: 0.6,
                                    delay: index * 0.1,
                                    ease: [0.21, 0.47, 0.32, 0.98],
                                }}
                                style={{
                                    willChange: 'opacity, transform',
                                    backfaceVisibility: 'hidden',
                                }}
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
                                        src={post.image_url || '/sushi-hero.webp'}
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
                                            <Calendar
                                                size={12}
                                                strokeWidth={1.5}
                                                className="text-red-500"
                                            />{' '}
                                            {new Date(post.created_at).toLocaleDateString()}
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <Clock
                                                size={12}
                                                strokeWidth={1.5}
                                                className="text-red-500"
                                            />{' '}
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
                                            Leer más <ChevronRight size={14} strokeWidth={1.5} />
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

                <div className="mt-12 text-center">
                    <Link
                        to="/menu"
                        className="inline-flex items-center gap-2 text-gray-500 hover:text-red-600 font-bold text-sm transition-colors"
                    >
                        <ArrowLeft size={16} strokeWidth={1.5} /> Volver a la tienda
                    </Link>
                </div>
            </div>

            {/* Newsletter Subscription (SEO Boost) */}
            <Newsletter />
        </div>
    );
}
