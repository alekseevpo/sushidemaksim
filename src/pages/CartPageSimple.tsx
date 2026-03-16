import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    Sparkles,
    MapPin,
    CheckCircle,
    Trash2,
    Plus,
    Minus,
    ArrowLeft,
    ArrowRight,
    ArrowDown,
    X,
    Gift,
    Flame,
    ShoppingCart,
    CreditCard,
    Wallet,
    Store,
    Truck,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { api, ApiError } from '../utils/api';
import { useToast } from '../context/ToastContext';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import SEO from '../components/SEO';
import { CartSkeleton } from '../components/skeletons/CartSkeleton';

interface MenuItem {
    id: number;
    name: string;
    description: string;
    price: number;
    image: string;
    category: string;
}

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
    const { success: showSuccess, error: showError, info: showInfo } = useToast();
    const { executeRecaptcha } = useGoogleReCaptcha();

    const [suggestions, setSuggestions] = useState<MenuItem[]>([]);
    const [popularItems, setPopularItems] = useState<MenuItem[]>([]);
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
    const [isLoadingPopular, setIsLoadingPopular] = useState(false);
    const { addItem } = useCart();

    const [address, setAddress] = useState('');
    const [house, setHouse] = useState('');
    const [apartment, setApartment] = useState('');
    const [phone, setPhone] = useState('');
    const [isOrdering, setIsOrdering] = useState(false);
    const [isInviting, setIsInviting] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState<number | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | null>(null);
    const [siteSettings, setSiteSettings] = useState<any>(null);
    const [isLoadingSettings, setIsLoadingSettings] = useState(true);

    const DELIVERY_FEE = siteSettings?.delivery_fee ?? 3.5;
    const MIN_ORDER = siteSettings?.min_order ?? 15;
    const isStoreClosed = !!siteSettings?.is_store_closed;

    const [noCall, setNoCall] = useState(false);
    const [noBuzzer, setNoBuzzer] = useState(false);
    const [isScheduled, setIsScheduled] = useState(false);
    const [scheduledDate, setScheduledDate] = useState(new Date().toISOString().split('T')[0]);
    const [scheduledTime, setScheduledTime] = useState('');
    const [customNote, setCustomNote] = useState('');
    const [failedImages, setFailedImages] = useState<Set<string | number>>(new Set());
    const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup'>('delivery');

    const EMOJI: Record<string, string> = {
        rolls: '🍣',
        'rollos-grandes': '🍣',
        'rolls-calientes': '🍘',
        sets: '🍱',
        classic: '🍙',
        baked: '🍘',
        sweet: '🍥',
        sauces: '🥢',
        extras: '🥢',
        entrantes: '🥟',
        postre: '🍰',
        bebidas: '🥤',
    };

    const getCategoryEmoji = (category: string) => EMOJI[category] || '🍱';

    // Pre-fill from user's default address
    const defaultAddr = user?.addresses?.find(a => a.isDefault) ?? user?.addresses?.[0];

    useEffect(() => {
        loadSettings();
        loadSuggestions();
        loadPopularItems();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadSettings = async () => {
        try {
            const data = await api.get('/settings');
            setSiteSettings(data);
        } catch (err) {
            console.error('Failed to load settings', err);
        } finally {
            setIsLoadingSettings(false);
        }
    };

    const loadSuggestions = async () => {
        setIsLoadingSuggestions(true);
        try {
            const [extras, beverages, desserts] = await Promise.all([
                api.get('/menu?category=extras'),
                api.get('/menu?category=entrantes'),
                api.get('/menu?category=postre'),
            ]);

            const all = [
                ...(extras.items || []),
                ...(beverages.items || []),
                ...(desserts.items || []),
            ];
            const filtered = all
                .filter(item => !items.find(cartItem => cartItem.id === String(item.id)))
                .slice(0, 8);
            setSuggestions(filtered);
        } catch (err) {
            console.error('Failed to load suggestions', err);
        } finally {
            setIsLoadingSuggestions(false);
        }
    };

    const loadPopularItems = async () => {
        setIsLoadingPopular(true);
        try {
            const [popularRes, promoRes] = await Promise.all([
                api.get('/menu?limit=6'), // Just get top items
                api.get('/menu?category=sets'), // We don't have a direct 'discount' filter in this simple API, so we fetch sets which are often promos
            ]);

            const popular = popularRes.items || [];
            // Assuming "sets" might contain some promos, or we just mix categories
            const promos = (promoRes.items || []).filter(
                (i: any) => i.is_promo || i.discount > 0 || i.category === 'sets'
            );

            // Combine and get unique
            const combinedMap = new Map();
            [...popular, ...promos].forEach((item: any) => combinedMap.set(item.id, item));

            const combined = Array.from(combinedMap.values()).slice(0, 6); // Top 6 items

            setPopularItems(combined);
        } catch (err) {
            console.error('Failed to load recommended items', err);
        } finally {
            setIsLoadingPopular(false);
        }
    };

    const handleAddToCart = (item: MenuItem, isSuggestion = false) => {
        const wasEmpty = items.length === 0;

        addItem({
            id: String(item.id),
            name: item.name,
            description: item.description || '',
            price: item.price,
            image: item.image,
            category: item.category as any,
        });

        if (isSuggestion) {
            setSuggestions(prev => prev.filter(p => p.id !== item.id));
        }

        if (wasEmpty) {
            setTimeout(() => {
                const lenis = (window as any).lenis;
                if (lenis) {
                    lenis.scrollTo(0, { duration: 1.5 });
                }
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }, 100);
        }
    };

    const handleOrder = async () => {
        if (!executeRecaptcha) {
            showError('reCAPTCHA no está listo. Por favor, inténtalo de nuevo.');
            return;
        }

        const streetVal =
            address.trim() ||
            (defaultAddr && defaultAddr.street
                ? `${defaultAddr.street}, ${defaultAddr.postalCode || ''} ${defaultAddr.city || ''}`
                : '');
        const houseVal = house.trim();
        const aptVal = apartment.trim();

        if (deliveryType === 'delivery') {
            if (!streetVal || streetVal.length < 3 || streetVal.includes('undefined')) {
                showError('Por favor, indica tu calle / dirección');
                return;
            }
            if (!houseVal) {
                showError('Por favor, indica tu portal/casa');
                return;
            }
            if (!aptVal) {
                showError('Por favor, indica tu piso/puerta');
                return;
            }
        }

        if (deliveryType === 'delivery' && total < MIN_ORDER) {
            showError(`El pedido mínimo para entrega es de ${MIN_ORDER.toFixed(2).replace('.', ',')} €`);
            return;
        }

        if (!paymentMethod) {
            showError('Por favor, selecciona un método de pago');
            return;
        }

        if (isStoreClosed) {
            showError(
                siteSettings?.closed_message || 'Lo sentimos, la tienda está cerrada ahora mismo.'
            );
            return;
        }

        const deliveryAddress =
            deliveryType === 'pickup'
                ? 'RECOGIDA EN LOCAL (Calle Barrilero, 20)'
                : `${streetVal}, Portal/Casa: ${houseVal}, Piso/Puerta: ${aptVal}`;
        const deliveryPhone = phone.trim() || user?.phone || '';
        if (!deliveryPhone || deliveryPhone.length < 6) {
            showError('Por favor, introduce un teléfono de contacto válido');
            return;
        }

        setIsOrdering(true);

        const notesArray = [];
        notesArray.push(`[TIPO: ${deliveryType === 'pickup' ? 'RECOGIDA EN LOCAL' : 'DOMICILIO'}]`);
        notesArray.push(`[MÉTODO DE PAGO: ${paymentMethod === 'card' ? 'TARJETA' : 'EFECTIVO'}]`);
        if (isScheduled && scheduledDate && scheduledTime) {
            notesArray.push(`[ENTREGA PROGRAMADA: ${scheduledDate} a las ${scheduledTime}]`);
        }
        if (noCall) notesArray.push('[NO LLAMAR ДЛЯ ПОДТВЕРЖДЕНИЯ]');
        if (noBuzzer) notesArray.push('[НЕ ЗВОНИТЬ В ДОМОФОН - ПОЗВОНИТЬ НА МОБИЛЬНЫЙ]');
        if (customNote.trim()) notesArray.push(customNote.trim());
        const notes = notesArray.join(' | ');

        try {
            const recaptchaToken = await executeRecaptcha('checkout');

            const orderPayload: any = {
                deliveryAddress,
                phoneNumber: deliveryPhone,
                notes,
                recaptchaToken,
            };

            if (!isAuthenticated) {
                orderPayload.guestItems = items.map(i => ({
                    menuItemId: parseInt(i.id),
                    quantity: i.quantity,
                }));
            }

            const data = await api.post('/orders', orderPayload);
            setOrderSuccess(data.order.id);
            clearCart();
            showSuccess('¡Pedido realizado con éxito! 🍣');

            if ('vibrate' in navigator) {
                navigator.vibrate(2000);
            }
        } catch (err) {
            showError(err instanceof ApiError ? err.message : 'Error al realizar el pedido');
        } finally {
            setIsOrdering(false);
        }
    };

    const handleInvite = async () => {
        if (items.length === 0) return;

        if (!executeRecaptcha) {
            showError('reCAPTCHA no está listo. Por favor, inténtalo de nuevo.');
            return;
        }

        const streetVal = address.trim();
        const houseVal = house.trim();
        const aptVal = apartment.trim();

        if (deliveryType === 'delivery') {
            if (!streetVal) {
                showError('Por favor, indica tu calle para el envío');
                return;
            }
            if (!houseVal) {
                showError('Por favor, indica tu portal/casa');
                return;
            }
            if (!aptVal) {
                showError('Por favor, indica tu piso/puerta');
                return;
            }
        }

        if (!paymentMethod) {
            showError('Por favor, selecciona un método de pago preferido');
            return;
        }

        const deliveryAddress =
            deliveryType === 'pickup'
                ? 'RECOGIDA EN LOCAL (Calle Barrilero, 20)'
                : `${streetVal}, Portal/Casa: ${houseVal}, Piso/Puerta: ${aptVal}`;
        const deliveryPhone = phone.trim() || user?.phone || '';
        if (!deliveryPhone || deliveryPhone.length < 6) {
            showError('Por favor, introduce un teléfono de contacto válido');
            return;
        }

        setIsInviting(true);

        const notesArray = [];
        notesArray.push(`[TIPO: ${deliveryType === 'pickup' ? 'RECOGIDA EN LOCAL' : 'DOMICILIO'}]`);
        notesArray.push(`[MÉTODO DE PAGO: ${paymentMethod === 'card' ? 'TARJETA' : 'EFECTIVO'}]`);
        if (isScheduled && scheduledDate && scheduledTime) {
            notesArray.push(`[ENTREGA PROGRAMADA: ${scheduledDate} a las ${scheduledTime}]`);
        }
        if (noCall) notesArray.push('[NO LLAMAR ДЛЯ ПОДТВЕРЖДЕНИЯ]');
        if (noBuzzer) notesArray.push('[НЕ ЗВОНИТЬ В ДОМОФОН - ПОЗВОНИТЬ НА МОБИЛЬНЫЙ]');
        if (customNote.trim()) notesArray.push(customNote.trim());
        const notes = notesArray.join(' | ');

        try {
            const recaptchaToken = await executeRecaptcha('invite');

            const payload: any = {
                deliveryAddress,
                phoneNumber: deliveryPhone,
                notes,
                senderName: user?.name || '',
                recaptchaToken,
            };

            if (!isAuthenticated) {
                payload.guestItems = items.map(i => ({
                    menuItemId: parseInt(i.id),
                    quantity: i.quantity,
                }));
            }

            const data = await api.post('/orders/invite', payload);

            const shareUrlWithCacheBust = `${data.shareUrl}?t=${Date.now()}`;

            if (navigator.share) {
                await navigator.share({
                    title: '¡Invítame a Sushi de Maksim! 🍣',
                    text: `¡Hola! He preparado este pedido de sushi y me encantaría que me invitases. ¿Te animas? 🍱✨\n\n${shareUrlWithCacheBust}`,
                    url: shareUrlWithCacheBust,
                });
            } else {
                await navigator.clipboard.writeText(shareUrlWithCacheBust);
                showInfo('¡Enlace de invitación copiado! ✨');
            }
        } catch (err) {
            showError(err instanceof ApiError ? err.message : 'Error al generar invitación');
        } finally {
            setIsInviting(false);
        }
    };

    const cartSubtotal = total;
    const deliveryCost = deliveryType === 'delivery' ? DELIVERY_FEE : 0;
    const finalTotal = cartSubtotal + deliveryCost;

    // ===== ORDER SUCCESS STATE =====
    if (orderSuccess !== null) {
        return (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-md animate-in fade-in duration-500">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="bg-white rounded-[40px] shadow-2xl p-10 max-w-md w-full text-center relative overflow-hidden border border-white"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full -mr-16 -mt-16 blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-red-500/5 rounded-full -ml-16 -mb-16 blur-3xl" />

                    <div className="w-24 h-24 bg-green-50 rounded-[32px] flex items-center justify-center mx-auto mb-8 relative shadow-inner border-2 border-white">
                        <CheckCircle size={48} strokeWidth={1.5} className="text-green-600" />
                    </div>

                    <h1 className="text-3xl font-black mb-3 text-gray-900 tracking-tight">
                        ¡Pedido exitoso!
                    </h1>
                    <p className="text-gray-500 font-medium mb-6 leading-relaxed">
                        Tu pedido{' '}
                        <span className="text-gray-900 font-black">
                            #{String(orderSuccess).padStart(5, '0')}
                        </span>{' '}
                        ha sido recibido y ya estamos preparando tus sushis con amor.
                    </p>

                    <div className="bg-gray-50/50 p-4 rounded-3xl border border-gray-100 mb-8 flex items-center justify-center gap-4">
                        <div className="flex flex-col items-center">
                            <span className="text-[10px] uppercase font-black text-gray-400 tracking-widest leading-none mb-1">
                                {deliveryType === 'pickup'
                                    ? 'Tiempo de preparación'
                                    : 'Entrega estimada'}
                            </span>
                            <span className="text-lg font-black text-red-600">
                                {deliveryType === 'pickup' ? '20 – 30 min' : '30 – 60 min'}
                            </span>
                        </div>
                    </div>

                    {deliveryType === 'pickup' && (
                        <div className="mb-8 p-6 bg-amber-50 rounded-3xl border border-amber-100 text-left animate-in fade-in slide-in-from-top-4 duration-700">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-amber-100 rounded-2xl text-amber-600">
                                    <Store size={24} strokeWidth={1.5} />
                                </div>
                                <div>
                                    <h4 className="text-amber-900 font-black uppercase tracking-tight mb-1 uppercase text-sm">
                                        Punto de Recogida
                                    </h4>
                                    <p className="text-sm text-amber-800 font-medium mb-4 italic">
                                        Calle Barrilero, 20, 28007 Madrid
                                    </p>

                                    <div className="pt-4 border-t border-amber-200/50">
                                        <p className="text-[10px] font-black text-amber-900/60 uppercase tracking-widest mb-2">
                                            Horario de recogida
                                        </p>
                                        <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-[11px] font-medium text-amber-800">
                                            <span>Miércoles – Viernes:</span>
                                            <span className="text-right">20:00 – 23:00</span>
                                            <span>Sábado:</span>
                                            <span className="text-right">
                                                14:00 – 17:00 | 20:00 – 23:00
                                            </span>
                                            <span>Domingo:</span>
                                            <span className="text-right">14:00 – 17:00</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col gap-3 relative z-10">
                        {isAuthenticated ? (
                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={() => navigate('/profile?tab=orders')}
                                    className="bg-red-600 text-white px-8 py-4 rounded-2xl font-black text-sm hover:bg-red-700 transition-all shadow-xl shadow-red-100 transform active:scale-95 flex items-center justify-center gap-2"
                                >
                                    Mis Pedidos
                                </button>
                                <Link
                                    to={`/track/${orderSuccess}?phone=${encodeURIComponent(phone || user?.phone || '')}`}
                                    className="bg-gray-900 text-white px-8 py-4 rounded-2xl font-black text-sm no-underline text-center hover:bg-black transition-all active:scale-95 flex items-center justify-center gap-2"
                                >
                                    Seguir mi pedido 🛵
                                </Link>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3">
                                <Link
                                    to={`/track/${orderSuccess}?phone=${encodeURIComponent(phone)}`}
                                    className="bg-red-600 text-white px-8 py-4 rounded-2xl font-black text-sm no-underline text-center hover:bg-red-700 transition-all shadow-xl shadow-red-100 transform active:scale-95"
                                >
                                    Seguir mi pedido 🛵
                                </Link>
                                <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl mb-2 flex flex-col items-center">
                                    <span className="text-amber-600 mb-1">🎁</span>
                                    <p className="text-xs text-amber-800 font-medium mb-3">
                                        ¡Regístrate ahora y consigue{' '}
                                        <strong>descuentos exclusivos</strong> en tus próximos
                                        pedidos!
                                    </p>
                                    <button
                                        onClick={() =>
                                            document.dispatchEvent(new Event('custom:openLogin'))
                                        }
                                        className="bg-gray-900 text-white w-full py-2.5 rounded-xl font-bold text-xs hover:bg-gray-800 transition transform active:scale-95"
                                    >
                                        Crear cuenta
                                    </button>
                                </div>
                            </div>
                        )}
                        <Link
                            to="/menu"
                            className="bg-gray-100 text-gray-700 px-8 py-4 rounded-2xl font-black text-sm no-underline text-center hover:bg-gray-200 transition-all active:scale-95"
                        >
                            Seguir comprando
                        </Link>
                    </div>
                </motion.div>
            </div>
        );
    }

    // Show skeleton ONLY if cart is actually loading its initial state
    // OR if we have items but are waiting for settings/settings loading
    if ((cartLoading && items.length === 0) || (items.length > 0 && isLoadingSettings)) {
        return <CartSkeleton />;
    }

    if (!cartLoading && items.length === 0) {
        return (
            <div className="min-h-screen bg-transparent px-4 py-8 flex items-center">
                <div className="max-w-4xl mx-auto text-center py-16 w-full">
                    <div className="flex justify-center mb-6">
                        <div className="w-24 h-24 bg-gray-50 rounded-[32px] flex items-center justify-center -rotate-12 shadow-sm border border-gray-100">
                            <ShoppingCart size={40} className="text-gray-400" strokeWidth={1.5} />
                        </div>
                    </div>
                    <h1 className="text-4xl font-bold mb-4 text-gray-900 tracking-tight">
                        Tu cesta está vacía
                    </h1>
                    <p className="text-gray-500 mb-8 max-w-md mx-auto">
                        <span className="block text-xl font-bold text-gray-900 mb-2">
                            Mira lo que tenemos para ti
                        </span>
                        Añade platos del menú o elige una de nuestras sugerencias a continuación
                        para hacer tu pedido.
                    </p>
                    <div className="flex flex-col items-center gap-4 mb-12">
                        <Link
                            to="/menu"
                            className="bg-red-600 text-white px-8 py-4 rounded-2xl no-underline font-black shadow-lg shadow-red-200 active:scale-95 transition-all w-full sm:w-auto"
                        >
                            Ver Menú Completo
                        </Link>

                        <motion.div
                            animate={{ y: [0, 10, 0] }}
                            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                            className="text-red-300 mt-8"
                        >
                            <ArrowDown size={32} strokeWidth={2} />
                        </motion.div>
                    </div>

                    {(popularItems.length > 0 || isLoadingPopular) && (
                        <div className="mt-12">
                            <div className="flex flex-col items-center justify-center gap-2 mb-8">
                                <span className="inline-block px-4 py-1.5 bg-red-50 text-red-600 text-xs font-black uppercase tracking-widest rounded-full mb-2">
                                    Recomendaciones
                                </span>
                                <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight m-0 flex items-center gap-3 w-full justify-center">
                                    <Flame
                                        size={28}
                                        strokeWidth={1.5}
                                        className="text-red-600 shrink-0"
                                    />
                                    <span className="truncate">Top Ventas y Ofertas</span>
                                    <Flame
                                        size={28}
                                        strokeWidth={1.5}
                                        className="text-red-600 shrink-0"
                                    />
                                </h2>
                            </div>
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8 text-left">
                                {isLoadingPopular
                                    ? [1, 2, 3, 4, 5, 6].map(i => (
                                          <div
                                              key={i}
                                              className="bg-white rounded-[32px] p-4 space-y-4 border border-gray-100"
                                          >
                                              <div className="aspect-[4/3] skeleton rounded-2xl" />
                                              <div className="space-y-2">
                                                  <div className="h-4 w-3/4 skeleton rounded" />
                                                  <div className="h-3 w-1/2 skeleton rounded" />
                                              </div>
                                              <div className="flex justify-between items-center pt-2">
                                                  <div className="h-6 w-16 skeleton rounded" />
                                                  <div className="h-10 w-24 skeleton rounded-xl" />
                                              </div>
                                          </div>
                                      ))
                                    : popularItems.map(item => (
                                          <div
                                              key={item.id}
                                              className="premium-card group relative flex flex-col h-full rounded-[24px] md:rounded-[32px] overflow-hidden"
                                          >
                                              <div className="aspect-[4/3] bg-gray-50 overflow-hidden relative">
                                                  {!failedImages.has(item.id) ? (
                                                      <img
                                                          src={item.image}
                                                          alt={item.name}
                                                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                          onError={() =>
                                                              setFailedImages(prev =>
                                                                  new Set(prev).add(item.id)
                                                              )
                                                          }
                                                      />
                                                  ) : (
                                                      <div className="w-full h-full bg-gradient-to-br from-gray-50 to-white flex items-center justify-center relative overflow-hidden group-hover:scale-110 transition-transform duration-700">
                                                          <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/asfalt-dark.png')]"></div>
                                                          <div className="absolute w-24 h-24 bg-red-500/10 rounded-full blur-2xl"></div>
                                                          <span className="text-4xl relative z-10 drop-shadow-2xl translate-y-2">
                                                              {getCategoryEmoji(item.category)}
                                                          </span>
                                                          <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent"></div>
                                                      </div>
                                                  )}
                                                  <div className="absolute top-2 right-2 md:top-3 md:right-3 bg-white/90 backdrop-blur-md text-[8px] md:text-[10px] font-black px-2 py-1 rounded-lg shadow-sm">
                                                      ★ TOP
                                                  </div>
                                              </div>
                                              <div className="p-3 md:p-6 flex flex-col flex-1">
                                                  <div className="mb-1 md:mb-2">
                                                      <h3 className="text-sm md:text-xl font-black text-gray-900 leading-tight line-clamp-2 md:line-clamp-1 h-8 md:h-auto">
                                                          {item.name}
                                                      </h3>
                                                  </div>
                                                  <p className="text-gray-500 text-[11px] md:text-sm leading-tight md:leading-relaxed mb-3 md:mb-6 line-clamp-2 min-h-[2.5rem] md:min-h-0 font-medium overflow-hidden">
                                                      {item.description}
                                                  </p>
                                                  <div className="mt-auto flex items-center justify-between gap-1">
                                                      <span className="text-base md:text-2xl font-black text-gray-900 whitespace-nowrap">
                                                          {item.price.toFixed(2).replace('.', ',')}{' '}
                                                          €
                                                      </span>
                                                      <button
                                                          onClick={() => handleAddToCart(item)}
                                                          className="h-8 w-8 md:h-11 md:w-auto md:px-6 rounded-lg md:rounded-2xl bg-gray-900 text-white hover:bg-red-600 hover:shadow-lg hover:shadow-red-200 active:scale-95 transition-all border-none cursor-pointer flex items-center justify-center gap-2"
                                                      >
                                                          <Plus size={16} strokeWidth={1.5} />
                                                          <span className="hidden md:inline">
                                                              Añadir
                                                          </span>
                                                      </button>
                                                  </div>
                                              </div>
                                          </div>
                                      ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-transparent flex flex-col">
            <SEO
                title="Tu Cesta"
                description="Finaliza tu pedido de sushi. Revisa tus platos, añade extras y disfruta del mejor sushi a domicilio."
            />

            <main className="flex-1 max-w-7xl mx-auto w-full px-2 md:px-4 py-6 sm:py-12">
                {isStoreClosed && (
                    <div className="mb-6 animate-in slide-in-from-top duration-500">
                        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-4">
                            <div className="p-3 bg-red-100 text-red-600 rounded-xl shrink-0">
                                <X size={24} strokeWidth={1.5} />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-red-900 leading-tight">
                                    Tienda Cerrada
                                </h3>
                                <p className="text-sm text-red-700">
                                    {siteSettings?.closed_message ||
                                        'Nuestra cocina está descansando. No es posible realizar pedidos en este momento.'}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <h1 className="text-3xl sm:text-4xl font-black text-gray-900 m-0 tracking-tight">
                        Tu cesta
                    </h1>
                    <button
                        onClick={clearCart}
                        className="text-sm font-bold text-gray-400 hover:text-red-600 transition-colors border-none bg-transparent cursor-pointer flex items-center gap-1 w-fit"
                    >
                        <Trash2 size={14} strokeWidth={1.5} /> Vaciar cesta
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 flex flex-col gap-4 md:gap-6 px-0 md:px-0">
                        <div className="bg-transparent md:bg-white md:rounded-xl md:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1)] p-0 md:p-6">
                            <div className="flex items-center justify-between mb-4 md:mb-6 px-4 md:px-0">
                                <h2 className="text-xl md:text-xl font-black m-0 uppercase tracking-tight">
                                    Productos ({items.length})
                                </h2>
                            </div>

                            <div className="flex flex-col gap-4">
                                {items.map(item => (
                                    <div
                                        key={item.id}
                                        className="relative flex items-center gap-3 p-3 bg-white border-b border-gray-50 last:border-none animate-in slide-in-from-left duration-300"
                                    >
                                        <div className="w-16 h-16 sm:w-16 sm:h-16 rounded-xl overflow-hidden shrink-0 bg-gray-50 flex items-center justify-center border border-gray-100 relative group/img">
                                            {!failedImages.has(item.id) ? (
                                                <img
                                                    src={item.image}
                                                    alt={`Producto ${item.name}`}
                                                    loading="lazy"
                                                    className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-500"
                                                    onError={() =>
                                                        setFailedImages(prev =>
                                                            new Set(prev).add(item.id)
                                                        )
                                                    }
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-gray-50 to-white flex items-center justify-center relative overflow-hidden group-hover/img:scale-110 transition-transform duration-500">
                                                    <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/asfalt-dark.png')]"></div>
                                                    <div className="absolute w-12 h-12 bg-red-500/5 rounded-full blur-xl"></div>
                                                    <span className="text-2xl relative z-10 drop-shadow-md">
                                                        {getCategoryEmoji(item.category)}
                                                    </span>
                                                    <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent"></div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-gray-900 leading-tight mb-1 md:mb-2 text-sm md:text-sm truncate">
                                                {item.name}
                                            </h3>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center bg-gray-50 rounded-lg p-0.5 border border-gray-100">
                                                    <button
                                                        onClick={() =>
                                                            item.quantity > 1
                                                                ? updateQuantity(
                                                                      item.id,
                                                                      item.quantity - 1
                                                                  )
                                                                : removeItem(item.id)
                                                        }
                                                        className="w-8 h-8 md:w-7 md:h-7 rounded-md bg-white border-none shadow-sm cursor-pointer flex items-center justify-center hover:text-red-600 active:scale-95 transition-all"
                                                    >
                                                        <Minus size={14} strokeWidth={1.5} />
                                                    </button>
                                                    <span className="w-8 md:w-8 text-center font-black text-gray-900 text-sm">
                                                        {item.quantity}
                                                    </span>
                                                    <button
                                                        onClick={() =>
                                                            updateQuantity(
                                                                item.id,
                                                                item.quantity + 1
                                                            )
                                                        }
                                                        className="w-8 h-8 md:w-7 md:h-7 rounded-md bg-white border-none shadow-sm cursor-pointer flex items-center justify-center hover:text-red-600 active:scale-95 transition-all"
                                                    >
                                                        <Plus size={14} strokeWidth={1.5} />
                                                    </button>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-base md:text-base font-black text-gray-900">
                                                        {(item.price * item.quantity)
                                                            .toFixed(2)
                                                            .replace('.', ',')}{' '}
                                                        €
                                                    </span>
                                                    <button
                                                        onClick={() => removeItem(item.id)}
                                                        className="text-gray-300 hover:text-red-500 cursor-pointer p-0 transition-colors flex items-center justify-center"
                                                        aria-label="Eliminar"
                                                    >
                                                        <X size={18} strokeWidth={1.5} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white md:rounded-xl shadow-[0_4px_10px_rgba(0,0,0,0.03)] md:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1)] px-3 py-5 md:p-6 mx-0 md:mx-0 rounded-[28px] md:rounded-xl">
                            <h2 className="text-lg md:text-xl font-bold mb-4 flex items-center gap-2">
                                <MapPin size={18} strokeWidth={1.5} className="text-red-600" />{' '}
                                Datos de entrega
                            </h2>

                            <div className="flex bg-gray-50 p-1.5 rounded-2xl mb-6 border border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setDeliveryType('delivery')}
                                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all ${
                                        deliveryType === 'delivery'
                                            ? 'bg-white text-red-600 shadow-sm border border-gray-100'
                                            : 'text-gray-400 hover:text-gray-500'
                                    }`}
                                >
                                    <Truck size={16} strokeWidth={2} />
                                    Domicilio
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setDeliveryType('pickup')}
                                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all ${
                                        deliveryType === 'pickup'
                                            ? 'bg-white text-red-600 shadow-sm border border-gray-100'
                                            : 'text-gray-400 hover:text-gray-500'
                                    }`}
                                >
                                    <Store size={16} strokeWidth={2} />
                                    Recogida
                                </button>
                            </div>

                            {deliveryType === 'pickup' && (
                                <div className="mb-6 p-4 bg-amber-50 rounded-2xl border border-amber-100 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-amber-100 rounded-xl text-amber-600">
                                            <Store size={20} strokeWidth={1.5} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-amber-900 uppercase tracking-tight mb-1">
                                                Punto de Recogida
                                            </p>
                                            <p className="text-sm text-amber-800 font-medium">
                                                Calle Barrilero, 20, 28007 Madrid
                                            </p>

                                            <div className="mt-4 pt-4 border-t border-amber-200/50">
                                                <p className="text-[10px] font-black text-amber-900/60 uppercase tracking-widest mb-2">
                                                    Horario de recogida
                                                </p>
                                                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] font-medium text-amber-800">
                                                    <span>Miércoles – Viernes:</span>
                                                    <span className="text-right">
                                                        20:00 – 23:00
                                                    </span>
                                                    <span>Sábado (Comida):</span>
                                                    <span className="text-right">
                                                        14:00 – 17:00
                                                    </span>
                                                    <span>Sábado (Cena):</span>
                                                    <span className="text-right">
                                                        20:00 – 23:00
                                                    </span>
                                                    <span>Domingo:</span>
                                                    <span className="text-right">
                                                        14:00 – 17:00
                                                    </span>
                                                    <span className="text-amber-900/40">
                                                        Lunes – Martes:
                                                    </span>
                                                    <span className="text-right text-amber-900/40">
                                                        Cerrado
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {deliveryType === 'delivery' &&
                                user?.addresses &&
                                user.addresses.length > 0 && (
                                    <div className="flex flex-col gap-2 mb-4">
                                        {user.addresses.map(addr => (
                                            <button
                                                key={addr.id}
                                                onClick={() => {
                                                    let s = addr.street || '';
                                                    let h = addr.house || '';
                                                    let a = addr.apartment || '';

                                                    if (s.includes(',') && !h && !a) {
                                                        const pts = s.split(',').map(p => p.trim());
                                                        if (pts.length >= 2) {
                                                            s = pts[0];
                                                            h = pts[1];
                                                            if (pts.length >= 3)
                                                                a = pts.slice(2).join(', ');
                                                        }
                                                    }

                                                    setAddress(s);
                                                    setHouse(h);
                                                    setApartment(a);
                                                    setPhone(prev => prev || addr.phone || '');
                                                }}
                                                type="button"
                                                className="flex items-center gap-2 text-sm bg-red-50 text-red-700 border border-red-200 rounded-xl px-3 py-3 cursor-pointer hover:bg-red-100 transition font-medium text-left w-full truncate"
                                            >
                                                <MapPin
                                                    size={16}
                                                    strokeWidth={1.5}
                                                    className="shrink-0"
                                                />
                                                <span className="truncate">
                                                    Usar "{addr.label || 'Mi dirección'}":{' '}
                                                    {addr.street}
                                                    {addr.house && `, Portal/Casa ${addr.house}`}
                                                    {addr.apartment &&
                                                        `, Piso/Puerta ${addr.apartment}`}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            <div className="flex flex-col gap-3">
                                {deliveryType === 'delivery' && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-600 mb-1">
                                                Calle / Avenida *
                                            </label>
                                            <input
                                                type="text"
                                                id="address-input"
                                                data-testid="address-input"
                                                value={address}
                                                onChange={e => setAddress(e.target.value)}
                                                placeholder={
                                                    defaultAddr && defaultAddr.street
                                                        ? `${defaultAddr.street}, ${defaultAddr.postalCode || ''} ${defaultAddr.city || ''}`
                                                        : 'Nombre de tu calle'
                                                }
                                                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400 focus:shadow-[0_0_0_3px_rgba(220,38,38,0.1)] transition bg-gray-50 focus:bg-white"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-600 mb-1">
                                                    Portal / Casa *
                                                </label>
                                                <input
                                                    type="text"
                                                    id="house-input"
                                                    data-testid="house-input"
                                                    value={house}
                                                    onChange={e => setHouse(e.target.value)}
                                                    placeholder="Ej: 15"
                                                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400 focus:shadow-[0_0_0_3px_rgba(220,38,38,0.1)] transition bg-gray-50 focus:bg-white"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-600 mb-1">
                                                    Piso / Puerta *
                                                </label>
                                                <input
                                                    type="text"
                                                    id="apartment-input"
                                                    data-testid="apartment-input"
                                                    value={apartment}
                                                    onChange={e => setApartment(e.target.value)}
                                                    placeholder="Ej: 3ºB"
                                                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400 focus:shadow-[0_0_0_3px_rgba(220,38,38,0.1)] transition bg-gray-50 focus:bg-white"
                                                />
                                            </div>
                                        </div>
                                    </>
                                )}

                                <div>
                                    <label className="block text-sm font-semibold text-gray-600 mb-1">
                                        Teléfono de contacto *
                                    </label>
                                    <input
                                        type="tel"
                                        id="phone-input"
                                        data-testid="phone-input"
                                        value={phone}
                                        onChange={e => setPhone(e.target.value)}
                                        placeholder={user?.phone || '+34 600 000 000'}
                                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400 focus:shadow-[0_0_0_3px_rgba(220,38,38,0.1)] transition bg-gray-50 focus:bg-white"
                                    />
                                </div>
                            </div>

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
                                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 accent-red-600 rounded cursor-pointer"
                                        checked={isScheduled}
                                        onChange={e => setIsScheduled(e.target.checked)}
                                    />
                                    🔥 Entrega programada (Opcional)
                                </label>

                                {isScheduled && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="grid grid-cols-2 gap-3 mt-2 overflow-hidden"
                                    >
                                        <div>
                                            <label className="block text-[10px] uppercase font-black text-gray-400 mb-1 ml-1 tracking-wider">
                                                Fecha
                                            </label>
                                            <input
                                                type="date"
                                                min={new Date().toISOString().split('T')[0]}
                                                value={scheduledDate}
                                                onChange={e => setScheduledDate(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-red-400 bg-white shadow-sm transition-all"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] uppercase font-black text-gray-400 mb-1 ml-1 tracking-wider">
                                                Hora
                                            </label>
                                            <input
                                                type="time"
                                                value={scheduledTime}
                                                onChange={e => setScheduledTime(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-red-400 bg-white shadow-sm transition-all"
                                            />
                                        </div>
                                    </motion.div>
                                )}
                            </div>

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
                                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400 focus:shadow-[0_0_0_3px_rgba(220,38,38,0.1)] transition bg-gray-50 focus:bg-white"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-8">
                        {isLoadingSuggestions ? (
                            <div className="bg-white rounded-xl shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1)] p-6">
                                <div className="h-6 w-32 bg-gray-100 animate-pulse rounded mb-4"></div>
                                <div className="space-y-4">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="flex gap-3 items-center">
                                            <div className="w-12 h-12 bg-gray-100 animate-pulse rounded"></div>
                                            <div className="flex-1 space-y-2">
                                                <div className="h-3 w-3/4 bg-gray-100 animate-pulse rounded"></div>
                                                <div className="h-3 w-1/4 bg-gray-100 animate-pulse rounded"></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : suggestions.length > 0 ? (
                            <div className="bg-white rounded-xl shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1)] px-2 py-4 md:p-6 animate-in fade-in duration-500">
                                <h3 className="text-base font-black mb-3 flex items-center gap-2 uppercase tracking-tight">
                                    <Sparkles
                                        size={16}
                                        strokeWidth={1.5}
                                        className="text-amber-500"
                                    />{' '}
                                    Extras
                                </h3>
                                <div className="flex flex-col gap-2">
                                    {suggestions.map(item => (
                                        <div
                                            key={String(item.id)}
                                            className="flex items-center gap-2 p-1.5 hover:bg-gray-50 rounded-xl transition-colors border border-transparent hover:border-gray-100"
                                        >
                                            <div className="w-12 h-12 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center border border-gray-100 group/sug">
                                                {!failedImages.has(item.id) ? (
                                                    <img
                                                        src={item.image}
                                                        alt={item.name}
                                                        className="w-full h-full object-cover group-hover/sug:scale-110 transition-transform duration-500"
                                                        onError={() =>
                                                            setFailedImages(prev =>
                                                                new Set(prev).add(item.id)
                                                            )
                                                        }
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-gradient-to-br from-gray-50 to-white flex items-center justify-center relative overflow-hidden group-hover/sug:scale-110 transition-transform duration-500">
                                                        <div className="absolute inset-0 opacity-[0.02] bg-[url('https://www.transparenttextures.com/patterns/asfalt-dark.png')]"></div>
                                                        <span className="text-xl relative z-10 drop-shadow-sm">
                                                            {getCategoryEmoji(item.category)}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0 pr-2">
                                                <p className="text-sm font-bold text-gray-900 truncate m-0 leading-tight">
                                                    {item.name}
                                                </p>
                                                <p className="text-[11px] text-red-600 font-black m-0">
                                                    {item.price.toFixed(2).replace('.', ',')} €
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => handleAddToCart(item, true)}
                                                className="bg-gray-900 text-white rounded-full p-1.5 hover:bg-red-600 transition-all shadow-sm flex items-center justify-center"
                                                title="Añadir al pedido"
                                            >
                                                <Plus size={14} strokeWidth={1.5} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : null}

                        <div className="bg-white md:rounded-xl shadow-[0_4px_10px_rgba(0,0,0,0.03)] md:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1)] p-5 md:p-6 sticky top-24 rounded-t-[32px] md:rounded-xl border-b md:border-none border-gray-50">
                            <h2 className="text-lg font-black mb-4 uppercase tracking-tight">
                                Resumen
                            </h2>

                            <div className="flex flex-col gap-3 mb-6">
                                <div className="flex justify-between text-gray-500">
                                    <span>
                                        Productos ({items.reduce((s, i) => s + i.quantity, 0)} uds.)
                                    </span>
                                    <span className="font-bold text-gray-900">
                                        {total.toFixed(2).replace('.', ',')} €
                                    </span>
                                </div>
                                {deliveryType === 'delivery' && (
                                    <div className="flex justify-between text-gray-500 animate-in fade-in duration-300">
                                        <span>Envío</span>
                                        <span className="font-bold text-gray-900">
                                            {DELIVERY_FEE.toFixed(2).replace('.', ',')} €
                                        </span>
                                    </div>
                                )}
                                <div className="border-t border-gray-200 pt-3 mt-1">
                                    <div className="flex justify-between text-lg font-bold">
                                        <span>Total</span>
                                        <div className="text-right">
                                            <span className="text-red-600">
                                                {finalTotal.toFixed(2).replace('.', ',')} €
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-6 pb-6 border-b border-gray-100">
                                <label className="block text-sm font-black text-gray-900 mb-3 uppercase tracking-tight">
                                    Método de Pago *
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => {
                                            setPaymentMethod('card');
                                            if ('vibrate' in navigator) navigator.vibrate(10);
                                        }}
                                        className={`group flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all duration-300 ${
                                            paymentMethod === 'card'
                                                ? 'border-red-600 bg-red-50/50 text-red-600 shadow-md scale-[1.02]'
                                                : 'border-gray-100 bg-gray-50 text-gray-400 hover:border-gray-200 hover:bg-gray-100/50'
                                        }`}
                                    >
                                        <div
                                            className={`p-3 rounded-xl transition-all duration-300 ${paymentMethod === 'card' ? 'bg-red-600 text-white shadow-lg shadow-red-200 rotate-3' : 'bg-white text-gray-400 border border-gray-100 group-hover:rotate-3'}`}
                                        >
                                            <CreditCard size={20} strokeWidth={2} />
                                        </div>
                                        <span
                                            className={`text-[10px] font-black uppercase tracking-wider transition-colors ${paymentMethod === 'card' ? 'text-red-600' : 'text-gray-500'}`}
                                        >
                                            Tarjeta
                                        </span>
                                    </button>
                                    <button
                                        onClick={() => {
                                            setPaymentMethod('cash');
                                            if ('vibrate' in navigator) navigator.vibrate(10);
                                        }}
                                        className={`group flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all duration-300 ${
                                            paymentMethod === 'cash'
                                                ? 'border-red-600 bg-red-50/50 text-red-600 shadow-md scale-[1.02]'
                                                : 'border-gray-100 bg-gray-50 text-gray-400 hover:border-gray-200 hover:bg-gray-100/50'
                                        }`}
                                    >
                                        <div
                                            className={`p-3 rounded-xl transition-all duration-300 ${paymentMethod === 'cash' ? 'bg-red-600 text-white shadow-lg shadow-red-200 -rotate-3' : 'bg-white text-gray-400 border border-gray-100 group-hover:-rotate-3'}`}
                                        >
                                            <Wallet size={20} strokeWidth={2} />
                                        </div>
                                        <span
                                            className={`text-[10px] font-black uppercase tracking-wider transition-colors ${paymentMethod === 'cash' ? 'text-red-600' : 'text-gray-500'}`}
                                        >
                                            Efectivo
                                        </span>
                                    </button>
                                </div>
                            </div>

                            <button
                                onClick={handleOrder}
                                disabled={isOrdering || isInviting || items.length === 0}
                                className="bg-red-600 text-white px-6 py-4 rounded-2xl font-black border-none cursor-pointer w-full mb-3 text-base hover:bg-red-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed shadow-xl shadow-red-200 flex items-center justify-center gap-2 active:scale-[0.98]"
                            >
                                {isOrdering ? (
                                    'Procesando...'
                                ) : (
                                    <>
                                        <span>Realizar pedido</span>
                                        <ArrowRight size={18} strokeWidth={2} />
                                    </>
                                )}
                            </button>

                            <button
                                onClick={() => {
                                    if (isAuthenticated) {
                                        handleInvite();
                                    } else {
                                        document.dispatchEvent(new Event('custom:openLogin'));
                                    }
                                }}
                                data-testid="invite-button"
                                disabled={isOrdering || isInviting || items.length === 0}
                                className="bg-amber-100 text-amber-800 px-6 py-4 rounded-2xl font-black border border-amber-200 cursor-pointer w-full mb-6 text-base hover:bg-amber-200 transition flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98]"
                            >
                                <Gift size={18} strokeWidth={2} className="text-amber-600" />
                                {isInviting ? 'Generando Enlace...' : '¡Que me inviten!'}
                            </button>

                            <Link
                                to="/menu"
                                className="bg-gray-100 text-gray-700 px-6 py-4 rounded-2xl font-black no-underline flex items-center justify-center gap-2 w-full hover:bg-gray-200 transition active:scale-[0.98]"
                            >
                                <ArrowLeft size={18} strokeWidth={2} />
                                Volver al menú
                            </Link>

                            <p className="text-[9px] text-gray-400 text-center leading-relaxed mt-4">
                                Este sitio está protegido por reCAPTCHA y se aplican la
                                <a
                                    href="https://policies.google.com/privacy"
                                    className="underline mx-1"
                                >
                                    Política de privacidad
                                </a>
                                y los
                                <a
                                    href="https://policies.google.com/terms"
                                    className="underline ml-1"
                                >
                                    Términos de servicio
                                </a>
                                de Google.
                            </p>

                            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                                <h3 className="text-base font-bold mb-2">Información de envío</h3>
                                <ul className="text-sm text-gray-500 m-0 pl-5 space-y-1">
                                    <li>Entrega segura a domicilio</li>
                                    <li>Tiempo de entrega: 30–60 min</li>
                                    <li>
                                        Horario: según el horario de apertura (
                                        <Link
                                            to="/contacts"
                                            className="text-red-600 hover:underline"
                                        >
                                            ver horarios
                                        </Link>
                                        )
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <div className="md:hidden sticky bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-gray-100 p-2 pb-6 z-50 animate-in slide-in-from-bottom duration-500">
                <div className="max-w-7xl mx-auto">
                    {isAuthenticated ? (
                        <button
                            onClick={handleOrder}
                            disabled={isOrdering || items.length === 0}
                            className="w-full bg-red-600 text-white h-14 rounded-2xl font-black text-base hover:bg-red-700 transition active:scale-95 disabled:bg-gray-400 shadow-xl shadow-red-200 flex items-center justify-center gap-4 px-6"
                        >
                            <div className="flex items-center gap-2">
                                {isOrdering ? (
                                    'Procesando...'
                                ) : (
                                    <>
                                        <span>Pedir</span>
                                        <CheckCircle size={20} strokeWidth={2} />
                                    </>
                                )}
                            </div>
                            <div className="bg-white/20 px-4 py-1.5 rounded-xl text-lg tabular-nums">
                                {finalTotal.toFixed(2).replace('.', ',')} €
                            </div>
                        </button>
                    ) : (
                        <Link
                            to="/"
                            className="w-full bg-gray-900 text-white h-14 rounded-2xl font-black text-base no-underline active:scale-95 flex items-center justify-center gap-4 px-6 shadow-xl shadow-gray-200"
                        >
                            <span className="flex items-center gap-2">
                                Inicia sesión para pedir{' '}
                                <ArrowLeft className="rotate-180" size={18} strokeWidth={2} />
                            </span>
                            <div className="bg-white/10 px-4 py-1.5 rounded-xl text-lg">
                                {finalTotal.toFixed(2).replace('.', ',')} €
                            </div>
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}
