import { useEffect } from 'react';

export function useBodyScrollLock(isLocked: boolean) {
    useEffect(() => {
        if (!isLocked) return;

        // Save original styles
        const originalStyle = window.getComputedStyle(document.body).overflow;

        // Prevent scrolling on body
        document.body.style.overflow = 'hidden';
        // Add touch-action none to prevent mobile scroll bouncing
        document.body.style.touchAction = 'none';

        // Stop Lenis if it exists
        if ((window as any).lenis) {
            (window as any).lenis.stop();
        }

        return () => {
            document.body.style.overflow = originalStyle;
            document.body.style.touchAction = '';

            // Resume Lenis
            if ((window as any).lenis) {
                (window as any).lenis.start();
            }
        };
    }, [isLocked]);
}
