import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Clock, ArrowLeft, RefreshCw, AlertCircle } from 'lucide-react';
import { api } from '../utils/api';
import SEO from '../components/SEO';

interface BlogPost {
    id: number;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    image_url: string;
    author: string;
    read_time: string;
    category: string;
    created_at: string;
}

export default function BlogPostPage() {
    const { slug } = useParams<{ slug: string }>();
    const [post, setPost] = useState<BlogPost | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPost = async () => {
            setLoading(true);
            try {
                const data = await api.get(`/blog/${slug}`);
                setPost(data);
                setError(null);
            } catch (err: any) {
                console.error('Error fetching blog post:', err);
                setError(err.message || 'No se pudo cargar el artículo.');
            } finally {
                setLoading(false);
            }
        };

        if (slug) {
            fetchPost();
        }
    }, [slug]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
                <RefreshCw size={40} className="animate-spin text-red-600 mb-4" />
                <p className="text-gray-500 font-medium tracking-wide">Cargando artículo...</p>
            </div>
        );
    }

    if (error || !post) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <AlertCircle size={60} className="text-red-500 mb-6" />
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

    return (
        <article className="min-h-screen bg-white pb-20">
            <SEO
                title={post.title}
                description={post.excerpt}
                image={post.image_url}
                type="article"
            />
            {/* Minimalist Header with Back Button */}
            <div className="absolute top-24 left-4 md:left-8 z-50">
                <Link
                    to="/blog"
                    className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-md px-4 py-2 rounded-full shadow-sm hover:shadow-md transition-all text-sm font-bold text-gray-700 hover:text-red-600"
                >
                    <ArrowLeft size={16} /> Volver
                </Link>
            </div>

            {/* Hero Image Section */}
            <div className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden bg-gray-900">
                <img
                    src={post.image_url || '/sushi-hero.jpg'}
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
                                <Calendar size={16} className="text-red-500" />
                                {new Date(post.created_at).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-2">
                                <Clock size={16} className="text-red-500" />
                                {post.read_time || '5 min'} de lectura
                            </span>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Content Section */}
            <div className="max-w-3xl mx-auto px-6 pt-16 md:pt-24 relative">
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
        </article>
    );
}
