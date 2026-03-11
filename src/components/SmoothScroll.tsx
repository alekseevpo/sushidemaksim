import { useEffect } from 'react';
import Lenis from 'lenis';
import { useLocation } from 'react-router-dom';

export default function SmoothScroll() {
    const { pathname } = useLocation();

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

    // Scroll to top on route change
    useEffect(() => {
        const lenis = (window as any).lenis;
        if (lenis) {
            lenis.scrollTo(0, { immediate: true });
        }
    }, [pathname]);

    return null;
}
