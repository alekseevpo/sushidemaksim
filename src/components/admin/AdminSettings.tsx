import { useState, useEffect } from 'react';
import { Save, Plus, Trash2, CheckCircle2, AlertTriangle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../utils/api';

export default function AdminSettings() {
    const queryClient = useQueryClient();
    const [localSettings, setLocalSettings] = useState<any>(null);
    const [saveStatus, setSaveStatus] = useState<null | 'success' | 'error'>(null);
    const [socialToRemove, setSocialToRemove] = useState<number | null>(null);

    // Settings Query
    const { data: remoteSettings, isLoading } = useQuery({
        queryKey: ['admin-settings'],
        queryFn: async () => {
            const data = await api.get('/admin/settings');
            return {
                contact_phone: data.contact_phone || '',
                contact_email: data.contact_email || '',
                contact_address_line1: data.contact_address_line1 || '',
                contact_address_line2: data.contact_address_line2 || '',
                contact_google_maps_url: data.contact_google_maps_url || '',
                contact_schedule: Array.isArray(data.contact_schedule) ? data.contact_schedule : [],
                social_links: Array.isArray(data.social_links) ? data.social_links : [],
                est_delivery_time: data.est_delivery_time || '30-60 min',
                is_store_closed: !!data.is_store_closed,
                closed_message:
                    data.closed_message || 'Lo sentimos, la cocina está cerrada temporalmente.',
            };
        },
    });

    // Update local state when remote data changes
    useEffect(() => {
        if (remoteSettings && !localSettings) {
            setLocalSettings(remoteSettings);
        }
    }, [remoteSettings, localSettings]);

    const updateMutation = useMutation({
        mutationFn: (payload: any) => api.put('/admin/settings', payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
            setSaveStatus('success');
            setTimeout(() => setSaveStatus(null), 4000);
        },
        onError: () => {
            setSaveStatus('error');
            setTimeout(() => setSaveStatus(null), 4000);
        },
    });

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (localSettings) {
            updateMutation.mutate(localSettings);
        }
    };

    const handleAddSocial = () => {
        if (!localSettings) return;
        setLocalSettings({
            ...localSettings,
            social_links: [
                ...localSettings.social_links,
                { platform: 'Nueva Red', url: '#', icon: 'facebook' },
            ],
        });
    };

    const confirmRemoveSocial = () => {
        if (socialToRemove === null || !localSettings) return;
        const newLinks = [...localSettings.social_links];
        newLinks.splice(socialToRemove, 1);
        setLocalSettings({ ...localSettings, social_links: newLinks });
        setSocialToRemove(null);
    };

    const handleUpdateSocial = (index: number, key: string, value: string) => {
        if (!localSettings) return;
        const newLinks = [...localSettings.social_links];
        newLinks[index] = { ...newLinks[index], [key]: value };
        setLocalSettings({ ...localSettings, social_links: newLinks });
    };

    if (isLoading || !localSettings)
        return <div className="p-8 text-center text-gray-500">Cargando ajustes...</div>;

    return (
        <form onSubmit={handleSave} className="space-y-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Configuración de Contactos</h2>
                <button
                    type="submit"
                    disabled={updateMutation.isPending}
                    className="flex items-center gap-2 bg-red-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-red-700 transition disabled:opacity-50"
                >
                    <Save size={18} strokeWidth={1.5} />{' '}
                    {updateMutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
                </button>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-lg mb-4 text-gray-800">Información General</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">
                            Teléfono
                        </label>
                        <input
                            value={localSettings.contact_phone}
                            onChange={e =>
                                setLocalSettings({
                                    ...localSettings,
                                    contact_phone: e.target.value,
                                })
                            }
                            className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-red-500"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Email</label>
                        <input
                            value={localSettings.contact_email}
                            onChange={e =>
                                setLocalSettings({
                                    ...localSettings,
                                    contact_email: e.target.value,
                                })
                            }
                            className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-red-500"
                        />
                    </div>
                </div>

                <h3 className="font-bold text-lg mb-4 text-gray-800 mt-8">Dirección Físicia</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">
                            Dirección (Línea 1)
                        </label>
                        <input
                            value={localSettings.contact_address_line1}
                            onChange={e =>
                                setLocalSettings({
                                    ...localSettings,
                                    contact_address_line1: e.target.value,
                                })
                            }
                            className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-red-500"
                            placeholder="Calle Barrilero, 20,"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">
                            Dirección (Línea 2)
                        </label>
                        <input
                            value={localSettings.contact_address_line2}
                            onChange={e =>
                                setLocalSettings({
                                    ...localSettings,
                                    contact_address_line2: e.target.value,
                                })
                            }
                            className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-red-500"
                            placeholder="28007 Madrid"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <div className="flex justify-between items-center mb-1">
                            <label className="block text-xs font-bold text-gray-500">
                                URL Google Maps (al hacer clic en 'Ver Mapa')
                            </label>
                            {(localSettings.contact_address_line1 ||
                                localSettings.contact_address_line2) && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        const fullAddress =
                                            `${localSettings.contact_address_line1} ${localSettings.contact_address_line2}`.trim();
                                        const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`;
                                        setLocalSettings({
                                            ...localSettings,
                                            contact_google_maps_url: url,
                                        });
                                    }}
                                    className="text-[10px] font-bold text-blue-600 hover:underline"
                                >
                                    Generar desde dirección
                                </button>
                            )}
                        </div>
                        <input
                            value={localSettings.contact_google_maps_url}
                            onChange={e =>
                                setLocalSettings({
                                    ...localSettings,
                                    contact_google_maps_url: e.target.value,
                                })
                            }
                            className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-red-500"
                            placeholder="https://www.google.com/maps/..."
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg text-gray-800">Redes Sociales</h3>
                    <button
                        type="button"
                        onClick={handleAddSocial}
                        className="text-sm flex items-center gap-1 font-bold text-blue-600 hover:text-blue-700"
                    >
                        <Plus size={16} strokeWidth={1.5} /> Añadir red social
                    </button>
                </div>

                <div className="space-y-4">
                    {localSettings.social_links.map((link: any, idx: number) => (
                        <div
                            key={idx}
                            className="flex flex-col md:flex-row gap-3 items-end bg-gray-50 p-4 rounded-xl border border-gray-100 relative group"
                        >
                            <div className="w-full md:w-1/4">
                                <label className="block text-xs font-bold text-gray-500 mb-1">
                                    Plataforma
                                </label>
                                <input
                                    value={link.platform}
                                    onChange={e =>
                                        handleUpdateSocial(idx, 'platform', e.target.value)
                                    }
                                    className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-red-500 bg-white"
                                />
                            </div>
                            <div className="w-full justify-center md:w-1/4">
                                <label className="block text-xs font-bold text-gray-500 mb-1">
                                    Icono Lucide/SVG
                                </label>
                                <select
                                    value={link.icon}
                                    onChange={e => handleUpdateSocial(idx, 'icon', e.target.value)}
                                    className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-red-500 bg-white"
                                >
                                    <option value="whatsapp">WhatsApp</option>
                                    <option value="instagram">Instagram</option>
                                    <option value="facebook">Facebook</option>
                                    <option value="tiktok">TikTok</option>
                                    <option value="twitter">Twitter</option>
                                    <option value="thefork">The Fork</option>
                                    <option value="threads">Threads</option>
                                </select>
                            </div>
                            <div className="w-full md:w-2/4 flex items-center gap-3">
                                <div className="flex-1">
                                    <label className="block text-xs font-bold text-gray-500 mb-1">
                                        Enlace / URL
                                    </label>
                                    <input
                                        value={link.url}
                                        onChange={e =>
                                            handleUpdateSocial(idx, 'url', e.target.value)
                                        }
                                        className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-red-500 bg-white"
                                        placeholder="https://"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setSocialToRemove(idx)}
                                    className="text-red-500 hover:text-red-700 p-2 mb-0.5"
                                    title="Eliminar"
                                >
                                    <Trash2 size={16} strokeWidth={1.5} />
                                </button>
                            </div>
                        </div>
                    ))}
                    {localSettings.social_links.length === 0 && (
                        <p className="text-sm text-gray-500 italic">
                            No hay redes sociales configuradas.
                        </p>
                    )}
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-lg mb-4 text-gray-800">Horarios (JSON)</h3>
                <p className="text-xs text-gray-500 mb-2">
                    Modo avanzado. Modificar este JSON actualiza los horarios mostrados
                    (propiedades: "days", "hours", "closed")
                </p>
                <textarea
                    value={JSON.stringify(localSettings.contact_schedule, null, 2)}
                    onChange={e => {
                        try {
                            const parsed = JSON.parse(e.target.value);
                            setLocalSettings({ ...localSettings, contact_schedule: parsed });
                        } catch {
                            // ignore parsing errors while typing
                        }
                    }}
                    className="w-full h-48 border rounded-lg px-3 py-2 text-sm font-mono outline-none focus:border-red-500 bg-gray-50"
                />
            </div>

            {/* Notification Toast */}
            <AnimatePresence>
                {saveStatus && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                        className="fixed bottom-8 right-8 z-50"
                    >
                        <div
                            className={`flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border ${
                                saveStatus === 'success'
                                    ? 'bg-green-600 border-green-500 text-white'
                                    : 'bg-red-600 border-red-500 text-white'
                            }`}
                        >
                            {saveStatus === 'success' ? (
                                <CheckCircle2
                                    size={24}
                                    strokeWidth={1.5}
                                    className="animate-bounce"
                                />
                            ) : (
                                <AlertTriangle size={24} strokeWidth={1.5} />
                            )}
                            <div>
                                <p className="font-bold text-sm">
                                    {saveStatus === 'success' ? '¡Cambios guardados!' : 'Error'}
                                </p>
                                <p className="text-xs opacity-90">
                                    {saveStatus === 'success'
                                        ? 'La configuración se actualizó correctamente.'
                                        : 'Hubo un problema al guardar los cambios.'}
                                </p>
                            </div>
                            <button
                                onClick={() => setSaveStatus(null)}
                                className="ml-4 p-1 hover:bg-white/10 rounded-lg transition"
                            >
                                <X size={18} strokeWidth={1.5} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Remove Social Confirmation Modal */}
            {socialToRemove !== null && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
                        onClick={() => setSocialToRemove(null)}
                    />
                    <div className="relative bg-white rounded-[32px] p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <Trash2 size={32} strokeWidth={1.5} />
                            </div>
                            <h3 className="text-xl font-black text-gray-900 mb-2">
                                ¿Quitar red social?
                            </h3>
                            <p className="text-sm text-gray-500 font-medium mb-8">
                                Estás a punto de quitar{' '}
                                <span className="text-red-600 font-bold uppercase">
                                    "{localSettings.social_links[socialToRemove]?.platform}"
                                </span>{' '}
                                de la lista.
                            </p>
                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={confirmRemoveSocial}
                                    className="w-full py-4 bg-red-600 text-white rounded-2xl font-black text-sm hover:bg-black transition-all"
                                >
                                    SÍ, QUITAR
                                </button>
                                <button
                                    onClick={() => setSocialToRemove(null)}
                                    className="w-full py-4 bg-gray-100 text-gray-500 rounded-2xl font-black text-sm hover:bg-gray-200 transition-all"
                                >
                                    CANCELAR
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </form>
    );
}
