import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ArrowLeft, MapPin, CheckCircle } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { api, ApiError } from '../utils/api';

export default function CartPageSimple() {
    const {
        items,
        total,
        updateQuantity,
        removeItem,
        clearCart,
        isLoading: cartLoading,
    } = useCart();
    const { isAuthenticated, user } = useAuth();
    const navigate = useNavigate();

    const [address, setAddress] = useState('');
    const [phone, setPhone] = useState('');
    const [isOrdering, setIsOrdering] = useState(false);
    const [orderError, setOrderError] = useState('');
    const [orderSuccess, setOrderSuccess] = useState<number | null>(null);

    // New options
    const [noCall, setNoCall] = useState(false);
    const [noBuzzer, setNoBuzzer] = useState(false);
    const [customNote, setCustomNote] = useState('');

    // Promo code
    const [promoCodeInput, setPromoCodeInput] = useState('');
    const [appliedPromo, setAppliedPromo] = useState<{ code: string; percentage: number } | null>(
        null
    );
    const [promoError, setPromoError] = useState('');
    const [isApplyingPromo, setIsApplyingPromo] = useState(false);

    // Pre-fill from user's default address
    const defaultAddr = user?.addresses?.find(a => a.isDefault) ?? user?.addresses?.[0];

    const handleOrder = async () => {
        setOrderError('');
        const deliveryAddress =
            address.trim() ||
            (defaultAddr
                ? `${defaultAddr.street}, ${defaultAddr.postalCode} ${defaultAddr.city}`
                : '');
        const deliveryPhone = phone.trim() || user?.phone || '';

        if (!deliveryAddress) {
            setOrderError('Por favor, introduce una dirección de entrega');
            return;
        }
        if (!deliveryPhone) {
            setOrderError('Por favor, introduce un teléfono de contacto');
            return;
        }

        setIsOrdering(true);

        // Build notes from checkboxes and custom comment
        const notesArray = [];
        if (noCall) notesArray.push('Sin llamada de confirmación');
        if (noBuzzer) notesArray.push('No llamar al timbre, llamar al móvil');
        if (customNote.trim()) notesArray.push(customNote.trim());
        const notes = notesArray.join('. ');

        try {
            const data = await api.post('/orders', {
                deliveryAddress,
                phoneNumber: deliveryPhone,
                notes,
                promoCode: appliedPromo?.code || undefined,
            });
            setOrderSuccess(data.order.id);
        } catch (err) {
            setOrderError(err instanceof ApiError ? err.message : 'Error al realizar el pedido');
        } finally {
            setIsOrdering(false);
        }
    };

    const handleApplyPromo = async () => {
        if (!promoCodeInput.trim()) return;
        setPromoError('');
        setIsApplyingPromo(true);

        try {
            const res = await api.post('/promo/validate', { code: promoCodeInput.trim() });
            setAppliedPromo({ code: promoCodeInput.trim(), percentage: res.percentage });
            setPromoCodeInput('');
        } catch (err) {
            setPromoError(err instanceof ApiError ? err.message : 'Código inválido');
        } finally {
            setIsApplyingPromo(false);
        }
    };

    const finalTotal = appliedPromo ? total * (1 - appliedPromo.percentage / 100) : total;

    // ===== ORDER SUCCESS STATE =====
    if (orderSuccess !== null) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                <div className="bg-white rounded-2xl shadow-xl p-10 max-w-md w-full text-center">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle size={40} className="text-green-600" />
                    </div>
                    <h1 className="text-2xl font-bold mb-3 text-gray-900">¡Pedido realizado!</h1>
                    <p className="text-gray-500 mb-2">
                        Pedido{' '}
                        <span className="font-bold text-gray-900">
                            #{String(orderSuccess).padStart(5, '0')}
                        </span>
                    </p>
                    <p className="text-gray-500 mb-8">
                        Tiempo estimado de entrega:{' '}
                        <span className="font-bold text-red-600">30–60 min</span>
                    </p>
                    <div className="flex flex-col gap-3">
                        <button
                            onClick={() => navigate('/profile', { state: { tab: 'orders' } })}
                            className="bg-red-600 text-white px-6 py-3 rounded-lg font-bold border-none cursor-pointer hover:bg-red-700 transition"
                        >
                            Ver mis pedidos
                        </button>
                        <Link
                            to="/menu"
                            className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-bold no-underline text-center hover:bg-gray-200 transition"
                        >
                            Seguir comprando
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // ===== EMPTY CART =====
    if (!cartLoading && items.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 px-4 py-8 flex items-center">
                <div className="max-w-4xl mx-auto text-center py-16">
                    <div className="text-8xl mb-4">🛒</div>
                    <h1 className="text-4xl font-bold mb-4">Tu cesta está vacía</h1>
                    <p className="text-xl text-gray-500 mb-8">
                        Añade platos del menú para hacer tu pedido
                    </p>
                    <Link
                        to="/menu"
                        className="bg-red-600 text-white px-6 py-3 rounded-lg no-underline font-bold inline-flex items-center gap-2 hover:bg-red-700 transition"
                    >
                        <ArrowLeft size={20} />
                        Ir al menú
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-8">
            <div className="max-w-5xl mx-auto">
                <h1 className="text-4xl font-bold mb-8">Tu cesta</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Cart Items */}
                    <div className="lg:col-span-2 flex flex-col gap-6">
                        <div className="bg-white rounded-xl shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1)] p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold m-0">
                                    Productos ({items.length})
                                </h2>
                                <button
                                    onClick={clearCart}
                                    className="border-none bg-transparent text-red-500 text-sm font-bold cursor-pointer hover:underline"
                                >
                                    Vaciar cesta
                                </button>
                            </div>

                            <div className="flex flex-col gap-4">
                                {items.map(item => (
                                    <div
                                        key={item.id}
                                        className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
                                    >
                                        <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-gray-200 flex items-center justify-center">
                                            {item.image ? (
                                                <img
                                                    src={item.image}
                                                    alt={`Producto ${item.name} en el carrito`}
                                                    loading="lazy"
                                                    decoding="async"
                                                    className="w-full h-full object-cover"
                                                    onError={e => {
                                                        e.currentTarget.style.display = 'none';
                                                    }}
                                                />
                                            ) : (
                                                <span className="text-3xl">🍣</span>
                                            )}
                                        </div>

                                        <div className="flex-1">
                                            <h3 className="font-bold m-0 mb-1">{item.name}</h3>
                                            <p className="text-lg font-bold text-red-600 m-0">
                                                {item.price.toFixed(2).replace('.', ',')} € ×{' '}
                                                {item.quantity} ={' '}
                                                {(item.price * item.quantity)
                                                    .toFixed(2)
                                                    .replace('.', ',')}{' '}
                                                €
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() =>
                                                    item.quantity > 1
                                                        ? updateQuantity(item.id, item.quantity - 1)
                                                        : removeItem(item.id)
                                                }
                                                className="w-8 h-8 rounded-full bg-gray-200 border-none cursor-pointer flex items-center justify-center hover:bg-gray-300 transition"
                                            >
                                                <Minus size={16} />
                                            </button>
                                            <span className="w-8 text-center font-bold">
                                                {item.quantity}
                                            </span>
                                            <button
                                                onClick={() =>
                                                    updateQuantity(item.id, item.quantity + 1)
                                                }
                                                className="w-8 h-8 rounded-full bg-gray-200 border-none cursor-pointer flex items-center justify-center hover:bg-gray-300 transition"
                                            >
                                                <Plus size={16} />
                                            </button>
                                        </div>

                                        <button
                                            onClick={() => removeItem(item.id)}
                                            className="border-none bg-transparent text-red-500 cursor-pointer p-1 hover:bg-red-50 rounded transition"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Delivery info — only for logged-in users */}
                        {isAuthenticated && (
                            <div className="bg-white rounded-xl shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1)] p-6">
                                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                    <MapPin size={20} className="text-red-600" /> Datos de entrega
                                </h2>

                                {/* Default address pill */}
                                {defaultAddr && (
                                    <button
                                        onClick={() => {
                                            setAddress(
                                                `${defaultAddr.street}, ${defaultAddr.postalCode} ${defaultAddr.city}`
                                            );
                                            setPhone(prev => prev || defaultAddr.phone);
                                        }}
                                        className="mb-4 flex items-center gap-2 text-sm bg-red-50 text-red-700 border border-red-200 rounded-full px-4 py-2 cursor-pointer hover:bg-red-100 transition font-medium"
                                    >
                                        <MapPin size={14} /> Usar "{defaultAddr.label}":{' '}
                                        {defaultAddr.street}
                                    </button>
                                )}

                                <div className="flex flex-col gap-3">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-600 mb-1">
                                            Dirección de entrega *
                                        </label>
                                        <input
                                            type="text"
                                            value={address}
                                            onChange={e => setAddress(e.target.value)}
                                            placeholder={
                                                defaultAddr
                                                    ? `${defaultAddr.street}, ${defaultAddr.postalCode} ${defaultAddr.city}`
                                                    : 'Calle, número, piso, ciudad'
                                            }
                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400 focus:shadow-[0_0_0_3px_rgba(220,38,38,0.1)] transition bg-gray-50 focus:bg-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-600 mb-1">
                                            Teléfono de contacto *
                                        </label>
                                        <input
                                            type="tel"
                                            value={phone}
                                            onChange={e => setPhone(e.target.value)}
                                            placeholder={user?.phone || '+34 600 000 000'}
                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400 focus:shadow-[0_0_0_3px_rgba(220,38,38,0.1)] transition bg-gray-50 focus:bg-white"
                                        />
                                    </div>
                                </div>

                                {/* Checkboxes */}
                                <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-gray-100">
                                    <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none">
                                        <input
                                            type="checkbox"
                                            className="w-4 h-4 accent-red-600 rounded cursor-pointer"
                                            checked={noCall}
                                            onChange={e => setNoCall(e.target.checked)}
                                        />
                                        Sin llamada de confirmación de pedido
                                    </label>
                                    <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none">
                                        <input
                                            type="checkbox"
                                            className="w-4 h-4 accent-red-600 rounded cursor-pointer"
                                            checked={noBuzzer}
                                            onChange={e => setNoBuzzer(e.target.checked)}
                                        />
                                        No llamar al timbre / El repartidor llama al móvil
                                    </label>
                                </div>

                                {/* Custom Note */}
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                    <label className="block text-sm font-semibold text-gray-600 mb-1">
                                        Comentario para el pedido (Opcional)
                                    </label>
                                    <textarea
                                        value={customNote}
                                        onChange={e => setCustomNote(e.target.value)}
                                        placeholder="Ej. Quitar pepino del rollo California, dejar el pedido en la puerta..."
                                        rows={2}
                                        style={{ resize: 'none' }}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400 focus:shadow-[0_0_0_3px_rgba(220,38,38,0.1)] transition bg-gray-50 focus:bg-white"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Order Summary */}
                    <div>
                        <div className="bg-white rounded-xl shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1)] p-6 sticky top-24">
                            <h2 className="text-xl font-bold mb-6">Resumen</h2>

                            <div className="flex flex-col gap-3 mb-6">
                                <div className="flex justify-between text-gray-500">
                                    <span>
                                        Productos ({items.reduce((s, i) => s + i.quantity, 0)} uds.)
                                    </span>
                                    <span className="font-bold text-gray-900">
                                        {total.toFixed(2).replace('.', ',')} €
                                    </span>
                                </div>
                                <div className="flex justify-between text-gray-500">
                                    <span>Envío</span>
                                    <span className="font-bold text-green-600">Gratis</span>
                                </div>
                                <div className="border-t border-gray-200 pt-3 mt-1">
                                    <div className="flex justify-between text-lg font-bold">
                                        <span>Total</span>
                                        <div className="text-right">
                                            {appliedPromo && (
                                                <div className="text-sm font-normal text-gray-400 line-through mb-1">
                                                    {total.toFixed(2).replace('.', ',')} €
                                                </div>
                                            )}
                                            <span className="text-red-600">
                                                {finalTotal.toFixed(2).replace('.', ',')} €
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Promo code input */}
                            <div className="mb-6 pb-6 border-b border-gray-100">
                                <label className="block text-sm font-semibold text-gray-600 mb-2">
                                    Código promocional
                                </label>
                                {!appliedPromo ? (
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={promoCodeInput}
                                            onChange={e => {
                                                setPromoCodeInput(e.target.value.toUpperCase());
                                                setPromoError('');
                                            }}
                                            placeholder="Ej. LATE-20..."
                                            className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400 focus:shadow-[0_0_0_3px_rgba(220,38,38,0.1)] transition"
                                        />
                                        <button
                                            onClick={handleApplyPromo}
                                            disabled={!promoCodeInput.trim() || isApplyingPromo}
                                            className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-bold disabled:opacity-50"
                                        >
                                            {isApplyingPromo ? '...' : 'Aplicar'}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between bg-green-50 border border-green-200 px-4 py-3 rounded-lg">
                                        <div className="text-sm text-green-700 font-medium">
                                            🎉 -{appliedPromo.percentage}% (Código:{' '}
                                            {appliedPromo.code})
                                        </div>
                                        <button
                                            onClick={() => setAppliedPromo(null)}
                                            className="text-red-600 text-sm font-bold hover:underline"
                                        >
                                            Quitar
                                        </button>
                                    </div>
                                )}
                                {promoError && (
                                    <p className="text-red-600 text-xs mt-2">{promoError}</p>
                                )}
                            </div>

                            {/* Error */}
                            {orderError && (
                                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                                    ⚠️ {orderError}
                                </div>
                            )}

                            {isAuthenticated ? (
                                <button
                                    onClick={handleOrder}
                                    disabled={isOrdering || items.length === 0}
                                    className="bg-red-600 text-white px-6 py-3 rounded-lg font-bold border-none cursor-pointer w-full mb-4 text-base hover:bg-red-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                                >
                                    {isOrdering ? 'Procesando...' : 'Realizar pedido →'}
                                </button>
                            ) : (
                                <div className="mb-4">
                                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm text-center mb-3">
                                        🔐 Inicia sesión para realizar el pedido
                                    </div>
                                    <Link
                                        to="/"
                                        className="bg-red-600 text-white px-6 py-3 rounded-lg font-bold no-underline flex items-center justify-center w-full hover:bg-red-700 transition"
                                    >
                                        Iniciar sesión
                                    </Link>
                                </div>
                            )}

                            <Link
                                to="/menu"
                                className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-bold no-underline flex items-center justify-center gap-2 w-full hover:bg-gray-200 transition"
                            >
                                <ArrowLeft size={20} />
                                Volver al menú
                            </Link>

                            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                                <h3 className="text-base font-bold mb-2">Información de envío</h3>
                                <ul className="text-sm text-gray-500 m-0 pl-5 space-y-1">
                                    <li>Envío gratuito</li>
                                    <li>Tiempo de entrega: 30–60 min</li>
                                    <li>Horario: 12:00–22:00</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
