import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, ChevronRight, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../utils/api';
import SEO from '../components/SEO';
import Newsletter from '../components/Newsletter';
import { BlogSkeleton } from '../components/skeletons/BlogSkeleton';
import { getOptimizedImageUrl } from '../utils/images';

interface BlogPost {
    id: number;
    title: string;
    slug: string;
    excerpt: string;
    imageUrl: string;
    author: string;
    readTime: number;
    category: string;
    createdAt: string;
}

export default function BlogPage() {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [pagination, setPagination] = useState<{
        totalPages: number;
        currentPage: number;
        totalPosts: number;
    } | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);

    const fetchPosts = async (page: number) => {
        setLoading(true);
        try {
            const data = await api.get(`/blog?page=${page}&limit=5`);
            setPosts(data.posts);
            setPagination(data.pagination);

            // Scroll to top of posts container on page change
            if (page !== 1 || currentPage !== 1) {
                const container = document.getElementById('blog-posts-container');
                if (container) {
                    const offset = container.getBoundingClientRect().top + window.scrollY - 100;
                    window.scrollTo({ top: offset, behavior: 'smooth' });
                }
            }
        } catch (err) {
            console.error('Error fetching blog posts:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts(currentPage);
    }, [currentPage]);

    if (loading) return <BlogSkeleton />;

    return (
        <div className="min-h-screen bg-transparent pb-20">
            <SEO
                title="Blog de Sushi y Cultura Japonesa — Sushi de Maksim Madrid"
                description="Descubre los secretos del sushi artesanal, recetas exclusivas y la cultura japonesa en el blog de Sushi de Maksim. ¡Pasión por el detalle en Madrid!"
                keywords="blog sushi madrid, cultura japonesa, recetas sushi, secretos del sushi, sushi artesanal madrid"
                schema={{
                    '@context': 'https://schema.org',
                    '@type': 'Blog',
                    name: 'Blog de Sushi de Maksim',
                    description: 'Historias, recetas y secretos del mundo del sushi artesanal.',
                    url: 'https://sushidemaksim.vercel.app/blog',
                    publisher: {
                        '@type': 'Organization',
                        name: 'Sushi de Maksim',
                        logo: {
                            '@type': 'ImageObject',
                            url: 'https://sushidemaksim.vercel.app/logo.svg',
                        },
                    },
                }}
            />

            {/* Hero Section */}
            <section className="relative h-[40vh] overflow-hidden flex items-center justify-center bg-black">
                <div className="absolute inset-0 z-0">
                    <img
                        src={getOptimizedImageUrl('/blog_post_sushi_art.jpg', 1200)}
                        alt="Mundo Sushi de Maksim"
                        {...({ fetchpriority: 'high' } as any)}
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
                    <span className="inline-block px-3 py-1 bg-orange-600 text-white text-[11px] font-bold rounded-full mb-4 tracking-widest uppercase">
                        Nuestra bitácora
                    </span>
                    <h1 className="text-4xl md:text-6xl font-black text-white mb-4 drop-shadow-lg">
                        Blog & <span className="text-orange-500 italic">Estilo</span>
                    </h1>
                    <p className="text-gray-300 max-w-xl mx-auto text-sm md:text-base font-medium">
                        Historias, recetas y secretos del mundo del sushi artesanal.
                    </p>
                </motion.div>
            </section>

            {/* Container */}
            <div
                id="blog-posts-container"
                className="max-w-7xl mx-auto px-2 md:px-4 -mt-10 relative z-20 min-h-[600px]"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {posts.map((post, index) => (
                        <motion.article
                            key={post.id}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                                duration: 0.6,
                                delay: index * 0.1,
                                ease: [0.21, 0.47, 0.32, 0.98],
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
                                    src={getOptimizedImageUrl(
                                        post.imageUrl || '/sushi-hero.webp',
                                        600
                                    )}
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
                                            className="text-orange-500"
                                        />{' '}
                                        {new Date(post.createdAt).toLocaleDateString()}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <Clock
                                            size={12}
                                            strokeWidth={1.5}
                                            className="text-orange-500"
                                        />{' '}
                                        {post.readTime || '5'} min
                                    </span>
                                </div>

                                <h2 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-orange-600 transition-colors line-clamp-2 leading-snug">
                                    {post.title}
                                </h2>

                                <p className="text-gray-500 text-sm mb-6 line-clamp-3 leading-relaxed">
                                    {post.excerpt}
                                </p>

                                <div className="mt-auto pt-6 border-t border-gray-50 flex items-center justify-between z-20">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-[10px] font-bold text-orange-600">
                                            {post.author ? post.author.charAt(0) : 'E'}
                                        </div>
                                        <span className="text-xs font-bold text-gray-700">
                                            {post.author || 'Equipo Editorial'}
                                        </span>
                                    </div>

                                    <Link
                                        to={`/blog/${post.slug}`}
                                        className="text-[12px] font-black uppercase tracking-tighter text-orange-600 flex items-center gap-1 hover:gap-2 transition-all no-underline"
                                    >
                                        Leer más <ChevronRight size={14} strokeWidth={1.5} />
                                    </Link>
                                </div>
                            </div>
                        </motion.article>
                    ))}
                    {!loading && posts.length === 0 && (
                        <div className="col-span-full py-20 text-center text-gray-500 font-medium">
                            No hay artículos publicados aún.
                        </div>
                    )}
                </div>

                {/* Pagination Controls */}
                {pagination && pagination.totalPages > 1 && (
                    <div className="mt-16 flex items-center justify-center gap-2">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1 || loading}
                            className="p-3 rounded-xl bg-white border border-gray-100 text-gray-400 hover:text-orange-600 hover:border-orange-200 transition-all disabled:opacity-30 disabled:pointer-events-none shadow-sm active:scale-95"
                        >
                            <ArrowLeft size={18} strokeWidth={2.5} />
                        </button>

                        <div className="flex items-center gap-2 px-2">
                            {Array.from({ length: pagination.totalPages }).map((_, i) => {
                                const pageNum = i + 1;
                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => setCurrentPage(pageNum)}
                                        disabled={loading}
                                        className={`w-10 h-10 rounded-xl text-[12px] font-black transition-all ${
                                            currentPage === pageNum
                                                ? 'bg-orange-600 text-white shadow-lg shadow-orange-200'
                                                : 'bg-white text-gray-400 border border-gray-100 hover:border-orange-200 hover:text-orange-600'
                                        }`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}
                        </div>

                        <button
                            onClick={() =>
                                setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))
                            }
                            disabled={currentPage === pagination.totalPages || loading}
                            className="p-3 rounded-xl bg-white border border-gray-100 text-gray-400 hover:text-orange-600 hover:border-orange-200 transition-all disabled:opacity-30 disabled:pointer-events-none shadow-sm active:scale-95"
                        >
                            <ChevronRight size={18} strokeWidth={2.5} />
                        </button>
                    </div>
                )}

                <div className="mt-12 text-center pb-12">
                    <Link
                        to="/menu"
                        className="inline-flex items-center gap-2 text-gray-400 hover:text-gray-900 font-bold text-[10px] uppercase tracking-widest transition-colors"
                    >
                        <ArrowLeft size={14} strokeWidth={2.5} /> Volver al restaurante
                    </Link>
                </div>
            </div>

            {/* Newsletter Subscription (SEO Boost) */}
            <Newsletter />
        </div>
    );
}
