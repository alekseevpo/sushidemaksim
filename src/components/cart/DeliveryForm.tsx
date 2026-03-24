import { motion } from 'framer-motion';
import {
    MapPin,
    Truck,
    Store,
    CreditCard,
    Wallet,
    Smartphone,
    Users,
    Minus,
    Plus,
} from 'lucide-react';
import { triggerHaptic } from '../../utils/haptics';
import { useEffect, useRef } from 'react';
import { tracker } from '../../analytics/tracker';
import { BUSINESS_HOURS } from '../../utils/storeStatus';

interface DeliveryFormProps {
    deliveryType: 'delivery' | 'pickup' | 'reservation';
    setDeliveryType: (type: 'delivery' | 'pickup' | 'reservation') => void;
    address: string;
    setAddress: (val: string) => void;
    house: string;
    setHouse: (val: string) => void;
    apartment: string;
    setApartment: (val: string) => void;
    postalCode: string;
    setPostalCode: (val: string) => void;
    phone: string;
    setPhone: (val: string) => void;
    customerNameState: string;
    setCustomerNameState: (val: string) => void;
    guestEmailState: string;
    setGuestEmailState: (val: string) => void;
    paymentMethod: 'cash' | 'card' | null;
    setPaymentMethod: (val: 'cash' | 'card' | null) => void;
    isScheduled: boolean;
    setIsScheduled: (val: boolean) => void;
    scheduledDate: string;
    setScheduledDate: (val: string) => void;
    scheduledTime: string;
    setScheduledTime: (val: string) => void;
    noCall: boolean;
    setNoCall: (val: boolean) => void;
    noBuzzer: boolean;
    setNoBuzzer: (val: boolean) => void;
    customNote: string;
    setCustomNote: (val: string) => void;
    selectedZone: any;
    setIsAddressModalOpen: (val: boolean) => void;
    user: any;
    isAuthenticated: boolean;
    todayStr: string;
    isStoreClosed: boolean;
    saveAddress: boolean;
    setSaveAddress: (val: boolean) => void;
    deliveryCost?: number;
    totalValue?: number;
    itemsCount?: number;
    guestsCount: number;
    setGuestsCount: (val: number) => void;
}

