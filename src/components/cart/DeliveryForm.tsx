import { motion } from 'framer-motion';
import { MapPin, Truck, Store, ArrowRight, CreditCard, Wallet, Smartphone } from 'lucide-react';
import { triggerHaptic } from '../../utils/haptics';

interface DeliveryFormProps {
    deliveryType: 'delivery' | 'pickup';
    setDeliveryType: (type: 'delivery' | 'pickup') => void;
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
}: DeliveryFormProps) {
    const handleAddressClick = () => {
        setIsAddressModalOpen(true);
    };

    return (
        <div className="bg-white md:rounded-xl shadow-[0_4px_10px_rgba(0,0,0,0.03)] md:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1)] px-3 py-5 md:p-6 mx-0 md:mx-0 rounded-[28px] md:rounded-xl">
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
                                    <span className="text-right">20:00 – 23:00</span>
                                    <span>Sábado (Comida):</span>
                                    <span className="text-right">14:00 – 17:00</span>
                                    <span>Sábado (Cena):</span>
                                    <span className="text-right">20:00 – 23:00</span>
                                    <span>Domingo:</span>
                                    <span className="text-right">14:00 – 17:00</span>
                                    <span className="text-amber-900/40">Lunes – Martes:</span>
                                    <span className="text-right text-amber-900/40">Cerrado</span>
                                </div>
                            </div>
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

                    {/* Address Trigger */}
                    <div className="md:hidden">
                        {!address ? (
                            <button
                                type="button"
                                onClick={handleAddressClick}
                                className="w-full bg-white border-2 border-red-50 rounded-[24px] p-5 text-center hover:border-red-500 transition-all group mb-2 shadow-sm active:scale-95 duration-200 cursor-pointer"
                            >
                                <div className="flex flex-col items-center gap-2">
                                    <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition duration-300 shadow-inner">
                                        <MapPin className="text-red-500" size={24} />
                                    </div>
                                    <p className="font-black text-base text-gray-900 tracking-tight">
                                        ¿Dónde entregamos?
                                    </p>
                                </div>
                            </button>
                        ) : (
                            <div className="flex flex-col gap-3">
                                <div className="bg-gray-50 rounded-[32px] p-6 border border-gray-100 flex items-center justify-between">
                                    <div className="flex items-center gap-4 overflow-hidden">
                                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-gray-100 shrink-0">
                                            <MapPin className="text-red-500" size={20} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-black text-sm text-gray-900 truncate">
                                                {address}
                                                {house && `, ${house}`}
                                                {apartment && `, ${apartment}`}
                                            </p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                {selectedZone && (
                                                    <span
                                                        className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full text-white"
                                                        style={{
                                                            backgroundColor: selectedZone.color,
                                                        }}
                                                    >
                                                        {selectedZone.name}
                                                    </span>
                                                )}
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                                                    CP: {postalCode}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleAddressClick}
                                        className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 hover:bg-gray-50 active:scale-90 transition shrink-0 ml-2 cursor-pointer"
                                    >
                                        <ArrowRight size={18} className="text-gray-400" />
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 gap-3 -mt-1">
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 px-1 tracking-wider">
                                            Portal / Casa
                                        </label>
                                        <input
                                            value={house}
                                            onChange={e => setHouse(e.target.value)}
                                            placeholder="Ej: 20"
                                            data-testid="house-input-mobile"
                                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold outline-none focus:ring-2 ring-red-500/10 transition"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 px-1 tracking-wider">
                                            Piso / Puerta
                                        </label>
                                        <input
                                            value={apartment}
                                            onChange={e => setApartment(e.target.value)}
                                            placeholder="Ej: 1B"
                                            data-testid="apartment-input-mobile"
                                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold outline-none focus:ring-2 ring-red-500/10 transition"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="hidden md:block">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase mb-1 px-1">
                                    Calle / Avenida *
                                </label>
                                <input
                                    value={address}
                                    onChange={e => setAddress(e.target.value)}
                                    placeholder="Ej: Calle de Serrano"
                                    data-testid="address-input"
                                    className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-sm font-bold outline-none focus:ring-2 ring-red-500/10 transition"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase mb-1 px-1">
                                        Portal
                                    </label>
                                    <input
                                        value={house}
                                        onChange={e => setHouse(e.target.value)}
                                        placeholder="Ej: 20"
                                        data-testid="house-input-desktop"
                                        className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-sm font-bold outline-none focus:ring-2 ring-red-500/10 transition"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase mb-1 px-1">
                                        Piso
                                    </label>
                                    <input
                                        value={apartment}
                                        onChange={e => setApartment(e.target.value)}
                                        placeholder="Ej: 1B"
                                        data-testid="apartment-input-desktop"
                                        className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-sm font-bold outline-none focus:ring-2 ring-red-500/10 transition"
                                    />
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase mb-1 px-1">
                                Código Postal
                            </label>
                            <input
                                value={postalCode}
                                onChange={e => setPostalCode(e.target.value)}
                                placeholder="28001"
                                maxLength={5}
                                className="w-64 px-4 py-3 bg-gray-50 border-none rounded-2xl text-sm font-bold outline-none focus:ring-2 ring-red-500/10 transition"
                            />
                        </div>
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
                                    <input
                                        type="time"
                                        value={scheduledTime}
                                        onChange={e => setScheduledTime(e.target.value)}
                                        className="w-full px-4 h-[46px] border border-gray-200 rounded-xl text-sm outline-none focus:border-red-400 bg-white"
                                    />
                                </div>
                            </div>
                            <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100/50">
                                <p className="text-[10px] font-black text-blue-900/40 uppercase tracking-widest mb-1.5">
                                    Horario de atención
                                </p>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-[10px] font-bold text-blue-800/70">
                                    <span>Mié – Vie: 20:00 – 23:00</span>
                                    <span className="text-right">Sáb: 14:00 – 17:00 / 20:00 – 23:00</span>
                                    <span>Dom: 14:00 – 17:00</span>
                                    <span className="text-right text-red-400/60 uppercase">Lun – Mar: Cerrado</span>
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
