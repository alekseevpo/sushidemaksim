import { useEffect } from 'react';
import Lenis from 'lenis';

export default function SmoothScroll() {

    useEffect(() => {
        const lenis = new Lenis({
            duration: 1.2,
            easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: 'vertical',
            gestureOrientation: 'vertical',
            smoothWheel: true,
            wheelMultiplier: 1,
            touchMultiplier: 2,
            infinite: false,
        });

        function raf(time: number) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }

        requestAnimationFrame(raf);

        // Store lenis instance on window for access if needed
        (window as any).lenis = lenis;

        return () => {
            lenis.destroy();
            delete (window as any).lenis;
        };
    }, []);

    // Global scroll-to-top is now handled by components within AnimatePresence 
    // to prevent jumping during exit animations.

    return null;
}
