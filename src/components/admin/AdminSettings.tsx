import { useState, useEffect } from 'react';
import { Save, Plus, Trash2 } from 'lucide-react';
import { api } from '../../utils/api';

export default function AdminSettings() {
    const [settings, setSettings] = useState<any>({
        contact_phone: '',
        contact_email: '',
        contact_address_line1: '',
        contact_address_line2: '',
        contact_google_maps_url: '',
        contact_schedule: [],
        social_links: []
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        setLoading(true);
        try {
            const data = await api.get('/admin/settings');
            // Populate defaults if missing
            setSettings({
                contact_phone: data.contact_phone || '',
                contact_email: data.contact_email || '',
                contact_address_line1: data.contact_address_line1 || '',
                contact_address_line2: data.contact_address_line2 || '',
                contact_google_maps_url: data.contact_google_maps_url || '',
                contact_schedule: Array.isArray(data.contact_schedule) ? data.contact_schedule : [],
                social_links: Array.isArray(data.social_links) ? data.social_links : []
            });
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.put('/admin/settings', settings);
            alert('Ajustes guardados con éxito');
        } catch (err) {
            console.error(err);
            alert('Error al guardar ajustes');
        } finally {
            setSaving(false);
        }
    };

    const handleAddSocial = () => {
        setSettings({
            ...settings,
            social_links: [...settings.social_links, { platform: 'Nueva Red', url: '#', icon: 'facebook' }]
        });
    };

    const handleRemoveSocial = (index: number) => {
        const newLinks = [...settings.social_links];
        newLinks.splice(index, 1);
        setSettings({ ...settings, social_links: newLinks });
    };

    const handleUpdateSocial = (index: number, key: string, value: string) => {
        const newLinks = [...settings.social_links];
        newLinks[index] = { ...newLinks[index], [key]: value };
        setSettings({ ...settings, social_links: newLinks });
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Cargando ajustes...</div>;

    return (
        <form onSubmit={handleSave} className="space-y-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Configuración de Contactos</h2>
                <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 bg-red-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-red-700 transition disabled:opacity-50"
                >
                    <Save size={18} /> {saving ? 'Guardando...' : 'Guardar Cambios'}
                </button>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-lg mb-4 text-gray-800">Información General</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Teléfono</label>
                        <input
                            value={settings.contact_phone}
                            onChange={(e) => setSettings({ ...settings, contact_phone: e.target.value })}
                            className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-red-500"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Email</label>
                        <input
                            value={settings.contact_email}
                            onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
                            className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-red-500"
                        />
                    </div>
                </div>

                <h3 className="font-bold text-lg mb-4 text-gray-800 mt-8">Dirección Físicia</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Dirección (Línea 1)</label>
                        <input
                            value={settings.contact_address_line1}
                            onChange={(e) => setSettings({ ...settings, contact_address_line1: e.target.value })}
                            className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-red-500"
                            placeholder="Calle Barrilero, 20,"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Dirección (Línea 2)</label>
                        <input
                            value={settings.contact_address_line2}
                            onChange={(e) => setSettings({ ...settings, contact_address_line2: e.target.value })}
                            className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-red-500"
                            placeholder="28007 Madrid"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-gray-500 mb-1">URL Google Maps (al hacer clic en 'Ver Mapa')</label>
                        <input
                            value={settings.contact_google_maps_url}
                            onChange={(e) => setSettings({ ...settings, contact_google_maps_url: e.target.value })}
                            className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-red-500"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg text-gray-800">Redes Sociales</h3>
                    <button type="button" onClick={handleAddSocial} className="text-sm flex items-center gap-1 font-bold text-blue-600 hover:text-blue-700">
                        <Plus size={16} /> Añadir red social
                    </button>
                </div>

                <div className="space-y-4">
                    {settings.social_links.map((link: any, idx: number) => (
                        <div key={idx} className="flex flex-col md:flex-row gap-3 items-end bg-gray-50 p-4 rounded-xl border border-gray-100 relative group">
                            <div className="w-full md:w-1/4">
                                <label className="block text-xs font-bold text-gray-500 mb-1">Plataforma</label>
                                <input
                                    value={link.platform}
                                    onChange={(e) => handleUpdateSocial(idx, 'platform', e.target.value)}
                                    className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-red-500 bg-white"
                                />
                            </div>
                            <div className="w-full justify-center md:w-1/4">
                                <label className="block text-xs font-bold text-gray-500 mb-1">Icono Lucide/SVG</label>
                                <select
                                    value={link.icon}
                                    onChange={(e) => handleUpdateSocial(idx, 'icon', e.target.value)}
                                    className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-red-500 bg-white"
                                >
                                    <option value="whatsapp">WhatsApp</option>
                                    <option value="instagram">Instagram</option>
                                    <option value="facebook">Facebook</option>
                                    <option value="tiktok">TikTok</option>
                                    <option value="twitter">Twitter</option>
                                </select>
                            </div>
                            <div className="w-full md:w-2/4 flex items-center gap-3">
                                <div className="flex-1">
                                    <label className="block text-xs font-bold text-gray-500 mb-1">Enlace / URL</label>
                                    <input
                                        value={link.url}
                                        onChange={(e) => handleUpdateSocial(idx, 'url', e.target.value)}
                                        className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-red-500 bg-white"
                                        placeholder="https://"
                                    />
                                </div>
                                <button type="button" onClick={() => handleRemoveSocial(idx)} className="text-red-500 hover:text-red-700 p-2 mb-0.5" title="Eliminar">
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        </div>
                    ))}
                    {settings.social_links.length === 0 && <p className="text-sm text-gray-500 italic">No hay redes sociales configuradas.</p>}
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-lg mb-4 text-gray-800">Horarios (JSON)</h3>
                <p className="text-xs text-gray-500 mb-2">Modo avanzado. Modificar este JSON actualiza los horarios mostrados (propiedades: "days", "hours", "closed")</p>
                <textarea
                    value={JSON.stringify(settings.contact_schedule, null, 2)}
                    onChange={(e) => {
                        try {
                            const parsed = JSON.parse(e.target.value);
                            setSettings({ ...settings, contact_schedule: parsed });
                        } catch {
                            // ignore parsing errors while typing
                        }
                    }}
                    className="w-full h-48 border rounded-lg px-3 py-2 text-sm font-mono outline-none focus:border-red-500 bg-gray-50"
                />
            </div>

        </form>
    );
}
