import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CartProvider } from './hooks/useCart';
import { AuthProvider } from './hooks/useAuth';
import Header from './components/Header';
import Footer from './components/Footer';
import CookieConsent from './components/CookieConsent';
import FloatingCart from './components/FloatingCart';
import SmoothScroll from './components/SmoothScroll';
import RegistrationPrompt from './components/RegistrationPrompt';
import ErrorBoundary from './components/ErrorBoundary';
import { ToastProvider } from './context/ToastContext';
import Schema from './components/SEO/Schema';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { CartSkeleton } from './components/skeletons/CartSkeleton';
import { MenuSkeleton } from './components/skeletons/MenuSkeleton';
import { HomeSkeleton } from './components/skeletons/HomeSkeleton';
import { AdminSkeleton } from './components/skeletons/AdminSkeleton';
import { ProfileSkeleton } from './components/skeletons/ProfileSkeleton';
import { PromoSkeleton } from './components/skeletons/PromoSkeleton';
import { BlogSkeleton } from './components/skeletons/BlogSkeleton';
import { TrackSkeleton } from './components/skeletons/TrackSkeleton';
import { GenericSkeleton } from './components/skeletons/GenericSkeleton';
import { usePageTracking } from './hooks/usePageTracking';

// Lazy-loaded pages with retry logic
const lazyRetry = (componentImport: () => Promise<{ default: React.ComponentType<any> }>) => {
    return lazy(async () => {
        const hasRetried = window.sessionStorage.getItem('retry-lazy');
        try {
            const component = await componentImport();
            window.sessionStorage.removeItem('retry-lazy');
            return component;
        } catch (error) {
            if (!hasRetried) {
                window.sessionStorage.setItem('retry-lazy', 'true');
                window.location.reload();
                return { default: () => null } as any;
            }
            throw error;
        }
    });
};

const HomePage = lazyRetry(() => import('./pages/HomePage'));
const MenuPage = lazyRetry(() => import('./pages/MenuPage'));
const CartPage = lazyRetry(() => import('./pages/CartPage'));
const PromoPage = lazyRetry(() => import('./pages/PromoPage'));
const ProfilePage = lazyRetry(() => import('./pages/ProfilePage'));
const AdminPage = lazyRetry(() => import('./pages/AdminPage'));
const ContactsPage = lazyRetry(() => import('./pages/ContactsPage'));
const BlogPage = lazyRetry(() => import('./pages/BlogPage'));
const BlogPostPage = lazyRetry(() => import('./pages/BlogPostPage'));
const PayForFriendPage = lazyRetry(() => import('./pages/PayForFriendPage'));
const VerifyPage = lazyRetry(() => import('./pages/VerifyPage'));
const VerifyEmailChangePage = lazyRetry(() => import('./pages/VerifyEmailChangePage'));
const OrderTrackingPage = lazyRetry(() => import('./pages/OrderTrackingPage'));
const WaiterOrderPage = lazyRetry(() => import('./pages/WaiterOrderPage'));
const NotFoundPage = lazyRetry(() => import('./pages/NotFoundPage'));

// Page Wrapper for consistent transitions
const PageWrapper = ({
    children,
    skeleton,
    isHome = false,
    isAdmin = false,
}: {
    children: React.ReactNode;
    skeleton: React.ReactNode;
    isHome?: boolean;
    isAdmin?: boolean;
}) => {
    const location = useLocation();
    const isProfile = location.pathname === '/profile';
    const isWaiterRoute = location.pathname.startsWith('/waiter');

    useEffect(() => {
        // Scroll to top on pathname change, regardless of search params.
        // We keep hash check to respect anchor links.
        if (!location.hash) {
            // Use requestAnimationFrame to ensure it wins against browser native restoration
            requestAnimationFrame(() => {
                window.scrollTo(0, 0);
                (window as any).lenis?.scrollTo(0, { immediate: true });
            });
        }
    }, [location.pathname, location.hash]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="flex-1 flex flex-col"
            style={{
                paddingTop: '0',
            }}
        >
            <div
                className="flex-1 flex flex-col w-full"
                style={{
                    paddingTop:
                        !isAdmin && !isWaiterRoute && !isHome && !isProfile
                            ? 'var(--header-height, 4rem)'
                            : '0',
                }}
            >
                <Suspense fallback={skeleton}>{children}</Suspense>
            </div>
        </motion.div>
    );
};

function PageTracker() {
    usePageTracking();
    return null;
}

