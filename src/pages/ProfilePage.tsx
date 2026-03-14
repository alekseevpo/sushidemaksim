import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User,
    MapPin,
    Package,
    LogOut,
    ChevronRight,
    Heart,
    Gift,
    Percent,
    Trophy,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import SEO from '../components/SEO';
import ProfileTab from '../components/profile/ProfileTab';
import AddressesTab from '../components/profile/AddressesTab';
import OrdersTab from '../components/profile/OrdersTab';
import FavoritesTab from '../components/profile/FavoritesTab';
import { ProfileSkeleton } from '../components/skeletons/ProfileSkeleton';

type TabId = 'profile' | 'addresses' | 'orders' | 'favorites';

export default function ProfilePage() {
    const {
        user,
        isAuthenticated,
        isLoading,
        logout,
        updateProfile,
        addAddress,
        editAddress,
        removeAddress,
        setDefaultAddress,
    } = useAuth();

    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    // Initial tab from URL or state or default
    const getInitialTab = (): TabId => {
        const tabParam = searchParams.get('tab') as TabId;
        if (['profile', 'addresses', 'orders', 'favorites'].includes(tabParam)) {
            return tabParam;
        }
        return 'profile';
    };

    const [activeTab, setActiveTab] = useState<TabId>(getInitialTab());

    // Sync tab with URL when it changes (e.g. back button)
    useEffect(() => {
        const tabParam = searchParams.get('tab') as TabId;
        if (tabParam && ['profile', 'addresses', 'orders', 'favorites'].includes(tabParam)) {
            if (tabParam !== activeTab) {
                setActiveTab(tabParam);
            }
        }
    }, [searchParams, activeTab]);

    // Scroll active tab into view on mobile
    useEffect(() => {
        const activeElement = document.getElementById(`tab-${activeTab}`);
        if (activeElement && typeof activeElement.scrollIntoView === 'function') {
            activeElement.scrollIntoView({
                behavior: 'smooth',
                inline: 'center',
                block: 'nearest',
            });
        }
    }, [activeTab]);

    // Scroll to content when tab changes (especially on mobile)
    useEffect(() => {
        if (activeTab === 'orders' || activeTab === 'addresses' || activeTab === 'favorites') {
            const contentElement = document.getElementById('profile-content');
            if (contentElement && typeof contentElement.scrollIntoView === 'function') {
                const headerOffset = window.innerWidth < 768 ? 160 : 120;
                const elementPosition = contentElement.getBoundingClientRect().top;
                const offsetPosition =
                    elementPosition + (window.scrollY || window.pageYOffset) - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth',
                });
            }
        }
    }, [activeTab]);

    // Update URL when tab changes manually
    const handleTabChange = (tab: TabId) => {
        setActiveTab(tab);
        setSearchParams({ tab }, { replace: true });

        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate(5);
        }
    };

    if (isLoading) {
        return <ProfileSkeleton />;
    }

    if (!isAuthenticated || !user) {
        return (
            <div className="min-h-screen bg-transparent flex items-center justify-center p-6">
                <div className="max-w-md w-full bg-white rounded-[40px] p-12 shadow-2xl text-center border border-gray-100">
                    <div className="w-24 h-24 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-8 text-4xl shadow-inner border-2 border-white">
                        🔒
                    </div>
                    <h1 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">
                        Inicia sesión
                    </h1>
                    <p className="text-gray-500 font-medium mb-10 leading-relaxed italic">
                        Inicia sesión para poder gestionar tu perfil, direcciones y ver tu historial
                        de pedidos.
                    </p>
                    <button
                        onClick={() => navigate('/')}
                        className="w-full py-4 bg-red-600 text-white rounded-2xl font-black text-sm hover:bg-red-700 transition-all shadow-xl shadow-red-100 transform hover:scale-[1.02]"
                    >
                        Volver al inicio
                    </button>
                </div>
            </div>
        );
    }

    const handleLogout = () => {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate([10, 30, 10]);
        }
        logout();
        navigate('/');
    };

    const initials = user.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    const tabs: { id: TabId; label: string; icon: typeof User; color: string }[] = [
        { id: 'profile', label: 'Mi Perfil', icon: User, color: 'bg-blue-500' },
        { id: 'addresses', label: 'Direcciones', icon: MapPin, color: 'bg-green-500' },
        { id: 'orders', label: 'Mis Pedidos', icon: Package, color: 'bg-amber-500' },
        { id: 'favorites', label: 'Favoritos', icon: Heart, color: 'bg-red-50' },
    ];

    return (
        <div className="min-h-screen bg-transparent flex flex-col">
            <SEO
                title="Mi Perfil"
                description="Gestiona tu cuenta, direcciones y pedidos en Sushi de Maksim."
            />

            {/* Header Section - More Compact */}
            <div className="bg-red-600 pt-8 pb-32 px-2 md:px-4 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-10">
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_30%,#fff_0,transparent_50%)]" />
                </div>

                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
                        <div className="w-20 h-20 md:w-24 md:h-24 rounded-3xl bg-white p-1 shadow-xl relative">
                            <div className="w-full h-full rounded-[22px] bg-red-50 flex items-center justify-center text-2xl md:text-4xl border-2 border-white overflow-hidden shadow-inner">
                                {user.avatar ? user.avatar : initials}
                            </div>
                            <div className="absolute -bottom-1 -right-1 bg-green-500 border-2 border-white w-6 h-6 rounded-full shadow-lg flex items-center justify-center">
                                <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                            </div>
                        </div>

                        <div className="flex-1">
                            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-2">
                                <h1 className="text-2xl md:text-3xl font-black text-white m-0 tracking-tight">
                                    {user.name}
                                </h1>
                                <div className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-white border border-white/10 w-fit mx-auto md:mx-0">
                                    <Trophy size={10} className="text-amber-400" />
                                    {(user.orderCount || 0) >= 50
                                        ? 'Leyenda del Sushi 👑'
                                        : (user.orderCount || 0) >= 20
                                          ? 'Cliente VIP ⭐'
                                          : (user.orderCount || 0) >= 5
                                            ? 'Cliente Fiel 💎'
                                            : 'Nuevo Miembro 🌱'}
                                </div>
                            </div>
                            <p className="text-red-100 font-medium opacity-80 m-0 text-sm mb-4">
                                {user.email}
                            </p>
                            <div className="flex flex-wrap gap-2">
                                <span className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-lg text-[10px] font-bold text-white border border-white/5">
                                    Miembro desde{' '}
                                    {new Date(user.createdAt || Date.now()).toLocaleDateString(
                                        'es-ES',
                                        { month: 'short', year: 'numeric' }
                                    )}
                                </span>
                            </div>
                        </div>

                        {/* Quick Stats Grid */}
                        <div className="grid grid-cols-2 md:flex gap-3 md:gap-4 w-full md:w-auto mt-4 md:mt-0">
                            <div className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-[24px] border border-white/20 text-center min-w-[120px] flex-1 md:flex-none">
                                <div className="text-white font-black text-2xl leading-none">
                                    {user.orderCount || 0}
                                </div>
                                <div className="text-red-100 text-[10px] uppercase font-bold tracking-widest mt-1 opacity-70">
                                    Pedidos
                                </div>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="bg-white/10 hover:bg-white/20 px-6 py-3 rounded-[24px] border border-white/20 text-white font-bold transition-all flex items-center justify-center gap-2 flex-1 md:flex-none"
                            >
                                <LogOut size={18} strokeWidth={1.5} />
                                <span className="md:hidden">Salir</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <main className="flex-1 max-w-7xl mx-auto w-full px-2 md:px-4 -mt-24 pb-20 relative z-20">
                {/* Loyalty Program Section */}
                <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-[32px] p-6 shadow-xl border border-white relative overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-red-500/10 transition-colors" />
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-600 shadow-inner">
                                <Percent size={24} strokeWidth={2.5} />
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-gray-900 m-0 uppercase tracking-tight">
                                    Próximo Descuento 5%
                                </h3>
                                <p className="text-[11px] text-gray-400 font-medium m-0">
                                    En cada 5º pedido
                                </p>
                            </div>
                            <div className="ml-auto text-right">
                                <span className="block text-lg font-black text-red-600 leading-none">
                                    {5 - ((user.orderCount || 0) % 5)}
                                </span>
                                <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">
                                    faltan
                                </span>
                            </div>
                        </div>
                        <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden border border-gray-50">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${((user.orderCount || 0) % 5) * 20}%` }}
                                className="h-full bg-red-600 rounded-full shadow-[0_0_8px_rgba(220,38,38,0.3)]"
                            />
                        </div>
                        <div className="flex justify-between mt-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            <span>0</span>
                            <span>5 pedidos</span>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white rounded-[32px] p-6 shadow-xl border border-white relative overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-amber-500/10 transition-colors" />
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 shadow-inner">
                                <Gift size={24} strokeWidth={2.5} />
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-gray-900 m-0 uppercase tracking-tight">
                                    Postre de Regalo 🍰
                                </h3>
                                <p className="text-[11px] text-gray-400 font-medium m-0">
                                    En cada 10º pedido
                                </p>
                            </div>
                            <div className="ml-auto text-right">
                                <span className="block text-lg font-black text-amber-600 leading-none">
                                    {10 - ((user.orderCount || 0) % 10)}
                                </span>
                                <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">
                                    faltan
                                </span>
                            </div>
                        </div>
                        <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden border border-gray-50">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${((user.orderCount || 0) % 10) * 10}%` }}
                                className="h-full bg-amber-500 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.3)]"
                            />
                        </div>
                        <div className="flex justify-between mt-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            <span>0</span>
                            <span>10 pedidos</span>
                        </div>
                    </motion.div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Navigation Sidebar */}
                    <aside className="lg:w-80 shrink-0 -mx-2 md:mx-0 sticky top-[80px] md:relative z-30 mb-4 md:mb-0">
                        <div className="bg-white/95 md:bg-white backdrop-blur-xl border-y md:border border-gray-100 md:border-white shadow-lg md:shadow-2xl rounded-none md:rounded-[32px] p-2 flex md:block overflow-x-auto no-scrollbar gap-1.5 px-3 md:px-2 snap-x snap-mandatory">
                            {tabs.map(tab => {
                                const Icon = tab.icon;
                                const isActive = activeTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        id={`tab-${tab.id}`}
                                        onClick={() => handleTabChange(tab.id)}
                                        className={`shrink-0 md:w-full flex items-center gap-2.5 md:gap-4 p-2.5 md:p-4 rounded-2xl transition-all duration-300 group snap-start relative
                                            ${
                                                isActive
                                                    ? 'text-white'
                                                    : 'hover:bg-gray-50 text-gray-500 hover:text-gray-900 border border-transparent'
                                            }`}
                                    >
                                        {isActive && (
                                            <motion.div
                                                layoutId="profile-tab-active"
                                                className="absolute inset-0 bg-red-600 shadow-lg shadow-red-200 ring-4 ring-red-600/5 rounded-2xl"
                                                transition={{
                                                    type: 'spring',
                                                    bounce: 0.2,
                                                    duration: 0.6,
                                                }}
                                            />
                                        )}
                                        <div
                                            className={`relative z-10 w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110
                                            ${isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-400'}`}
                                        >
                                            <Icon size={16} strokeWidth={1.5} />
                                        </div>
                                        <span
                                            className={`relative z-10 font-black text-[11px] md:text-sm whitespace-nowrap uppercase tracking-wider ${isActive ? 'translate-x-0.5' : ''} transition-transform`}
                                        >
                                            {tab.label}
                                        </span>
                                        <ChevronRight
                                            size={14}
                                            strokeWidth={1.5}
                                            className={`hidden md:block ml-auto transition-all ${isActive ? 'rotate-90 opacity-100' : 'opacity-20'}`}
                                        />
                                    </button>
                                );
                            })}
                        </div>
                    </aside>

                    {/* Content Section */}
                    <div className="flex-1 min-w-0" id="profile-content">
                        <div className="bg-transparent md:bg-white/90 md:backdrop-blur-xl md:border md:border-white md:shadow-2xl rounded-[32px] overflow-hidden">
                            <div className="p-0 md:p-8">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={activeTab}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        {activeTab === 'profile' && (
                                            <ProfileTab user={user} updateProfile={updateProfile} />
                                        )}
                                        {activeTab === 'addresses' && (
                                            <AddressesTab
                                                addresses={user.addresses}
                                                addAddress={addAddress}
                                                editAddress={editAddress}
                                                removeAddress={removeAddress}
                                                setDefaultAddress={setDefaultAddress}
                                            />
                                        )}
                                        {activeTab === 'orders' && <OrdersTab />}
                                        {activeTab === 'favorites' && <FavoritesTab />}
                                    </motion.div>
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
