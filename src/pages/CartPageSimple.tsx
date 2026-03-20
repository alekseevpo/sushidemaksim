import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { api } from '../utils/api';
import { useToast } from '../context/ToastContext';
import SEO from '../components/SEO';
import { CartSkeleton } from '../components/skeletons/CartSkeleton';
import AddressModal from '../components/AddressModal';

// Modular Components
import CartItemList from '../components/cart/CartItemList';
import DeliveryForm from '../components/cart/DeliveryForm';
import CartSummary from '../components/cart/CartSummary';
import OrderSuccessModal from '../components/cart/OrderSuccessModal';
import CartSuggestions from '../components/cart/CartSuggestions';
import CartEmptyView from '../components/cart/CartEmptyView';

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
        isLoading: cartLoading,
        updateQuantity,
        removeItem,
        clearCart,
        addItem,
    } = useCart();
    const { isAuthenticated, user } = useAuth();
    const { success: showSuccess, error: showError, info: showInfo } = useToast();

    const [suggestions, setSuggestions] = useState<MenuItem[]>([]);
    const [popularItems, setPopularItems] = useState<MenuItem[]>([]);
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
    const [isLoadingPopular, setIsLoadingPopular] = useState(false);

    const [address, setAddress] = useState('');
    const [customerNameState, setCustomerNameState] = useState('');
    const [guestEmailState, setGuestEmailState] = useState('');
    const [house, setHouse] = useState('');
    const [apartment, setApartment] = useState('');
    const [phone, setPhone] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [isOrdering, setIsOrdering] = useState(false);
    const [isInviting, setIsInviting] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState<number | null>(null);
    const [orderWhatsappUrl, setOrderWhatsappUrl] = useState<string | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | null>(null);
    const [siteSettings, setSiteSettings] = useState<any>(null);
    const [isLoadingSettings, setIsLoadingSettings] = useState(true);

    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
    const [selectedZone, setSelectedZone] = useState<any>(null);
    const [deliveryZones, setDeliveryZones] = useState<any[]>([]);

    const [noCall, setNoCall] = useState(false);
    const [noBuzzer, setNoBuzzer] = useState(false);
    const [isScheduled, setIsScheduled] = useState(false);
    const [customNote, setCustomNote] = useState('');
    const [failedImages, setFailedImages] = useState<Set<string | number>>(new Set());
    const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup'>('delivery');
    const [addedItems, setAddedItems] = useState<Set<number>>(new Set());

    const todayStr = new Date().toISOString().split('T')[0];

    const DELIVERY_FEE = selectedZone
        ? (selectedZone.cost ?? 0)
        : (siteSettings?.delivery_fee ?? 3.5);
    const MIN_ORDER = selectedZone
        ? (selectedZone.min_order ?? 0)
        : (siteSettings?.min_order ?? 15);
    const FREE_DELIVERY_THRESHOLD = selectedZone
        ? (selectedZone.free_threshold ?? siteSettings?.free_delivery_threshold ?? 60)
        : (siteSettings?.free_delivery_threshold ?? 60);
    const isStoreClosed = !!siteSettings?.is_store_closed;

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

    const [scheduledDate, setScheduledDate] = useState(todayStr);
    const [scheduledTime, setScheduledTime] = useState('');

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const [settingsData, zonesData] = await Promise.all([
                    api.get('/settings'),
                    api.get('/delivery-zones'),
                ]);
                setSiteSettings(settingsData);
                setDeliveryZones(zonesData.zones || []);
            } catch (err) {
                console.error('Failed to load initial data', err);
            } finally {
                setIsLoadingSettings(false);
            }
        };
        loadInitialData();
    }, []);

    useEffect(() => {
        if (items.length === 0) {
            loadPopularItems();
        } else {
            loadSuggestions();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [items.length]);

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
            const data = await api.get('/menu?limit=6');
            setPopularItems(data.items || []);
        } catch (err) {
            console.error('Failed to load recommended items', err);
        } finally {
            setIsLoadingPopular(false);
        }
    };

    const handleAddToCart = async (item: MenuItem, isSuggestion = false) => {
        try {
            await addItem({
                id: String(item.id),
                name: item.name,
                description: item.description || '',
                price: item.price,
                image: item.image,
                category: item.category as any,
            });

            setAddedItems(prev => new Set(prev).add(item.id));
            if (isSuggestion) {
                setSuggestions(prev => prev.filter(p => p.id !== item.id));
            }
            if ('vibrate' in navigator) navigator.vibrate(15);

            setTimeout(() => {
                setAddedItems(prev => {
                    const n = new Set(prev);
                    n.delete(item.id);
                    return n;
                });
            }, 1200);
        } catch (err) {
            showError('No se pudo añadir el producto al carrito');
        }
    };

    const handleOrder = async () => {
        const streetVal = address.trim();
        const houseVal = house.trim();
        const aptVal = apartment.trim();

        if (deliveryType === 'delivery') {
            if (!streetVal || streetVal.length < 3) return showError('Indica tu calle / dirección');
            if (!houseVal) return showError('Indica tu portal/casa');
            if (!aptVal) return showError('Indica tu piso/puerta');
            if (total < MIN_ORDER) return showError(`El pedido mínimo es de ${MIN_ORDER.toFixed(2).replace('.', ',')}€`);
        }

        if (!paymentMethod) return showError('Selecciona un método de pago');

        const deliveryPhone = phone.trim() || user?.phone || '';
        if (!deliveryPhone || deliveryPhone.length < 9) return showError('Teléfono no válido');

        setIsOrdering(true);

        const notesArray = [];
        notesArray.push(`[TIPO: ${deliveryType === 'pickup' ? 'RECOGIDA' : 'DOMICILIO'}]`);
        notesArray.push(`[PAGO: ${paymentMethod === 'card' ? 'TARJETA' : 'EFECTIVO'}]`);
        if (isStoreClosed) notesArray.push('[PRE-ORDEN: Restaurante cerrado]');
        if (isScheduled && scheduledDate && scheduledTime)
            notesArray.push(`[PROGRAMADO: ${scheduledDate} ${scheduledTime}]`);
        if (noCall) notesArray.push('[SIN CONFIRMACIÓN LLAMADA]');
        if (noBuzzer) notesArray.push('[NO LLAMAR TIMBRE]');
        if (customNote.trim()) notesArray.push(customNote.trim());

        try {
            const payload: any = {
                deliveryAddress:
                    deliveryType === 'pickup'
                        ? 'RECOGIDA'
                        : `${streetVal}, ${houseVal}, ${aptVal}, CP: ${postalCode}`,
                phoneNumber: deliveryPhone,
                customerName: isAuthenticated ? user?.name || '' : customerNameState,
                email: isAuthenticated ? user?.email || '' : guestEmailState,
                postalCode: postalCode || (selectedZone ? selectedZone.postal_codes?.[0] : ''),
                notes: notesArray.join(' | '),
                deliveryZoneId: selectedZone?.id,
            };

            if (!isAuthenticated) {
                payload.guestItems = items.map(i => ({
                    menuItemId: parseInt(i.id),
                    quantity: i.quantity,
                }));
            }

            const data = await api.post('/orders', payload);
            setOrderSuccess(data.order.id);
            setOrderWhatsappUrl(data.whatsappUrl || null);
            clearCart();
            showSuccess('¡Pedido realizado! 🍣');
            if ('vibrate' in navigator) navigator.vibrate([100, 50, 100]);
        } catch (err: any) {
            showError(err.message || 'Error al realizar el pedido');
        } finally {
            setIsOrdering(false);
        }
    };

    const handleInvite = async () => {
        if (items.length === 0) return;
        if (deliveryType === 'delivery' && !address.trim()) {
            return showError('Por favor, indica tu calle para el envío');
        }
        setIsInviting(true);

        const notesArray = [];
        notesArray.push(`[TIPO: ${deliveryType === 'pickup' ? 'RECOGIDA' : 'DOMICILIO'}]`);
        if (paymentMethod) notesArray.push(`[MÉTODO DE PAGO: ${paymentMethod === 'card' ? 'TARJETA' : 'EFECTIVO'}]`);
        if (isStoreClosed) notesArray.push('[PRE-ORDEN: Restaurante cerrado]');
        if (customNote.trim()) notesArray.push(customNote.trim());

        try {
            const payload: any = {
                deliveryAddress: deliveryType === 'pickup' ? 'RECOGIDA' : `${address}${house ? `, Portal: ${house}` : ''}${apartment ? `, Piso: ${apartment}` : ''}`,
                phoneNumber: phone || user?.phone || '',
                senderName: user?.name || '',
                notes: notesArray.join(' | '),
            };
            if (!isAuthenticated) {
                payload.guestItems = items.map(i => ({
                    menuItemId: parseInt(i.id),
                    quantity: i.quantity,
                }));
            }
            const data = await api.post('/orders/invite', payload);
            if (navigator.share) {
                await navigator.share({
                    title: 'Sushi de Maksim',
                    text: '¡Invítame!',
                    url: data.shareUrl,
                });
            } else {
                await navigator.clipboard.writeText(data.shareUrl);
                showInfo('Enlace copiado! 📋');
            }
        } catch (err) {
            showError('Error al generar invitación');
        } finally {
            setIsInviting(false);
        }
    };

    const cartSubtotal = Number(total) || 0;
    const deliveryCost =
        deliveryType === 'delivery'
            ? cartSubtotal >= Number(FREE_DELIVERY_THRESHOLD)
                ? 0
                : Number(DELIVERY_FEE)
            : 0;
    const finalTotal = cartSubtotal + deliveryCost;

    if ((cartLoading && items.length === 0) || (items.length > 0 && isLoadingSettings))
        return <CartSkeleton />;

    if (!cartLoading && items.length === 0) {
        return (
            <CartEmptyView
                popularItems={popularItems}
                isLoadingPopular={isLoadingPopular}
                handleAddToCart={handleAddToCart}
                getCategoryEmoji={getCategoryEmoji}
                failedImages={failedImages}
                setFailedImages={setFailedImages}
                addedItems={addedItems}
            />
        );
    }

    return (
        <div className="min-h-screen bg-transparent flex flex-col">
            <SEO title="Tu Cesta" description="Finaliza tu pedido de sushi." />

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
                                        'Nuestra cocina está descansando.'}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-8 tracking-tight px-4 md:px-0">
                    Tu cesta
                </h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 flex flex-col gap-6">
                        <CartItemList
                            items={items}
                            updateQuantity={updateQuantity}
                            removeItem={removeItem}
                            clearCart={clearCart}
                            getCategoryEmoji={getCategoryEmoji}
                            failedImages={failedImages}
                            setFailedImages={setFailedImages}
                        />

                        <DeliveryForm
                            deliveryType={deliveryType}
                            setDeliveryType={setDeliveryType}
                            address={address}
                            setAddress={setAddress}
                            house={house}
                            setHouse={setHouse}
                            apartment={apartment}
                            setApartment={setApartment}
                            postalCode={postalCode}
                            setPostalCode={setPostalCode}
                            phone={phone}
                            setPhone={setPhone}
                            customerNameState={customerNameState}
                            setCustomerNameState={setCustomerNameState}
                            guestEmailState={guestEmailState}
                            setGuestEmailState={setGuestEmailState}
                            paymentMethod={paymentMethod}
                            setPaymentMethod={setPaymentMethod}
                            isScheduled={isScheduled}
                            setIsScheduled={setIsScheduled}
                            scheduledDate={scheduledDate}
                            setScheduledDate={setScheduledDate}
                            scheduledTime={scheduledTime}
                            setScheduledTime={setScheduledTime}
                            noCall={noCall}
                            setNoCall={setNoCall}
                            noBuzzer={noBuzzer}
                            setNoBuzzer={setNoBuzzer}
                            customNote={customNote}
                            setCustomNote={setCustomNote}
                            selectedZone={selectedZone}
                            setIsAddressModalOpen={setIsAddressModalOpen}
                            user={user}
                            isAuthenticated={isAuthenticated}
                            todayStr={todayStr}
                        />
                    </div>

                    <div className="flex flex-col gap-8">
                        <CartSuggestions
                            suggestions={suggestions}
                            isLoadingSuggestions={isLoadingSuggestions}
                            handleAddToCart={handleAddToCart}
                            getCategoryEmoji={getCategoryEmoji}
                            failedImages={failedImages}
                            setFailedImages={setFailedImages}
                        />
                        <CartSummary
                            items={items}
                            total={total}
                            deliveryType={deliveryType}
                            deliveryCost={deliveryCost}
                            finalTotal={finalTotal}
                            isStoreClosed={isStoreClosed}
                            isOrdering={isOrdering}
                            isInviting={isInviting}
                            isAuthenticated={isAuthenticated}
                            handleOrder={handleOrder}
                            handleInvite={handleInvite}
                        />
                    </div>
                </div>
            </main>

            <AddressModal
                isOpen={isAddressModalOpen}
                onClose={() => setIsAddressModalOpen(false)}
                onSelect={res => {
                    setAddress(res.address);
                    setPostalCode(res.postalCode);
                    setSelectedZone(res.zone);
                }}
                deliveryZones={deliveryZones}
            />

            {orderSuccess && (
                <OrderSuccessModal
                    orderId={orderSuccess}
                    phone={phone || user?.phone || ''}
                    isAuthenticated={isAuthenticated}
                    user={user}
                    isScheduled={isScheduled}
                    scheduledDate={scheduledDate}
                    scheduledTime={scheduledTime}
                    deliveryType={deliveryType}
                    address={address}
                    house={house}
                    apartment={apartment}
                    orderWhatsappUrl={orderWhatsappUrl}
                />
            )}
        </div>
    );
}
