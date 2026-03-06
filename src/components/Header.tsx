import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, User, ChevronDown, LogOut, Menu, X, ShieldCheck } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { useState, useRef, useEffect } from 'react';
import LoginModal from './LoginModal';

export default function Header() {
  const { itemCount } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
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

  // Close mobile menu on route change
  useEffect(() => {
    setShowMobileMenu(false);
  }, [location.pathname]);

  const initials = user ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '';

  const navLinks = [
    { to: '/menu', label: 'Menú' },
    { to: '/contacts', label: 'Contactos' },
    { to: '/promo', label: 'Promo 🎉', highlight: true },
  ];

  return (
    <>
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link to="/" className="flex items-center no-underline gap-2">
              <img src="/logo.svg" alt="Sushi de Maksim" className="h-8 w-auto" />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`no-underline font-bold pb-0.5 transition-colors duration-150
                    ${link.highlight ? 'text-red-600' : 'text-gray-700 hover:text-red-600'}
                    ${location.pathname === link.to ? 'border-b-2 border-red-600' : 'border-b-2 border-transparent'}`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-2">

              {/* Desktop: User button or login */}
              <div className="hidden md:block">
                {isAuthenticated && user ? (
                  <div ref={userMenuRef} className="relative">
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className={`flex items-center gap-2 border border-gray-200 pl-1 pr-3 py-1 rounded-full cursor-pointer transition-colors duration-200
                        ${showUserMenu ? 'bg-gray-50' : 'bg-white hover:bg-gray-50'}`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white
                        ${user.avatar ? 'bg-gray-100 text-[18px]' : 'bg-gradient-to-br from-red-600 to-red-400'}`}>
                        {user.avatar ? user.avatar : initials}
                      </div>
                      <span className="text-sm font-semibold text-gray-700 max-w-[120px] overflow-hidden text-ellipsis whitespace-nowrap">
                        {user.name.split(' ')[0]}
                      </span>
                      <ChevronDown size={14} className={`text-gray-500 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Dropdown */}
                    {showUserMenu && (
                      <div className="absolute top-[calc(100%+8px)] right-0 bg-white rounded-xl shadow-xl p-2 w-[220px] z-[100] animate-[dropIn_0.15s_ease]">
                        <div className="px-3 py-3 border-b border-gray-100 mb-1">
                          <p className="text-sm font-bold text-gray-900 mb-0.5">{user.name}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>

                        {user.role === 'admin' && (
                          <>
                            <Link
                              to="/admin"
                              onClick={() => setShowUserMenu(false)}
                              className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg no-underline text-red-600 text-sm font-bold bg-red-50 hover:bg-red-100 transition-colors duration-150"
                            >
                              <ShieldCheck size={16} /> Admin Panel
                            </Link>
                            <div className="h-px bg-gray-100 my-1" />
                          </>
                        )}

                        <Link
                          to="/profile"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg no-underline text-gray-700 text-sm hover:bg-gray-50 transition-colors duration-150"
                        >
                          <User size={16} /> Mi Perfil
                        </Link>

                        <div className="h-px bg-gray-100 my-1" />

                        <button
                          onClick={() => { setShowUserMenu(false); logout(); }}
                          className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg w-full border-none cursor-pointer text-red-600 text-sm bg-transparent hover:bg-red-50 transition-colors duration-150 text-left"
                        >
                          <LogOut size={16} /> Cerrar sesión
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => setIsLoginModalOpen(true)}
                    className="border border-gray-200 text-gray-700 px-4 py-2 rounded-lg font-bold text-sm cursor-pointer bg-white hover:bg-gray-50 transition-colors duration-200"
                  >
                    Entrar
                  </button>
                )}
              </div>

              {/* Cart */}
              <Link to="/cart" className="relative p-2 no-underline text-gray-700">
                <ShoppingCart size={24} />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[11px] font-bold rounded-full w-[18px] h-[18px] flex items-center justify-center">
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
              </Link>

              {/* Mobile burger */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="md:hidden border-none bg-transparent cursor-pointer p-2 rounded-lg text-gray-700"
              >
                {showMobileMenu ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="border-t border-gray-100 bg-white p-4 animate-[slideDown_0.2s_ease] md:hidden">
            {/* Nav links */}
            <div className="flex flex-col gap-1 mb-3">
              {navLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`no-underline px-4 py-3 rounded-xl font-bold text-[15px]
                    ${link.highlight ? 'text-red-600' : 'text-gray-700'}
                    ${location.pathname === link.to ? 'bg-red-100' : ''}`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="h-px bg-gray-100 mb-3" />

            {/* Auth */}
            {isAuthenticated && user ? (
              <div>
                <div className="px-4 py-3 mb-1">
                  <p className="mb-0.5 font-bold text-gray-900">{user.name}</p>
                  <p className="text-[13px] text-gray-500">{user.email}</p>
                </div>
                {user.role === 'admin' && (
                  <Link to="/admin" className="flex items-center gap-2.5 px-4 py-3 rounded-xl no-underline text-red-600 text-sm font-bold bg-red-50 mb-1">
                    <ShieldCheck size={16} /> Admin Panel
                  </Link>
                )}
                <Link to="/profile" className="flex items-center gap-2.5 px-4 py-3 rounded-xl no-underline text-gray-700 text-sm font-semibold">
                  <User size={16} /> Mi Perfil
                </Link>
                <button
                  onClick={logout}
                  className="flex items-center gap-2.5 px-4 py-3 rounded-xl w-full border-none cursor-pointer text-red-600 text-sm bg-transparent font-semibold text-left"
                >
                  <LogOut size={16} /> Cerrar sesión
                </button>
              </div>
            ) : (
              <button
                onClick={() => { setShowMobileMenu(false); setIsLoginModalOpen(true); }}
                className="w-full py-3 rounded-xl bg-red-600 text-white border-none cursor-pointer font-bold text-[15px]"
              >
                Iniciar sesión
              </button>
            )}
          </div>
        )}
      </header>

      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </>
  );
}
