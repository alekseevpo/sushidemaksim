import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Mail,
    User,
    CheckCircle2,
    AlertCircle,
    Clock,
    ChevronDown,
    Minus,
    Plus,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../utils/api';
import { BUSINESS_HOURS } from '../../utils/storeStatus';
import CustomDatePicker from '../ui/CustomDatePicker';

interface ReservationModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function ReservationModal({ isOpen, onClose }: ReservationModalProps) {
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
        const dateObj = new Date(formData.date);
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
            // 1. First save to DB (Required now for success state)
            await api.post('/reservations', {
                ...formData,
                phone: `+34${formData.phone.replace(/\s/g, '')}`,
                user_id: user?.id,
            });

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
            const whatsappUrl = `https://wa.me/34641518390?text=${encodedMessage}`;

            // 3. Trigger redirect
            const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
            if (isMobile) {
                window.location.href = whatsappUrl;
            } else {
                window.open(whatsappUrl, '_blank');
            }

            // 4. Only now set success
            setIsSuccess(true);
        } catch (err: any) {
            console.error('Error initiating reservation:', err);
            setError(
                err.message || 'Hubo un error al procesar tu reserva. Por favor intenta de nuevo.'
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const today = new Date().toLocaleDateString('en-CA');

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[1000] flex items-start justify-center"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ y: '-100%', opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: '-100%', opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                        onClick={e => e.stopPropagation()}
                        className="relative w-full max-w-md bg-white md:rounded-b-[2rem] shadow-2xl flex flex-col overflow-hidden"
                    >
                        {/* Header Image/Pattern */}
                        <div className="h-16 md:h-18 bg-red-600 relative overflow-hidden flex items-center justify-center shrink-0">
                            <div className="absolute inset-0 opacity-10 flex flex-wrap gap-4 p-2 pointer-events-none">
                                {[...Array(15)].map((_, i) => (
                                    <div key={i} className="text-2xl font-serif text-white">
                                        福
                                    </div>
                                ))}
                            </div>
                            <h2 className="relative z-10 text-base md:text-xl font-black text-white tracking-[0.1em] uppercase">
                                Reservar Mesa
                            </h2>
                        </div>

                        <div className="px-4 py-4 md:p-6 flex flex-col gap-4">
                            {isSuccess ? (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-center py-6"
                                >
                                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <CheckCircle2 size={40} />
                                    </div>
                                    <h3 className="text-2xl font-black text-gray-900 mb-2 uppercase tracking-tighter">
                                        ¡Reserva Solicitada!
                                    </h3>
                                    <p className="text-gray-500 font-medium mb-8">
                                        Hemos recibido tu solicitud para el{' '}
                                        <span className="text-gray-900 font-bold">
                                            {(() => {
                                                const d = new Date(formData.date);
                                                return `${d.getDate()} de ${d.toLocaleString('es-ES', { month: 'long' })} ${d.getFullYear()}`;
                                            })()}
                                        </span>{' '}
                                        a las{' '}
                                        <span className="text-gray-900 font-bold">
                                            {formData.time}
                                        </span>
                                        . Te contactaremos pronto para confirmar.
                                    </p>
                                    <button
                                        onClick={onClose}
                                        className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black text-xs tracking-widest hover:bg-black transition-all"
                                    >
                                        ENTENDIDO
                                    </button>
                                </motion.div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-3">
                                    {error && (
                                        <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 text-[11px] font-bold">
                                            <AlertCircle size={14} />
                                            {error}
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-3">
                                                Fecha
                                            </label>
                                            <div className="relative">
                                                <CustomDatePicker
                                                    value={formData.date}
                                                    onChange={date => {
                                                        const today = new Date().toLocaleDateString('en-CA');
                                                        if (date < today && date !== '') return;
                                                        setFormData(prev => ({ ...prev, date, time: '' }));
                                                    }}
                                                    min={today}
                                                    placeholder="dd/mm/aaaa"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-3">
                                                Hora
                                            </label>
                                            {!formData.date ? (
                                                <div className="h-11 flex items-center justify-center bg-gray-50 border border-gray-100 rounded-xl text-[10px] font-bold text-gray-400 uppercase text-center tracking-widest px-2">
                                                    Fecha primero
                                                </div>
                                            ) : isDayClosed ? (
                                                <div className="h-11 flex items-center justify-center bg-red-50 border border-red-100 rounded-xl text-[10px] font-bold text-red-500 uppercase text-center tracking-widest px-2">
                                                    Cerrado
                                                </div>
                                            ) : (
                                                <div className="relative">
                                                    <Clock
                                                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                                                        size={16}
                                                    />
                                                    <select
                                                        required
                                                        name="time"
                                                        value={formData.time}
                                                        onChange={handleChange}
                                                        className="w-full pl-10 pr-8 h-11 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold focus:ring-4 focus:ring-red-600/5 focus:border-red-600 transition-all outline-none appearance-none cursor-pointer"
                                                    >
                                                        <option value="" disabled>
                                                            Selecciona hora
                                                        </option>
                                                        {availableSlots.map(slot => (
                                                            <option key={slot} value={slot}>
                                                                {slot}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <ChevronDown
                                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                                                        size={14}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 pb-1">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-3">
                                                Personas
                                            </label>
                                            <div className="flex items-center justify-between bg-gray-50 p-1 rounded-xl border border-gray-100 h-11">
                                                <div className="pl-3">
                                                    <span className="text-sm font-black text-gray-900 leading-none">
                                                        {formData.guests}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg shadow-sm border border-gray-100">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setFormData(prev => ({
                                                                ...prev,
                                                                guests: Math.max(
                                                                    1,
                                                                    prev.guests - 1
                                                                ),
                                                            }))
                                                        }
                                                        className="w-8 h-8 rounded-md flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all border-none bg-transparent cursor-pointer"
                                                    >
                                                        <Minus size={14} strokeWidth={3} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setFormData(prev => ({
                                                                ...prev,
                                                                guests: prev.guests + 1,
                                                            }))
                                                        }
                                                        className="w-8 h-8 rounded-md flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all border-none bg-transparent cursor-pointer"
                                                    >
                                                        <Plus size={14} strokeWidth={3} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-3">
                                                Teléfono
                                            </label>
                                            <div className="relative">
                                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">
                                                    +34
                                                </div>
                                                <input
                                                    required
                                                    type="tel"
                                                    name="phone"
                                                    placeholder="Ej: 600 000 000"
                                                    minLength={9}
                                                    pattern="[0-9]{9,}"
                                                    value={formData.phone}
                                                    onChange={handleChange}
                                                    className="w-full pl-11 pr-2 h-11 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold focus:ring-4 focus:ring-red-600/5 focus:border-red-600 transition-all outline-none"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-3">
                                            Nombre Completo
                                        </label>
                                        <div className="relative">
                                            <User
                                                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                                                size={16}
                                            />
                                            <input
                                                required
                                                type="text"
                                                name="name"
                                                placeholder="Tu nombre"
                                                value={formData.name}
                                                onChange={handleChange}
                                                className="w-full pl-10 pr-2 h-11 bg-gray-50 border border-gray-100 rounded-xl text-[12px] font-bold focus:ring-4 focus:ring-red-600/5 focus:border-red-600 transition-all outline-none"
                                            />
                                        </div>
                                    </div>

                                    {!isAuthenticated && (
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-3">
                                                Email
                                            </label>
                                            <div className="relative">
                                                <Mail
                                                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                                                    size={16}
                                                />
                                                <input
                                                    required
                                                    type="email"
                                                    name="email"
                                                    placeholder="tucorreo@ejemplo.com"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    className="w-full pl-10 pr-2 h-11 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold focus:ring-4 focus:ring-red-600/5 focus:border-red-600 transition-all outline-none"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <button
                                        disabled={isSubmitting}
                                        type="submit"
                                        className="w-full py-4 bg-red-600 text-white rounded-2xl font-black text-sm hover:bg-red-700 transition-all shadow-xl shadow-red-100 flex items-center justify-center gap-2 mt-4 active:scale-[0.98] border-none cursor-pointer"
                                    >
                                        {/* Shine & Anim Effects */}
                                        {/* No shine effect */}

                                        {isSubmitting ? (
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                <span className="relative z-10 flex items-center gap-3">
                                                    RESERVAR AHORA
                                                </span>
                                            </>
                                        )}
                                    </button>
                                </form>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
