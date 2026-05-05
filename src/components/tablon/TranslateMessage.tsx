import { useState, useCallback } from 'react';
import { Languages, Share2 } from 'lucide-react';

interface TranslateMessageProps {
    originalText: string;
    className?: string;
    textClassName?: string;
    shareUrl?: string;
}

export function TranslateMessage({
    originalText,
    className = '',
    textClassName = 'text-gray-200 text-sm leading-relaxed whitespace-pre-wrap',
    shareUrl,
}: TranslateMessageProps) {
    const [translatedText, setTranslatedText] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showTranslated, setShowTranslated] = useState(false);

    const handleTranslate = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (translatedText) {
            setShowTranslated(!showTranslated);
            return;
        }

        setIsLoading(true);
        try {
            // Always translate to Spanish
            const targetLang = 'es';

            const res = await fetch(
                `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(
                    originalText
                )}`
            );

            if (!res.ok) throw new Error('Translation failed');

            const data = await res.json();
            const translated = data[0].map((item: any) => item[0]).join('');

            setTranslatedText(translated);
            setShowTranslated(true);
        } catch (error) {
            console.error('Translation error:', error);
            // Fallback: show original on error
        } finally {
            setIsLoading(false);
        }
    };

    const handleShare = useCallback(
        (e: React.MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
            if (!shareUrl) return;

            if (navigator.share) {
                navigator.share({
                    title: 'Anuncio en Tablón | Sushi de Maksim',
                    text: originalText.slice(0, 100) + '...',
                    url: shareUrl,
                });
            } else {
                navigator.clipboard.writeText(shareUrl);
                alert('Enlace copiado al portapapeles');
            }
        },
        [shareUrl, originalText]
    );

    const btnTextTranslate = 'Ver traducción';
    const btnTextOriginal = 'Ver original';
    const btnTextTranslating = 'Traduciendo...';

    return (
        <div className={className} onClick={e => e.stopPropagation()}>
            <p className={textClassName}>
                {showTranslated && translatedText ? translatedText : originalText}
            </p>
            <div className="flex items-center gap-4 mt-2">
                <button
                    type="button"
                    onClick={handleTranslate}
                    disabled={isLoading}
                    className="text-[10px] uppercase tracking-widest text-gray-500 hover:text-orange-400 font-black transition-colors disabled:opacity-50 inline-flex items-center gap-1.5 active:scale-95"
                >
                    <Languages size={12} strokeWidth={2.5} />
                    {isLoading
                        ? btnTextTranslating
                        : showTranslated
                          ? btnTextOriginal
                          : btnTextTranslate}
                </button>

                {shareUrl && (
                    <button
                        type="button"
                        onClick={handleShare}
                        className="text-[10px] uppercase tracking-widest text-gray-500 hover:text-orange-400 font-black transition-colors inline-flex items-center gap-1.5 active:scale-95"
                    >
                        <Share2 size={12} strokeWidth={2.5} />
                        Compartir
                    </button>
                )}

                {showTranslated && (
                    <span className="text-[10px] text-gray-700 italic ml-auto">
                        Translated by Google
                    </span>
                )}
            </div>
        </div>
    );
}
