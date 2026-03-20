import { useEffect } from 'react';

/**
 * Custom hook to lock body scroll when a modal/overlay is open.
 * Handles both standard CSS overflow and Lenis smooth scrolling.
 */
export const useScrollLock = (isLocked: boolean) => {
    useEffect(() => {
        const lenis = (window as any).lenis;

        if (isLocked) {
            // Standard CSS lock
            document.body.style.overflow = 'hidden';
            document.body.style.paddingRight = 'var(--scrollbar-width, 0px)'; // Prevent layout shift

            // Lenis lock
            if (lenis) {
                lenis.stop();
            }
        } else {
            // Release locks
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';

            if (lenis) {
                lenis.start();
            }
        }

        // Cleanup on unmount
        return () => {
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
            if (lenis) {
                lenis.start();
            }
        };
    }, [isLocked]);
};
