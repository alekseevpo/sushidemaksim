import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, ArrowRight, Loader2, Search, CheckCircle, Info } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap, Polygon } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { api } from '../utils/api';
import * as turf from '@turf/turf';

// Fix Leaflet marker icons
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

const RESTAURANT_LOCATION: [number, number] = [40.40798, -3.67342];

interface AddressModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (data: any) => void;
    deliveryZones: any[];
    currentAddress?: any;
}

function MapUpdater({ center }: { center: [number, number] }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center, map.getZoom());
    }, [center, map]);
    return null;
}

function LocationMarker({
    position,
    setPosition,
}: {
    position: [number, number];
    setPosition: (p: [number, number]) => void;
}) {
    useMapEvents({
        click(e) {
            setPosition([e.latlng.lat, e.latlng.lng]);
        },
    });

    return position ? (
        <Marker
            position={position}
            icon={DefaultIcon}
            draggable={true}
            eventHandlers={{
                dragend: e => {
                    const marker = e.target;
                    const pos = marker.getLatLng();
                    setPosition([pos.lat, pos.lng]);
                },
            }}
        />
    ) : null;
}

export default function AddressModal({
    isOpen,
    onClose,
    onSelect,
    deliveryZones,
    currentAddress,
}: AddressModalProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    const [markerPosition, setMarkerPosition] = useState<[number, number]>(RESTAURANT_LOCATION);
    const [address, setAddress] = useState(currentAddress?.street || '');
    const [house, setHouse] = useState(currentAddress?.house || '');
    const [apartment, setApartment] = useState(currentAddress?.apartment || '');
    const [postalCode, setPostalCode] = useState(currentAddress?.postalCode || '');
    const [selectedZone, setSelectedZone] = useState<any>(null);
    const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
    const skipReverseGeocodeRef = useRef(false);

    // Auto-detect zone on marker move
    useEffect(() => {
        if (!markerPosition || deliveryZones.length === 0) return;

        const point = turf.point([markerPosition[1], markerPosition[0]]); // [lng, lat] for turf
        const matchingZones: any[] = [];

        for (const zone of deliveryZones) {
            if (!zone.coordinates || zone.coordinates.length < 3) continue;

            const turfCoords = zone.coordinates.map((c: number[]) => [c[1], c[0]]);
            if (
                turfCoords[0][0] !== turfCoords[turfCoords.length - 1][0] ||
                turfCoords[0][1] !== turfCoords[turfCoords.length - 1][1]
            ) {
                turfCoords.push(turfCoords[0]);
            }

            try {
                const poly = turf.polygon([turfCoords]);
                if (turf.booleanPointInPolygon(point, poly)) {
                    // Calculate area to find the "smallest" zone in case of overlap
                    const area = turf.area(poly);
                    matchingZones.push({ ...zone, area });
                }
            } catch (err) {
                console.warn('Invalid polygon for zone:', zone.name);
            }
        }

        if (matchingZones.length > 0) {
            // Sort by area ascending so the most specific (smallest) zone wins
            matchingZones.sort((a, b) => a.area - b.area);
            setSelectedZone(matchingZones[0]);
        } else {
            setSelectedZone(null);
        }
    }, [markerPosition, deliveryZones]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery.trim().length >= 3) {
                performSearch(searchQuery.trim());
            } else {
                setSearchResults([]);
            }
        }, 1200);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const performSearch = async (query: string) => {
        setIsSearching(true);
        try {
            const data = await api.get(`/delivery-zones/search?q=${encodeURIComponent(query)}`);
            setSearchResults(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Search failed', err);
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    };

    const performReverseGeocode = async (lat: number, lon: number) => {
        setIsReverseGeocoding(true);
        try {
            const data = await api.get(`/delivery-zones/reverse?lat=${lat}&lon=${lon}`);
            if (data && data.address) {
                const street =
                    data.address.road ||
                    data.address.pedestrian ||
                    data.address.suburb ||
                    data.address.neighbourhood ||
                    data.address.city ||
                    '';
                const houseNum = data.address.house_number || '';
                setAddress(street || data.display_name?.split(',')[0] || '');
                setHouse(houseNum);
                if (data.address.postcode) setPostalCode(data.address.postcode);
            }
        } catch (err) {
            console.error('Reverse geocode failed', err);
        } finally {
            setIsReverseGeocoding(false);
        }
    };

    const selectResult = (res: any) => {
        skipReverseGeocodeRef.current = true;
        const lat = parseFloat(res.lat);
        const lon = parseFloat(res.lon);
        setMarkerPosition([lat, lon]);

        let street =
            res.address?.road ||
            res.address?.pedestrian ||
            res.address?.suburb ||
            res.address?.neighbourhood ||
            res.display_name?.split(',')[0] ||
            '';

        const houseNum = res.address?.house_number || '';
        if (houseNum && street.includes(houseNum)) {
            street = street.replace(houseNum, '').replace(/,/g, '').trim();
        }

        setAddress(street);
        setHouse(houseNum);

        const pc = res.address?.postcode || res.display_name?.match(/\b\d{5}\b/)?.[0] || '';
        if (pc) setPostalCode(pc);
        setSearchResults([]);
        setSearchQuery('');
    };

    useEffect(() => {
        const isDefault =
            Math.abs(markerPosition[0] - RESTAURANT_LOCATION[0]) < 0.0001 &&
            Math.abs(markerPosition[1] - RESTAURANT_LOCATION[1]) < 0.0001;

        if (isDefault) return;
        if (skipReverseGeocodeRef.current) {
            skipReverseGeocodeRef.current = false;
            return;
        }

        const timer = setTimeout(() => {
            performReverseGeocode(markerPosition[0], markerPosition[1]);
        }, 1200);

        return () => clearTimeout(timer);
    }, [markerPosition]);

    const handleContinue = () => {
        onSelect({
            street: address,
            house,
            apartment,
            postalCode,
            zone: selectedZone,
            coordinates: markerPosition,
        });
        onClose();
    };

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-md z-[1001]"
                    />

                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 30, stiffness: 200 }}
                        className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[40px] z-[1002] max-h-[90vh] overflow-hidden flex flex-col md:max-w-2xl md:mx-auto md:top-20 md:bottom-20 md:rounded-[32px] shadow-3xl"
                    >
                        {/* Header */}
                        <div className="px-2 py-0.5 md:px-6 md:py-4 flex justify-between items-start border-b border-gray-100 shrink-0 relative bg-white z-20">
                            <div className="hidden md:block">
                                <h2 className="text-lg font-black text-gray-900 tracking-tight flex items-center gap-2">
                                    <MapPin size={18} className="text-red-500" />
                                    ¿Dónde entregamos?
                                </h2>
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none mt-1">
                                    Selecciona tu ubicación en el mapa
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="absolute top-0 right-2 md:top-5 md:right-5 p-1 text-gray-400 hover:text-gray-900 transition-all hover:bg-gray-50 rounded-lg"
                            >
                                <X size={20} strokeWidth={2.5} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-hidden flex flex-col md:flex-row shadow-2xl">
                            {/* Map Side */}
                            <div className="h-36 md:h-auto md:flex-1 relative bg-gray-100 border-r border-gray-100">
                                <MapContainer
                                    center={markerPosition}
                                    zoom={15}
                                    style={{ height: '100%', width: '100%' }}
                                    zoomControl={false}
                                    attributionControl={false}
                                >
                                    <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
                                    <MapUpdater center={markerPosition} />
                                    <LocationMarker
                                        position={markerPosition}
                                        setPosition={setMarkerPosition}
                                    />
                                    {deliveryZones.map(zone => (
                                        <Polygon
                                            key={zone.id}
                                            positions={zone.coordinates}
                                            pathOptions={{
                                                color: zone.color,
                                                fillColor: zone.color,
                                                fillOpacity: 0.1,
                                                weight: 2,
                                            }}
                                        />
                                    ))}
                                </MapContainer>

                                {/* Search Overlay */}
                                <div className="absolute top-4 left-4 right-4 z-[1000] space-y-2">
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-500 transition">
                                            {isSearching ? (
                                                <Loader2 size={18} className="animate-spin" />
                                            ) : (
                                                <Search size={18} />
                                            )}
                                        </div>
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={e => setSearchQuery(e.target.value)}
                                            placeholder="Buscar mi calle en Madrid..."
                                            className="w-full bg-white/95 backdrop-blur shadow-xl rounded-2xl pl-12 pr-4 py-2 md:py-3.5 text-sm font-bold border-none outline-none ring-2 ring-transparent focus:ring-red-500/20 transition-all placeholder:text-gray-400"
                                        />

                                        {searchResults.length > 0 && (
                                            <div className="absolute top-full mt-2 left-0 right-0 bg-white/95 backdrop-blur rounded-2xl shadow-2xl border border-gray-100 overflow-hidden divide-y divide-gray-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                                {searchResults.map((res, i) => (
                                                    <button
                                                        key={i}
                                                        onClick={() => selectResult(res)}
                                                        className="w-full px-5 py-4 text-left hover:bg-red-50 transition flex items-start gap-3"
                                                    >
                                                        <MapPin
                                                            size={16}
                                                            className="mt-1 text-gray-400 shrink-0"
                                                        />
                                                        <span className="text-sm font-bold text-gray-700">
                                                            {res.display_name
                                                                .toLowerCase()
                                                                .startsWith('madrid')
                                                                ? res.display_name
                                                                      .split(',')
                                                                      .slice(0, 3)
                                                                      .join(',')
                                                                : `Madrid, ${res.display_name.split(',').slice(0, 2).join(',')}`}
                                                        </span>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Form Side */}
                            <div className="w-full md:w-[300px] bg-white flex flex-col overflow-hidden border-l border-gray-100">
                                <div className="flex-1 overflow-y-auto p-4 md:px-5 md:py-4 space-y-3 scrollbar-hide">
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 md:mb-1.5 px-1 tracking-widest leading-none">
                                            Calle / Avenida *
                                        </label>
                                        <input
                                            value={address}
                                            onChange={e => setAddress(e.target.value)}
                                            data-testid="address-input"
                                            className="w-full bg-gray-50 rounded-2xl px-5 py-2 md:py-3.5 text-sm font-bold border-none focus:ring-2 ring-red-500/10 transition outline-none"
                                            placeholder="Ej: Calle de Serrano"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 md:mb-1.5 px-1 tracking-widest leading-none">
                                                Número / Portal *
                                            </label>
                                            <input
                                                value={house}
                                                onChange={e => setHouse(e.target.value)}
                                                data-testid="house-input"
                                                className="w-full bg-gray-50 rounded-2xl px-5 py-2 md:py-3.5 text-sm font-bold border-none focus:ring-2 ring-red-500/10 transition outline-none"
                                                placeholder="Ej: 20"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 md:mb-1.5 px-1 tracking-widest leading-none">
                                                Piso / Puerta
                                            </label>
                                            <input
                                                value={apartment}
                                                onChange={e => setApartment(e.target.value)}
                                                data-testid="apartment-input"
                                                className="w-full bg-gray-50 rounded-2xl px-5 py-2 md:py-3.5 text-sm font-bold border-none focus:ring-2 ring-red-500/10 transition outline-none"
                                                placeholder="Ej: 1B"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 md:mb-1.5 px-1 tracking-widest leading-none">
                                            Código Postal
                                        </label>
                                        <input
                                            value={postalCode}
                                            onChange={e => setPostalCode(e.target.value)}
                                            className="w-full bg-gray-50 rounded-2xl px-5 py-2 md:py-3.5 text-sm font-bold border-none focus:ring-2 ring-red-500/10 transition outline-none"
                                            placeholder="28001"
                                            maxLength={5}
                                        />
                                    </div>

                                    {/* Zone Status */}
                                    <div className="pt-2">
                                        {selectedZone ? (
                                            <div className="p-3 md:p-4 bg-green-50/50 rounded-3xl border border-green-100/50 animate-in slide-in-from-bottom-3 duration-500">
                                                <div className="flex items-center gap-3 mb-2 md:mb-3">
                                                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl md:rounded-2xl bg-white shadow-sm flex items-center justify-center shrink-0">
                                                        <CheckCircle
                                                            className="text-green-600 w-[18px] h-[18px] md:w-[22px] md:h-[22px]"
                                                            strokeWidth={2.5}
                                                        />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <h3 className="text-base md:text-xl font-black text-gray-900 leading-tight">
                                                                {selectedZone.name}
                                                            </h3>
                                                            <span className="text-[8px] md:text-[10px] font-black text-green-700 bg-green-100 px-2 md:px-2.5 py-0.5 md:py-1 rounded-md md:rounded-lg uppercase tracking-wider">
                                                                DISPONIBLE
                                                            </span>
                                                        </div>
                                                        <p className="hidden md:block text-[11px] font-bold text-green-600/80 uppercase tracking-widest mt-0.5">
                                                            Zona de entrega detectada
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="bg-white/80 backdrop-blur-sm p-3 rounded-2xl border border-green-100/30">
                                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 leading-none">
                                                            Envío
                                                        </p>
                                                        <p className="text-lg font-black text-gray-900 leading-none">
                                                            {selectedZone.cost === 0
                                                                ? 'GRATIS'
                                                                : `${selectedZone.cost}€`}
                                                        </p>
                                                    </div>
                                                    <div className="bg-white/80 backdrop-blur-sm p-3 rounded-2xl border border-green-100/30">
                                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 leading-none">
                                                            Pedido mín.
                                                        </p>
                                                        <p className="text-lg font-black text-gray-900 leading-none">
                                                            {selectedZone.min_order}€
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-3 py-2 px-1 animate-in shake duration-500">
                                                <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                                                    <Info className="text-red-500" size={18} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-red-900 tracking-tight">
                                                        Zona no cubierta
                                                    </p>
                                                    <p className="text-[10px] font-bold text-red-400 uppercase tracking-tighter">
                                                        Mueve el marcador o prueba otra dirección
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Sticky Footer with Gradient */}
                                <div className="p-4 md:p-5 bg-white border-t border-gray-50 relative pb-6 md:pb-6 shrink-0">
                                    <div className="absolute bottom-full left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent pointer-events-none" />
                                    <button
                                        onClick={handleContinue}
                                        disabled={
                                            !address ||
                                            !house ||
                                            !selectedZone ||
                                            isReverseGeocoding
                                        }
                                        className="w-full py-3.5 bg-red-600 text-white rounded-[20px] font-black text-base flex items-center justify-center gap-3 hover:bg-red-700 transition transform active:scale-95 disabled:grayscale disabled:opacity-30 shadow-[0_15px_30px_-10px_rgba(220,38,38,0.3)]"
                                    >
                                        {isReverseGeocoding ? (
                                            <span className="flex items-center gap-2">
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Actualizando...
                                            </span>
                                        ) : (
                                            <>
                                                Confirmar dirección <ArrowRight size={20} />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
