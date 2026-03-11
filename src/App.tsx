import { lazy, Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { CartProvider } from './hooks/useCart';
import { AuthProvider } from './hooks/useAuth';
import Header from './components/Header';
import Footer from './components/Footer';
import CookieConsent from './components/CookieConsent';
import FloatingCart from './components/FloatingCart';
import SmoothScroll from './components/SmoothScroll';
import ErrorBoundary from './components/ErrorBoundary';
import { ToastProvider } from './context/ToastContext';
import { CartSkeleton } from './components/skeletons/CartSkeleton';
import { MenuSkeleton } from './components/skeletons/MenuSkeleton';
import { HomeSkeleton } from './components/skeletons/HomeSkeleton';
import { AdminSkeleton } from './components/skeletons/AdminSkeleton';
import { ProfileSkeleton } from './components/skeletons/ProfileSkeleton';
import { PromoSkeleton } from './components/skeletons/PromoSkeleton';
import { BlogSkeleton } from './components/skeletons/BlogSkeleton';
import { GenericSkeleton } from './components/skeletons/GenericSkeleton';

// Lazy-loaded pages with retry logic
const lazyRetry = (componentImport: any) => {
    return lazy(async () => {
        const hasRetried = window.sessionStorage.getItem('retry-lazy');
        try {
            const component = await componentImport();
            window.sessionStorage.removeItem('retry-lazy');
            return component;
        } catch (error) {
            if (!hasRetried) {
                window.sessionStorage.setItem('retry-lazy', 'true');
                return window.location.reload() as any;
            }
            throw error;
        }
    });
};

const HomePageSimple = lazyRetry(() => import('./pages/HomePageSimple'));
const MenuPageSimple = lazyRetry(() => import('./pages/MenuPageSimple'));
const CartPageSimple = lazyRetry(() => import('./pages/CartPageSimple'));
const PromoPageSimple = lazyRetry(() => import('./pages/PromoPageSimple'));
const ProfilePage = lazyRetry(() => import('./pages/ProfilePage'));
const AdminPage = lazyRetry(() => import('./pages/AdminPage'));
const ContactsPage = lazyRetry(() => import('./pages/ContactsPage'));
const BlogPage = lazyRetry(() => import('./pages/BlogPage'));
const BlogPostPage = lazyRetry(() => import('./pages/BlogPostPage'));
const PayForFriendPage = lazyRetry(() => import('./pages/PayForFriendPage'));
const VerifyPage = lazyRetry(() => import('./pages/VerifyPage'));
const VerifyEmailChangePage = lazyRetry(() => import('./pages/VerifyEmailChangePage'));
const OrderTrackingPage = lazyRetry(() => import('./pages/OrderTrackingPage'));

function App() {
    const { pathname } = useLocation();
    const isAdminRoute = pathname.startsWith('/admin');

    return (
        <ErrorBoundary>
            <ToastProvider>
                <AuthProvider>
                    <CartProvider>
                        <div className="min-h-screen bg-[#FDFBF7] flex flex-col">
                            <SmoothScroll />
                            <CookieConsent />
                            <FloatingCart />
                            {!isAdminRoute && <Header />}
                            <main className="flex-1 flex flex-col relative">
                                <Routes>
                                    <Route
                                        path="/"
                                        element={
                                            <Suspense fallback={<HomeSkeleton />}>
                                                <HomePageSimple />
                                            </Suspense>
                                        }
                                    />
                                    <Route
                                        path="/menu"
                                        element={
                                            <Suspense fallback={<MenuSkeleton />}>
                                                <MenuPageSimple />
                                            </Suspense>
                                        }
                                    />
                                    <Route
                                        path="/cart"
                                        element={
                                            <Suspense fallback={<CartSkeleton />}>
                                                <CartPageSimple />
                                            </Suspense>
                                        }
                                    />
                                    <Route
                                        path="/promo"
                                        element={
                                            <Suspense fallback={<PromoSkeleton />}>
                                                <PromoPageSimple />
                                            </Suspense>
                                        }
                                    />
                                    <Route
                                        path="/profile"
                                        element={
                                            <Suspense fallback={<ProfileSkeleton />}>
                                                <ProfilePage />
                                            </Suspense>
                                        }
                                    />
                                    <Route
                                        path="/admin"
                                        element={
                                            <Suspense fallback={<AdminSkeleton />}>
                                                <AdminPage />
                                            </Suspense>
                                        }
                                    />
                                    <Route
                                        path="/contacts"
                                        element={
                                            <Suspense fallback={<GenericSkeleton />}>
                                                <ContactsPage />
                                            </Suspense>
                                        }
                                    />
                                    <Route
                                        path="/blog"
                                        element={
                                            <Suspense fallback={<BlogSkeleton />}>
                                                <BlogPage />
                                            </Suspense>
                                        }
                                    />
                                    <Route
                                        path="/blog/:slug"
                                        element={
                                            <Suspense fallback={<BlogSkeleton />}>
                                                <BlogPostPage />
                                            </Suspense>
                                        }
                                    />
                                    <Route
                                        path="/pay-for-friend/:id"
                                        element={
                                            <Suspense fallback={<GenericSkeleton />}>
                                                <PayForFriendPage />
                                            </Suspense>
                                        }
                                    />
                                    <Route
                                        path="/verify"
                                        element={
                                            <Suspense fallback={<GenericSkeleton />}>
                                                <VerifyPage />
                                            </Suspense>
                                        }
                                    />
                                    <Route
                                        path="/verify-email-change"
                                        element={
                                            <Suspense fallback={<GenericSkeleton />}>
                                                <VerifyEmailChangePage />
                                            </Suspense>
                                        }
                                    />
                                    <Route
                                        path="/track/:id"
                                        element={
                                            <Suspense fallback={<GenericSkeleton />}>
                                                <OrderTrackingPage />
                                            </Suspense>
                                        }
                                    />
                                </Routes>
                            </main>
                            {!isAdminRoute && <Footer />}
                        </div>
                    </CartProvider>
                </AuthProvider>
            </ToastProvider>
        </ErrorBoundary>
    );
}

export default App;
