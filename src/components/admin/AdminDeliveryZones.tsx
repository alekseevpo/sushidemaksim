import { useState } from 'react';
import { MapContainer, TileLayer, Polygon, FeatureGroup, Marker, Popup } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import { Trash2, Save, MapPin, RefreshCw, X } from 'lucide-react';

// Fix Leaflet marker icons
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

interface DeliveryZone {
    id: string;
    name: string;
    cost: number;
    min_order: number;
    color: string;
    opacity: number;
    coordinates: [number, number][];
    is_active: boolean;
}

const MADRID_CENTER: [number, number] = [40.4168, -3.7038];
const RESTAURANT_LOCATION: [number, number] = [40.40794, -3.67341];

export default function AdminDeliveryZones() {
    const { success, error: toastError } = useToast();
    const queryClient = useQueryClient();
    const [editingZone, setEditingZone] = useState<Partial<DeliveryZone> | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { data: zones = [], isLoading, refetch } = useQuery<DeliveryZone[]>({
        queryKey: ['delivery-zones'],
        queryFn: async () => {
            const res = await api.get('/admin/delivery-zones');
            return res.zones;
        },
    });

    const upsertMutation = useMutation({
        mutationFn: (data: Partial<DeliveryZone>) => {
            return data.id 
                ? api.put(`/admin/delivery-zones/${data.id}`, data)
                : api.post('/admin/delivery-zones', data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['delivery-zones'] });
            success('Zona guardada correctamente');
            setIsModalOpen(false);
            setEditingZone(null);
        },
        onError: (err: any) => {
            toastError(err.message || 'Error al guardar la zona');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => api.delete(`/admin/delivery-zones/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['delivery-zones'] });
            success('Zona eliminada');
        },
    });

    const handleCreated = (e: any) => {
        const { layerType, layer } = e;
        if (layerType === 'polygon') {
            const latlngs = layer.getLatLngs()[0].map((ll: any) => [ll.lat, ll.lng]);
            setEditingZone({
                name: '',
                cost: 0,
                min_order: 0,
                color: '#EF4444',
                opacity: 0.3,
                coordinates: latlngs,
                is_active: true
            });
            setIsModalOpen(true);
            // Remove the temporary layer from the map so we can render it from state
            layer.remove();
        }
    };

    const handleEdited = (e: any) => {
        const { layers } = e;
        layers.eachLayer((layer: any) => {
            const id = layer.options.id;
            const latlngs = layer.getLatLngs()[0].map((ll: any) => [ll.lat, ll.lng]);
            const zone = zones.find(z => z.id === id);
            if (zone) {
                upsertMutation.mutate({ ...zone, coordinates: latlngs });
            }
        });
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-gray-400">
                <RefreshCw size={32} className="animate-spin mb-4" />
                <p>Cargando mapa de zonas...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h3 className="font-bold text-gray-900">Zonas de Entrega Activas</h3>
                    <p className="text-sm text-gray-500">Dibuja polígonos en el mapa для определения областей доставки.</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => refetch()}
                        className="p-2 text-gray-400 hover:text-gray-600 transition"
                        title="Refrescar"
                    >
                        <RefreshCw size={20} />
                    </button>
                    <div className="text-xs font-bold px-3 py-1 bg-blue-50 text-blue-600 rounded-full border border-blue-100">
                        {zones.length} Zonas Guardadas
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Map Area */}
                <div className="lg:col-span-2 bg-white p-2 rounded-2xl shadow-sm border border-gray-100 overflow-hidden" style={{ minHeight: '600px' }}>
                    <MapContainer
                        center={MADRID_CENTER}
                        zoom={13}
                        style={{ height: '600px', width: '100%', borderRadius: '12px' }}
                    >
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        />
                        
                        <Marker position={RESTAURANT_LOCATION}>
                            <Popup>
                                <div className="text-center font-bold">Sushi de Maksim</div>
                                <div className="text-xs">C. de Barrilero, 20</div>
                            </Popup>
                        </Marker>

                        <FeatureGroup>
                            <EditControl
                                position="topright"
                                onCreated={handleCreated}
                                onEdited={handleEdited}
                                draw={{
                                    rectangle: false,
                                    circle: false,
                                    circlemarker: false,
                                    marker: false,
                                    polyline: false,
                                }}
                            />
                            {zones.map(zone => (
                                <Polygon
                                    key={zone.id}
                                    positions={zone.coordinates}
                                    pathOptions={{
                                        color: zone.color,
                                        fillColor: zone.color,
                                        fillOpacity: zone.opacity
                                    }}
                                    eventHandlers={{
                                        click: () => {
                                            setEditingZone(zone);
                                            setIsModalOpen(true);
                                        }
                                    }}
                                >
                                    <Popup>
                                        <div className="font-bold">{zone.name}</div>
                                        <div className="text-xs">Envío: {zone.cost}€</div>
                                        <div className="text-xs">Mínimo: {zone.min_order}€</div>
                                    </Popup>
                                </Polygon>
                            ))}
                        </FeatureGroup>
                    </MapContainer>
                </div>

                {/* Sidebar List */}
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                    {zones.length === 0 ? (
                        <div className="text-center p-8 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                            <MapPin size={32} className="mx-auto text-gray-300 mb-2" />
                            <p className="text-sm text-gray-500">No hay zonas definidas. Usa la herramienta de dibujo (polígono) para crear una.</p>
                        </div>
                    ) : (
                        zones.map(zone => (
                            <div key={zone.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 group">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2">
                                        <div 
                                            className="w-3 h-3 rounded-full" 
                                            style={{ backgroundColor: zone.color }}
                                        />
                                        <h4 className="font-bold text-gray-900">{zone.name}</h4>
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                                        <button 
                                            onClick={() => { setEditingZone(zone); setIsModalOpen(true); }}
                                            className="p-1.5 text-blue-500 hover:bg-blue-50 rounded"
                                        >
                                            <Save size={14} />
                                        </button>
                                        <button 
                                            onClick={() => deleteMutation.mutate(zone.id)}
                                            className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                                    <div className="bg-gray-50 p-2 rounded-lg">
                                        <span className="block text-[10px] uppercase font-bold text-gray-400">Envío</span>
                                        <span className="font-bold text-gray-900">{zone.cost} €</span>
                                    </div>
                                    <div className="bg-gray-50 p-2 rounded-lg">
                                        <span className="block text-[10px] uppercase font-bold text-gray-400">Min. Pedido</span>
                                        <span className="font-bold text-gray-900">{zone.min_order} €</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Modal de Configuración de Zona */}
            {isModalOpen && editingZone && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h2 className="text-xl font-bold text-gray-900">Configurar Zona</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase">Nombre de la Zona</label>
                                <input 
                                    type="text"
                                    value={editingZone.name || ''}
                                    onChange={e => setEditingZone({...editingZone, name: e.target.value})}
                                    placeholder="Ej: Retiro Norte"
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-red-400 transition"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Costo Envío (€)</label>
                                    <input 
                                        type="number"
                                        value={editingZone.cost || 0}
                                        onChange={e => setEditingZone({...editingZone, cost: parseFloat(e.target.value)})}
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-red-400 transition"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Pedido Mín. (€)</label>
                                    <input 
                                        type="number"
                                        value={editingZone.min_order || 0}
                                        onChange={e => setEditingZone({...editingZone, min_order: parseFloat(e.target.value)})}
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-red-400 transition"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Color</label>
                                    <input 
                                        type="color"
                                        value={editingZone.color || '#EF4444'}
                                        onChange={e => setEditingZone({...editingZone, color: e.target.value})}
                                        className="w-full h-10 p-1 bg-gray-50 border border-gray-200 rounded-lg cursor-pointer"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Opacidad (0-1)</label>
                                    <input 
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.1"
                                        value={editingZone.opacity || 0.3}
                                        onChange={e => setEditingZone({...editingZone, opacity: parseFloat(e.target.value)})}
                                        className="w-full mt-2"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="p-4 bg-gray-50 flex justify-end gap-3">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-5 py-2 text-sm font-bold text-gray-500 hover:text-gray-700 transition"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => upsertMutation.mutate(editingZone)}
                                disabled={upsertMutation.isPending || !editingZone.name}
                                className="px-6 py-2 text-sm font-bold bg-red-600 text-white hover:bg-red-700 rounded-lg transition disabled:bg-gray-300"
                            >
                                {upsertMutation.isPending ? 'Guardando...' : 'Guardar Zona'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
