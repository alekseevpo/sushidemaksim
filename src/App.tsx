import { lazy, Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { CartProvider } from './hooks/useCart';
import { AuthProvider } from './hooks/useAuth';
import Header from './components/Header';
import Footer from './components/Footer';
import CookieConsent from './components/CookieConsent';
import FloatingCart from './components/FloatingCart';

// Lazy-loaded pages — each gets its own chunk for faster initial load
const HomePageSimple = lazy(() => import('./pages/HomePageSimple'));
const MenuPageSimple = lazy(() => import('./pages/MenuPageSimple'));
const CartPageSimple = lazy(() => import('./pages/CartPageSimple'));
const PromoPageSimple = lazy(() => import('./pages/PromoPageSimple'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const ContactsPage = lazy(() => import('./pages/ContactsPage'));
const BlogPage = lazy(() => import('./pages/BlogPage'));
const BlogPostPage = lazy(() => import('./pages/BlogPostPage'));

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
        <AuthProvider>
            <CartProvider>
                <div className="min-h-screen bg-gray-50 flex flex-col">
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
                            </Routes>
                        </Suspense>
                    </main>
                    {!isAdminRoute && <Footer />}
                </div>
            </CartProvider>
        </AuthProvider>
    );
}

export default App;
