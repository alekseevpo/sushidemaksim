import { useState, useEffect, useRef } from 'react';
import { MapPin, Plus, Star, Trash2, Pencil } from 'lucide-react';

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
    };
}
import { UserAddress } from '../../types';
import { cardStyle, inputStyle } from './profileStyles';

interface Props {
    addresses: UserAddress[];
    addAddress: (data: any) => Promise<void>;
    editAddress?: (id: string, data: any) => Promise<void>;
    removeAddress: (id: string) => Promise<void>;
    setDefaultAddress: (id: string) => Promise<void>;
    onSuccess: (msg: string) => void;
}

export default function AddressesTab({
    addresses,
    addAddress,
    editAddress,
    removeAddress,
    setDefaultAddress,
    onSuccess,
}: Props) {
    const [showAddAddress, setShowAddAddress] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [newAddress, setNewAddress] = useState({
        label: '',
        street: '',
        city: 'Madrid',
        postalCode: '',
        phone: '',
        isDefault: false,
    });
    const [houseNumber, setHouseNumber] = useState('');
    const [details, setDetails] = useState('');

    // Autocomplete state
    const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const suggestionsRef = useRef<HTMLDivElement>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout>>();

    // Debounced Nominatim search
    useEffect(() => {
        if (searchQuery.length < 3) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        if (debounceRef.current) clearTimeout(debounceRef.current);

        debounceRef.current = setTimeout(async () => {
            try {
                const res = await fetch(
                    `https://nominatim.openstreetmap.org/search?` +
                        `format=json&addressdetails=1&limit=5&countrycodes=es&accept-language=es` +
                        `&viewbox=-4.58,41.16,-3.05,39.88&bounded=1` +
                        `&q=${encodeURIComponent(searchQuery)}`
                );
                const data = await res.json();
                setSuggestions(data);
                setShowSuggestions(data.length > 0);
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
        const hNum = addr.house_number || '';
        const city = addr.city || addr.town || addr.village || '';
        const postalCode = addr.postcode || '';

        setNewAddress(p => ({ ...p, street, city, postalCode }));
        setHouseNumber(hNum);
        setSearchQuery(street);
        setShowSuggestions(false);
        setSuggestions([]);
    };

    const handleStreetChange = (value: string) => {
        setSearchQuery(value);
        setNewAddress(p => ({ ...p, street: value }));
    };

    const startEditing = (addr: UserAddress) => {
        setEditId(addr.id);

        // Try to parse street, house number and details from the saved string
        // Assuming format: "Street Name, Number, Details" or just "Street Name"
        let streetExtracted = addr.street;
        let houseNumExtracted = '';
        let detailsExtracted = '';

        const parts = addr.street.split(',').map(s => s.trim());
        if (parts.length > 0) {
            streetExtracted = parts[0];
            if (parts.length > 1) houseNumExtracted = parts[1];
            if (parts.length > 2) detailsExtracted = parts.slice(2).join(', ');
        }

        setNewAddress({
            label: addr.label,
            street: streetExtracted,
            city: addr.city,
            postalCode: addr.postalCode || '',
            phone: addr.phone || '',
            isDefault: addr.isDefault,
        });
        setSearchQuery(streetExtracted);
        setHouseNumber(houseNumExtracted);
        setDetails(detailsExtracted);
        setShowAddAddress(true);
    };

    const resetForm = () => {
        setNewAddress({
            label: '',
            street: '',
            city: 'Madrid',
            postalCode: '',
            phone: '',
            isDefault: false,
        });
        setSearchQuery('');
        setHouseNumber('');
        setDetails('');
        setEditId(null);
        setShowAddAddress(false);
    };

    const handleSaveAddress = async () => {
        if (!newAddress.label || !newAddress.street || !newAddress.postalCode || !newAddress.phone)
            return;
        try {
            const finalStreet = [newAddress.street, houseNumber.trim(), details.trim()]
                .filter(Boolean)
                .join(', ');

            if (editId && editAddress) {
                await editAddress(editId, { ...newAddress, street: finalStreet });
                onSuccess('Dirección actualizada');
            } else {
                await addAddress({ ...newAddress, street: finalStreet });
                onSuccess('Dirección añadida');
            }
            resetForm();
        } catch {
            alert('Error al guardar la dirección');
        }
    };

    return (
        <div>
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '20px',
                }}
            >
                <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#111827' }}>
                    Mis Direcciones
                </h1>
                <button
                    onClick={() => setShowAddAddress(true)}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '8px 16px',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        backgroundColor: '#DC2626',
                        fontSize: '14px',
                        color: 'white',
                        fontWeight: 'bold',
                    }}
                >
                    <Plus size={14} /> Añadir dirección
                </button>
            </div>

            {showAddAddress && (
                <div style={{ ...cardStyle, border: '2px solid #DC2626' }}>
                    <h3
                        style={{
                            fontSize: '16px',
                            fontWeight: 'bold',
                            marginBottom: '16px',
                            color: '#111827',
                        }}
                    >
                        {editId ? 'Editar dirección' : 'Nueva dirección'}
                    </h3>
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '12px',
                            marginBottom: '16px',
                        }}
                    >
                        <div>
                            <label
                                style={{
                                    display: 'block',
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    color: '#6B7280',
                                    marginBottom: '4px',
                                }}
                            >
                                Nombre (ej: Casa, Oficina)
                            </label>
                            <input
                                value={newAddress.label}
                                onChange={e =>
                                    setNewAddress(p => ({ ...p, label: e.target.value }))
                                }
                                placeholder="Casa"
                                style={inputStyle}
                            />
                        </div>
                        <div>
                            <label
                                style={{
                                    display: 'block',
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    color: '#6B7280',
                                    marginBottom: '4px',
                                }}
                            >
                                Teléfono de contacto
                            </label>
                            <input
                                value={newAddress.phone}
                                onChange={e =>
                                    setNewAddress(p => ({ ...p, phone: e.target.value }))
                                }
                                placeholder="+34 600 000 000"
                                style={inputStyle}
                            />
                        </div>
                    </div>
                    {/* Street with autocomplete */}
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: '2fr 1fr',
                            gap: '12px',
                            marginBottom: '12px',
                        }}
                    >
                        <div style={{ position: 'relative' }} ref={suggestionsRef}>
                            <label
                                style={{
                                    display: 'block',
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    color: '#6B7280',
                                    marginBottom: '4px',
                                }}
                            >
                                Calle / Avenida
                            </label>
                            <input
                                value={searchQuery || newAddress.street}
                                onChange={e => handleStreetChange(e.target.value)}
                                placeholder="Ej: Calle Gran Vía..."
                                style={inputStyle}
                                autoComplete="off"
                            />
                            {/* Suggestions dropdown */}
                            {showSuggestions && suggestions.length > 0 && (
                                <div
                                    style={{
                                        position: 'absolute',
                                        top: '100%',
                                        left: 0,
                                        right: 0,
                                        zIndex: 50,
                                        backgroundColor: 'white',
                                        border: '1px solid #E5E7EB',
                                        borderRadius: '8px',
                                        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                                        marginTop: '4px',
                                        maxHeight: '200px',
                                        overflowY: 'auto',
                                    }}
                                >
                                    {suggestions.map((s, i) => (
                                        <button
                                            key={i}
                                            type="button"
                                            onClick={() => handleSelectSuggestion(s)}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'flex-start',
                                                gap: '8px',
                                                width: '100%',
                                                padding: '10px 12px',
                                                border: 'none',
                                                backgroundColor: 'transparent',
                                                cursor: 'pointer',
                                                textAlign: 'left',
                                                fontSize: '13px',
                                                color: '#374151',
                                                borderBottom:
                                                    i < suggestions.length - 1
                                                        ? '1px solid #F3F4F6'
                                                        : 'none',
                                            }}
                                            onMouseEnter={e =>
                                                (e.currentTarget.style.backgroundColor = '#F9FAFB')
                                            }
                                            onMouseLeave={e =>
                                                (e.currentTarget.style.backgroundColor =
                                                    'transparent')
                                            }
                                        >
                                            <MapPin
                                                size={14}
                                                style={{
                                                    color: '#DC2626',
                                                    marginTop: '2px',
                                                    flexShrink: 0,
                                                }}
                                            />
                                            <span style={{ lineHeight: '1.3' }}>
                                                {s.display_name}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div>
                            <label
                                style={{
                                    display: 'block',
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    color: '#6B7280',
                                    marginBottom: '4px',
                                }}
                            >
                                Número
                            </label>
                            <input
                                value={houseNumber}
                                onChange={e => setHouseNumber(e.target.value)}
                                placeholder="Ej: 12"
                                style={inputStyle}
                            />
                        </div>
                    </div>

                    {/* Floor, Door, etc */}
                    <div style={{ marginBottom: '12px' }}>
                        <label
                            style={{
                                display: 'block',
                                fontSize: '13px',
                                fontWeight: '600',
                                color: '#6B7280',
                                marginBottom: '4px',
                            }}
                        >
                            Piso, Escalera, Puerta{' '}
                            <span style={{ color: '#9CA3AF', fontWeight: '400' }}>(opcional)</span>
                        </label>
                        <input
                            value={details}
                            onChange={e => setDetails(e.target.value)}
                            placeholder="Ej: Piso 3, Puerta A, Esc. Derecha"
                            style={inputStyle}
                        />
                    </div>

                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '12px',
                            marginBottom: '16px',
                        }}
                    >
                        <div>
                            <label
                                style={{
                                    display: 'block',
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    color: '#6B7280',
                                    marginBottom: '4px',
                                }}
                            >
                                Ciudad
                            </label>
                            <input
                                value={newAddress.city}
                                onChange={e => setNewAddress(p => ({ ...p, city: e.target.value }))}
                                style={inputStyle}
                            />
                        </div>
                        <div>
                            <label
                                style={{
                                    display: 'block',
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    color: '#6B7280',
                                    marginBottom: '4px',
                                }}
                            >
                                Código postal
                            </label>
                            <input
                                value={newAddress.postalCode}
                                onChange={e =>
                                    setNewAddress(p => ({ ...p, postalCode: e.target.value }))
                                }
                                placeholder="28001"
                                style={inputStyle}
                            />
                        </div>
                    </div>

                    <label
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            marginBottom: '16px',
                            cursor: 'pointer',
                            fontSize: '14px',
                        }}
                    >
                        <input
                            type="checkbox"
                            checked={newAddress.isDefault}
                            onChange={e =>
                                setNewAddress(p => ({ ...p, isDefault: e.target.checked }))
                            }
                            style={{ accentColor: '#DC2626' }}
                        />
                        Dirección predeterminada
                    </label>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button
                            onClick={resetForm}
                            type="button"
                            style={{
                                padding: '8px 16px',
                                border: '1px solid #E5E7EB',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                backgroundColor: 'white',
                                fontSize: '14px',
                                color: '#6B7280',
                            }}
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleSaveAddress}
                            style={{
                                padding: '8px 16px',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                backgroundColor: '#DC2626',
                                fontSize: '14px',
                                color: 'white',
                                fontWeight: 'bold',
                            }}
                        >
                            {editId ? 'Guardar cambios' : 'Guardar dirección'}
                        </button>
                    </div>
                </div>
            )}

            {/* Address List */}
            {addresses.length === 0 && !showAddAddress ? (
                <div style={{ ...cardStyle, textAlign: 'center', padding: '48px 24px' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>📍</div>
                    <h3
                        style={{
                            fontSize: '18px',
                            fontWeight: 'bold',
                            marginBottom: '8px',
                            color: '#111827',
                        }}
                    >
                        No tienes direcciones guardadas
                    </h3>
                    <p style={{ fontSize: '14px', color: '#6B7280' }}>
                        Añade una dirección para hacer tus pedidos más rápido
                    </p>
                </div>
            ) : (
                addresses.map(addr => (
                    <div
                        key={addr.id}
                        style={{
                            ...cardStyle,
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '16px',
                        }}
                    >
                        <div
                            style={{
                                width: '44px',
                                height: '44px',
                                borderRadius: '12px',
                                backgroundColor: addr.isDefault ? '#FEE2E2' : '#F3F4F6',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                            }}
                        >
                            <MapPin size={20} color={addr.isDefault ? '#DC2626' : '#6B7280'} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    marginBottom: '4px',
                                }}
                            >
                                <h3
                                    style={{
                                        fontSize: '16px',
                                        fontWeight: 'bold',
                                        margin: 0,
                                        color: '#111827',
                                    }}
                                >
                                    {addr.label}
                                </h3>
                                {addr.isDefault && (
                                    <span
                                        style={{
                                            backgroundColor: '#DCFCE7',
                                            color: '#16A34A',
                                            fontSize: '11px',
                                            fontWeight: 'bold',
                                            padding: '2px 8px',
                                            borderRadius: '9999px',
                                        }}
                                    >
                                        Predeterminada
                                    </span>
                                )}
                            </div>
                            <p style={{ fontSize: '14px', color: '#374151', margin: '0 0 2px 0' }}>
                                {addr.street}
                            </p>
                            <p style={{ fontSize: '13px', color: '#6B7280', margin: '0 0 2px 0' }}>
                                {addr.postalCode} {addr.city}
                            </p>
                            <p style={{ fontSize: '13px', color: '#6B7280', margin: 0 }}>
                                {addr.phone}
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                            {!addr.isDefault && (
                                <button
                                    onClick={() => setDefaultAddress(addr.id)}
                                    title="Hacer predeterminada"
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        padding: '6px 10px',
                                        border: '1px solid #E5E7EB',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        backgroundColor: 'white',
                                        fontSize: '12px',
                                        color: '#4B5563',
                                        transition: 'all 0.2s',
                                    }}
                                    onMouseOver={e => {
                                        e.currentTarget.style.backgroundColor = '#F9FAFB';
                                        e.currentTarget.style.borderColor = '#D1D5DB';
                                    }}
                                    onMouseOut={e => {
                                        e.currentTarget.style.backgroundColor = 'white';
                                        e.currentTarget.style.borderColor = '#E5E7EB';
                                    }}
                                >
                                    <Star size={14} /> Predeterminar
                                </button>
                            )}
                            <button
                                onClick={() => startEditing(addr)}
                                title="Editar"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '32px',
                                    height: '32px',
                                    border: '1px solid #E5E7EB',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    backgroundColor: 'white',
                                    color: '#4B5563',
                                    transition: 'all 0.2s',
                                }}
                                onMouseOver={e => {
                                    e.currentTarget.style.backgroundColor = '#F9FAFB';
                                    e.currentTarget.style.borderColor = '#D1D5DB';
                                    e.currentTarget.style.color = '#111827';
                                }}
                                onMouseOut={e => {
                                    e.currentTarget.style.backgroundColor = 'white';
                                    e.currentTarget.style.borderColor = '#E5E7EB';
                                    e.currentTarget.style.color = '#4B5563';
                                }}
                            >
                                <Pencil size={14} />
                            </button>
                            <button
                                onClick={() => removeAddress(addr.id)}
                                title="Eliminar"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '32px',
                                    height: '32px',
                                    border: '1px solid #FECACA',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    backgroundColor: '#FEF2F2',
                                    color: '#DC2626',
                                    transition: 'all 0.2s',
                                }}
                                onMouseOver={e => {
                                    e.currentTarget.style.backgroundColor = '#FEE2E2';
                                    e.currentTarget.style.borderColor = '#FCA5A5';
                                }}
                                onMouseOut={e => {
                                    e.currentTarget.style.backgroundColor = '#FEF2F2';
                                    e.currentTarget.style.borderColor = '#FECACA';
                                }}
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}
