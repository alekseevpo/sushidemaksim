import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Clock, ArrowLeft, AlertCircle } from 'lucide-react';
import { api } from '../utils/api';
import SEO from '../components/SEO';
import { getOptimizedImageUrl } from '../utils/images';

import { PostSkeleton } from '../components/skeletons/PostSkeleton';

interface BlogPost {
    id: number;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    imageUrl: string;
    author: string;
    readTime: number;
    category: string;
    createdAt: string;
}

export default function BlogPostPage() {
    const { slug } = useParams<{ slug: string }>();
    const [post, setPost] = useState<BlogPost | null>(null);
    const [allPosts, setAllPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [postData, postsData] = await Promise.all([
                    api.get(`/blog/${slug}`),
                    api.get('/blog'),
                ]);
                setPost(postData);
                setAllPosts(postsData);
                setError(null);
            } catch (err: any) {
                console.error('Error fetching blog data:', err);
                setError(err.message || 'No se pudo cargar el artículo.');
            } finally {
                setLoading(false);
            }
        };

        if (slug) {
            fetchData();
        }
    }, [slug]);

    if (loading) {
        return <PostSkeleton />;
    }

    if (error || !post) {
        return (
            <div className="min-h-screen bg-transparent flex flex-col items-center justify-center p-4">
                <AlertCircle size={60} strokeWidth={1.5} className="text-red-500 mb-6" />
                <h1 className="text-3xl font-bold text-gray-900 mb-4 text-center">
                    ¡Ups! Algo salió mal
                </h1>
                <p className="text-gray-500 mb-8 max-w-md text-center">
                    {error || 'El artículo que buscas no existe o ha sido movido.'}
                </p>
                <Link to="/blog" className="btn-premium">
                    Volver al Blog
                </Link>
            </div>
        );
    }

    const relatedPosts = allPosts
        .filter(p => p.id !== post.id)
        .filter(p => p.category === post.category || true) // Prioritize same category if we wanted more complex logic
        .slice(0, 3);

    const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            {
                '@type': 'ListItem',
                position: 1,
                name: 'Inicio',
                item: 'https://sushidemaksim.vercel.app/',
            },
            {
                '@type': 'ListItem',
                position: 2,
                name: 'Blog',
                item: 'https://sushidemaksim.vercel.app/blog',
            },
            {
                '@type': 'ListItem',
                position: 3,
                name: post.title,
                item: `https://sushidemaksim.vercel.app/blog/${post.slug}`,
            },
        ],
    };

    const postSchema = {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: post.title,
        image: post.imageUrl,
        author: {
            '@type': 'Person',
            name: post.author || 'Equipo Editorial',
        },
        publisher: {
            '@type': 'Organization',
            name: 'Sushi de Maksim',
            logo: {
                '@type': 'ImageObject',
                url: 'https://sushidemaksim.vercel.app/logo.svg',
            },
        },
        datePublished: post.createdAt,
        description: post.excerpt,
    };

    return (
        <article className="min-h-screen bg-transparent pb-20">
            <SEO
                title={post.title}
                description={post.excerpt}
                image={post.imageUrl}
                type="article"
                schema={[postSchema, breadcrumbSchema]}
            />
            {/* Minimalist Header with Back Button */}
            <div className="absolute top-24 left-4 md:left-8 z-50 flex flex-col gap-4">
                <Link
                    to="/blog"
                    className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-md px-4 py-2 rounded-full shadow-sm hover:shadow-md transition-all text-sm font-bold text-gray-700 hover:text-red-600 w-fit"
                >
                    <ArrowLeft size={16} strokeWidth={1.5} /> Volver
                </Link>

                {/* Breadcrumbs UI */}
                <nav className="flex items-center gap-2 text-[10px] md:text-xs font-bold text-gray-400/80 bg-white/40 backdrop-blur-sm px-3 py-1 rounded-full w-fit">
                    <Link to="/" className="hover:text-red-500 transition-colors">
                        Inicio
                    </Link>
                    <span>/</span>
                    <Link to="/blog" className="hover:text-red-500 transition-colors">
                        Blog
                    </Link>
                    <span>/</span>
                    <span className="text-gray-200 truncate max-w-[100px] md:max-w-xs">
                        {post.title}
                    </span>
                </nav>
            </div>

            <div className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden bg-gray-900">
                <img
                    src={getOptimizedImageUrl(post.imageUrl || '/sushi-hero.webp', 1200)}
                    alt={`Hero de ${post.title}`}
                    fetchPriority="high"
                    decoding="async"
                    className="w-full h-full object-cover opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

                {/* Title Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 lg:px-32 max-w-5xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <span className="inline-block bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
                            {post.category}
                        </span>
                        <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white mb-6 leading-tight">
                            {post.title}
                        </h1>
                        <div className="flex flex-wrap items-center gap-6 text-gray-300 text-sm font-medium">
                            <span className="flex items-center gap-2">
                                <Calendar size={16} strokeWidth={1.5} className="text-red-500" />
                                {new Date(post.createdAt).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-2">
                                <Clock size={16} strokeWidth={1.5} className="text-red-500" />
                                {post.readTime || '5'} min de lectura
                            </span>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Content Section */}
            <div className="max-w-3xl mx-auto px-4 md:px-6 pt-16 md:pt-24 relative">
                {/* Floating Author Badge */}
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5, type: 'spring' }}
                    className="absolute -top-8 right-6 md:-top-10 md:right-10 bg-white p-2 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-3 pr-6"
                >
                    <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center text-red-600 font-bold text-lg">
                        {post.author ? post.author.charAt(0) : 'E'}
                    </div>
                    <div>
                        <div className="text-[10px] text-gray-400 uppercase font-black tracking-wider">
                            Escrito por
                        </div>
                        <div className="font-bold text-gray-900 text-sm">
                            {post.author || 'Equipo Editorial'}
                        </div>
                    </div>
                </motion.div>

                {/* Excerpt Overview */}
                <p className="text-xl md:text-2xl text-gray-600 leading-relaxed font-serif italic border-l-4 border-red-500 pl-6 mb-12">
                    {post.excerpt}
                </p>

                {/* Main Body */}
                <div className="prose prose-lg md:prose-xl prose-red max-w-none text-gray-700 space-y-8">
                    {/* Render paragraphs, rudimentary simulation of rich text for now */}
                    {post.content
                        .split('\n')
                        .filter(p => p.trim() !== '')
                        .map((paragraph, idx) => (
                            <p key={idx} className="leading-relaxed">
                                {paragraph}
                            </p>
                        ))}
                </div>

                {/* Footer Share / Tags area */}
                <div className="mt-16 pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex gap-2">
                        <span className="px-4 py-2 bg-gray-50 text-gray-600 rounded-full text-xs font-bold shadow-sm border border-gray-100">
                            #{post.category.toLowerCase().replace(/\s+/g, '')}
                        </span>
                        <span className="px-4 py-2 bg-gray-50 text-gray-600 rounded-full text-xs font-bold shadow-sm border border-gray-100">
                            #sushidemaksim
                        </span>
                    </div>
                    <Link to="/menu" className="btn-premium px-8 py-3 rounded-full text-sm">
                        Quiero Sushi Hoy
                    </Link>
                </div>
            </div>

            {/* Related Articles Section */}
            {relatedPosts.length > 0 && (
                <div className="max-w-5xl mx-auto px-4 md:px-6 mt-24">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-2xl font-black text-gray-900">
                            Artículos <span className="text-red-600 italic">Relacionados</span>
                        </h3>
                        <Link
                            to="/blog"
                            className="text-sm font-bold text-gray-400 hover:text-red-500 transition-colors"
                        >
                            Ver todos
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {relatedPosts.map(rPost => (
                            <Link
                                key={rPost.id}
                                to={`/blog/${rPost.slug}`}
                                className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-gray-100 flex flex-col"
                            >
                                <div className="h-40 overflow-hidden">
                                    <img
                                        src={getOptimizedImageUrl(
                                            rPost.imageUrl || '/sushi-hero.webp',
                                            400
                                        )}
                                        alt={rPost.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                </div>
                                <div className="p-4 flex-1 flex flex-col">
                                    <span className="text-[10px] font-black text-red-600 uppercase mb-2 tracking-widest">
                                        {rPost.category}
                                    </span>
                                    <h4 className="font-bold text-gray-900 line-clamp-2 leading-snug group-hover:text-red-600 transition-colors">
                                        {rPost.title}
                                    </h4>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </article>
    );
}