function App() {
    const location = useLocation();
    const isAdminRoute = location.pathname.startsWith('/admin');
    const isWaiterRoute = location.pathname.startsWith('/waiter');

    useEffect(() => {
        // Disable automatic scroll restoration on mount
        if ('scrollRestoration' in window.history) {
            window.history.scrollRestoration = 'manual';
        }
    }, []);

    return (
        <ErrorBoundary>
            <ToastProvider>
                <AuthProvider>
                    <CartProvider>
                        <Schema />
                        <PageTracker />
                        <div className="min-h-[100svh] bg-[#FBF7F0] flex flex-col">
                            <Analytics />
                            <SpeedInsights />
                            <SmoothScroll />
                            <CookieConsent />
                            <RegistrationPrompt />
                            <FloatingCart />

                            {!isAdminRoute && !isWaiterRoute && <Header />}
                            <main className="flex-1 flex flex-col relative w-full">
                                <AnimatePresence mode="wait">
                                    <Routes location={location} key={location.pathname}>
                                        <Route
                                            path="/"
                                            element={
                                                <PageWrapper
                                                    skeleton={<HomeSkeleton />}
                                                    isHome={true}
                                                >
                                                    <HomePage />
                                                </PageWrapper>
                                            }
                                        />
                                        <Route
                                            path="/menu"
                                            element={
                                                <PageWrapper skeleton={<MenuSkeleton />}>
                                                    <MenuPage />
                                                </PageWrapper>
                                            }
                                        />
                                        <Route
                                            path="/cart"
                                            element={
                                                <PageWrapper skeleton={<CartSkeleton />}>
                                                    <CartPage />
                                                </PageWrapper>
                                            }
                                        />
                                        <Route
                                            path="/promo"
                                            element={
                                                <PageWrapper skeleton={<PromoSkeleton />}>
                                                    <PromoPage />
                                                </PageWrapper>
                                            }
                                        />
                                        <Route
                                            path="/profile"
                                            element={
                                                <PageWrapper skeleton={<ProfileSkeleton />}>
                                                    <ProfilePage />
                                                </PageWrapper>
                                            }
                                        />
                                        <Route
                                            path="/admin/*"
                                            element={
                                                <Suspense fallback={<AdminSkeleton />}>
                                                    <AdminPage />
                                                </Suspense>
                                            }
                                        />
                                        <Route
                                            path="/contacts"
                                            element={
                                                <PageWrapper skeleton={<GenericSkeleton />}>
                                                    <ContactsPage />
                                                </PageWrapper>
                                            }
                                        />
                                        <Route
                                            path="/contacto"
                                            element={
                                                <PageWrapper skeleton={<GenericSkeleton />}>
                                                    <ContactsPage />
                                                </PageWrapper>
                                            }
                                        />
                                        <Route
                                            path="/blog"
                                            element={
                                                <PageWrapper skeleton={<BlogSkeleton />}>
                                                    <BlogPage />
                                                </PageWrapper>
                                            }
                                        />
                                        <Route
                                            path="/blog/:slug"
                                            element={
                                                <PageWrapper skeleton={<BlogSkeleton />}>
                                                    <BlogPostPage />
                                                </PageWrapper>
                                            }
                                        />
                                        <Route
                                            path="/pay-for-friend/:id"
                                            element={
                                                <PageWrapper skeleton={<GenericSkeleton />}>
                                                    <PayForFriendPage />
                                                </PageWrapper>
                                            }
                                        />
                                        <Route
                                            path="/verify"
                                            element={
                                                <PageWrapper skeleton={<GenericSkeleton />}>
                                                    <VerifyPage />
                                                </PageWrapper>
                                            }
                                        />
                                        <Route
                                            path="/verify-email-change"
                                            element={
                                                <PageWrapper skeleton={<GenericSkeleton />}>
                                                    <VerifyEmailChangePage />
                                                </PageWrapper>
                                            }
                                        />
                                        <Route
                                            path="/track/:id"
                                            element={
                                                <PageWrapper skeleton={<TrackSkeleton />}>
                                                    <OrderTrackingPage />
                                                </PageWrapper>
                                            }
                                        />
                                        <Route
                                            path="/waiter"
                                            element={
                                                <PageWrapper skeleton={<GenericSkeleton />}>
                                                    <WaiterOrderPage />
                                                </PageWrapper>
                                            }
                                        />
                                        <Route
                                            path="*"
                                            element={
                                                <PageWrapper skeleton={<GenericSkeleton />}>
                                                    <NotFoundPage />
                                                </PageWrapper>
                                            }
                                        />
                                    </Routes>
                                </AnimatePresence>
                            </main>
                            {!isAdminRoute && !isWaiterRoute && <Footer />}
                        </div>
                    </CartProvider>
                </AuthProvider>
            </ToastProvider>
        </ErrorBoundary>
    );
}

export default App;
