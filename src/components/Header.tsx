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
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import LoginModal from './LoginModal';

export default function Header() {
    const { itemCount } = useCart();
    const { user, isAuthenticated, logout, isLoading } = useAuth();
    const location = useLocation();
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [isCartBumping, setIsCartBumping] = useState(false);
    const userMenuRef = useRef<HTMLDivElement>(null);

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

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        const lenis = (window as any).lenis;
        if (showMobileMenu) {
            document.body.classList.add('overflow-hidden');
            if (lenis) lenis.stop();
        } else {
            document.body.classList.remove('overflow-hidden');
            if (lenis) lenis.start();
        }
        return () => {
            document.body.classList.remove('overflow-hidden');
            if (lenis) lenis.start();
        };
    }, [showMobileMenu]);

    // Close mobile menu on route change
    useEffect(() => {
        setShowMobileMenu(false);
    }, [location.pathname]);

    useEffect(() => {
        const handleOpenLogin = () => setIsLoginModalOpen(true);
        document.addEventListener('custom:openLogin', handleOpenLogin);
        return () => document.removeEventListener('custom:openLogin', handleOpenLogin);
    }, []);

    // Cart bump animation trigger
    const prevCountRef = useRef(itemCount);
    useEffect(() => {
        if (itemCount > prevCountRef.current) {
            setIsCartBumping(true);
            const timer = setTimeout(() => setIsCartBumping(false), 300);
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
        { to: '/menu', label: 'Menú' },
        { to: '/blog', label: 'Blog' },
        { to: '/contacts', label: 'Contactos' },
        { to: '/promo', label: 'Promo', highlight: true },
    ];

    return (
        <>
            <header className="sticky top-0 z-[100] transition-all duration-300 bg-white/30 backdrop-blur-xl border-b border-white/20">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex items-center justify-between h-20">
                        {/* Logo */}
                        <Link
                            to="/"
                            onClick={() => setShowMobileMenu(false)}
                            className="flex items-center no-underline gap-2 group"
                        >
                            <div className="bg-red-600 p-1.5 rounded-lg group-hover:rotate-12 transition-transform duration-300">
                                <img
                                    src="/logo.svg"
                                    alt="Sushi de Maksim"
                                    className="h-6 w-auto brightness-0 invert"
                                />
                            </div>
                            <span className="font-black text-xl tracking-tighter text-gray-900">
                                MAKSIM<span className="text-red-600">.</span>
                            </span>
                        </Link>

                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex items-center gap-2">
                            {navLinks.map(link => {
                                const isActive = location.pathname === link.to;
                                return (
                                    <Link
                                        key={link.to}
                                        to={link.to}
                                        className={`relative no-underline font-bold px-4 py-2 transition-colors duration-200 rounded-xl text-sm
                      ${link.highlight ? 'text-red-600' : 'text-gray-600 hover:text-gray-900'}
                      ${isActive ? (link.highlight ? 'text-red-600' : 'text-gray-900') : ''}`}
                                    >
                                        {link.label}
                                        {isActive && (
                                            <motion.div
                                                layoutId="nav-active"
                                                className="absolute inset-0 bg-gray-100/50 -z-10 rounded-xl"
                                                transition={{
                                                    type: 'spring',
                                                    bounce: 0.25,
                                                    duration: 0.5,
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

                            {/* Cart */}
                            <motion.div
                                animate={isCartBumping ? { scale: [1, 1.2, 1] } : {}}
                                transition={{ duration: 0.3 }}
                            >
                                <Link
                                    id="cart-icon"
                                    to="/cart"
                                    className="relative p-2.5 no-underline text-gray-800 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors flex items-center justify-center"
                                >
                                    <ShoppingCart size={20} strokeWidth={1.5} />
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

                            {/* Mobile burger */}
                            <button
                                onClick={() => setShowMobileMenu(!showMobileMenu)}
                                className="md:hidden border-none bg-gray-50 p-2.5 rounded-xl cursor-pointer text-gray-800"
                            >
                                {showMobileMenu ? (
                                    <X size={20} strokeWidth={1.5} />
                                ) : (
                                    <Menu size={20} strokeWidth={1.5} />
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
                                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9998] md:hidden"
                                />

                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                                    className="fixed right-4 top-[80px] w-[260px] bg-white rounded-3xl shadow-2xl z-[9999] md:hidden overflow-hidden border border-gray-100 origin-top-right"
                                >
                                    <div className="p-3 space-y-1 max-h-[calc(100vh-100px)] overflow-y-auto">
                                        {navLinks.map(link => (
                                            <Link
                                                key={link.to}
                                                to={link.to}
                                                onClick={() => setShowMobileMenu(false)}
                                                className={`flex items-center px-4 py-3 rounded-2xl font-black text-sm no-underline
                          ${link.highlight ? 'text-red-600 bg-red-50' : 'text-gray-700 hover:bg-gray-50'}
                          ${location.pathname === link.to ? (link.highlight ? 'bg-red-100' : 'bg-gray-100') : ''}`}
                                            >
                                                {link.label}
                                                {location.pathname === link.to && (
                                                    <ChevronRight
                                                        size={16}
                                                        strokeWidth={1.5}
                                                        className="ml-auto"
                                                    />
                                                )}
                                            </Link>
                                        ))}

                                        <div className="h-px bg-gray-100 my-2 mx-2" />

                                        {isLoading ? (
                                            <div className="w-full h-12 bg-gray-100 skeleton rounded-2xl animate-pulse" />
                                        ) : isAuthenticated && user ? (
                                            <div className="space-y-1">
                                                <div className="px-4 py-2">
                                                    <p className="font-black text-gray-900 text-sm mb-0.5 line-clamp-1">
                                                        {user.name}
                                                    </p>
                                                    <p className="text-[11px] text-gray-400 font-medium line-clamp-1">
                                                        {user.email}
                                                    </p>
                                                </div>
                                                {user.role === 'admin' && (
                                                    <Link
                                                        to="/admin"
                                                        onClick={() => setShowMobileMenu(false)}
                                                        className="flex items-center gap-3 px-4 py-3 rounded-2xl no-underline text-red-600 text-sm font-black bg-red-50"
                                                    >
                                                        <ShieldCheck size={18} strokeWidth={1.5} />{' '}
                                                        PANEL ADMIN
                                                    </Link>
                                                )}
                                                <Link
                                                    to="/profile"
                                                    onClick={() => setShowMobileMenu(false)}
                                                    className="flex items-center gap-3 px-4 py-3 rounded-2xl no-underline text-gray-700 text-sm font-bold hover:bg-gray-50"
                                                >
                                                    <User
                                                        size={18}
                                                        strokeWidth={1.5}
                                                        className="text-gray-400"
                                                    />{' '}
                                                    Mi Perfil
                                                </Link>
                                                <button
                                                    onClick={() => {
                                                        logout();
                                                        setShowMobileMenu(false);
                                                    }}
                                                    className="flex items-center gap-3 px-4 py-3 rounded-2xl w-full border-none cursor-pointer text-red-600 text-sm font-bold bg-transparent text-left hover:bg-red-50"
                                                >
                                                    <LogOut size={18} strokeWidth={1.5} /> Cerrar sesión
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => {
                                                    setShowMobileMenu(false);
                                                    setIsLoginModalOpen(true);
                                                }}
                                                className="w-full py-3 rounded-2xl bg-gray-900 text-white border-none cursor-pointer font-black text-[13px] shadow-xl active:scale-95 flex items-center justify-center gap-2 mt-2"
                                            >
                                                <User size={16} />
                                                ACCEDER / REGISTRO
                                            </button>
                                        )}
                                    </div>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>,
                    document.body
                )}
            </header>

            {isLoginModalOpen && (
                <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
            )}
        </>
    );
}
