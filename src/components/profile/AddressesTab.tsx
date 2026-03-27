import { useState, useEffect, useRef } from 'react';
import { MapPin, Plus, Star, Trash2, Pencil, X } from 'lucide-react';

import { UserAddress } from '../../types';
import { api } from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import DeleteConfirmationModal from '../admin/DeleteConfirmationModal';

interface AddressSuggestion {
    display_name: string;
    address: {
        road?: string;
        house_number?: string;
        city?: string;
        town?: string;
        village?: string;
        postcode?: string;
        suburb?: string;
        state?: string;
        neighbourhood?: string;
    };
}

interface Props {
    addresses: UserAddress[];
    addAddress: (data: any) => Promise<void>;
    editAddress?: (id: string, data: any) => Promise<void>;
    removeAddress: (id: string) => Promise<void>;
    setDefaultAddress: (id: string) => Promise<void>;
}

export default function AddressesTab({
    addresses,
    addAddress,
    editAddress,
    removeAddress,
    setDefaultAddress,
}: Props) {
    const { success, error } = useToast();
    const [showAddAddress, setShowAddAddress] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [newAddress, setNewAddress] = useState({
        label: '',
        street: '',
        house: '',
        apartment: '',
        city: 'Madrid',
        postalCode: '',
        phone: '',
        isDefault: false,
    });

    const [addressToDelete, setAddressToDelete] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Autocomplete state
    const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const suggestionsRef = useRef<HTMLDivElement>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout>>();
    const ignoreNextSearchRef = useRef(false);

    // Debounced Nominatim search
    useEffect(() => {
        if (ignoreNextSearchRef.current) {
            ignoreNextSearchRef.current = false;
            return;
        }

        if (searchQuery.length < 3) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        if (debounceRef.current) clearTimeout(debounceRef.current);

        debounceRef.current = setTimeout(async () => {
            try {
                const data = await api.get(
                    `/delivery-zones/search?q=${encodeURIComponent(searchQuery)}`
                );
                setSuggestions(data || []);
                setShowSuggestions((data || []).length > 0);
            } catch {
                setSuggestions([]);
            }
        }, 400);

        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [searchQuery]);

    // Close suggestions on outside click
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const handleSelectSuggestion = (s: AddressSuggestion) => {
        const addr = s.address;
        const street = addr.road || s.display_name.split(',')[0] || '';
        const house = addr.house_number || '';
        const city = addr.city || addr.town || addr.village || addr.suburb || 'Comunidad de Madrid';
        const postalCode = addr.postcode || '';

        setNewAddress(p => ({ ...p, street, house, city, postalCode, apartment: '' }));
        ignoreNextSearchRef.current = true;
        setSearchQuery(street);
        setShowSuggestions(false);
        setSuggestions([]);
    };

    const formRef = useRef<HTMLDivElement>(null);
    const [shouldScroll, setShouldScroll] = useState(false);

    // Scroll form into view when opened
    useEffect(() => {
        if (showAddAddress && shouldScroll && formRef.current) {
            const headerOffset = window.innerWidth < 768 ? 140 : 100;
            const elementPosition = formRef.current.getBoundingClientRect().top;
            const offsetPosition =
                elementPosition + (window.scrollY || window.pageYOffset) - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth',
            });
            setShouldScroll(false);
        }
    }, [showAddAddress, shouldScroll]);

    const handleStreetChange = (value: string) => {
        setSearchQuery(value);
        setNewAddress(p => ({ ...p, street: value }));
    };

    const startEditing = (addr: UserAddress) => {
        setEditId(addr.id);

        setNewAddress({
            label: addr.label,
            street: addr.street,
            house: addr.house || '',
            apartment: addr.apartment || '',
            city: addr.city,
            postalCode: addr.postalCode || '',
            phone: addr.phone || '',
            isDefault: addr.isDefault,
        });
        ignoreNextSearchRef.current = true;
        setSearchQuery(addr.street);
        setShowAddAddress(true);
        setShouldScroll(true);
    };

    const handleAddClick = () => {
        setShowAddAddress(true);
        setShouldScroll(true);
    };

    const resetForm = () => {
        setNewAddress({
            label: '',
            street: '',
            house: '',
            apartment: '',
            city: 'Madrid',
            postalCode: '',
            phone: '',
            isDefault: false,
        });
        setSearchQuery('');
        setEditId(null);
        setShowAddAddress(false);

        // Scroll back to top of tab when form closes - use a small delay for layout settling
        setTimeout(() => {
            const headerOffset = window.innerWidth < 768 ? 140 : 100;
            const element = document.getElementById('profile-content');
            if (element) {
                const elementPosition = element.getBoundingClientRect().top;
                const offsetPosition =
                    elementPosition + (window.scrollY || window.pageYOffset) - headerOffset;
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth',
                });
            }
        }, 100);
    };

    const handleSaveAddress = async () => {
        if (!newAddress.label || !newAddress.street || !newAddress.postalCode || !newAddress.phone)
            return;
        try {
            if (editId && editAddress) {
                await editAddress(editId, newAddress);
                success('¡Dirección actualizada con éxito! 📍');
            } else {
                await addAddress(newAddress);
                success('¡Dirección añadida con éxito! 🏠');
            }
            resetForm();
        } catch (err: any) {
            error(err.message || 'Error al guardar la dirección');
        }
    };

    const confirmDelete = async () => {
        if (!addressToDelete) return;
        setIsDeleting(true);
        try {
            await removeAddress(addressToDelete);
            success('¡Dirección eliminada con éxito! 🗑️');
            setAddressToDelete(null);
        } catch (err: any) {
            error(err.message || 'Error al eliminar la dirección');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10 px-2 md:px-0">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-6">
                <div>
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight m-0">
                        Mis Direcciones
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">
                        Gestiona tus lugares de entrega frecuentes
                    </p>
                </div>

                {!showAddAddress && (
                    <button
                        onClick={handleAddClick}
                        className="flex items-center gap-2 px-6 py-2.5 bg-red-600 text-white rounded-xl font-black text-xs md:text-sm hover:bg-red-700 transition-all shadow-lg shadow-red-100 active:scale-95"
                    >
                        <Plus size={16} strokeWidth={1.5} /> Añadir dirección
                    </button>
                )}
            </div>

            {/* Add/Edit Form */}
            {showAddAddress && (
                <div
                    ref={formRef}
                    className="bg-gray-50 border-2 border-red-600/20 rounded-[32px] p-6 md:p-8 space-y-6 relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-600 rounded-full blur-[60px] opacity-5 -mr-16 -mt-16" />

                    <div className="flex items-center justify-between relative z-10">
                        <h3 className="text-lg font-black text-gray-900 m-0">
                            {editId ? 'Editar dirección' : 'Nueva dirección'}
                        </h3>
                        <button
                            onClick={resetForm}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X size={20} strokeWidth={1.5} />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">
                                Etiqueta (ej: Casa, Oficina)
                            </label>
                            <input
                                value={newAddress.label}
                                onChange={e =>
                                    setNewAddress(p => ({ ...p, label: e.target.value }))
                                }
                                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-red-600/20 outline-none transition-all"
                                placeholder="Casa"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">
                                Teléfono de contacto
                            </label>
                            <input
                                value={newAddress.phone}
                                onChange={e =>
                                    setNewAddress(p => ({ ...p, phone: e.target.value }))
                                }
                                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-red-600/20 outline-none transition-all"
                                placeholder="+34 600 000 000"
                            />
                        </div>

                        <div className="md:col-span-2 space-y-2 relative" ref={suggestionsRef}>
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">
                                Calle / Avenida *
                            </label>
                            <div className="relative">
                                <input
                                    value={searchQuery || newAddress.street}
                                    onChange={e => handleStreetChange(e.target.value)}
                                    className={`w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-red-600/20 outline-none transition-all ${newAddress.street && 'border-green-100 bg-green-50/10'}`}
                                    placeholder="Introduce tu calle y número..."
                                    autoComplete="off"
                                />
                                <MapPin
                                    size={16}
                                    strokeWidth={1.5}
                                    className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors ${newAddress.street ? 'text-green-500' : 'text-gray-300'}`}
                                />
                            </div>

                            {showSuggestions && suggestions.length > 0 && (
                                <div className="absolute top-[calc(100%+4px)] left-0 right-0 z-50 bg-white border border-gray-100 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 divide-y divide-gray-50">
                                    {suggestions.map((s, i) => (
                                        <button
                                            key={i}
                                            type="button"
                                            onClick={() => handleSelectSuggestion(s)}
                                            className="flex items-start gap-3 w-full p-4 text-left hover:bg-red-50 transition-colors group"
                                        >
                                            <MapPin
                                                size={14}
                                                strokeWidth={1.5}
                                                className="mt-1 text-gray-300 group-hover:text-red-500 transition-colors shrink-0"
                                            />
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-xs font-bold text-gray-900 group-hover:text-red-600 truncate">
                                                    {s.address?.road ||
                                                        s.display_name.split(',')[0]}
                                                    {s.address?.house_number &&
                                                        `, ${s.address.house_number}`}
                                                </span>
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest truncate">
                                                    {s.address?.city ||
                                                        s.address?.town ||
                                                        s.address?.village ||
                                                        s.address?.suburb ||
                                                        'Comunidad de Madrid'}
                                                    {s.address?.postcode &&
                                                        ` • ${s.address.postcode}`}
                                                </span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="space-y-2 flex flex-col">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">
                                Número *
                            </label>
                            <input
                                value={newAddress.house}
                                readOnly
                                className="w-full bg-gray-100 border border-transparent rounded-xl px-4 py-3 text-sm font-bold text-gray-500 cursor-not-allowed outline-none"
                                placeholder="Busca arriba..."
                            />
                            {!newAddress.house && newAddress.street && (
                                <p className="text-[9px] font-bold text-red-500 mt-1.5 px-1 animate-pulse leading-none h-2">
                                    Busca tu calle con el número arriba
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">
                                Piso, Escalera, Puerta *
                            </label>
                            <input
                                value={newAddress.apartment}
                                onChange={e =>
                                    setNewAddress(p => ({ ...p, apartment: e.target.value }))
                                }
                                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-red-600/20 outline-none transition-all"
                                placeholder="Piso 3, Puerta A..."
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">
                                Ciudad
                            </label>
                            <input
                                value={newAddress.city}
                                readOnly
                                className="w-full bg-gray-100 border border-transparent rounded-xl px-4 py-3 text-sm font-bold text-gray-500 cursor-not-allowed outline-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">
                                Código Postal
                            </label>
                            <input
                                value={newAddress.postalCode}
                                readOnly
                                className="w-full bg-gray-100 border border-transparent rounded-xl px-4 py-3 text-sm font-bold text-gray-500 cursor-not-allowed outline-none"
                                placeholder="28001"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-4 relative z-10">
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={newAddress.isDefault}
                                onChange={e =>
                                    setNewAddress(p => ({ ...p, isDefault: e.target.checked }))
                                }
                                className="w-5 h-5 rounded-lg border-2 border-gray-300 text-red-600 focus:ring-red-600 transition-all cursor-pointer"
                            />
                            <span className="text-sm font-black text-gray-600 group-hover:text-gray-900 transition-colors">
                                Establecer como predeterminada
                            </span>
                        </label>

                        <div className="flex items-center gap-3 w-full sm:w-auto mt-2 sm:mt-0">
                            <button
                                onClick={resetForm}
                                className="flex-1 sm:flex-none px-8 py-3.5 bg-gray-100 text-gray-500 rounded-xl font-black text-xs md:text-sm hover:bg-gray-200 hover:text-gray-900 transition-all active:scale-95"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSaveAddress}
                                className="flex-1 sm:flex-none px-8 py-3.5 bg-red-600 text-white rounded-xl font-black text-xs md:text-sm hover:bg-red-700 transition-all shadow-xl shadow-red-100 active:scale-95"
                            >
                                {editId ? 'Guardar Cambios' : 'Guardar Dirección'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Address List */}
            <div className="grid grid-cols-1 gap-4">
                {addresses.length === 0 && !showAddAddress ? (
                    <div className="bg-gray-50 rounded-[40px] p-12 text-center border-2 border-dashed border-gray-200">
                        <div className="w-20 h-20 bg-white rounded-3xl shadow-xl flex items-center justify-center mx-auto mb-6 text-3xl">
                            🏠
                        </div>
                        <h3 className="text-xl font-black text-gray-900 mb-2">Sin direcciones</h3>
                        <p className="text-gray-500 text-sm max-w-xs mx-auto mb-8">
                            Añade una dirección para que tus pedidos lleguen volando.
                        </p>
                        <button
                            onClick={handleAddClick}
                            className="inline-flex items-center gap-2 px-8 py-3 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-700 transition-all"
                        >
                            <Plus size={18} strokeWidth={1.5} /> Añadir ahora
                        </button>
                    </div>
                ) : (
                    addresses.map(addr => (
                        <div
                            key={addr.id}
                            className={`group p-3 md:p-4 rounded-[24px] border transition-all duration-300 flex flex-row items-center gap-3 md:gap-5
                                ${
                                    addr.isDefault
                                        ? 'bg-red-50/50 border-red-200 shadow-lg shadow-red-100/30'
                                        : 'bg-white border-gray-100 hover:border-red-100 hover:shadow-md'
                                }`}
                        >
                            <div
                                className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 shadow-sm
                                ${addr.isDefault ? 'bg-red-600 text-white shadow-red-200' : 'bg-gray-100 text-gray-400'}`}
                            >
                                <MapPin size={addr.isDefault ? 18 : 20} strokeWidth={1.5} />
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center flex-wrap gap-1.5 md:gap-2 mb-0.5 md:mb-1">
                                    <h4 className="text-sm md:text-base font-black text-gray-900 m-0 truncate">
                                        {addr.label}
                                    </h4>
                                    {addr.isDefault && (
                                        <div className="bg-green-600 text-white text-[8px] md:text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full shadow-sm">
                                            Default
                                        </div>
                                    )}
                                </div>
                                <p className="text-[11px] md:text-[13px] font-bold text-gray-800 m-0 leading-tight truncate">
                                    {addr.street}
                                    {addr.house && `, ${addr.house}`}
                                    {addr.apartment && `, ${addr.apartment}`}
                                </p>
                                <p className="text-[10px] md:text-xs font-medium text-gray-500 m-0 truncate">
                                    {addr.postalCode} • {addr.city} •{' '}
                                    <span className="opacity-70 font-bold">{addr.phone}</span>
                                </p>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                                {!addr.isDefault && (
                                    <button
                                        onClick={() => setDefaultAddress(addr.id)}
                                        className="h-9 px-3 md:h-11 md:px-5 bg-white border border-gray-100 text-gray-400 rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-widest hover:bg-green-50 hover:text-green-600 hover:border-green-100 transition-all flex items-center justify-center gap-2 shadow-sm group/btn"
                                        title="Establecer como predeterminada"
                                    >
                                        <Star
                                            size={14}
                                            strokeWidth={2}
                                            className="transition-transform group-hover/btn:scale-110"
                                        />
                                        <span>Principal</span>
                                    </button>
                                )}
                                <button
                                    onClick={() => startEditing(addr)}
                                    className="h-9 w-9 md:h-11 md:w-11 flex items-center justify-center bg-white border border-gray-100 text-gray-400 rounded-2xl hover:text-gray-900 hover:border-gray-900 transition-all shadow-sm"
                                >
                                    <Pencil size={16} strokeWidth={1.5} />
                                </button>
                                <button
                                    onClick={() => setAddressToDelete(addr.id)}
                                    className="h-9 w-9 md:h-11 md:w-11 flex items-center justify-center bg-red-50/50 text-red-400 border border-red-50 rounded-2xl hover:bg-red-600 hover:text-white hover:border-red-600 transition-all shadow-sm"
                                >
                                    <Trash2 size={16} strokeWidth={1.5} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <DeleteConfirmationModal
                isOpen={!!addressToDelete}
                onClose={() => setAddressToDelete(null)}
                onConfirm={confirmDelete}
                title="¿Eliminar dirección?"
                description="¿Estás seguro de que deseas eliminar esta dirección?"
                isLoading={isDeleting}
                itemType="dirección"
                itemName={addresses.find(a => a.id === addressToDelete)?.label}
            />
        </div>
    );
}
