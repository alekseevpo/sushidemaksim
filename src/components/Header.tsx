import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation } from 'react-router-dom';
import {
    ShoppingCart,
    User,
    ChevronDown,
    LogOut,
    Menu,
    X,
    ShieldCheck,
    ChevronRight,
    BookOpen,
    Phone,
    Star,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import StoreStatusBanner from './StoreStatusBanner';
import LoginModal from './LoginModal';
import { useScrollLock } from '../hooks/useScrollLock';

export default function Header() {
    const { itemCount } = useCart();
    const { user, isAuthenticated, logout, isLoading } = useAuth();
    const location = useLocation();
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [loginModalMode, setLoginModalMode] = useState<
        'login' | 'register' | 'forgot' | 'verify-sent' | 'reset-password'
    >('login');
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [isCartBumping, setIsCartBumping] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const userMenuRef = useRef<HTMLDivElement>(null);

    // Track scroll for dynamic header styling
    useEffect(() => {
        const handleScroll = () => {
            const scrolled = window.scrollY > 20;
            setIsScrolled(prev => {
                if (prev === scrolled) return prev; // No re-render if unchanged
                return scrolled;
            });
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll(); // Check initial scroll
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
                setShowUserMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useScrollLock(showMobileMenu || isLoginModalOpen);

    // Close mobile menu on route change
    useEffect(() => {
        setShowMobileMenu(false);
    }, [location.pathname]);

    useEffect(() => {
        const handleOpenLogin = (e: any) => {
            if (e.detail?.mode) setLoginModalMode(e.detail.mode);
            else setLoginModalMode('login');
            setIsLoginModalOpen(true);
        };
        document.addEventListener('custom:openLogin', handleOpenLogin as EventListener);
        return () =>
            document.removeEventListener('custom:openLogin', handleOpenLogin as EventListener);
    }, []);

    // Cart bump animation trigger
    const prevCountRef = useRef(itemCount);
    useEffect(() => {
        if (itemCount > prevCountRef.current) {
            setIsCartBumping(true);
            const timer = setTimeout(() => setIsCartBumping(false), 500);
            return () => clearTimeout(timer);
        }
        prevCountRef.current = itemCount;
    }, [itemCount]);

    const initials = user
        ? user.name
              .split(' ')
              .map(n => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2)
        : '';

    const navLinks = [
        { to: '/menu', label: 'Menú', icon: Menu },
        { to: '/blog', label: 'Blog', icon: BookOpen },
        { to: '/contacts', label: 'Contactos', icon: Phone },
        { to: '/promo', label: 'Promo', highlight: true, icon: Star },
    ];

    const isHome = location.pathname === '/';

    return (
        <>
            <header
                className={`fixed top-0 inset-x-0 z-[100] transition-[background-color,border-color] duration-300
                ${
                    isScrolled
                        ? 'bg-[#FDFBF7] shadow-sm border-b border-gray-200'
                        : isHome
                          ? 'bg-transparent border-b border-transparent'
                          : 'bg-[#FDFBF7] border-b border-gray-100'
                }
            `}
            >
                <StoreStatusBanner />
                <div className="max-w-7xl mx-auto px-3 md:px-4">
                    <div className="flex items-center justify-between h-16">
                        {' '}
                        {/* Logo */}
                        <Link
                            to="/"
                            onClick={() => setShowMobileMenu(false)}
                            className="flex items-center no-underline gap-0 group"
                        >
                            <div
                                className={`
                                    transition-all duration-500 shrink-0 flex items-center justify-center
                                    md:bg-red-600 md:px-5 md:h-16 md:w-[218px] md:group-hover:rotate-6
                                    bg-transparent h-16 w-auto
                                `}
                            >
                                <img
                                    src="/logo.svg"
                                    alt="Sushi de Maksim"
                                    className={`
                                        h-10 md:h-14 w-auto object-contain transition-all duration-500
                                        ${
                                            isScrolled || !isHome
                                                ? 'brightness-0 md:invert'
                                                : 'brightness-0 invert'
                                        }
                                    `}
                                />
                            </div>
                        </Link>
                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex items-center gap-2">
                            {navLinks.map(link => {
                                const isActive = location.pathname === link.to;
                                return (
                                    <Link
                                        key={link.to}
                                        to={link.to}
                                        className={`relative no-underline font-bold px-4 py-2 transition-all duration-300 rounded-xl text-sm
                                            ${
                                                isActive
                                                    ? 'text-white'
                                                    : link.highlight
                                                      ? 'text-red-600 hover:text-red-700'
                                                      : isScrolled || !isHome
                                                        ? 'text-gray-600 hover:text-gray-900'
                                                        : 'text-white/80 hover:text-white'
                                            }`}
                                    >
                                        {link.label}
                                        {isActive && (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                className="absolute inset-0 bg-red-600 -z-10 rounded-xl shadow-sm shadow-red-900/10"
                                                transition={{
                                                    duration: 0.3,
                                                    ease: 'easeOut',
                                                }}
                                            />
                                        )}
                                    </Link>
                                );
                            })}
                        </nav>
                        {/* Right side */}
                        <div className="flex items-center gap-3">
                            {/* Desktop: User button or login */}
                            <div className="hidden md:block">
                                {isLoading ? (
                                    <div className="w-24 h-10 bg-gray-100 skeleton rounded-xl" />
                                ) : isAuthenticated && user ? (
                                    <div ref={userMenuRef} className="relative">
                                        <button
                                            onClick={() => setShowUserMenu(!showUserMenu)}
                                            className={`flex items-center gap-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 pl-1 pr-3 py-1 rounded-2xl cursor-pointer transition-all duration-200
                        ${showUserMenu ? 'ring-2 ring-red-600/20 bg-white' : ''}`}
                                        >
                                            <div
                                                className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black text-white shadow-sm
                        ${user.avatar ? 'bg-gray-100 text-[18px]' : 'bg-red-600'}`}
                                            >
                                                {user.avatar ? user.avatar : initials}
                                            </div>
                                            <span className="text-sm font-bold text-gray-700 max-w-[120px] overflow-hidden text-ellipsis whitespace-nowrap">
                                                {user.name.split(' ')[0]}
                                            </span>
                                            <ChevronDown
                                                size={14}
                                                strokeWidth={1.5}
                                                className={`text-gray-400 transition-transform duration-300 ${showUserMenu ? 'rotate-180' : ''}`}
                                            />
                                        </button>

                                        {/* Dropdown */}
                                        <AnimatePresence>
                                            {showUserMenu && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                    className="absolute top-[calc(100%+12px)] right-0 bg-white rounded-2xl shadow-2xl p-2 w-[240px] z-[100] border border-gray-100"
                                                >
                                                    <div className="px-4 py-3 border-b border-gray-50 mb-1">
                                                        <p className="text-sm font-black text-gray-900 mb-0.5">
                                                            {user.name}
                                                        </p>
                                                        <p className="text-xs text-gray-500 font-medium line-clamp-1">
                                                            {user.email}
                                                        </p>
                                                    </div>

                                                    {user.role === 'admin' && (
                                                        <>
                                                            <Link
                                                                to="/admin"
                                                                onClick={() =>
                                                                    setShowUserMenu(false)
                                                                }
                                                                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl no-underline text-red-600 text-[13px] font-black bg-red-50 hover:bg-red-100 transition-colors duration-150"
                                                            >
                                                                <ShieldCheck
                                                                    size={16}
                                                                    strokeWidth={1.5}
                                                                />{' '}
                                                                PANEL ADMIN
                                                            </Link>
                                                            <div className="h-px bg-gray-50 my-1.5" />
                                                        </>
                                                    )}

                                                    <Link
                                                        to="/profile"
                                                        onClick={() => setShowUserMenu(false)}
                                                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl no-underline text-gray-700 text-[13px] font-bold hover:bg-gray-50 transition-colors duration-150"
                                                    >
                                                        <User
                                                            size={16}
                                                            strokeWidth={1.5}
                                                            className="text-gray-400"
                                                        />{' '}
                                                        Mi Perfil
                                                    </Link>

                                                    <div className="h-px bg-gray-50 my-1.5" />

                                                    <button
                                                        onClick={() => {
                                                            setShowUserMenu(false);
                                                            logout();
                                                        }}
                                                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl w-full border-none cursor-pointer text-red-600 text-[13px] font-bold bg-transparent hover:bg-red-50 transition-colors duration-150 text-left"
                                                    >
                                                        <LogOut size={16} strokeWidth={1.5} />{' '}
                                                        Cerrar sesión
                                                    </button>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setIsLoginModalOpen(true)}
                                        className="btn-premium bg-gray-900 text-white px-5 py-2.5 rounded-xl font-black text-[13px] cursor-pointer shadow-lg active:scale-95"
                                    >
                                        ACCEDER
                                    </button>
                                )}
                            </div>

                            <motion.div
                                animate={
                                    isCartBumping
                                        ? {
                                              scale: [1, 1.3, 0.95, 1],
                                              rotate: [0, -8, 8, 0],
                                          }
                                        : {}
                                }
                                transition={{ duration: 0.4, ease: 'easeInOut' }}
                            >
                                <Link
                                    id="cart-icon"
                                    to="/cart"
                                    className={`relative p-3 no-underline rounded-xl transition-all flex items-center justify-center min-w-[44px] min-h-[44px] ${
                                        isScrolled || !isHome
                                            ? 'text-gray-800 bg-gray-50 hover:bg-gray-100'
                                            : 'text-white bg-white/15 hover:bg-white/25 border border-white/20'
                                    }`}
                                >
                                    <ShoppingCart size={22} strokeWidth={1.5} />
                                    <AnimatePresence>
                                        {itemCount > 0 && (
                                            <motion.span
                                                key={itemCount} // Re-trigger animation on every count change
                                                initial={{ scale: 0.5, opacity: 0 }}
                                                animate={{ scale: [0.5, 1.3, 1], opacity: 1 }}
                                                exit={{ scale: 0, opacity: 0 }}
                                                transition={{
                                                    type: 'spring',
                                                    stiffness: 500,
                                                    damping: 15,
                                                }}
                                                className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-[10px] font-black rounded-lg min-w-[20px] h-[20px] flex items-center justify-center px-1 shadow-md border-2 border-white"
                                            >
                                                {itemCount}
                                            </motion.span>
                                        )}
                                    </AnimatePresence>
                                </Link>
                            </motion.div>

                            <button
                                onClick={() => setShowMobileMenu(!showMobileMenu)}
                                className={`md:hidden border-none p-3 rounded-xl cursor-pointer flex items-center justify-center min-w-[44px] min-h-[44px] transition-all ${
                                    isScrolled || !isHome
                                        ? 'bg-gray-50 text-gray-800'
                                        : 'bg-white/15 text-white border border-white/20'
                                }`}
                            >
                                {showMobileMenu ? (
                                    <X size={22} strokeWidth={1.5} />
                                ) : (
                                    <Menu size={22} strokeWidth={1.5} />
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu Overlay - Rendered in Portal to avoid stacking context issues */}
                {createPortal(
                    <AnimatePresence>
                        {showMobileMenu && (
                            <>
                                {/* Backdrop overlay */}
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onClick={() => setShowMobileMenu(false)}
                                    className="fixed inset-0 bg-black/50 z-[9998] md:hidden"
                                />

                                {/* Bottom Sheet */}
                                <motion.div
                                    initial={{ y: '100%' }}
                                    animate={{ y: 0 }}
                                    exit={{ y: '100%' }}
                                    transition={{
                                        type: 'spring',
                                        damping: 30,
                                        stiffness: 300,
                                        mass: 0.8,
                                    }}
                                    className="fixed inset-x-0 bottom-0 bg-white rounded-t-[40px] shadow-[0_-20px_40px_-15px_rgba(0,0,0,0.1)] z-[9999] md:hidden overflow-hidden border-t border-gray-100 will-change-transform flex flex-col max-h-[92dvh]"
                                >
                                    {/* Drag Handle Container */}
                                    <div className="flex justify-center pt-5 pb-2 shrink-0">
                                        <div className="w-12 h-1.5 bg-gray-200/80 rounded-full" />
                                    </div>

                                    {/* Scrollable Content Area */}
                                    <div className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar">
                                        <div className="px-3 pt-4 pb-2 space-y-2">
                                            {navLinks.map(link => {
                                                const Icon = link.icon;
                                                const isActive = location.pathname === link.to;
                                                return (
                                                    <Link
                                                        key={link.to}
                                                        to={link.to}
                                                        onClick={() => setShowMobileMenu(false)}
                                                        className={`group flex items-center gap-4 px-4 py-4 rounded-[20px] font-black text-[16px] no-underline transition-all active:scale-[0.97]
                                                        ${
                                                            isActive
                                                                ? 'text-red-600 bg-red-50/50'
                                                                : 'text-gray-600 hover:text-gray-900'
                                                        }`}
                                                    >
                                                        <div
                                                            className={`transition-colors ${isActive ? 'text-red-600' : 'text-gray-500'}`}
                                                        >
                                                            <Icon
                                                                size={22}
                                                                strokeWidth={isActive ? 2.5 : 1.8}
                                                            />
                                                        </div>
                                                        <span
                                                            className={`flex-1 tracking-tight ${isActive ? 'text-red-600' : 'text-gray-900'}`}
                                                        >
                                                            {link.label}
                                                        </span>
                                                        <ChevronRight
                                                            size={18}
                                                            strokeWidth={isActive ? 2.5 : 2}
                                                            className={`transition-all duration-300 ${isActive ? 'translate-x-0 opacity-100' : 'opacity-0 -translate-x-2'}`}
                                                        />
                                                    </Link>
                                                );
                                            })}
                                        </div>

                                        <div className="px-3 pb-8 space-y-3">
                                            <div className="h-px bg-gray-100 my-2 mx-2" />

                                            {isLoading ? (
                                                <div className="w-full h-12 bg-gray-100 skeleton rounded-2xl animate-pulse" />
                                            ) : isAuthenticated && user ? (
                                                <div className="space-y-4">
                                                    <div className="px-5 py-4 bg-gray-50 rounded-3xl flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-white font-black text-sm">
                                                            {user.avatar ? user.avatar : initials}
                                                        </div>
                                                        <div>
                                                            <p className="font-black text-gray-900 text-[14px] leading-none mb-1">
                                                                {user.name}
                                                            </p>
                                                            <p className="text-[12px] text-gray-400 font-medium leading-none">
                                                                {user.email}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div
                                                        className={`grid gap-2 ${user.role === 'admin' ? 'grid-cols-2' : 'grid-cols-1'}`}
                                                    >
                                                        {user.role === 'admin' && (
                                                            <Link
                                                                to="/admin"
                                                                onClick={() =>
                                                                    setShowMobileMenu(false)
                                                                }
                                                                className="flex items-center justify-center gap-2 px-4 py-4 rounded-2xl no-underline text-red-600 text-[13px] font-black bg-red-50 border border-red-100"
                                                            >
                                                                <ShieldCheck
                                                                    size={18}
                                                                    strokeWidth={1.5}
                                                                />
                                                                PANEL
                                                            </Link>
                                                        )}
                                                        <Link
                                                            to="/profile"
                                                            onClick={() => setShowMobileMenu(false)}
                                                            className="flex items-center justify-center gap-2 px-4 py-4 rounded-2xl no-underline text-gray-700 text-[13px] font-bold bg-gray-50 border border-gray-100"
                                                        >
                                                            <User size={18} strokeWidth={1.5} />
                                                            MI PERFIL
                                                        </Link>
                                                    </div>
                                                    <button
                                                        onClick={() => {
                                                            logout();
                                                            setShowMobileMenu(false);
                                                        }}
                                                        className="flex items-center justify-center gap-3 px-5 py-4 rounded-2xl w-full border-none cursor-pointer text-red-600 text-[14px] font-black bg-white border border-red-50 hover:bg-red-50 transition-colors mb-4"
                                                    >
                                                        <LogOut size={18} strokeWidth={1.5} />{' '}
                                                        Cerrar sesión
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="pb-4">
                                                    <button
                                                        onClick={() => {
                                                            setShowMobileMenu(false);
                                                            setIsLoginModalOpen(true);
                                                        }}
                                                        className="w-full py-5 rounded-[24px] bg-gray-900 text-white border-none cursor-pointer font-black text-[15px] shadow-xl shadow-gray-200 active:scale-95 flex items-center justify-center gap-3"
                                                    >
                                                        <User size={20} />
                                                        ACCEDER / REGISTRO
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>,
                    document.body
                )}
            </header>

            {isLoginModalOpen && (
                <LoginModal
                    isOpen={isLoginModalOpen}
                    onClose={() => setIsLoginModalOpen(false)}
                    initialMode={loginModalMode}
                />
            )}
        </>
    );
}
