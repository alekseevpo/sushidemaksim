import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    Calendar,
    Phone,
    Mail,
    User,
    CheckCircle2,
    ChevronRight,
    AlertCircle,
    Clock,
    ChevronDown,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../utils/api';
import { BUSINESS_HOURS } from '../../utils/storeStatus';

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
        setFormData(prev => ({ ...prev, [name]: value }));
        if (name === 'date') {
            setFormData(prev => ({ ...prev, time: '' }));
        }
    };

    const getTimeSlots = () => {
        if (!formData.date) return [];
        const dateObj = new Date(formData.date);
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
    const isDayClosed = Boolean(formData.date && availableSlots.length === 0);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            await api.post('/reservations', formData);
            setIsSuccess(true);
        } catch (err: any) {
            console.error('Error creating reservation:', err);
            setError(
                err.message || 'Hubo un error al procesar tu reserva. Por favor intenta de nuevo.'
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const today = new Date().toISOString().split('T')[0];

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-[95%] max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
                    >
                        {/* Header Image/Pattern */}
                        <div className="h-20 md:h-28 bg-red-600 relative overflow-hidden flex items-center justify-center">
                            <div className="absolute inset-0 opacity-10 flex flex-wrap gap-4 p-4 pointer-events-none">
                                {[...Array(20)].map((_, i) => (
                                    <div key={i} className="text-4xl font-serif">
                                        福
                                    </div>
                                ))}
                            </div>
                            <h2 className="text-xl md:text-3xl font-black text-white tracking-tighter uppercase italic">
                                Reservar Mesa
                            </h2>
                            <button
                                onClick={onClose}
                                className="absolute top-4 md:top-6 right-4 md:right-6 w-8 h-8 md:w-10 md:h-10 rounded-full bg-black/20 text-white flex items-center justify-center hover:bg-black/40 transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <div className="p-4 md:p-8">
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
                                        <strong>{formData.date}</strong> a las{' '}
                                        <strong>{formData.time}</strong>. Te contactaremos pronto
                                        para confirmar.
                                    </p>
                                    <button
                                        onClick={onClose}
                                        className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black text-xs tracking-widest hover:bg-black transition-all"
                                    >
                                        ENTENDIDO
                                    </button>
                                </motion.div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    {error && (
                                        <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm font-bold">
                                            <AlertCircle size={18} />
                                            {error}
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-4">
                                                Fecha
                                            </label>
                                            <div className="relative">
                                                <Calendar
                                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                                                    size={18}
                                                />
                                                <input
                                                    required
                                                    type="date"
                                                    name="date"
                                                    min={today}
                                                    value={formData.date}
                                                    onChange={handleChange}
                                                    className="w-full pl-12 pr-4 h-11 md:h-13 bg-gray-50 border border-gray-100 rounded-2xl text-base font-bold focus:ring-2 focus:ring-red-600/20 focus:border-red-600 transition-all outline-none"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-4">
                                                Hora
                                            </label>
                                            {!formData.date ? (
                                                <div className="h-11 md:h-13 flex items-center justify-center bg-gray-50 border border-gray-100 rounded-2xl text-[10px] font-bold text-gray-400 uppercase text-center tracking-widest px-4">
                                                    Selecciona fecha primero
                                                </div>
                                            ) : isDayClosed ? (
                                                <div className="h-11 md:h-13 flex items-center justify-center bg-red-50 border border-red-100 rounded-2xl text-[10px] font-bold text-red-500 uppercase text-center tracking-widest px-4">
                                                    Restaurante cerrado
                                                </div>
                                            ) : (
                                                <div className="relative">
                                                    <Clock
                                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                                                        size={18}
                                                    />
                                                    <select
                                                        required
                                                        name="time"
                                                        value={formData.time}
                                                        onChange={handleChange}
                                                        className="w-full pl-12 pr-10 h-11 md:h-13 bg-gray-50 border border-gray-100 rounded-2xl text-base font-bold focus:ring-2 focus:ring-red-600/20 focus:border-red-600 transition-all outline-none appearance-none cursor-pointer"
                                                    >
                                                        <option value="" disabled>
                                                            Selecciona una hora
                                                        </option>
                                                        {availableSlots.map(slot => (
                                                            <option key={slot} value={slot}>
                                                                {slot}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <ChevronDown
                                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                                                        size={16}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-4">
                                                Personas
                                            </label>
                                            <div className="flex bg-gray-50 border border-gray-100 rounded-2xl p-1 gap-1 h-11 md:h-13">
                                                {[1, 2, 3, 4, 5, 6].map(num => (
                                                    <button
                                                        key={num}
                                                        type="button"
                                                        onClick={() =>
                                                            setFormData(prev => ({
                                                                ...prev,
                                                                guests: num,
                                                            }))
                                                        }
                                                        className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all ${
                                                            formData.guests === num
                                                                ? 'bg-white text-red-600 shadow-sm border border-gray-100'
                                                                : 'text-gray-400 hover:text-gray-500 bg-transparent opacity-60'
                                                        }`}
                                                    >
                                                        {num}
                                                    </button>
                                                ))}
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setFormData(prev => ({
                                                            ...prev,
                                                            guests:
                                                                prev.guests < 7
                                                                    ? 7
                                                                    : prev.guests + 1,
                                                        }))
                                                    }
                                                    className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all ${
                                                        formData.guests > 6
                                                            ? 'bg-red-600 text-white shadow-md border border-red-500'
                                                            : 'text-gray-400 hover:text-gray-500 bg-transparent opacity-60'
                                                    }`}
                                                >
                                                    {formData.guests > 6 ? formData.guests : '+'}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-4">
                                                Teléfono
                                            </label>
                                            <div className="relative">
                                                <Phone
                                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                                                    size={18}
                                                />
                                                <input
                                                    required
                                                    type="tel"
                                                    name="phone"
                                                    placeholder="600 000 000"
                                                    value={formData.phone}
                                                    onChange={handleChange}
                                                    className="w-full pl-12 pr-4 h-11 md:h-13 bg-gray-50 border border-gray-100 rounded-2xl text-base font-bold focus:ring-2 focus:ring-red-600/20 focus:border-red-600 transition-all outline-none"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-4">
                                            Nombre
                                        </label>
                                        <div className="relative">
                                            <User
                                                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                                                size={18}
                                            />
                                            <input
                                                required
                                                type="text"
                                                name="name"
                                                placeholder="Tu nombre completo"
                                                value={formData.name}
                                                onChange={handleChange}
                                                className="w-full pl-12 pr-4 h-11 md:h-13 bg-gray-50 border border-gray-100 rounded-2xl text-base font-bold focus:ring-2 focus:ring-red-600/20 focus:border-red-600 transition-all outline-none"
                                            />
                                        </div>
                                    </div>

                                    {!isAuthenticated && (
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-4">
                                                Email
                                            </label>
                                            <div className="relative">
                                                <Mail
                                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                                                    size={18}
                                                />
                                                <input
                                                    required
                                                    type="email"
                                                    name="email"
                                                    placeholder="email@ejemplo.com"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    className="w-full pl-12 pr-4 h-11 md:h-13 bg-gray-50 border border-gray-100 rounded-2xl text-base font-bold focus:ring-2 focus:ring-red-600/20 focus:border-red-600 transition-all outline-none"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <button
                                        disabled={isSubmitting}
                                        type="submit"
                                        className="w-full py-3 md:py-4 bg-red-600 text-white rounded-2xl font-black text-xs tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-red-600/20 hover:bg-red-700 transition-all disabled:opacity-50 mt-2"
                                    >
                                        {isSubmitting ? 'PROCESANDO...' : 'RESERVAR AHORA'}
                                        <ChevronRight size={18} />
                                    </button>
                                </form>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
