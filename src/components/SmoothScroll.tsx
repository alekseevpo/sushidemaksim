import { useEffect } from 'react';
import Lenis from 'lenis';

export default function SmoothScroll() {
    useEffect(() => {
        // Disable Lenis on touch devices for better performance and to avoid ghost scrolling issues
        const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

        if (isTouchDevice) return;

        const lenis = new Lenis({
            lerp: 0.1,
            orientation: 'vertical',
            gestureOrientation: 'vertical',
            smoothWheel: true,
            wheelMultiplier: 1,
            touchMultiplier: 1.2,
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

    return null;
}
