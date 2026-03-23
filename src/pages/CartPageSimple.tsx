import { useState, useEffect, useCallback } from 'react';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { api } from '../utils/api';
import { useToast } from '../context/ToastContext';
import SEO from '../components/SEO';
import { isStoreOpen, isTimeWithinBusinessHours } from '../utils/storeStatus';
import { CartSkeleton } from '../components/skeletons/CartSkeleton';
import AddressModal from '../components/AddressModal';

// Modular Components
import CartItemList from '../components/cart/CartItemList';
import DeliveryForm from '../components/cart/DeliveryForm';
import CartSummary from '../components/cart/CartSummary';
import OrderSuccessModal from '../components/cart/OrderSuccessModal';
import CartSuggestions from '../components/cart/CartSuggestions';
import CartEmptyView from '../components/cart/CartEmptyView';
import { useScrollLock } from '../hooks/useScrollLock';
import { funnelTracker } from '../analytics/funnel';

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
        deliveryDetails,
        updateDeliveryDetails,
    } = useCart();

    const { isAuthenticated, user } = useAuth();
    const { success: showSuccess, error: showError, info: showInfo } = useToast();

    const cartSubtotal = Number(total) || 0;
    const [promoCode, setPromoCode] = useState('');
    const [promoDiscount, setPromoDiscount] = useState<number | null>(null);
    const [promoError, setPromoError] = useState<string | null>(null);

    const discountAmount = promoDiscount ? (cartSubtotal * promoDiscount) / 100 : 0;
    const { deliveryType, selectedZone } = deliveryDetails;

    // We need siteSettings for these. But they are loaded in useEffect.
    // I'll keep them where they are if they need it, or move siteSettings load to useCart?
    // Actually, I can just calculate them later OR handle nulls.

    const [isOrdering, setIsOrdering] = useState(false);
    const [isInviting, setIsInviting] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState<number | null>(null);
    const [orderWhatsappUrl, setOrderWhatsappUrl] = useState<string | null>(null);
    const [isLoadingSettings, setIsLoadingSettings] = useState(true);

    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
    const [deliveryZones, setDeliveryZones] = useState<any[]>([]);

    const [failedImages, setFailedImages] = useState<Set<string | number>>(new Set());
    const [addedItems, setAddedItems] = useState<Set<number>>(new Set());

    const [suggestions, setSuggestions] = useState<MenuItem[]>([]);
    const [popularItems, setPopularItems] = useState<MenuItem[]>([]);
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
    const [isLoadingPopular, setIsLoadingPopular] = useState(false);
    const [siteSettings, setSiteSettings] = useState<any>(null);

    const [isApplyingPromo, setIsApplyingPromo] = useState(false);

    const todayStr = new Date().toISOString().split('T')[0];

    const {
        address,
        house,
        apartment,
        phone,
        postalCode,
        customerName: customerNameState,
        guestEmail: guestEmailState,
        paymentMethod,
        noCall,
        noBuzzer,
        isScheduled,
        scheduledDate,
        scheduledTime,
        customNote,
        saveAddress,
    } = deliveryDetails;

    const MIN_ORDER = selectedZone ? (selectedZone.minOrder ?? 0) : (siteSettings?.minOrder ?? 15);
    const isManualClosed = !!siteSettings?.is_store_closed;
    const isOpenNow = isStoreOpen();
    const isStoreClosed = isManualClosed || !isOpenNow;

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

    useScrollLock(isAddressModalOpen || !!orderSuccess);

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

    const loadSuggestions = useCallback(async () => {
        if (suggestions.length > 0) return;

        setIsLoadingSuggestions(true);
        try {
            const data = await api.get('/menu?category=extras');
            const all = data.items || [];

            // Filter out items already in cart
            const filtered = all
                .filter((item: any) => !items.find(cartItem => cartItem.id === String(item.id)))
                .slice(0, 10);

            setSuggestions(filtered);
        } catch (err) {
            console.error('Failed to load suggestions', err);
        } finally {
            setIsLoadingSuggestions(false);
        }
    }, [items, suggestions.length]);

    const loadPopularItems = useCallback(async () => {
        setIsLoadingPopular(true);
        try {
            const data = await api.get('/menu?limit=6');
            setPopularItems(data.items || []);
        } catch (err) {
            console.error('Failed to load recommended items', err);
        } finally {
            setIsLoadingPopular(false);
        }
    }, []);

    useEffect(() => {
        if (items.length === 0) {
            loadPopularItems();
        } else if (suggestions.length === 0) {
            // Only load suggestions if we don't have any yet
            loadSuggestions();
        }
    }, [items.length, suggestions.length, loadSuggestions, loadPopularItems]);

    // Analytics: Track cart view
    useEffect(() => {
        if (!cartLoading && items.length > 0) {
            funnelTracker.trackStep('cart_view', {
                totalValue: cartSubtotal,
                itemsCount: items.reduce((s, i) => s + i.quantity, 0),
                userId: user?.id,
            });
        }
    }, [cartLoading, items, cartSubtotal, user?.id]);

    const handleAddToCart = async (item: MenuItem, quantity: number = 1, isSuggestion = false) => {
        try {
            // Map our local MenuItem to the global SushiItem type
            const sushiItem = {
                id: String(item.id),
                name: item.name,
                description: item.description || '',
                price: item.price,
                image: item.image,
                category: item.category as any,
            };

            await addItem(sushiItem, quantity);

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
            }, 1600);
        } catch (err) {
            showError('No se pudo añadir el producto al carrito');
        }
    };

    const handleApplyPromo = async (code: string) => {
        if (!code.trim()) return;
        setIsApplyingPromo(true);
        setPromoError(null);
        try {
            const data = await api.post('/promo/validate', {
                code: code.trim().toUpperCase(),
                subtotal: cartSubtotal,
            });
            setPromoDiscount(data.percentage);
            setPromoCode(code.trim().toUpperCase());
            showSuccess(`¡Código aplicado! -${data.percentage}%`);
        } catch (err: any) {
            setPromoError(err.message || 'Código inválido');
            setPromoDiscount(null);
            showError(err.message || 'Código inválido o requisitos no cumplidos');
        } finally {
            setIsApplyingPromo(false);
        }
    };

    const handleRemovePromo = () => {
        setPromoCode('');
        setPromoDiscount(null);
        setPromoError(null);
    };

    useEffect(() => {
        // If welcome promo is applied and subtotal drops below 70, invalidate it
        if (promoDiscount && promoCode.startsWith('NUEVO') && cartSubtotal < 70) {
            handleRemovePromo();
            setPromoError('El código de bienvenida requiere un pedido mínimo de 70,00€');
        }
    }, [cartSubtotal, promoCode, promoDiscount]);

    const handleOrder = async () => {
        console.log('--- HANDLE ORDER ---');
        console.log('deliveryType:', deliveryType);
        console.log('total:', total);
        console.log('MIN_ORDER:', MIN_ORDER);
        console.log('selectedZone:', selectedZone?.name);

        const streetVal = address.trim();
        const houseVal = house.trim();
        const aptVal = apartment.trim();

        if (deliveryType === 'delivery') {
            if (!streetVal || streetVal.length < 3) return showError('Indica tu calle / dirección');
            if (!houseVal) return showError('Indica tu portal/casa');
            if (!aptVal) return showError('Indica tu piso / puerta');
        }

        if (!paymentMethod) return showError('Selecciona un método de pago');

        const deliveryPhone = phone.trim() || user?.phone || '';
        if (!deliveryPhone || deliveryPhone.length < 9) return showError('Teléfono no válido');

        // Business Hour Validation
        if (isStoreClosed && !isScheduled) {
            return showError(
                'Nuestra cocina está descansando en este momento, ¡pero estaremos encantados de preparar tu pedido anticipado! Por favor, selecciona "Entrega programada".'
            );
        }

        if (isScheduled && scheduledDate && scheduledTime) {
            const date = new Date(scheduledDate);
            if (!isTimeWithinBusinessHours(date, scheduledTime)) {
                return showError(
                    'La hora seleccionada está fuera de nuestro horario de servicio. ¡Por favor, elige un momento en el que nuestros chefs estén en la cocina!'
                );
            }
        }

        // Analytics: Track checkout start
        funnelTracker.trackStep('checkout_start', {
            totalValue: cartSubtotal,
            itemsCount: items.reduce((s, i) => s + i.quantity, 0),
            userId: user?.id,
            metadata: { deliveryType, paymentMethod },
        });

        setIsOrdering(true);

        const notesArray = [];
        notesArray.push(`[TIPO: ${deliveryType === 'pickup' ? 'RECOGIDA' : 'DOMICILIO'}]`);
        notesArray.push(`[MÉTODO DE PAGO: ${paymentMethod === 'card' ? 'TARJETA' : 'EFECTIVO'}]`);
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
                postalCode: postalCode || (selectedZone ? selectedZone.postalCodes?.[0] : ''),
                notes: notesArray.join(' | '),
                deliveryZoneId: selectedZone?.id,
                promoCode: promoDiscount ? promoCode : undefined,
            };

            if (!isAuthenticated) {
                payload.guestItems = items.map(i => ({
                    menuItemId: parseInt(i.id),
                    quantity: i.quantity,
                }));
            }

            const data = await api.post('/orders', payload);

            // Save address if requested
            if (isAuthenticated && saveAddress && deliveryType === 'delivery') {
                try {
                    await api.post('/user/addresses', {
                        street: streetVal,
                        house: houseVal,
                        apartment: aptVal,
                        postalCode:
                            postalCode || (selectedZone ? selectedZone.postalCodes?.[0] : ''),
                        phone: deliveryPhone,
                        label: 'Ultima dirección',
                    });
                } catch (saveErr) {
                    console.error('Failed to save address to profile', saveErr);
                }
            }

            // Analytics: Track order placed
            funnelTracker.trackStep('order_placed', {
                totalValue: cartSubtotal,
                itemsCount: items.reduce((s, i) => s + i.quantity, 0),
                userId: user?.id,
                metadata: { orderId: data.order.id },
            });

            setOrderSuccess(data.order.id);
            setOrderWhatsappUrl(data.whatsappUrl || null);
            clearCart();

            // Reset for next order session
            funnelTracker.resetSession();

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
        if (paymentMethod)
            notesArray.push(
                `[MÉTODO DE PAGO: ${paymentMethod === 'card' ? 'TARJETA' : 'EFECTIVO'}]`
            );
        if (isStoreClosed) notesArray.push('[PRE-ORDEN: Restaurante cerrado]');
        if (customNote.trim()) notesArray.push(customNote.trim());

        try {
            const payload: any = {
                deliveryAddress:
                    deliveryType === 'pickup'
                        ? 'RECOGIDA'
                        : `${address}${house ? `, Portal: ${house}` : ''}${apartment ? `, Piso: ${apartment}` : ''}`,
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
                showInfo('Enlace de invitación generado! 📋');
            }
        } catch (err) {
            showError('Error al generar invitación');
        } finally {
            setIsInviting(false);
        }
    };

    const deliveryCost =
        deliveryType === 'delivery'
            ? cartSubtotal >=
              (selectedZone
                  ? (selectedZone.free_threshold ?? siteSettings?.free_delivery_threshold ?? 60)
                  : (siteSettings?.free_delivery_threshold ?? 60))
                ? 0
                : selectedZone
                  ? (selectedZone.cost ?? 0)
                  : (siteSettings?.delivery_fee ?? 3.5)
            : 0;
    const finalTotal = cartSubtotal - discountAmount + deliveryCost;

    return (
        <div className="min-h-screen bg-transparent flex flex-col">
            <SEO title="Tu Cesta" description="Finaliza tu pedido de sushi." />

            {(cartLoading && items.length === 0) || (items.length > 0 && isLoadingSettings) ? (
                <CartSkeleton />
            ) : items.length === 0 ? (
                <CartEmptyView
                    popularItems={popularItems}
                    isLoadingPopular={isLoadingPopular}
                    handleAddToCart={handleAddToCart}
                    getCategoryEmoji={getCategoryEmoji}
                    failedImages={failedImages}
                    setFailedImages={setFailedImages}
                    addedItems={addedItems}
                />
            ) : (
                <main className="flex-1 max-w-7xl mx-auto w-full px-2 md:px-4 py-6 sm:py-12">
                    {isStoreClosed && (
                        <div className="mb-6 animate-in slide-in-from-top duration-500">
                            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 md:p-6">
                                <div className="flex-1">
                                    <h3 className="font-bold text-red-900 leading-tight mb-2">
                                        Tienda Cerrada
                                    </h3>
                                    <p className="text-sm text-red-700 whitespace-pre-line leading-relaxed">
                                        {isManualClosed
                                            ? siteSettings?.closed_message ||
                                              'Nuestra cocina está tomando un breve descanso, ¡encantados de atenderte pronto!'
                                            : 'Actualmente nuestra cocina está fuera de servicio, ¡pero no te preocupes!'}
                                        {'\n\n'}**Estaremos encantados de recibir tu pedido
                                        programado.** Selecciona la opción "Entrega programada" más
                                        abajo para que podamos entregártelo en nuestro próximo
                                        horario de apertura.
                                        {'\n\n'}
                                        **Horario de Servicio:**
                                        {'\n'}• Miércoles a Viernes: 20:00 – 23:00
                                        {'\n'}• Sábado (Comida): 14:00 – 17:00
                                        {'\n'}• Sábado (Cena): 20:00 – 23:00
                                        {'\n'}• Domingo: 14:00 – 17:00
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
                                setDeliveryType={val =>
                                    updateDeliveryDetails({ deliveryType: val })
                                }
                                address={address}
                                setAddress={val => updateDeliveryDetails({ address: val })}
                                house={house}
                                setHouse={val => updateDeliveryDetails({ house: val })}
                                apartment={apartment}
                                setApartment={val => updateDeliveryDetails({ apartment: val })}
                                postalCode={postalCode}
                                setPostalCode={val => updateDeliveryDetails({ postalCode: val })}
                                phone={phone}
                                setPhone={val => updateDeliveryDetails({ phone: val })}
                                customerNameState={customerNameState}
                                setCustomerNameState={val =>
                                    updateDeliveryDetails({ customerName: val })
                                }
                                guestEmailState={guestEmailState}
                                setGuestEmailState={val =>
                                    updateDeliveryDetails({ guestEmail: val })
                                }
                                paymentMethod={paymentMethod}
                                setPaymentMethod={val =>
                                    updateDeliveryDetails({ paymentMethod: val })
                                }
                                isScheduled={isScheduled}
                                setIsScheduled={val => updateDeliveryDetails({ isScheduled: val })}
                                scheduledDate={scheduledDate}
                                setScheduledDate={val =>
                                    updateDeliveryDetails({ scheduledDate: val })
                                }
                                scheduledTime={scheduledTime}
                                setScheduledTime={val =>
                                    updateDeliveryDetails({ scheduledTime: val })
                                }
                                noCall={noCall}
                                setNoCall={val => updateDeliveryDetails({ noCall: val })}
                                noBuzzer={noBuzzer}
                                setNoBuzzer={val => updateDeliveryDetails({ noBuzzer: val })}
                                customNote={customNote}
                                setCustomNote={val => updateDeliveryDetails({ customNote: val })}
                                selectedZone={selectedZone}
                                setIsAddressModalOpen={setIsAddressModalOpen}
                                user={user}
                                isAuthenticated={isAuthenticated}
                                todayStr={todayStr}
                                isStoreClosed={isStoreClosed}
                                saveAddress={saveAddress}
                                setSaveAddress={val => updateDeliveryDetails({ saveAddress: val })}
                                deliveryCost={deliveryCost}
                                totalValue={cartSubtotal}
                                itemsCount={items.reduce((s, i) => s + i.quantity, 0)}
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
                                hasAddress={!!address.trim()}
                                hasHouse={!!house.trim()}
                                hasApartment={!!apartment.trim()}
                                handleOrder={handleOrder}
                                handleInvite={handleInvite}
                                promoCode={promoCode}
                                setPromoCode={setPromoCode}
                                promoDiscount={promoDiscount}
                                handleApplyPromo={handleApplyPromo}
                                isApplyingPromo={isApplyingPromo}
                                promoError={promoError}
                                handleRemovePromo={handleRemovePromo}
                            />
                        </div>
                    </div>
                </main>
            )}

            <AddressModal
                isOpen={isAddressModalOpen}
                onClose={() => setIsAddressModalOpen(false)}
                onSelect={res => {
                    updateDeliveryDetails({
                        address: res.street || '',
                        house: res.house || '',
                        apartment: res.apartment || '',
                        postalCode: res.postalCode || '',
                        selectedZone: res.zone,
                    });
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
                    total={cartSubtotal - discountAmount}
                    deliveryCost={deliveryCost}
                />
            )}
        </div>
    );
}
