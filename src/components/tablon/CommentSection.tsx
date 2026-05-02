import { useState, useCallback, useMemo } from 'react';
import type { TablonComment } from '../../hooks/queries/useTablon';
import { useCreateTablonComment, useDeleteTablonComment } from '../../hooks/queries/useTablon';
import { useAuth } from '../../hooks/useAuth';
import { TranslateMessage } from './TranslateMessage';

interface CommentSectionProps {
    postId: string;
    comments: TablonComment[];
    isAuthenticated: boolean;
    onLoginPrompt: () => void;
}

export function CommentSection({
    postId,
    comments,
    isAuthenticated,
    onLoginPrompt,
}: CommentSectionProps) {
    const { user } = useAuth();
    const createComment = useCreateTablonComment();
    const deleteComment = useDeleteTablonComment();
    const [message, setMessage] = useState('');
    const [replyTo, setReplyTo] = useState<string | null>(null);

    // Build threaded comments
    const threadedComments = useMemo(() => {
        const topLevel: TablonComment[] = [];
        const childMap: Record<string, TablonComment[]> = {};

        comments.forEach(c => {
            if (c.parentId) {
                if (!childMap[c.parentId]) childMap[c.parentId] = [];
                childMap[c.parentId].push(c);
            } else {
                topLevel.push(c);
            }
        });

        return { topLevel, childMap };
    }, [comments]);

    const handleSubmit = useCallback(async () => {
        if (!isAuthenticated) {
            onLoginPrompt();
            return;
        }

        const text = message.trim();
        if (!text) return;

        try {
            await createComment.mutateAsync({
                postId,
                message: text,
                parentId: replyTo,
            });
            setMessage('');
            setReplyTo(null);
        } catch {
            // Error handled by mutation
        }
    }, [isAuthenticated, message, postId, replyTo, createComment, onLoginPrompt]);

    const handleDelete = useCallback(
        async (commentId: string) => {
            if (!confirm('¿Eliminar este comentario?')) return;
            await deleteComment.mutateAsync(commentId);
        },
        [deleteComment]
    );

    const isModerator = user?.role === 'moderator' || user?.role === 'admin' || user?.isSuperadmin;

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-bold text-white">💬 Comentarios ({comments.length})</h3>

            {/* Comment input */}
            <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-700 overflow-hidden">
                    {isAuthenticated && user?.avatar ? (
                        <img
                            src={user.avatar}
                            alt=""
                            className="w-full h-full object-cover"
                            width={32}
                            height={32}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-sm">
                            👤
                        </div>
                    )}
                </div>
                <div className="flex-1">
                    {replyTo && (
                        <div className="flex items-center gap-2 mb-2 text-xs text-gray-400">
                            <span>Respondiendo a un comentario</span>
                            <button
                                onClick={() => setReplyTo(null)}
                                className="text-orange-400 hover:text-orange-300"
                            >
                                ✕ Cancelar
                            </button>
                        </div>
                    )}
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={message}
                            onChange={e => setMessage(e.target.value)}
                            onKeyDown={e => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleSubmit();
                                }
                            }}
                            onFocus={() => {
                                if (!isAuthenticated) {
                                    onLoginPrompt();
                                }
                            }}
                            placeholder={
                                isAuthenticated
                                    ? 'Escribe un comentario...'
                                    : 'Inicia sesión para comentar'
                            }
                            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-orange-500/50 transition-colors"
                            maxLength={500}
                            data-testid="comment-input"
                        />
                        <button
                            onClick={handleSubmit}
                            disabled={!message.trim() || createComment.isPending}
                            className="px-4 py-2.5 bg-orange-500 text-white rounded-xl text-sm font-medium hover:bg-orange-600 disabled:opacity-30 transition-all"
                            data-testid="comment-submit"
                        >
                            {createComment.isPending ? '...' : '→'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Comments list */}
            {comments.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                    No hay comentarios aún. ¡Sé el primero!
                </p>
            ) : (
                <div className="space-y-4">
                    {threadedComments.topLevel.map(comment => (
                        <CommentItem
                            key={comment.id}
                            comment={comment}
                            replies={threadedComments.childMap[comment.id] || []}
                            isAuthenticated={isAuthenticated}
                            currentUserId={user?.id}
                            isModerator={!!isModerator}
                            onReply={setReplyTo}
                            onDelete={handleDelete}
                            onLoginPrompt={onLoginPrompt}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

// ─── Comment Item ─────────────────────────────────────────────────────────────

interface CommentItemProps {
    comment: TablonComment;
    replies: TablonComment[];
    isAuthenticated: boolean;
    currentUserId?: string;
    isModerator: boolean;
    onReply: (id: string) => void;
    onDelete: (id: string) => void;
    onLoginPrompt: () => void;
}

function CommentItem({
    comment,
    replies,
    isAuthenticated,
    currentUserId,
    isModerator,
    onReply,
    onDelete,
    onLoginPrompt,
}: CommentItemProps) {
    const timeAgo = getCommentTimeAgo(comment.createdAt);
    const canDelete = currentUserId === comment.userId || isModerator;

    return (
        <div data-testid={`comment-${comment.id}`}>
            <div className="flex gap-3">
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gray-700 overflow-hidden">
                    {isAuthenticated && comment.author.avatar ? (
                        <img
                            src={comment.author.avatar}
                            alt=""
                            className="w-full h-full object-cover"
                            width={28}
                            height={28}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs">
                            👤
                        </div>
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                        <span className="text-sm font-medium text-white">
                            {isAuthenticated && comment.author.name
                                ? comment.author.name
                                : 'Alguien'}
                        </span>
                        <span className="text-xs text-gray-500">{timeAgo}</span>
                    </div>
                    <TranslateMessage
                        originalText={comment.message}
                        className="mt-1"
                        textClassName="text-sm text-gray-300 break-words whitespace-pre-wrap"
                    />
                    <div className="flex gap-3 mt-1.5">
                        <button
                            onClick={() => {
                                if (!isAuthenticated) {
                                    onLoginPrompt();
                                    return;
                                }
                                onReply(comment.id);
                            }}
                            className="text-xs text-gray-500 hover:text-orange-400 transition-colors"
                        >
                            Responder
                        </button>
                        {canDelete && (
                            <button
                                onClick={() => onDelete(comment.id)}
                                className="text-xs text-gray-500 hover:text-red-400 transition-colors"
                            >
                                Eliminar
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Replies */}
            {replies.length > 0 && (
                <div className="ml-10 mt-3 space-y-3 border-l border-white/5 pl-4">
                    {replies.map(reply => (
                        <CommentItem
                            key={reply.id}
                            comment={reply}
                            replies={[]}
                            isAuthenticated={isAuthenticated}
                            currentUserId={currentUserId}
                            isModerator={isModerator}
                            onReply={onReply}
                            onDelete={onDelete}
                            onLoginPrompt={onLoginPrompt}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

function getCommentTimeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'ahora';
    if (m < 60) return `${m} min`;
    const h = Math.floor(diff / 3600000);
    if (h < 24) return `${h}h`;
    const d = Math.floor(diff / 86400000);
    if (d < 7) return `${d}d`;
    return new Date(dateStr).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
}
