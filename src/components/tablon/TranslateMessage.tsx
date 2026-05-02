import { useState } from 'react';

interface TranslateMessageProps {
    originalText: string;
    className?: string;
    textClassName?: string;
}

export function TranslateMessage({
    originalText,
    className = '',
    textClassName = 'text-gray-200 text-sm leading-relaxed whitespace-pre-wrap',
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

    const btnTextTranslate = 'Ver traducción';
    const btnTextOriginal = 'Ver original';
    const btnTextTranslating = 'Traduciendo...';

    return (
        <div className={className} onClick={e => e.stopPropagation()}>
            <p className={textClassName}>
                {showTranslated && translatedText ? translatedText : originalText}
            </p>
            <button
                type="button"
                onClick={handleTranslate}
                disabled={isLoading}
                className="text-xs text-gray-500 hover:text-gray-300 font-medium mt-1.5 transition-colors disabled:opacity-50 inline-flex items-center gap-1 active:scale-95"
            >
                🌎{' '}
                {isLoading
                    ? btnTextTranslating
                    : showTranslated
                      ? btnTextOriginal
                      : btnTextTranslate}
            </button>
        </div>
    );
}
