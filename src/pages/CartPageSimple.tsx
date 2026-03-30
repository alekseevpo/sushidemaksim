import { useState, useEffect, useCallback, useMemo } from 'react'; // Heartbeat update
import { AlertCircle } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { api } from '../utils/api';
import { useToast } from '../context/ToastContext';
import SEO from '../components/SEO';
import { isStoreOpen, isTimeWithinBusinessHours } from '../utils/storeStatus';
import { CartSkeleton } from '../components/skeletons/CartSkeleton';
import AddressModal from '../components/AddressModal';
import { detectZone } from '../utils/delivery';

// Modular Components
import CartItemList from '../components/cart/CartItemList';
import DeliveryForm from '../components/cart/DeliveryForm';
import CartSummary from '../components/cart/CartSummary';
import OrderSuccessModal from '../components/cart/OrderSuccessModal';
import CartSuggestions from '../components/cart/CartSuggestions';
import CartEmptyView from '../components/cart/CartEmptyView';
import { useScrollLock } from '../hooks/useScrollLock';
import { tracker } from '../analytics/tracker';

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
        resetDeliveryDetails,
    } = useCart();

    const { isAuthenticated, user } = useAuth();
    const { success: showSuccess, error: showError, info: showInfo } = useToast();

    const cartSubtotal = Number(total) || 0;
    const [promoCode, setPromoCode] = useState('');
    const [promoDiscount, setPromoDiscount] = useState<number | null>(null);
    const [promoError, setPromoError] = useState<string | null>(null);

    const discountAmount = promoDiscount ? (cartSubtotal * promoDiscount) / 100 : 0;
    const { deliveryType, selectedZone, guestsCount } = deliveryDetails;

    // We need siteSettings for these. But they are loaded in useEffect.
    // I'll keep them where they are if they need it, or move siteSettings load to useCart?
    // Actually, I can just calculate them later OR handle nulls.

    const [isOrdering, setIsOrdering] = useState(false);
    const [isInviting, setIsInviting] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState<number | null>(null);
    const [orderWhatsappUrl, setOrderWhatsappUrl] = useState<string | null>(null);
    const [isLoadingSettings, setIsLoadingSettings] = useState(true);
    const [lastOrderSummary, setLastOrderSummary] = useState<{
        total: number;
        deliveryCost: number;
    } | null>(null);

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

    const todayStr = new Date().toLocaleDateString('sv-SE'); // Local date in YYYY-MM-DD format

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

    const MIN_ORDER =
        deliveryType === 'delivery'
            ? selectedZone
                ? (selectedZone.minOrder ?? 0)
                : (siteSettings?.minOrder ?? 15)
            : 0;
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

    const handleCloseAddressModal = useCallback(() => {
        setIsAddressModalOpen(false);
    }, []);

    const handleAddressSelect = useCallback(
        (res: any) => {
            updateDeliveryDetails({
                address: res.street || '',
                house: res.house || '',
                apartment: res.apartment || '',
                postalCode: res.postalCode || '',
                selectedZone: res.zone,
                lat: res.coordinates?.[0],
                lon: res.coordinates?.[1],
            });
        },
        [updateDeliveryDetails]
    );

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
        window.scrollTo(0, 0);
    }, []);

    // Sync selectedZone with latest data from DB when zones are loaded
    useEffect(() => {
        if (deliveryZones.length > 0 && deliveryDetails.selectedZone) {
            const freshZone = deliveryZones.find(
                z =>
                    z.id === deliveryDetails.selectedZone.id ||
                    z.name === deliveryDetails.selectedZone.name
            );
            if (freshZone) {
                // If metadata has changed (cost, threshold, etc.), update the state
                const current = JSON.stringify(deliveryDetails.selectedZone);
                const latest = JSON.stringify(freshZone);
                if (current !== latest) {
                    updateDeliveryDetails({ selectedZone: freshZone });
                }
            }
        }
    }, [deliveryZones, deliveryDetails.selectedZone, updateDeliveryDetails]);

    // Schedule integrity sync (prevent past dates from remembered state)
    useEffect(() => {
        if (isScheduled && scheduledDate && scheduledDate < todayStr) {
            updateDeliveryDetails({
                scheduledDate: todayStr,
                scheduledTime: '', // Reset time too as it might be past
            });
        }
    }, [todayStr, isScheduled, scheduledDate, updateDeliveryDetails]);

    const loadSuggestions = useCallback(async () => {
        if (suggestions.length > 0) return;

        setIsLoadingSuggestions(true);
        try {
            const data = await api.get('/menu?category=postre');
            setSuggestions(data.items || []);
        } catch (err) {
            console.error('Failed to load suggestions', err);
        } finally {
            setIsLoadingSuggestions(false);
        }
    }, [suggestions.length]);

    // Re-filter suggestions based on what's currently in the cart
    const filteredSuggestions = useMemo(() => {
        return suggestions.filter(
            suggestion => !items.find(cartItem => String(cartItem.id) === String(suggestion.id))
        );
    }, [suggestions, items]);

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

    // Popular items for empty cart
    useEffect(() => {
        if (items.length === 0 && popularItems.length === 0 && !isLoadingPopular) {
            loadPopularItems();
        } else if (items.length > 0 && suggestions.length === 0 && !isLoadingSuggestions) {
            loadSuggestions();
        }
    }, [
        items.length,
        popularItems.length,
        suggestions.length,
        loadSuggestions,
        loadPopularItems,
        isLoadingPopular,
        isLoadingSuggestions,
    ]);

    // Save current address to user profile if requested
    const saveCurrentAddress = async () => {
        if (!isAuthenticated || !saveAddress || deliveryType !== 'delivery') return;

        try {
            const streetVal = address.trim();
            const houseVal = house.trim();
            const aptVal = apartment.trim();
            const deliveryPhone = phone || user?.phone || '';

            if (!streetVal) return;

            // Check for duplicates on frontend
            const isDuplicate = (user?.addresses || []).some((addr: any) => {
                const s = addr.street || '';
                const h = addr.house || '';
                const a = addr.apartment || '';
                return (
                    s.toLowerCase() === streetVal.toLowerCase() &&
                    h.toLowerCase() === houseVal.toLowerCase() &&
                    a.toLowerCase() === aptVal.toLowerCase()
                );
            });

            if (isDuplicate) {
                console.log('Skipping address save: already exists in profile');
                return;
            }

            const { lat, lon } = deliveryDetails;

            await api.post('/user/addresses', {
                street: streetVal,
                house: houseVal,
                apartment: aptVal,
                postalCode: postalCode || (selectedZone ? selectedZone.postalCodes?.[0] : ''),
                phone: deliveryPhone,
                label: 'Dirección reciente',
                lat,
                lon,
                isDefault: true,
            });
        } catch (saveErr) {
            console.error('Failed to save address to profile', saveErr);
        }
    };

    // Analytics: Track cart view
    useEffect(() => {
        if (!cartLoading && items.length > 0) {
            tracker.track('cart_view', {
                metadata: {
                    totalValue: cartSubtotal,
                    itemsCount: items.reduce((s, i) => s + i.quantity, 0),
                    items: items.map(i => ({
                        id: i.id,
                        name: i.name,
                        price: i.price,
                        quantity: i.quantity,
                    })),
                },
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
        const isWelcomePromo = promoCode.startsWith('NUEVO') || promoCode.startsWith('NEW');
        if (promoDiscount && isWelcomePromo && cartSubtotal < 70) {
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
            if (scheduledDate < todayStr) {
                return showError('Por favor, selecciona una fecha a partir de hoy.');
            }

            // If it is today, ensure the time is not in the past
            if (scheduledDate === todayStr) {
                const now = new Date();
                const nowMinutes = now.getHours() * 60 + now.getMinutes();
                const [h, m] = scheduledTime.split(':').map(Number);
                const scheduledMinutes = h * 60 + m;

                if (scheduledMinutes < nowMinutes + 15) {
                    // Small margin (15 min) for processing
                    return showError(
                        'La hora seleccionada ya ha pasado o es demasiado cercana. Elige una hora posterior.'
                    );
                }
            }

            const date = new Date(scheduledDate);
            if (!isTimeWithinBusinessHours(date, scheduledTime)) {
                return showError(
                    'La hora seleccionada está fuera de nuestro horario de servicio. ¡Por favor, elige un momento en el que nuestros chefs estén en la cocina!'
                );
            }
        }

        // Analytics: Track checkout start
        tracker.track('checkout_start', {
            metadata: {
                totalValue: cartSubtotal,
                itemsCount: items.reduce((s, i) => s + i.quantity, 0),
                deliveryType,
                paymentMethod,
            },
            userId: user?.id,
        });

        setIsOrdering(true);

        const notesArray = [];
        const typeLabel =
            deliveryType === 'pickup'
                ? 'RECOGIDA'
                : deliveryType === 'reservation'
                  ? 'RESERVA'
                  : 'DOMICILIO';
        notesArray.push(`[TIPO: ${typeLabel}]`);
        if (deliveryType === 'reservation') {
            notesArray.push(`[PERSONAS: ${Number(guestsCount) || 2}]`);
        }
        notesArray.push(`[MÉTODO DE PAGO: ${paymentMethod === 'card' ? 'TARJETA' : 'EFECTIVO'}]`);
        if (isStoreClosed) notesArray.push('[PRE-ORDEN: Restaurante cerrado]');
        if (isScheduled && scheduledDate && scheduledTime)
            notesArray.push(`[PROGRAMADO: ${scheduledDate} ${scheduledTime}]`);
        if (noCall) notesArray.push('[SIN CONFIRMACIÓN LLAMADA]');
        if (noBuzzer) notesArray.push('[NO LLAMAR TIMBRE]');
        if (deliveryDetails.chopsticksCount > 0)
            notesArray.push(`[PALILLOS: ${deliveryDetails.chopsticksCount}]`);
        if (customNote.trim()) notesArray.push(customNote.trim());

        try {
            const { lat, lon } = deliveryDetails;
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
                lat,
                lon,
            };

            if (!isAuthenticated) {
                payload.guestItems = items.map(i => ({
                    menuItemId: parseInt(i.id),
                    quantity: i.quantity,
                }));
            }

            const data = await api.post('/orders', payload);

            // Save address if requested
            await saveCurrentAddress();

            // Analytics: Track order placed
            tracker.track('order_placed', {
                metadata: {
                    totalValue: cartSubtotal,
                    itemsCount: items.reduce((s, i) => s + i.quantity, 0),
                    orderId: data.order.id,
                },
                userId: user?.id,
            });

            // Capture summary before clearing cart
            setLastOrderSummary({
                total: cartSubtotal - discountAmount,
                deliveryCost: deliveryCost,
            });

            setOrderSuccess(data.order.id);
            setOrderWhatsappUrl(data.whatsappUrl || null);
            clearCart();
            resetDeliveryDetails();
            handleRemovePromo();

            // Reset for next order session
            tracker.resetSession();

            showSuccess('¡Pedido realizado! 🍣');
            if ('vibrate' in navigator) navigator.vibrate([100, 50, 100]);
        } catch (err: any) {
            tracker.track('error_notice', {
                metadata: {
                    errorSource: 'handleOrder',
                    errorMessage: err.message,
                    errorCode: err.errorCode || err.code,
                },
                userId: user?.id,
            });
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
            // Save address if requested
            await saveCurrentAddress();

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
                  ? (selectedZone.freeThreshold ?? siteSettings?.freeDeliveryThreshold ?? 60)
                  : (siteSettings?.freeDeliveryThreshold ?? 60))
                ? 0
                : selectedZone
                  ? (selectedZone.cost ?? 0)
                  : (siteSettings?.deliveryFee ?? 3.5)
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
                <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-6 py-4 sm:py-8">
                    {isStoreClosed && (
                        <div className="mb-6">
                            <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 md:p-5 shadow-sm">
                                <div className="flex items-start gap-3">
                                    <div className="mt-0.5 w-10 h-10 rounded-2xl bg-orange-100 flex items-center justify-center shrink-0 border border-orange-200 shadow-inner">
                                        <AlertCircle
                                            size={22}
                                            className="text-orange-600"
                                            strokeWidth={2.5}
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-black text-orange-900 leading-none mb-1.5 text-[15px] uppercase tracking-wider">
                                            Restaurante Cerrado
                                        </h3>
                                        <p className="text-[13px] text-orange-800/80 whitespace-pre-line leading-snug">
                                            {isManualClosed
                                                ? siteSettings?.closed_message ||
                                                  'Nuestra cocina está tomando un breve descanso.'
                                                : 'Actualmente nuestra cocina está fuera de servicio.'}
                                        </p>
                                        <div className="mt-3 pt-3 border-t border-orange-200/50">
                                            <p className="text-[11px] font-bold text-orange-900/40 uppercase tracking-widest mb-1.5">
                                                Horario de Servicio:
                                            </p>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-[12px] text-orange-800/80 font-medium">
                                                <div className="flex justify-between border-b border-orange-100/30 pb-0.5">
                                                    <span>Miércoles – Viernes</span>
                                                    <span className="font-bold">20:00 – 23:00</span>
                                                </div>
                                                <div className="flex justify-between border-b border-orange-100/30 pb-0.5">
                                                    <span>Sábado (Comida)</span>
                                                    <span className="font-bold">14:00 – 17:00</span>
                                                </div>
                                                <div className="flex justify-between border-b border-orange-100/30 pb-0.5">
                                                    <span>Sábado (Cena)</span>
                                                    <span className="font-bold">20:00 – 23:00</span>
                                                </div>
                                                <div className="flex justify-between border-b border-orange-100/30 pb-0.5">
                                                    <span>Domingo</span>
                                                    <span className="font-bold">14:00 – 17:00</span>
                                                </div>
                                            </div>
                                            <p className="mt-3 text-[11px] bg-orange-100/50 px-2 py-1.5 rounded-lg text-orange-900 font-bold inline-block">
                                                🚀 Aceptamos pedidos programados
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <h1 className="text-lg font-black text-gray-900 mb-2 px-2 md:px-0 uppercase tracking-[0.2em] opacity-30">
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
                                chopsticksCount={deliveryDetails.chopsticksCount}
                                updateChopsticks={val =>
                                    updateDeliveryDetails({ chopsticksCount: val })
                                }
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
                                noBuzzer={deliveryDetails.noBuzzer}
                                setNoBuzzer={val => updateDeliveryDetails({ noBuzzer: val })}
                                customNote={deliveryDetails.customNote}
                                setCustomNote={val => updateDeliveryDetails({ customNote: val })}
                                guestsCount={guestsCount}
                                setGuestsCount={val => updateDeliveryDetails({ guestsCount: val })}
                                selectedZone={selectedZone}
                                setIsAddressModalOpen={setIsAddressModalOpen}
                                user={user}
                                isAuthenticated={isAuthenticated}
                                todayStr={todayStr}
                                isStoreClosed={isStoreClosed}
                                saveAddress={saveAddress}
                                onSavedAddressSelect={addr => {
                                    const zone = detectZone(addr.lat, addr.lon, deliveryZones);
                                    updateDeliveryDetails({
                                        address: addr.street || '',
                                        house: addr.house || '',
                                        apartment: addr.apartment || '',
                                        phone: addr.phone || phone || '',
                                        lat: addr.lat,
                                        lon: addr.lon,
                                        postalCode: addr.postalCode || '',
                                        selectedZone: zone,
                                    });
                                }}
                                setSaveAddress={val => updateDeliveryDetails({ saveAddress: val })}
                                deliveryCost={deliveryCost}
                                totalValue={cartSubtotal}
                                itemsCount={items.reduce((s, i) => s + i.quantity, 0)}
                            />
                        </div>

                        <div className="flex flex-col gap-8">
                            <CartSuggestions
                                suggestions={filteredSuggestions}
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
                                minOrder={MIN_ORDER}
                            />
                        </div>
                    </div>
                </main>
            )}

            <AddressModal
                isOpen={isAddressModalOpen}
                onClose={handleCloseAddressModal}
                onSelect={handleAddressSelect}
                deliveryZones={deliveryZones}
                currentAddress={deliveryDetails}
            />

            {orderSuccess && (
                <OrderSuccessModal
                    orderId={orderSuccess}
                    phone={phone || ''}
                    isAuthenticated={isAuthenticated}
                    user={user}
                    isScheduled={deliveryDetails.isScheduled}
                    scheduledDate={deliveryDetails.scheduledDate}
                    scheduledTime={deliveryDetails.scheduledTime}
                    deliveryType={deliveryType}
                    address={address}
                    house={house}
                    apartment={apartment}
                    orderWhatsappUrl={orderWhatsappUrl}
                    total={lastOrderSummary?.total ?? cartSubtotal - discountAmount}
                    deliveryCost={lastOrderSummary?.deliveryCost ?? deliveryCost}
                    guestsCount={guestsCount}
                />
            )}
        </div>
    );
}
