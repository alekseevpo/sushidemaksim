import { memo } from 'react';
import { Heart, ThumbsUp, Zap } from 'lucide-react';
import { useToggleReaction } from '../../hooks/queries/useTablon';
import { cn } from '../../utils/cn';

interface PostReactionsProps {
    postId: string;
    reactions: Record<string, number>;
    userReaction: string | null;
    isAuthenticated: boolean;
    onLoginPrompt: () => void;
}

const REACTION_OPTIONS = [
    { type: '❤️', label: 'Me gusta', icon: Heart },
    { type: '👍', label: 'De acuerdo', icon: ThumbsUp },
    { type: '😮', label: 'Sorprendente', icon: Zap },
];

export const PostReactions = memo(function PostReactions({
    postId,
    reactions,
    userReaction,
    isAuthenticated,
    onLoginPrompt,
}: PostReactionsProps) {
    const toggleReaction = useToggleReaction();

    const handleToggle = (reactionType: string) => {
        if (!isAuthenticated) {
            onLoginPrompt();
            return;
        }
        toggleReaction.mutate({ postId, reactionType });
    };

    const totalReactions = Object.values(reactions || {}).reduce((acc, count) => acc + count, 0);

    return (
        <div className="flex flex-wrap items-center gap-2">
            {REACTION_OPTIONS.map(({ type, label, icon: Icon }) => {
                const count = (reactions || {})[type] || 0;
                const isActive = userReaction === type;

                return (
                    <button
                        key={type}
                        onClick={() => handleToggle(type)}
                        disabled={toggleReaction.isPending}
                        className={cn(
                            'inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 border-2 active:scale-95',
                            isActive
                                ? 'bg-orange-500/10 border-orange-500/50 text-orange-500 shadow-lg shadow-orange-500/10'
                                : 'bg-white/5 border-transparent text-gray-500 hover:bg-white/10 hover:text-gray-300'
                        )}
                        title={label}
                    >
                        <Icon
                            size={14}
                            strokeWidth={3}
                            className={cn(isActive && 'fill-current animate-bounce-subtle')}
                        />
                        {count > 0 && <span>{count}</span>}
                    </button>
                );
            })}

            {totalReactions > 0 && (
                <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-2">
                    {totalReactions} {totalReactions === 1 ? 'reacción' : 'reacciones'}
                </span>
            )}
        </div>
    );
});
