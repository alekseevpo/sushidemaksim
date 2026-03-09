import { lazy, Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { CartProvider } from './hooks/useCart';
import { AuthProvider } from './hooks/useAuth';
import Header from './components/Header';
import Footer from './components/Footer';
import CookieConsent from './components/CookieConsent';
import FloatingCart from './components/FloatingCart';
import ScrollToTop from './components/ScrollToTop';
import ErrorBoundary from './components/ErrorBoundary';
import { ToastProvider } from './context/ToastContext';

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

function PageLoader() {
    return (
        <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
                <div className="text-4xl mb-3 animate-bounce">🍣</div>
                <p className="text-gray-400 text-sm">Cargando...</p>
            </div>
        </div>
    );
}

function App() {
    const { pathname } = useLocation();
    const isAdminRoute = pathname.startsWith('/admin');

    return (
        <ErrorBoundary>
            <ToastProvider>
                <AuthProvider>
                    <CartProvider>
                        <div className="min-h-screen bg-[#FDFBF7] flex flex-col">
                            <ScrollToTop />
                            <CookieConsent />
                            <FloatingCart />
                            {!isAdminRoute && <Header />}
                            <main className="flex-1 flex flex-col relative">
                                <Suspense fallback={<PageLoader />}>
                                    <Routes>
                                        <Route path="/" element={<HomePageSimple />} />
                                        <Route path="/menu" element={<MenuPageSimple />} />
                                        <Route path="/cart" element={<CartPageSimple />} />
                                        <Route path="/promo" element={<PromoPageSimple />} />
                                        <Route path="/profile" element={<ProfilePage />} />
                                        <Route path="/admin" element={<AdminPage />} />
                                        <Route path="/contacts" element={<ContactsPage />} />
                                        <Route path="/blog" element={<BlogPage />} />
                                        <Route path="/blog/:slug" element={<BlogPostPage />} />
                                        <Route
                                            path="/pay-for-friend/:id"
                                            element={<PayForFriendPage />}
                                        />
                                        <Route path="/verify" element={<VerifyPage />} />
                                        <Route
                                            path="/verify-email-change"
                                            element={<VerifyEmailChangePage />}
                                        />
                                    </Routes>
                                </Suspense>
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
