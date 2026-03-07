import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    User,
    MapPin,
    Package,
    LogOut,
    ChevronRight,
    Heart,
    Sparkles,
    CheckCircle,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import SEO from '../components/SEO';
import ProfileTab from '../components/profile/ProfileTab';
import AddressesTab from '../components/profile/AddressesTab';
import OrdersTab from '../components/profile/OrdersTab';
import FavoritesTab from '../components/profile/FavoritesTab';

type TabId = 'profile' | 'addresses' | 'orders' | 'favorites';

// Latest version with fix for editAddress unused error
export default function ProfilePage() {
    const {
        user,
        isAuthenticated,
        logout,
        updateProfile,
        addAddress,
        editAddress,
        removeAddress,
        setDefaultAddress,
    } = useAuth();

    const navigate = useNavigate();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState<TabId>((location.state as any)?.tab || 'profile');
    const [saveSuccess, setSaveSuccess] = useState('');

    useEffect(() => {
        if ((location.state as any)?.tab) {
            setActiveTab((location.state as any).tab);
        }
    }, [location.state]);

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
        logout();
        navigate('/');
    };

    const showToast = (msg: string) => {
        setSaveSuccess(msg);
        setTimeout(() => setSaveSuccess(''), 2000);
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
        { id: 'favorites', label: 'Favoritos', icon: Heart, color: 'bg-red-500' },
    ];

    return (
        <div className="min-h-screen bg-transparent flex flex-col">
            <SEO
                title="Mi Perfil"
                description="Gestiona tu cuenta, direcciones y pedidos en Sushi de Maksim."
            />

            {/* Header Section */}
            <div className="bg-red-600 pt-12 pb-24 px-4 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-10">
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_30%,#fff_0,transparent_50%)]" />
                </div>

                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
                        <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-white p-1 shadow-2xl relative">
                            <div className="w-full h-full rounded-[22px] bg-red-50 flex items-center justify-center text-3xl md:text-5xl border-2 border-white overflow-hidden shadow-inner">
                                {user.avatar ? user.avatar : initials}
                            </div>
                            <div className="absolute -bottom-2 -right-2 bg-green-500 border-4 border-white w-8 h-8 rounded-full shadow-lg flex items-center justify-center">
                                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                            </div>
                        </div>

                        <div className="flex-1">
                            <h1 className="text-3xl md:text-4xl font-black text-white m-0 tracking-tight">
                                {user.name}
                            </h1>
                            <p className="text-red-100 font-medium opacity-90 m-0 mt-1 mb-3">
                                {user.email}
                            </p>
                            <div className="inline-flex items-center gap-2 bg-black/20 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold text-white border border-white/10">
                                <Sparkles size={12} className="text-amber-400" />
                                Miembro desde{' '}
                                {new Date(user.createdAt || Date.now()).toLocaleDateString(
                                    'es-ES',
                                    { month: 'long', year: 'numeric' }
                                )}
                            </div>
                        </div>

                        <button
                            onClick={handleLogout}
                            className="hidden md:flex items-center gap-2 bg-white/10 hover:bg-white/20 px-6 py-2.5 rounded-xl border border-white/20 text-white font-bold transition-all"
                        >
                            <LogOut size={18} /> Cerrar sesión
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <main className="flex-1 max-w-7xl mx-auto w-full px-4 -mt-16 pb-20 relative z-20">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Navigation Sidebar (Desktop) / Menu (Mobile) */}
                    <aside className="lg:w-80 shrink-0 -mx-4 md:mx-0">
                        <div className="bg-white/80 md:bg-white backdrop-blur-xl border border-white/50 md:border-white shadow-xl md:shadow-2xl rounded-none md:rounded-[32px] p-2 flex md:block overflow-x-auto no-scrollbar gap-1 px-4 md:px-2">
                            {tabs.map(tab => {
                                const Icon = tab.icon;
                                const isActive = activeTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`shrink-0 md:w-full flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-2xl transition-all duration-300 group
                                            ${
                                                isActive
                                                    ? 'bg-red-50 text-red-600 shadow-sm'
                                                    : 'hover:bg-gray-50 text-gray-600 hover:text-gray-900'
                                            }`}
                                    >
                                        <div
                                            className={`w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110
                                            ${isActive ? 'bg-red-600 text-white shadow-lg shadow-red-200' : 'bg-gray-100 text-gray-500'}`}
                                        >
                                            <Icon size={18} />
                                        </div>
                                        <span
                                            className={`font-bold text-xs md:text-sm whitespace-nowrap ${isActive ? 'translate-x-1' : ''} transition-transform`}
                                        >
                                            {tab.label}
                                        </span>
                                        <ChevronRight
                                            size={14}
                                            className={`hidden md:block ml-auto transition-all ${isActive ? 'rotate-90 opacity-100' : 'opacity-20'}`}
                                        />
                                    </button>
                                );
                            })}

                            <div className="h-px bg-gray-100 mx-4 my-2" />

                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-4 p-4 rounded-2xl text-red-500 hover:bg-red-50 transition-colors md:hidden"
                            >
                                <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-500">
                                    <LogOut size={20} />
                                </div>
                                <span className="font-bold text-sm">Cerrar sesión</span>
                            </button>
                        </div>
                    </aside>

                    {/* Content Section */}
                    <div className="flex-1 min-w-0">
                        <div className="bg-transparent md:bg-white/90 md:backdrop-blur-xl md:border md:border-white md:shadow-2xl rounded-[32px] overflow-hidden">
                            {saveSuccess && (
                                <div className="bg-green-600 text-white p-4 flex items-center gap-2 animate-in slide-in-from-top duration-300">
                                    <CheckCircle size={18} />
                                    <span className="font-bold text-sm">{saveSuccess}</span>
                                </div>
                            )}

                            <div className="p-0 md:p-8">
                                {activeTab === 'profile' && (
                                    <ProfileTab
                                        user={user}
                                        updateProfile={updateProfile}
                                        onSuccess={showToast}
                                    />
                                )}
                                {activeTab === 'addresses' && (
                                    <AddressesTab
                                        addresses={user.addresses}
                                        addAddress={addAddress}
                                        editAddress={editAddress}
                                        removeAddress={removeAddress}
                                        setDefaultAddress={setDefaultAddress}
                                        onSuccess={showToast}
                                    />
                                )}
                                {activeTab === 'orders' && <OrdersTab />}
                                {activeTab === 'favorites' && <FavoritesTab />}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
