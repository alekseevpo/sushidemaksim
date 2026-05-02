import { useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../hooks/useAuth';
import { useTablonPost, useDeleteTablonPost } from '../hooks/queries/useTablon';
import { CommentSection } from '../components/tablon/CommentSection';
import { TranslateMessage } from '../components/tablon/TranslateMessage';
import { TABLON_EDIT_WINDOW_MS } from '../constants/tablon';

export default function TablonPostPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const { data, isLoading, error } = useTablonPost(id || '');
    const deletePost = useDeleteTablonPost();

    const [showLoginToast, setShowLoginToast] = useState(false);

    const handleLoginPrompt = useCallback(() => {
        setShowLoginToast(true);
        setTimeout(() => setShowLoginToast(false), 3000);
    }, []);

    const handleDelete = useCallback(async () => {
        if (!id) return;
        if (!confirm('¿Estás seguro de que quieres eliminar este anuncio?')) return;
        await deletePost.mutateAsync(id);
        navigate('/tablon');
    }, [id, deletePost, navigate]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-950 pt-24 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-gray-600 border-t-orange-500 rounded-full animate-spin" />
            </div>
        );
    }

    if (error || !data?.post) {
        return (
            <div className="min-h-screen bg-gray-950 pt-24 flex flex-col items-center justify-center gap-4">
                <p className="text-xl text-gray-400">📭 Anuncio no encontrado</p>
                <Link
                    to="/tablon"
                    className="text-orange-400 hover:text-orange-300 text-sm underline"
                >
                    ← Volver al tablón
                </Link>
            </div>
        );
    }

    const { post, comments } = data;
    const isOwner = user?.id === post.userId;
    const isModerator = user?.role === 'moderator' || user?.role === 'admin' || user?.isSuperadmin;
    const canEdit =
        isOwner && Date.now() - new Date(post.createdAt).getTime() < TABLON_EDIT_WINDOW_MS;
    const canDelete = isOwner || isModerator;

    const whatsappLink = post.whatsappPhone
        ? `https://wa.me/${post.whatsappPhone.replace(/[^0-9]/g, '')}`
        : null;

    return (
        <>
            <Helmet>
                <title>
                    {post.category?.name
                        ? `${post.category.emoji} ${post.category.name}`
                        : 'Anuncio'}{' '}
                    — Tablón | Sushi de Maksim
                </title>
                <meta name="description" content={post.message.slice(0, 160)} />
                <link rel="canonical" href={`https://sushidemaksim.vercel.app/tablon/${post.id}`} />
            </Helmet>

            <div className="min-h-[100svh] bg-[#0d0d0d] pt-24 pb-20 relative">
                {/* Ambient Background Glows */}
                <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                    <div className="absolute top-[-10%] right-[-10%] w-[80vw] h-[80vw] bg-orange-900/15 rounded-full blur-[140px]" />
                    <div className="absolute bottom-[-10%] left-[-10%] w-[80vw] h-[80vw] bg-orange-950/25 rounded-full blur-[140px]" />
                    <div className="absolute bottom-[-20%] left-1/2 -translate-x-1/2 w-[110vw] h-[70vw] bg-orange-900/20 rounded-full blur-[160px]" />
                </div>

                <div className="relative z-10 max-w-3xl mx-auto px-4">
                    {/* Back link */}
                    <Link
                        to="/tablon"
                        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-300 mb-6 transition-colors"
                        data-testid="back-to-tablon"
                    >
                        ← Volver al tablón
                    </Link>

                    {/* Post Card */}
                    <article className="bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
                        {/* Images */}
                        {post.images.length > 0 && (
                            <div
                                className={`grid ${
                                    post.images.length === 1
                                        ? 'grid-cols-1'
                                        : post.images.length === 2
                                          ? 'grid-cols-2'
                                          : 'grid-cols-2'
                                } gap-1`}
                            >
                                {post.images.map((img, idx) => (
                                    <a
                                        key={idx}
                                        href={img}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`relative overflow-hidden ${
                                            post.images.length === 1
                                                ? 'h-64 md:h-96'
                                                : post.images.length === 3 && idx === 0
                                                  ? 'h-64 md:h-80 row-span-2'
                                                  : 'h-32 md:h-40'
                                        }`}
                                    >
                                        <img
                                            src={img}
                                            alt={`Foto ${idx + 1} del anuncio`}
                                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                            loading={idx === 0 ? 'eager' : 'lazy'}
                                            width={600}
                                            height={400}
                                        />
                                    </a>
                                ))}
                            </div>
                        )}

                        <div className="p-6 md:p-8">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    {/* Author */}
                                    <div className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden flex-shrink-0">
                                        {isAuthenticated && post.author.avatar ? (
                                            <img
                                                src={post.author.avatar}
                                                alt=""
                                                className="w-full h-full object-cover"
                                                width={40}
                                                height={40}
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-lg">
                                                👤
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-white">
                                            {isAuthenticated && post.author.name
                                                ? post.author.name
                                                : 'Alguien escribió'}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {new Date(post.createdAt).toLocaleDateString('es-ES', {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </p>
                                    </div>
                                </div>

                                {/* Category badge */}
                                {post.category && (
                                    <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-orange-500/15 text-orange-400 rounded-full text-xs font-medium">
                                        {post.category.emoji} {post.category.name}
                                    </span>
                                )}
                            </div>

                            {/* Message */}
                            <TranslateMessage
                                originalText={post.message}
                                className="mb-6"
                                textClassName="text-gray-200 leading-relaxed whitespace-pre-wrap"
                            />

                            {/* Tags */}
                            {post.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-6">
                                    {post.tags.map(tag => (
                                        <Link
                                            key={tag}
                                            to={`/tablon?tag=${encodeURIComponent(tag)}`}
                                            className="text-xs px-2.5 py-1 bg-white/5 text-gray-400 rounded-md hover:bg-white/10 transition-colors"
                                        >
                                            #{tag}
                                        </Link>
                                    ))}
                                </div>
                            )}

                            {/* Action buttons */}
                            <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                                {/* WhatsApp button (auth only) */}
                                {isAuthenticated && whatsappLink ? (
                                    <a
                                        href={whatsappLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 transition-all"
                                        data-testid="whatsapp-contact"
                                    >
                                        💬 WhatsApp
                                    </a>
                                ) : !isAuthenticated ? (
                                    <button
                                        onClick={handleLoginPrompt}
                                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-700 text-gray-400 rounded-xl text-sm cursor-not-allowed"
                                    >
                                        🔒 Contacto (Inicia sesión)
                                    </button>
                                ) : null}

                                <div className="flex-1" />

                                {/* Edit */}
                                {canEdit && (
                                    <button
                                        className="px-3 py-2 text-sm text-gray-400 hover:text-white transition-colors"
                                        data-testid="edit-post-btn"
                                    >
                                        ✏️ Editar
                                    </button>
                                )}

                                {/* Delete */}
                                {canDelete && (
                                    <button
                                        onClick={handleDelete}
                                        disabled={deletePost.isPending}
                                        className="px-3 py-2 text-sm text-gray-400 hover:text-red-400 transition-colors"
                                        data-testid="delete-post-btn"
                                    >
                                        🗑️ Eliminar
                                    </button>
                                )}
                            </div>
                        </div>
                    </article>

                    {/* Comments Section */}
                    <div className="mt-8">
                        <CommentSection
                            postId={post.id}
                            comments={comments}
                            isAuthenticated={isAuthenticated}
                            onLoginPrompt={handleLoginPrompt}
                        />
                    </div>
                </div>

                {/* Login toast */}
                {showLoginToast && (
                    <div className="fixed bottom-32 left-1/2 -translate-x-1/2 z-toast bg-gray-800 text-white px-6 py-3 rounded-xl shadow-2xl text-sm font-medium border border-white/10 animate-fade-in">
                        🔒 Inicia sesión para ver el contacto y comentar
                    </div>
                )}
            </div>
        </>
    );
}
