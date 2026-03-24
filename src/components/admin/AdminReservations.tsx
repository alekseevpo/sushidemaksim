import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users,
    Calendar,
    Clock,
    Phone,
    Mail,
    CheckCircle,
    XCircle,
    Trash2,
    Search,
    MessageSquare,
} from 'lucide-react';
import { api } from '../../utils/api';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import DeleteConfirmationModal from './DeleteConfirmationModal';

interface Reservation {
    id: string;
    name: string;
    email: string;
    phone: string;
    reservation_date: string;
    reservation_time: string;
    guests: number;
    status: 'pending' | 'confirmed' | 'cancelled';
    notes?: string;
    created_at: string;
}

export default function AdminReservations() {
    const queryClient = useQueryClient();
    const [filter, setFilter] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [reservationToDelete, setReservationToDelete] = useState<Reservation | null>(null);

    const { data, isLoading } = useQuery({
        queryKey: ['admin-reservations', filter],
        queryFn: () => api.get(`/admin/reservations${filter !== 'all' ? `?status=${filter}` : ''}`),
        refetchInterval: 30000,
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, status, notes }: { id: string; status?: string; notes?: string }) =>
            api.patch(`/admin/reservations/${id}`, { status, notes }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-reservations'] });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => api.delete(`/admin/reservations/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-reservations'] });
            setReservationToDelete(null);
        },
    });

    const reservations = (data?.reservations || []) as Reservation[];

    const filteredReservations = reservations.filter(
        res =>
            res.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            res.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            res.phone.includes(searchTerm)
    );

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed':
                return 'text-green-600 bg-green-50';
            case 'cancelled':
                return 'text-red-600 bg-red-50';
            default:
                return 'text-amber-600 bg-amber-50';
        }
    };

    const stats = {
        total: reservations.length,
        pending: reservations.filter(r => r.status === 'pending').length,
        confirmed: reservations.filter(r => r.status === 'confirmed').length,
    };

    return (
        <div className="space-y-6">
            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                    <p className="text-gray-400 text-xs font-black uppercase tracking-widest mb-1">
                        Total Reservas
                    </p>
                    <p className="text-3xl font-black text-gray-900">{stats.total}</p>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                    <p className="text-amber-600 text-xs font-black uppercase tracking-widest mb-1">
                        Pendientes
                    </p>
                    <p className="text-3xl font-black text-amber-600">{stats.pending}</p>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                    <p className="text-green-600 text-xs font-black uppercase tracking-widest mb-1">
                        Confirmadas Today
                    </p>
                    <p className="text-3xl font-black text-green-600">{stats.confirmed}</p>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
                <div className="flex-1 w-full relative">
                    <Search
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                        size={18}
                    />
                    <input
                        type="text"
                        placeholder="Buscar por nombre, email o teléfono..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-red-600/20 outline-none transition-all"
                    />
                </div>
                <div className="flex gap-2 w-full md:w-auto overflow-x-auto no-scrollbar pb-1 md:pb-0">
                    {['all', 'pending', 'confirmed', 'cancelled'].map(s => (
                        <button
                            key={s}
                            onClick={() => setFilter(s)}
                            className={`px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${
                                filter === s
                                    ? 'bg-gray-900 text-white'
                                    : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                            }`}
                        >
                            {s === 'all'
                                ? 'Ver Todo'
                                : s === 'pending'
                                  ? 'Pendientes'
                                  : s === 'confirmed'
                                    ? 'Confirmadas'
                                    : 'Canceladas'}
                        </button>
                    ))}
                </div>
            </div>

            {/* List */}
            {isLoading ? (
                <div className="flex flex-col gap-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-32 bg-gray-100 rounded-3xl animate-pulse" />
                    ))}
                </div>
            ) : filteredReservations.length === 0 ? (
                <div className="bg-white p-12 rounded-[2.5rem] border-2 border-dashed border-gray-100 text-center">
                    <div className="w-16 h-16 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Users size={32} />
                    </div>
                    <p className="font-bold text-gray-400">No se encontraron reservas</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    <AnimatePresence mode="popLayout">
                        {filteredReservations.map(res => (
                            <motion.div
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                key={res.id}
                                className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col lg:flex-row gap-6 items-start lg:items-center"
                            >
                                <div className="flex-1 space-y-4">
                                    <div className="flex flex-wrap items-center gap-3">
                                        <span
                                            className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider ${getStatusColor(res.status)}`}
                                        >
                                            {res.status === 'pending'
                                                ? 'Pendiente'
                                                : res.status === 'confirmed'
                                                  ? 'Confirmada'
                                                  : 'Cancelada'}
                                        </span>
                                        <span className="text-gray-300">|</span>
                                        <h3 className="text-lg font-black text-gray-900 uppercase tracking-tighter flex items-center gap-2">
                                            {res.name}
                                            <span className="text-gray-400 text-sm font-medium">
                                                ({res.guests} pers.)
                                            </span>
                                        </h3>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                        <div className="flex items-center gap-3 text-sm font-bold text-gray-600">
                                            <Calendar size={16} className="text-gray-400" />
                                            {format(
                                                new Date(res.reservation_date),
                                                "eeee d 'de' MMMM",
                                                { locale: es }
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3 text-sm font-bold text-gray-600">
                                            <Clock size={16} className="text-gray-400" />
                                            {res.reservation_time}
                                        </div>
                                        <div className="flex items-center gap-3 text-sm font-bold text-gray-600">
                                            <Phone size={16} className="text-gray-400" />
                                            {res.phone}
                                        </div>
                                        <div className="flex items-center gap-3 text-sm font-bold text-gray-400">
                                            <Mail size={16} />
                                            {res.email}
                                        </div>
                                    </div>

                                    {res.notes && (
                                        <div className="p-3 bg-gray-50 rounded-2xl flex gap-3 items-start border border-gray-100">
                                            <MessageSquare
                                                size={16}
                                                className="text-gray-400 mt-0.5"
                                            />
                                            <p className="text-xs font-medium text-gray-500 italic">
                                                "{res.notes}"
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-wrap gap-2 lg:w-48 justify-end">
                                    {res.status === 'pending' && (
                                        <>
                                            <button
                                                onClick={() =>
                                                    updateMutation.mutate({
                                                        id: res.id,
                                                        status: 'confirmed',
                                                    })
                                                }
                                                className="h-12 w-12 rounded-2xl bg-green-500 text-white flex items-center justify-center hover:bg-green-600 transition-all shadow-lg shadow-green-500/10"
                                                title="Confirmar"
                                            >
                                                <CheckCircle size={20} />
                                            </button>
                                            <button
                                                onClick={() =>
                                                    updateMutation.mutate({
                                                        id: res.id,
                                                        status: 'cancelled',
                                                    })
                                                }
                                                className="h-12 w-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-200 transition-all"
                                                title="Cancelar"
                                            >
                                                <XCircle size={20} />
                                            </button>
                                        </>
                                    )}
                                    {res.status !== 'pending' && (
                                        <button
                                            onClick={() =>
                                                updateMutation.mutate({
                                                    id: res.id,
                                                    status: 'pending',
                                                })
                                            }
                                            className="px-4 h-12 rounded-2xl bg-gray-100 text-gray-500 font-bold text-xs hover:bg-gray-200 transition-all"
                                        >
                                            REVERTIR
                                        </button>
                                    )}
                                    <button
                                        onClick={() => setReservationToDelete(res)}
                                        className="h-12 w-12 rounded-2xl bg-gray-50 text-gray-400 flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all border border-gray-100"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {/* Custom Delete Confirmation Modal */}
            <DeleteConfirmationModal
                isOpen={!!reservationToDelete}
                onClose={() => setReservationToDelete(null)}
                onConfirm={() =>
                    reservationToDelete && deleteMutation.mutate(reservationToDelete.id)
                }
                title="¿Eliminar Reserva?"
                description={`Estás a punto de eliminar la reserva de ${reservationToDelete?.name}. Esta acción no se puede deshacer.`}
                isLoading={deleteMutation.isPending}
                itemType="reserva"
                itemName={reservationToDelete?.name}
            />
        </div>
    );
}
