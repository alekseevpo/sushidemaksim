import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, MapPin, Package, LogOut, ChevronRight, Heart } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import ProfileTab from '../components/profile/ProfileTab';
import AddressesTab from '../components/profile/AddressesTab';
import OrdersTab from '../components/profile/OrdersTab';
import FavoritesTab from '../components/profile/FavoritesTab';
import { cardStyle } from '../components/profile/profileStyles';

type TabId = 'profile' | 'addresses' | 'orders' | 'favorites';

export default function ProfilePage() {
    const { user, isAuthenticated, logout, updateProfile, addAddress, editAddress, removeAddress, setDefaultAddress } = useAuth();
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
            <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', padding: '32px 16px' }}>
                <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center', padding: '80px 0' }}>
                    <div style={{ fontSize: '80px', marginBottom: '24px' }}>🔒</div>
                    <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '12px', color: '#111827' }}>
                        Inicia sesión
                    </h1>
                    <p style={{ fontSize: '16px', color: '#6B7280', marginBottom: '32px' }}>
                        Necesitas iniciar sesión para acceder a tu perfil
                    </p>
                    <button
                        onClick={() => navigate('/')}
                        style={{
                            backgroundColor: '#DC2626', color: 'white', padding: '12px 32px',
                            borderRadius: '10px', border: 'none', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer',
                        }}
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

    const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

    const tabs: { id: TabId; label: string; icon: typeof User }[] = [
        { id: 'profile', label: 'Mi Perfil', icon: User },
        { id: 'addresses', label: 'Direcciones', icon: MapPin },
        { id: 'orders', label: 'Mis Pedidos', icon: Package },
        { id: 'favorites', label: 'Favoritos', icon: Heart },
    ];

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#F3F4F6', padding: '32px 16px' }}>
            <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

                {/* Success toast */}
                {saveSuccess && (
                    <div style={{
                        position: 'fixed', top: '80px', right: '24px',
                        backgroundColor: '#059669', color: 'white', padding: '12px 24px',
                        borderRadius: '10px', fontSize: '14px', fontWeight: 'bold', zIndex: 100,
                        boxShadow: '0 10px 25px rgba(5, 150, 105, 0.3)',
                        animation: 'slideIn 0.3s ease', display: 'flex', alignItems: 'center', gap: '8px',
                    }}>
                        ✓ {saveSuccess}
                    </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '24px' }}>

                    {/* Sidebar */}
                    <div>
                        {/* User Card */}
                        <div style={{ ...cardStyle, textAlign: 'center' }}>
                            <div style={{
                                width: '80px', height: '80px', borderRadius: '50%',
                                background: user.avatar ? '#F9FAFB' : 'linear-gradient(135deg, #DC2626, #F87171)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                margin: '0 auto 16px',
                                fontSize: user.avatar ? '48px' : '28px',
                                fontWeight: 'bold', color: 'white',
                                boxShadow: user.avatar ? '0 4px 12px rgba(0, 0, 0, 0.05)' : '0 4px 12px rgba(220, 38, 38, 0.3)',
                            }}>
                                {user.avatar ? user.avatar : initials}
                            </div>
                            <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 4px 0', color: '#111827' }}>
                                {user.name}
                            </h2>
                            <p style={{ fontSize: '13px', color: '#6B7280', margin: '0 0 4px 0' }}>{user.email}</p>
                            <p style={{ fontSize: '12px', color: '#9CA3AF', margin: 0 }}>
                                Miembro desde {new Date(user.createdAt?.replace(' ', 'T') || Date.now()).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                            </p>
                        </div>

                        {/* Nav Tabs */}
                        <div style={cardStyle}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                {tabs.map(tab => {
                                    const Icon = tab.icon;
                                    const isActive = activeTab === tab.id;
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: '12px',
                                                padding: '12px 16px', border: 'none', borderRadius: '10px',
                                                cursor: 'pointer',
                                                backgroundColor: isActive ? '#FEE2E2' : 'transparent',
                                                color: isActive ? '#DC2626' : '#374151',
                                                fontWeight: isActive ? 'bold' : 'normal',
                                                fontSize: '14px', transition: 'all 0.2s',
                                                width: '100%', textAlign: 'left',
                                            }}
                                            onMouseOver={e => { if (!isActive) e.currentTarget.style.backgroundColor = '#F9FAFB'; }}
                                            onMouseOut={e => { if (!isActive) e.currentTarget.style.backgroundColor = 'transparent'; }}
                                        >
                                            <Icon size={18} />
                                            {tab.label}
                                            <ChevronRight size={14} style={{ marginLeft: 'auto', opacity: isActive ? 1 : 0.3 }} />
                                        </button>
                                    );
                                })}

                                <div style={{ height: '1px', backgroundColor: '#E5E7EB', margin: '8px 0' }} />

                                <button
                                    onClick={handleLogout}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '12px',
                                        padding: '12px 16px', border: 'none', borderRadius: '10px',
                                        cursor: 'pointer', backgroundColor: 'transparent', color: '#EF4444',
                                        fontWeight: 'normal', fontSize: '14px', transition: 'all 0.2s',
                                        width: '100%', textAlign: 'left',
                                    }}
                                    onMouseOver={e => e.currentTarget.style.backgroundColor = '#FEF2F2'}
                                    onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
                                >
                                    <LogOut size={18} />
                                    Cerrar sesión
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div>
                        {activeTab === 'profile' && (
                            <ProfileTab user={user} updateProfile={updateProfile} onSuccess={showToast} />
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

            <style>{`
                @keyframes slideIn {
                    from { opacity: 0; transform: translateX(20px); }
                    to { opacity: 1; transform: translateX(0); }
                }
            `}</style>
        </div>
    );
}
