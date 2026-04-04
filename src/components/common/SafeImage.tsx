import { useState, useEffect, forwardRef, memo } from 'react';

interface Props extends React.ImgHTMLAttributes<HTMLImageElement> {
    src: string;
    fallbackContent?: React.ReactNode;
    optimize?: boolean;
    getOptimizedUrl?: (url: string) => string;
}

/**
 * A robust image component that handles Vercel Image Optimization failures
 * by automatically retrying with the raw source URL.
 */
const SafeImage = memo(
    forwardRef<HTMLImageElement, Props>(
        (
            {
                src,
                fallbackContent,
                optimize = true,
                getOptimizedUrl,
                className,
                onError,
                ...props
            },
            ref
        ) => {
            const [hasError, setHasError] = useState(false);
            const [isRetrying, setIsRetrying] = useState(false);

            useEffect(() => {
                setHasError(false);
                setIsRetrying(false);
            }, [src]);

            if (!src || hasError) {
                return <>{fallbackContent}</>;
            }

            const optimizedUrl =
                optimize && getOptimizedUrl && !isRetrying ? getOptimizedUrl(src) : src;

            return (
                <img
                    {...props}
                    ref={ref}
                    src={optimizedUrl}
                    alt={props.alt || ''}
                    className={className}
                    onError={e => {
                        if (optimize && !isRetrying && src !== optimizedUrl) {
                            setIsRetrying(true);
                        } else {
                            setHasError(true);
                            if (onError) onError(e);
                        }
                    }}
                />
            );
        }
    )
);

SafeImage.displayName = 'SafeImage';

export default SafeImage;