export default function DeliveryForm({
    deliveryType,
    setDeliveryType,
    address,
    setAddress,
    house,
    setHouse,
    apartment,
    setApartment,
    postalCode,
    setPostalCode,
    phone,
    setPhone,
    customerNameState,
    setCustomerNameState,
    guestEmailState,
    setGuestEmailState,
    paymentMethod,
    setPaymentMethod,
    isScheduled,
    setIsScheduled,
    scheduledDate,
    setScheduledDate,
    scheduledTime,
    setScheduledTime,
    noCall,
    setNoCall,
    noBuzzer,
    setNoBuzzer,
    customNote,
    setCustomNote,
    selectedZone,
    setIsAddressModalOpen,
    user,
    isAuthenticated,
    todayStr,
    isStoreClosed,
    saveAddress,
    setSaveAddress,
    deliveryCost = 0,
    totalValue = 0,
    itemsCount = 0,
    guestsCount,
    setGuestsCount,
}: DeliveryFormProps) {
    const hasSentDeliveryStep = useRef(false);

    // Analytics: Track when delivery info is mostly filled
    useEffect(() => {
        const isAddressFilled = deliveryType === 'pickup' || (address && house && apartment);
        const hasContactInfo = phone.length > 5;

        if (isAddressFilled && hasContactInfo && !hasSentDeliveryStep.current) {
            tracker.track('delivery_info_filled', {
                metadata: {
                    deliveryType,
                    customerName: customerNameState,
                    guestEmail: guestEmailState,
                    phone,
                },
            });
            hasSentDeliveryStep.current = true;
        }
    }, [address, house, apartment, deliveryType, customerNameState, guestEmailState, phone]);

    const handleAddressClick = () => {
        setIsAddressModalOpen(true);
    };

    const getTimeSlots = () => {
        if (!scheduledDate) return [];
        const dateObj = new Date(scheduledDate);
        const day = dateObj.getDay();
        const intervals = BUSINESS_HOURS[day] || [];

        const slots: string[] = [];
        intervals.forEach(interval => {
            const [startH] = interval.start.split(':').map(Number);
            const [endH] = interval.end.split(':').map(Number);

            for (let h = startH; h < endH; h++) {
                slots.push(`${h.toString().padStart(2, '0')}:00`);
                slots.push(`${h.toString().padStart(2, '0')}:30`);
            }
        });
        return slots;
    };

    const availableSlots = getTimeSlots();
    const isDayClosedSelect = Boolean(scheduledDate && availableSlots.length === 0);

    return (
        <div className="bg-white md:rounded-xl shadow-[0_4px_10px_rgba(0,0,0,0.03)] md:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1)] px-3 py-5 md:p-6 mx-0 md:mx-0 rounded-[28px]">
            <h2 className="text-lg md:text-xl font-bold mb-4 flex items-center gap-2">
                <MapPin size={18} strokeWidth={1.5} className="text-red-600" /> Datos de entrega
            </h2>

            <div className="flex bg-gray-50 p-1.5 rounded-2xl mb-6 border border-gray-100">
                <button
                    type="button"
                    onClick={() => {
                        triggerHaptic();
                        setDeliveryType('delivery');
                    }}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all border-none cursor-pointer ${
                        deliveryType === 'delivery'
                            ? 'bg-white text-red-600 shadow-sm border border-gray-100'
                            : 'text-gray-400 hover:text-gray-500 bg-transparent'
                    }`}
                >
                    <Truck size={16} strokeWidth={2} />
                    Domicilio
                </button>
                <button
                    type="button"
                    onClick={() => {
                        triggerHaptic();
                        setDeliveryType('pickup');
                    }}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all border-none cursor-pointer ${
                        deliveryType === 'pickup'
                            ? 'bg-white text-red-600 shadow-sm border border-gray-100'
                            : 'text-gray-400 hover:text-gray-500 bg-transparent'
                    }`}
                >
                    <Store size={16} strokeWidth={2} />
                    Recogida
                </button>
                <button
                    type="button"
                    onClick={() => {
                        triggerHaptic();
                        setDeliveryType('reservation');
                        setIsScheduled(true); // Mandatory for reservation
                    }}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all border-none cursor-pointer ${
                        deliveryType === 'reservation'
                            ? 'bg-white text-red-600 shadow-sm border border-gray-100'
                            : 'text-gray-400 hover:text-gray-500 bg-transparent'
                    }`}
                >
                    <Users size={16} strokeWidth={2} />
                    Reserva
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
                                <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-[11px] font-medium text-amber-800">
                                    <div className="flex flex-col gap-0.5">
                                        <span className="opacity-50 uppercase text-[9px] tracking-tight">
                                            Mié – Vie
                                        </span>
                                        <span className="font-bold">20:00 – 23:00</span>
                                    </div>
                                    <div className="flex flex-col gap-0.5">
                                        <span className="opacity-50 uppercase text-[9px] tracking-tight">
                                            Sábado
                                        </span>
                                        <span className="font-bold leading-tight">
                                            14:00 – 17:00 / 20:00 – 23:00
                                        </span>
                                    </div>
                                    <div className="flex flex-col gap-0.5">
                                        <span className="opacity-50 uppercase text-[9px] tracking-tight">
                                            Domingo
                                        </span>
                                        <span className="font-bold">14:00 – 17:00</span>
                                    </div>
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-amber-900/40 uppercase text-[9px] tracking-tight font-black">
                                            Lun – Mar
                                        </span>
                                        <span className="text-amber-900/40 font-black uppercase">
                                            Cerrado
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {deliveryType === 'reservation' && (
                <div className="mb-6 p-4 bg-red-50 rounded-2xl border border-red-100 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-red-100 rounded-xl text-red-600">
                            <Users size={20} strokeWidth={1.5} />
                        </div>
                        <div>
                            <p className="text-sm font-black text-red-900 uppercase tracking-tight mb-1">
                                Reserva de Mesa
                            </p>
                            <p className="text-sm text-red-800 font-medium">
                                Prepararemos tu pedido para que esté listo cuando llegues a tu mesa.
                            </p>
                            <p className="text-[10px] text-red-600 font-black uppercase mt-2">
                                * Se requiere reserva previa confirmada
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {deliveryType === 'delivery' && (
                <div className="flex flex-col gap-3">
                    {user?.addresses && user.addresses.length > 0 && (
                        <div className="grid grid-cols-1 gap-2 mb-2">
                            {user.addresses.map((addr: any) => (
                                <button
                                    key={addr.id}
                                    onClick={() => {
                                        let s = addr.street || '';
                                        let h = addr.house || '';
                                        let a = addr.apartment || '';
                                        if (s.includes(',') && !h && !a) {
                                            const pts = s.split(',').map((p: string) => p.trim());
                                            if (pts.length >= 2) {
                                                s = pts[0];
                                                h = pts[1];
                                                if (pts.length >= 3) a = pts.slice(2).join(', ');
                                            }
                                        }
                                        setAddress(s);
                                        setHouse(h);
                                        setApartment(a);
                                        setPhone(addr.phone || phone || '');
                                    }}
                                    type="button"
                                    className="flex items-center gap-2 text-sm bg-red-50 text-red-700 border border-red-200 rounded-xl px-3 py-3 cursor-pointer hover:bg-red-100 transition font-medium text-left w-full truncate"
                                >
                                    <MapPin size={16} strokeWidth={1.5} className="shrink-0" />
                                    <span className="truncate">
                                        Usar "{addr.label || 'Mi dirección'}": {addr.street}{' '}
                                        {addr.house && `, ${addr.house}`}
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Unified Address Component for Mobile & Desktop */}
                    <div className="w-full">
                        {!address ? (
                            <button
                                type="button"
                                onClick={handleAddressClick}
                                data-testid="address-input"
                                className="w-full bg-white border-2 border-red-50 rounded-[24px] p-6 md:p-10 text-center hover:border-red-500 hover:bg-red-50/10 transition-all group mb-4 shadow-sm active:scale-95 duration-200 cursor-pointer flex flex-col items-center gap-3 md:gap-4"
                            >
                                <div className="w-14 h-14 md:w-20 md:h-20 bg-red-50 rounded-2xl md:rounded-[28px] flex items-center justify-center group-hover:scale-110 transition duration-500 shadow-inner group-hover:shadow-[0_10px_30px_-10px_rgba(220,38,38,0.3)]">
                                    <MapPin className="text-red-500 w-8 h-8 md:w-12 md:h-12" />
                                </div>
                                <div className="space-y-1">
                                    <p className="font-black text-lg md:text-2xl text-gray-900 tracking-tight">
                                        ¿Dónde entregamos el pedido?
                                    </p>
                                    <p className="text-xs md:text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center justify-center gap-2">
                                        Indica tu dirección y descubre nuestras zonas
                                    </p>
                                </div>
                            </button>
                        ) : (
                            <div className="flex flex-col gap-4">
                                {/* Enhanced Address Card - Full block click */}
                                <button
                                    type="button"
                                    onClick={handleAddressClick}
                                    data-testid="address-display"
                                    className="bg-gray-50/80 backdrop-blur-sm rounded-[24px] md:rounded-[32px] p-3.5 md:p-6 border border-gray-100 flex items-center justify-between group hover:bg-white hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-500"
                                >
                                    <div className="flex items-center gap-3 md:gap-6 overflow-hidden">
                                        <div className="w-12 h-12 md:w-16 md:h-16 bg-white rounded-xl md:rounded-[24px] flex items-center justify-center shadow-md border border-gray-50 shrink-0 group-hover:scale-105 transition-all duration-500">
                                            <MapPin className="text-red-500 w-5 h-5 md:w-8 md:h-8" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-black text-lg md:text-3xl text-gray-900 leading-tight tracking-tight mb-1">
                                                {address}
                                            </p>
                                            {(house || apartment) && (
                                                <p className="text-sm md:text-lg font-black text-red-600 uppercase tracking-tight -mt-0.5">
                                                    {house && `Portal / Casa: ${house}`}
                                                    {apartment && ` • Piso / Puerta: ${apartment}`}
                                                </p>
                                            )}
                                            <div className="flex flex-wrap items-center gap-1.5 md:gap-3 mt-1 md:mt-1.5">
                                                <div className="flex items-center gap-1.5 bg-white/80 px-2.5 py-1 md:px-4 md:py-2 rounded-xl md:rounded-2xl shadow-sm border border-gray-100 max-w-full">
                                                    <div
                                                        className="w-1.5 h-1.5 rounded-full shrink-0"
                                                        style={{
                                                            backgroundColor:
                                                                selectedZone?.color || '#EF4444',
                                                        }}
                                                    />
                                                    <span className="text-[9px] md:text-xs font-black text-gray-900 uppercase tracking-widest whitespace-nowrap">
                                                        {selectedZone?.name || 'Zona no detectada'}
                                                    </span>
                                                    {selectedZone && (
                                                        <span className="ml-1 text-[9px] md:text-xs font-black text-red-600 bg-red-50 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                                                            {deliveryCost > 0
                                                                ? `+${deliveryCost.toFixed(2).replace('.', ',')}€ envío`
                                                                : 'Envío GRATIS'}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-1.5 bg-gray-100/50 px-2 py-1 md:px-3 md:py-1.5 rounded-xl md:rounded-2xl border border-gray-100">
                                                    <span className="text-[9px] md:text-xs font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">
                                                        CP {postalCode}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </button>
                                {/* Form Fields below the card */}
                                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 -mt-1 px-1">
                                    <div className="lg:col-span-1">
                                        <label className="block text-[10px] md:text-xs font-black text-gray-400 uppercase mb-1.5 px-2 tracking-widest">
                                            Portal / Casa *
                                        </label>
                                        <input
                                            value={house}
                                            onChange={e => setHouse(e.target.value)}
                                            placeholder="Ej: 20"
                                            data-testid="house-input"
                                            className={`w-full px-5 py-3 md:py-4 bg-gray-50 border rounded-2xl md:rounded-3xl text-sm md:text-base font-bold outline-none focus:ring-4 ring-red-500/5 focus:bg-white transition ${!house && address ? 'border-amber-200 bg-amber-50/30' : 'border-gray-100'}`}
                                        />
                                        {!house && address && (
                                            <p className="text-[9px] font-black text-amber-600 mt-1 ml-2 uppercase tracking-widest animate-pulse">
                                                Falta número
                                            </p>
                                        )}
                                    </div>
                                    <div className="lg:col-span-1">
                                        <label className="block text-[10px] md:text-xs font-black text-gray-400 uppercase mb-1.5 px-2 tracking-widest">
                                            Piso / Puerta *
                                        </label>
                                        <input
                                            value={apartment}
                                            onChange={e => setApartment(e.target.value)}
                                            placeholder="Ej: 1B"
                                            data-testid="apartment-input"
                                            className={`w-full px-5 py-3 md:py-4 bg-gray-50 border rounded-2xl md:rounded-3xl text-sm md:text-base font-bold outline-none focus:ring-4 ring-red-500/5 focus:bg-white transition ${!apartment && address ? 'border-amber-200 bg-amber-50/30' : 'border-gray-100'}`}
                                        />
                                        {!apartment && address && (
                                            <p className="text-[9px] font-black text-amber-600 mt-1 ml-2 uppercase tracking-widest animate-pulse">
                                                Falta piso/puerta
                                            </p>
                                        )}
                                    </div>
                                    <div className="col-span-2 lg:col-span-1">
                                        <label className="block text-[10px] md:text-xs font-black text-gray-400 uppercase mb-1.5 px-2 tracking-widest">
                                            Código Postal
                                        </label>
                                        <input
                                            value={postalCode}
                                            onChange={e => setPostalCode(e.target.value)}
                                            placeholder="Ej: 28001"
                                            maxLength={5}
                                            className="w-full px-5 py-3 md:py-4 bg-gray-50 border border-gray-100 rounded-2xl md:rounded-3xl text-sm md:text-base font-bold outline-none focus:ring-4 ring-red-500/5 focus:bg-white transition"
                                        />
                                    </div>
                                </div>

                                {isAuthenticated && (
                                    <div className="px-2">
                                        <label className="flex items-center gap-3 p-3 bg-red-50/20 rounded-2xl border border-red-100/30 cursor-pointer group hover:bg-red-50/40 transition-all select-none">
                                            <div className="relative flex items-center">
                                                <input
                                                    type="checkbox"
                                                    className="w-5 h-5 accent-red-600 rounded-md cursor-pointer border-2 border-red-200"
                                                    checked={saveAddress}
                                                    onChange={e => {
                                                        triggerHaptic();
                                                        setSaveAddress(e.target.checked);
                                                    }}
                                                />
                                            </div>
                                            <div>
                                                <p className="text-[13px] font-black text-gray-900 uppercase tracking-tight leading-none mb-1">
                                                    Guardar dirección
                                                </p>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">
                                                    Para tus futuros pedidos 🍣
                                                </p>
                                            </div>
                                        </label>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div className="mt-8 pt-6 border-t border-gray-100">
                <h2 className="text-lg md:text-xl font-bold mb-4 flex items-center gap-2">
                    <CreditCard size={18} strokeWidth={1.5} className="text-red-600" /> Método de
                    Pago
                </h2>
                <div className="grid grid-cols-2 gap-3">
                    <button
                        type="button"
                        onClick={() => {
                            triggerHaptic();
                            setPaymentMethod('card');
                            tracker.track('payment_method_selected', {
                                metadata: { paymentMethod: 'card', totalValue, itemsCount },
                            });
                        }}
                        data-testid="payment-method-card"
                        className={`group flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-300 cursor-pointer ${
                            paymentMethod === 'card'
                                ? 'border-red-600 bg-red-50/50 text-red-600 shadow-sm'
                                : 'border-gray-100 bg-white text-gray-400 hover:border-gray-200'
                        }`}
                    >
                        <div
                            className={`p-2 rounded-lg transition-all ${paymentMethod === 'card' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-400'}`}
                        >
                            <CreditCard size={18} strokeWidth={2} />
                        </div>
                        <span className="text-sm font-black uppercase tracking-tight">Tarjeta</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            triggerHaptic();
                            setPaymentMethod('cash');
                            tracker.track('payment_method_selected', {
                                metadata: { paymentMethod: 'cash', totalValue, itemsCount },
                            });
                        }}
                        data-testid="payment-method-cash"
                        className={`group flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-300 cursor-pointer ${
                            paymentMethod === 'cash'
                                ? 'border-red-600 bg-red-50/50 text-red-600 shadow-sm'
                                : 'border-gray-100 bg-white text-gray-400 hover:border-gray-200'
                        }`}
                    >
                        <div
                            className={`p-2 rounded-lg transition-all ${paymentMethod === 'cash' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-400'}`}
                        >
                            <Wallet size={18} strokeWidth={2} />
                        </div>
                        <span className="text-sm font-black uppercase tracking-tight">
                            Efectivo
                        </span>
                    </button>
                </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100">
                <h2 className="text-lg md:text-xl font-bold mb-4 flex items-center gap-2">
                    <Smartphone size={18} strokeWidth={1.5} className="text-red-600" /> Datos de
                    contacto
                </h2>
                {!isAuthenticated && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-600 mb-1">
                                Tu nombre *
                            </label>
                            <input
                                type="text"
                                value={customerNameState}
                                onChange={e => setCustomerNameState(e.target.value)}
                                placeholder="Ej: Juan Pérez"
                                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400 focus:shadow-[0_0_0_3px_rgba(220,38,38,0.1)] transition bg-gray-50 focus:bg-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-600 mb-1">
                                Email (opcional)
                            </label>
                            <input
                                type="email"
                                value={guestEmailState}
                                onChange={e => setGuestEmailState(e.target.value)}
                                placeholder="tu@email.com"
                                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400 focus:shadow-[0_0_0_3px_rgba(220,38,38,0.1)] transition bg-gray-50 focus:bg-white"
                            />
                        </div>
                    </div>
                )}
                <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-600 mb-1">
                        Teléfono de contacto *
                    </label>
                    <input
                        type="tel"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        placeholder="+34 600 000 000"
                        data-testid="phone-input"
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400 focus:shadow-[0_0_0_3px_rgba(220,38,38,0.1)] transition bg-gray-50 focus:bg-white"
                    />
                </div>

                <div className="flex flex-col gap-2 mt-4">
                    <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none">
                        <input
                            type="checkbox"
                            className="w-4 h-4 accent-red-600 rounded cursor-pointer"
                            checked={noCall}
                            onChange={e => {
                                triggerHaptic();
                                setNoCall(e.target.checked);
                            }}
                        />
                        Sin llamada de confirmación de pedido
                    </label>
                    <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none">
                        <input
                            type="checkbox"
                            className="w-4 h-4 accent-red-600 rounded cursor-pointer"
                            checked={noBuzzer}
                            onChange={e => {
                                triggerHaptic();
                                setNoBuzzer(e.target.checked);
                            }}
                        />
                        No llamar al timbre / El repartidor llama al móvil
                    </label>
                    <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none">
                        <input
                            type="checkbox"
                            className="w-4 h-4 accent-red-600 rounded cursor-pointer"
                            checked={isScheduled}
                            onChange={e => {
                                triggerHaptic();
                                setIsScheduled(e.target.checked);
                            }}
                        />
                        🔥 Entrega programada (Opcional)
                    </label>

                    {isStoreClosed && !isScheduled && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="p-3 bg-red-50 border border-red-100 rounded-xl mt-2"
                        >
                            <p className="text-[11px] font-bold text-red-600 m-0">
                                🏪 El restaurante está cerrado. Por favor, selecciona la opción
                                "Entrega programada" para recibir tu pedido en el próximo horario de
                                apertura.
                            </p>
                        </motion.div>
                    )}

                    {isScheduled && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="flex flex-col gap-3 mt-2 overflow-hidden"
                        >
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[10px] uppercase font-black text-gray-400 mb-1 ml-1 tracking-wider">
                                        Fecha
                                    </label>
                                    <input
                                        type="date"
                                        min={todayStr}
                                        value={scheduledDate}
                                        onChange={e => setScheduledDate(e.target.value)}
                                        className="w-full px-4 h-[46px] border border-gray-200 rounded-xl text-sm outline-none focus:border-red-400 bg-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] uppercase font-black text-gray-400 mb-1 ml-1 tracking-wider">
                                        Hora
                                    </label>
                                    {!isDayClosedSelect && availableSlots.length > 0 ? (
                                        <select
                                            value={scheduledTime}
                                            onChange={e => setScheduledTime(e.target.value)}
                                            className="w-full px-4 h-[46px] border border-gray-200 rounded-xl text-sm outline-none focus:border-red-400 bg-white"
                                        >
                                            <option value="">Selecciona hora</option>
                                            {availableSlots.map(slot => (
                                                <option key={slot} value={slot}>
                                                    {slot}
                                                </option>
                                            ))}
                                        </select>
                                    ) : (
                                        <input
                                            type="time"
                                            value={scheduledTime}
                                            onChange={e => setScheduledTime(e.target.value)}
                                            className="w-full px-4 h-[46px] border border-gray-200 rounded-xl text-sm outline-none focus:border-red-400 bg-white disabled:bg-gray-100 disabled:text-gray-400"
                                            disabled={isDayClosedSelect}
                                        />
                                    )}
                                </div>
                            </div>

                            {deliveryType === 'reservation' && (
                                <div className="mt-1">
                                    <label className="block text-[10px] uppercase font-black text-gray-400 mb-1.5 ml-1 tracking-wider">
                                        Número de personas
                                    </label>
                                    <div className="flex items-center justify-between bg-gray-50 p-1 rounded-xl border border-gray-100 h-[46px]">
                                        <div className="pl-3">
                                            <span className="text-xs font-black text-gray-900 leading-none">
                                                {guestsCount}{' '}
                                                {guestsCount === 1 ? 'Persona' : 'Personas'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1 bg-white p-1 rounded-lg shadow-sm border border-gray-100">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    triggerHaptic();
                                                    setGuestsCount(Math.max(1, guestsCount - 1));
                                                }}
                                                className="w-8 h-8 rounded-md flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all border-none bg-transparent cursor-pointer"
                                            >
                                                <Minus size={16} strokeWidth={3} />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    triggerHaptic();
                                                    setGuestsCount(guestsCount + 1);
                                                }}
                                                className="w-8 h-8 rounded-md flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all border-none bg-transparent cursor-pointer"
                                            >
                                                <Plus size={16} strokeWidth={3} />
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-gray-400 mt-2 ml-1 font-medium">
                                        Para grupos de más de 8 personas, por favor contáctanos por
                                        teléfono.
                                    </p>
                                </div>
                            )}

                            {isDayClosedSelect && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="p-3 bg-red-50 border border-red-100 rounded-xl"
                                >
                                    <p className="text-[10px] font-bold text-red-600 m-0 text-center">
                                        ⚠️ El restaurante está cerrado este día. Por favor elige
                                        otra fecha.
                                    </p>
                                </motion.div>
                            )}

                            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100/50">
                                <p className="text-[10px] font-black text-blue-900/40 uppercase tracking-widest mb-3">
                                    Horario de atención
                                </p>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[10px] font-bold text-blue-800/70">
                                    <div className="flex flex-col gap-0.5">
                                        <span className="opacity-50 uppercase text-[8px] tracking-tight">
                                            Mié – Vie
                                        </span>
                                        <span>20:00 – 23:00</span>
                                    </div>
                                    <div className="flex flex-col gap-0.5">
                                        <span className="opacity-50 uppercase text-[8px] tracking-tight">
                                            Sábado
                                        </span>
                                        <span className="leading-tight">
                                            14:00 – 17:00 / 20:00 – 23:00
                                        </span>
                                    </div>
                                    <div className="flex flex-col gap-0.5">
                                        <span className="opacity-50 uppercase text-[8px] tracking-tight">
                                            Domingo
                                        </span>
                                        <span>14:00 – 17:00</span>
                                    </div>
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-red-400/60 uppercase text-[8px] tracking-tight font-black">
                                            Lun – Mar
                                        </span>
                                        <span className="text-red-400/80 font-black uppercase">
                                            Cerrado
                                        </span>
                                    </div>
                                </div>
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
                        placeholder="Ej. Quitar pepino del rollo California..."
                        rows={2}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400 focus:shadow-[0_0_0_3px_rgba(220,38,38,0.1)] transition bg-gray-50 focus:bg-white resize-none"
                    />
                </div>
            </div>
        </div>
    );
}
