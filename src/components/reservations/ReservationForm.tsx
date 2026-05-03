import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, User, CheckCircle2, AlertCircle, Minus, Plus } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../utils/api';
import { BUSINESS_HOURS } from '../../utils/storeStatus';
import CustomDatePicker from '../ui/CustomDatePicker';
import CustomTimePicker from '../ui/CustomTimePicker';

interface ReservationFormProps {
    onSuccess?: () => void;
    className?: string;
    showTitle?: boolean;
}

export default function ReservationForm({
    onSuccess,
    className = '',
    showTitle = false,
}: ReservationFormProps) {
    const { user, isAuthenticated } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: '',
        date: '',
        time: '',
        guests: 2,
        notes: '',
    });

    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                name: user.name,
                email: user.email,
            }));
        }
    }, [user]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;

        if (name === 'date') {
            const today = new Date().toLocaleDateString('en-CA');
            if (value < today) return;
            setFormData(prev => ({ ...prev, date: value, time: '' }));
            return;
        }

        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const getTimeSlots = () => {
        if (!formData.date) return [];
        const [yr, mo, dy] = formData.date.split('-').map(Number);
        const dateObj = new Date(yr, mo - 1, dy);
        const day = dateObj.getDay();
        const intervals = BUSINESS_HOURS[day] || [];

        const now = new Date();
        const isToday = formData.date === now.toLocaleDateString('en-CA');
        const currentH = now.getHours();
        const currentM = now.getMinutes();

        const slots: string[] = [];
        intervals.forEach(interval => {
            const [startH] = interval.start.split(':').map(Number);
            const [endH] = interval.end.split(':').map(Number);

            for (let h = startH; h < endH; h++) {
                ['00', '30'].forEach(m => {
                    const slotM = Number(m);

                    // If today, filter out passed or too close slots
                    if (isToday) {
                        if (h < currentH || (h === currentH && slotM <= currentM + 15)) {
                            return;
                        }
                    }

                    slots.push(`${h.toString().padStart(2, '0')}:${m}`);
                });
            }
        });
        return slots;
    };

    const availableSlots = getTimeSlots();
    const isDayClosed = Boolean(formData.date && availableSlots.length === 0);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            // 1. Try to save to DB (Log the attempt, but don't let it block WhatsApp)
            try {
                await api.post('/reservations', {
                    name: formData.name,
                    email: formData.email,
                    phone: `+34${formData.phone.replace(/\D/g, '')}`,
                    date: formData.date,
                    time: formData.time,
                    guests: formData.guests,
                    notes: formData.notes,
                    user_id:
                        user?.id && user.id.length > 5 && !user.id.includes('!') ? user.id : null,
                });
            } catch (dbErr) {
                console.error(
                    'Warning: Could not save reservation to DB, proceeding to WhatsApp:',
                    dbErr
                );
            }

            // 2. Prepare WhatsApp redirect
            const formattedDate = new Date(formData.date).toLocaleDateString('es-ES', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
            });

            const message =
                `Nueva Reserva de Mesa\n\n` +
                `Nombre: ${formData.name}\n` +
                `Teléfono: +34 ${formData.phone.replace(/\s/g, '')}\n` +
                `Fecha: ${formattedDate}\n` +
                `Hora: ${formData.time}\n` +
                `Personas: ${formData.guests}`;

            const encodedMessage = encodeURIComponent(message);
            const whatsappUrl = `https://wa.me/34631920312?text=${encodedMessage}`;

            // 3. Trigger redirect
            const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
            if (isMobile) {
                window.location.href = whatsappUrl;
            } else {
                window.open(whatsappUrl, '_blank');
            }

            // 4. Set success state
            setIsSuccess(true);
            if (onSuccess) onSuccess();
        } catch (err: any) {
            console.error('Error initiating reservation redirect:', err);
            setError(
                err.message || 'Hubo un error al procesar tu reserva. Por favor intenta de nuevo.'
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const today = new Date().toLocaleDateString('en-CA');

    return (
        <div className={className}>
            {showTitle && (
                <div className="mb-8">
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight leading-tight">
                        Reservar Mesa
                    </h2>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                        Sushi de Maksim
                    </p>
                </div>
            )}

            {isSuccess ? (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-8"
                >
                    <div className="w-20 h-20 bg-green-50 text-green-600 rounded-[26px] flex items-center justify-center mx-auto mb-6 shadow-sm border border-green-100">
                        <CheckCircle2 size={40} strokeWidth={2.5} />
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 mb-3 uppercase tracking-tight">
                        ¡Mesa Reservada!
                    </h3>
                    <p className="text-base text-gray-500 font-medium mb-10 leading-relaxed max-w-sm mx-auto">
                        Hemos recibido tu solicitud para el{' '}
                        <span className="text-gray-900 font-bold">
                            {(() => {
                                const d = new Date(formData.date);
                                return `${d.getDate()} de ${d.toLocaleString('es-ES', { month: 'long' })}`;
                            })()}
                        </span>{' '}
                        a las <span className="text-gray-900 font-bold">{formData.time}</span>. Te
                        esperamos.
                    </p>
                </motion.div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-3.5">
                    {error && (
                        <div className="p-4 bg-orange-50 border border-orange-100 rounded-2xl flex items-center gap-3 text-orange-600 text-xs font-bold">
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}

                    {/* 1. Nombre Completo */}
                    <div className="space-y-1.5">
                        <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">
                            Nombre Completo
                        </label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-orange-500 transition-colors">
                                <User size={18} strokeWidth={1.5} />
                            </div>
                            <input
                                required
                                type="text"
                                name="name"
                                placeholder="Tu nombre и apellidos"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full pl-11 pr-4 py-2.5 bg-gray-50/50 border-2 border-transparent rounded-[1.25rem] focus:bg-white focus:border-orange-600 outline-none transition-all font-bold text-base text-gray-900 shadow-sm placeholder:text-gray-400 placeholder:font-medium"
                            />
                        </div>
                    </div>

                    {/* 2. Fecha и Hora */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">
                                Fecha
                            </label>
                            <CustomDatePicker
                                value={formData.date}
                                onChange={date => {
                                    const today = new Date().toLocaleDateString('en-CA');
                                    if (date < today && date !== '') return;
                                    setFormData(prev => ({
                                        ...prev,
                                        date,
                                        time: '',
                                    }));
                                }}
                                min={today}
                                placeholder="Hoy/Mañana"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">
                                Hora
                            </label>
                            {!formData.date ? (
                                <div className="h-12 flex items-center justify-center bg-gray-50/50 border-2 border-transparent rounded-[1.25rem] text-[11px] font-bold text-gray-400 uppercase tracking-widest px-2 opacity-60">
                                    Selecciona fecha primero
                                </div>
                            ) : isDayClosed ? (
                                <div className="h-12 flex items-center justify-center bg-orange-50/50 border-2 border-transparent rounded-[1.25rem] text-[11px] font-bold text-orange-500 uppercase tracking-widest px-2">
                                    Cerrado
                                </div>
                            ) : (
                                <CustomTimePicker
                                    value={formData.time}
                                    onChange={time => setFormData(prev => ({ ...prev, time }))}
                                    slots={availableSlots}
                                    placeholder="Selecciona"
                                />
                            )}
                        </div>
                    </div>

                    {/* 3. Personas и Teléfono */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">
                                Personas
                            </label>
                            <div className="flex items-center justify-between bg-gray-50/50 p-1 rounded-[1.25rem] border-2 border-transparent h-12 shadow-sm">
                                <span
                                    className="pl-4 text-base font-medium text-gray-900 leading-none min-w-[2rem] text-center"
                                    style={{ fontVariantNumeric: 'tabular-nums' }}
                                >
                                    {formData.guests}
                                </span>
                                <div className="flex items-center gap-1 bg-white p-1 rounded-xl shadow-sm border border-gray-100">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setFormData(prev => ({
                                                ...prev,
                                                guests: Math.max(1, prev.guests - 1),
                                            }))
                                        }
                                        className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-orange-600 hover:bg-orange-50 transition-all border-none bg-transparent cursor-pointer"
                                    >
                                        <Minus size={14} strokeWidth={3} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setFormData(prev => ({
                                                ...prev,
                                                guests: Math.min(30, prev.guests + 1),
                                            }))
                                        }
                                        className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-orange-600 hover:bg-orange-50 transition-all border-none bg-transparent cursor-pointer"
                                    >
                                        <Plus size={14} strokeWidth={3} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1.5 min-w-0">
                            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">
                                Teléfono
                            </label>
                            <div className="flex items-center bg-gray-50/50 border-2 border-transparent rounded-[1.25rem] focus-within:bg-white focus-within:border-orange-600 transition-all overflow-hidden h-12 shadow-sm min-w-0">
                                <div className="pl-4 pr-3 text-gray-400 font-bold text-sm select-none border-r border-gray-200/50 h-[60%] flex items-center">
                                    +34
                                </div>
                                <input
                                    required
                                    type="tel"
                                    name="phone"
                                    placeholder="600 000 000"
                                    maxLength={9}
                                    value={formData.phone}
                                    onChange={e => {
                                        const val = e.target.value.replace(/\D/g, '');
                                        if (val.length <= 9) {
                                            handleChange({
                                                ...e,
                                                target: {
                                                    ...e.target,
                                                    value: val,
                                                    name: 'phone',
                                                },
                                            } as any);
                                        }
                                    }}
                                    className="flex-1 min-w-0 bg-transparent border-none text-base font-medium outline-none px-3 h-full tracking-wider placeholder:text-gray-400/50 placeholder:font-medium placeholder:tracking-normal"
                                />
                            </div>
                        </div>
                    </div>

                    {!isAuthenticated && (
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">
                                Email
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-orange-500 transition-colors">
                                    <Mail size={18} strokeWidth={1.5} />
                                </div>
                                <input
                                    required
                                    type="email"
                                    name="email"
                                    placeholder="tucorreo@ejemplo.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full pl-11 pr-4 py-2.5 bg-gray-50/50 border-2 border-transparent rounded-[1.25rem] focus:bg-white focus:border-orange-600 outline-none transition-all font-bold text-base text-gray-900 shadow-sm placeholder:text-gray-400 placeholder:font-medium"
                                />
                            </div>
                        </div>
                    )}

                    <button
                        disabled={isSubmitting}
                        type="submit"
                        className="w-full py-4 bg-orange-600 text-white rounded-[1.5rem] font-black text-xs hover:bg-orange-700 transition-all shadow-xl shadow-orange-100 flex items-center justify-center gap-3 mt-4 active:scale-[0.98] border-none cursor-pointer h-14"
                    >
                        {isSubmitting ? (
                            <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <span className="relative z-10 flex items-center gap-3 tracking-[0.15em]">
                                RESERVAR AHORA
                            </span>
                        )}
                    </button>
                </form>
            )}
        </div>
    );
}
