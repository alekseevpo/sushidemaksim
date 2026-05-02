import { useState, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../hooks/useAuth';
import { useTablonPosts, useTablonCategories } from '../hooks/queries/useTablon';
import type { TablonFilters } from '../hooks/queries/useTablon';
import { CategoryFilter } from '../components/tablon/CategoryFilter';
import { PostCard } from '../components/tablon/PostCard';
import { CreatePostModal } from '../components/tablon/CreatePostModal';
import { TablonSkeleton } from '../components/skeletons/TablonSkeleton';

export default function TablonPage() {
    const { isAuthenticated } = useAuth();
    const [filters, setFilters] = useState<TablonFilters>({
        page: 1,
        limit: 12,
        sort: 'newest',
    });
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showLoginToast, setShowLoginToast] = useState(false);

    const { data: categoriesData, isLoading: catsLoading } = useTablonCategories();
    const { data, isLoading } = useTablonPosts(filters);

    const categories = categoriesData?.categories || [];
    const posts = data?.posts || [];
    const pagination = data?.pagination;

    const handleCategorySelect = useCallback((catId: string | null) => {
        setFilters(prev => ({ ...prev, category: catId || undefined, page: 1 }));
    }, []);

    const handleSortChange = useCallback((sort: 'newest' | 'oldest') => {
        setFilters(prev => ({ ...prev, sort, page: 1 }));
    }, []);

    const handlePageChange = useCallback((page: number) => {
        setFilters(prev => ({ ...prev, page }));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    const handleCreateClick = useCallback(() => {
        if (!isAuthenticated) {
            setShowLoginToast(true);
            setTimeout(() => setShowLoginToast(false), 3000);
            return;
        }
        setShowCreateModal(true);
    }, [isAuthenticated]);

    if (isLoading && !data) return <TablonSkeleton />;

    return (
        <>
            <Helmet>
                <title>Tablón — Comunidad | Sushi de Maksim</title>
                <meta
                    name="description"
                    content="Tablón de anuncios de la comunidad Sushi de Maksim. Publica, comparte, y descubre ofertas, eventos, ideas y más."
                />
                <link rel="canonical" href="https://sushidemaksim.vercel.app/tablon" />
            </Helmet>

            <div className="min-h-[100svh] bg-[#0d0d0d] pt-24 pb-20 relative">
                {/* Ambient Background Glows */}
                <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                    <div className="absolute top-[-10%] right-[-10%] w-[80vw] h-[80vw] bg-orange-900/15 rounded-full blur-[140px]" />
                    <div className="absolute bottom-[-10%] left-[-10%] w-[80vw] h-[80vw] bg-orange-950/25 rounded-full blur-[140px]" />
                    <div className="absolute bottom-[-20%] left-1/2 -translate-x-1/2 w-[110vw] h-[70vw] bg-orange-900/20 rounded-full blur-[160px]" />
                </div>

                {/* Content */}
                <div className="relative z-10 max-w-6xl mx-auto px-4">
                    {/* Filters */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                        {!catsLoading && (
                            <CategoryFilter
                                categories={categories}
                                selectedCategoryId={filters.category || null}
                                onSelect={handleCategorySelect}
                            />
                        )}

                        {/* Sort */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                            <button
                                onClick={() => handleSortChange('newest')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                    filters.sort === 'newest'
                                        ? 'bg-white/15 text-white'
                                        : 'text-gray-500 hover:text-gray-300'
                                }`}
                                data-testid="sort-newest"
                            >
                                🆕 Recientes
                            </button>
                            <button
                                onClick={() => handleSortChange('oldest')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                    filters.sort === 'oldest'
                                        ? 'bg-white/15 text-white'
                                        : 'text-gray-500 hover:text-gray-300'
                                }`}
                                data-testid="sort-oldest"
                            >
                                📅 Antiguos
                            </button>
                        </div>
                    </div>

                    {/* Posts Grid */}
                    {posts.length === 0 ? (
                        <div className="text-center py-20">
                            <div className="text-6xl mb-4">📭</div>
                            <p className="text-gray-400 text-lg">
                                {filters.category
                                    ? 'No hay anuncios en esta categoría'
                                    : 'Aún no hay anuncios. ¡Sé el primero!'}
                            </p>
                            <button
                                onClick={handleCreateClick}
                                className="mt-6 px-5 py-2.5 bg-orange-500/20 text-orange-400 rounded-xl text-sm font-medium hover:bg-orange-500/30 transition-all"
                            >
                                ✏️ Publicar ahora
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {posts.map(post => (
                                    <PostCard
                                        key={post.id}
                                        post={post}
                                        isAuthenticated={isAuthenticated}
                                    />
                                ))}
                            </div>

                            {/* Pagination */}
                            {pagination && pagination.totalPages > 1 && (
                                <div className="flex justify-center gap-2 mt-12">
                                    {pagination.currentPage > 1 && (
                                        <button
                                            onClick={() =>
                                                handlePageChange(pagination.currentPage - 1)
                                            }
                                            className="px-4 py-2 bg-white/5 text-gray-300 rounded-lg text-sm hover:bg-white/10 transition-all"
                                            data-testid="pagination-prev"
                                        >
                                            ← Anterior
                                        </button>
                                    )}

                                    <span className="px-4 py-2 text-sm text-gray-500">
                                        {pagination.currentPage} / {pagination.totalPages}
                                    </span>

                                    {pagination.currentPage < pagination.totalPages && (
                                        <button
                                            onClick={() =>
                                                handlePageChange(pagination.currentPage + 1)
                                            }
                                            className="px-4 py-2 bg-white/5 text-gray-300 rounded-lg text-sm hover:bg-white/10 transition-all"
                                            data-testid="pagination-next"
                                        >
                                            Siguiente →
                                        </button>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* FAB (Floating Action Button) */}
                <button
                    onClick={handleCreateClick}
                    className="fixed bottom-24 right-4 md:bottom-10 md:right-10 w-14 h-14 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full shadow-xl shadow-orange-500/30 flex items-center justify-center text-2xl z-fixed active:scale-90 transition-transform"
                    data-testid="create-post-fab"
                >
                    ✏️
                </button>

                {/* Login toast */}
                {showLoginToast && (
                    <div className="fixed bottom-32 left-1/2 -translate-x-1/2 z-toast bg-gray-800 text-white px-6 py-3 rounded-xl shadow-2xl text-sm font-medium border border-white/10 animate-fade-in">
                        🔒 Inicia sesión para publicar un anuncio
                    </div>
                )}

                {/* Create Post Modal */}
                <CreatePostModal
                    isOpen={showCreateModal}
                    onClose={() => setShowCreateModal(false)}
                />
            </div>
        </>
    );
}
