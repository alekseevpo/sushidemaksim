import { Link } from 'react-router-dom';
import { Heart, MessageSquare, User, Camera } from 'lucide-react';
import { getCategoryIcon } from '../../utils/tablonIcons';
import type { TablonPost } from '../../hooks/queries/useTablon';
import { TranslateMessage } from './TranslateMessage';

interface PostCardProps {
    post: TablonPost;
    isAuthenticated: boolean;
}

export function PostCard({ post, isAuthenticated }: PostCardProps) {
    const timeAgo = getTimeAgo(post.createdAt);

    return (
        <Link
            to={`/tablon/${post.id}`}
            data-testid={`tablon-post-${post.id}`}
            className="group flex flex-col h-full bg-transparent border-none md:bg-gray-900/50 md:backdrop-blur-sm md:border md:border-white/10 rounded-none md:rounded-2xl overflow-visible md:overflow-hidden hover:border-orange-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/5"
        >
            {/* Images preview */}
            {post.images.length > 0 ? (
                <div className="relative h-64 md:h-48 overflow-hidden rounded-2xl md:rounded-none">
                    <img
                        src={post.images[0]}
                        alt="Foto del anuncio"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                        width={400}
                        height={192}
                    />
                    {post.images.length > 1 && (
                        <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm text-white text-[10px] font-black px-2 py-1 rounded-lg flex items-center gap-1.5 border border-white/10 uppercase tracking-widest">
                            <Camera size={10} strokeWidth={3} />
                            <span>+{post.images.length - 1}</span>
                        </div>
                    )}
                </div>
            ) : (
                <div className="relative h-64 md:h-48 overflow-hidden rounded-2xl md:rounded-none bg-white/5 flex flex-col items-center justify-center gap-3 border-b border-white/5 group-hover:bg-white/[0.07] transition-colors duration-300">
                    <Camera
                        size={32}
                        strokeWidth={1}
                        className="text-gray-700 group-hover:text-gray-600 transition-colors"
                    />
                    <span className="text-[10px] font-black text-gray-700 group-hover:text-gray-600 uppercase tracking-[0.2em] transition-colors">
                        Sin fotos
                    </span>
                </div>
            )}

            <div className="py-5 px-0 md:p-5 flex flex-col flex-grow">
                {/* Category badge + time */}
                <div className="flex items-center justify-between mb-3">
                    {post.category &&
                        (() => {
                            const Icon = getCategoryIcon(post.category.name);
                            return (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-orange-500/10 text-orange-500 rounded-lg text-[10px] font-black uppercase tracking-widest border border-orange-500/20">
                                    <Icon size={10} strokeWidth={3} />
                                    {post.category.name}
                                </span>
                            );
                        })()}
                    <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">
                        {timeAgo}
                    </span>
                </div>

                {/* Message */}
                <TranslateMessage
                    originalText={post.message}
                    className="mb-4"
                    textClassName="text-gray-200 text-sm leading-relaxed line-clamp-3"
                    shareUrl={`${window.location.origin}/tablon/${post.id}`}
                />

                {/* Tags */}
                {post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                        {post.tags.map(tag => (
                            <span
                                key={tag}
                                className="text-xs px-2 py-0.5 bg-white/5 text-gray-400 rounded-md"
                            >
                                #{tag}
                            </span>
                        ))}
                    </div>
                )}

                {/* Footer: Author + Comment count */}
                <div className="flex items-center justify-between pt-3 border-t border-white/5 mt-auto">
                    <div className="flex items-center gap-2">
                        {isAuthenticated && post.author.avatar ? (
                            <img
                                src={post.author.avatar}
                                alt=""
                                className="w-6 h-6 rounded-full object-cover"
                                width={24}
                                height={24}
                            />
                        ) : (
                            <div className="w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center text-gray-500">
                                <User size={12} strokeWidth={2.5} />
                            </div>
                        )}
                        <span className="text-xs text-gray-400">
                            {isAuthenticated && post.author.name
                                ? post.author.name
                                : 'Alguien escribió'}
                        </span>
                    </div>

                    <div className="flex items-center gap-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                        {Object.values(post.reactions || {}).reduce((a, b) => a + b, 0) > 0 && (
                            <div className="flex items-center gap-1.5 text-orange-500">
                                <Heart size={12} fill="currentColor" />
                                <span>
                                    {Object.values(post.reactions || {}).reduce((a, b) => a + b, 0)}
                                </span>
                            </div>
                        )}
                        <div className="flex items-center gap-1.5">
                            <MessageSquare size={12} />
                            <span>{post.commentCount}</span>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}

/** Simple relative time formatter */
function getTimeAgo(dateStr: string): string {
    const now = Date.now();
    const date = new Date(dateStr).getTime();
    const diff = now - date;

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Ahora';
    if (minutes < 60) return `${minutes} min`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return new Date(dateStr).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
}
