import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { api } from '../../utils/api';

export default function AdminPromos() {
    const [promos, setPromos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState<any>(null);
    const [form, setForm] = useState({
        title: '', description: '', discount: '', valid_until: '', icon: '🎁', color: '#F59E0B', bg: 'from-amber-500 to-amber-400', is_active: true
    });

    useEffect(() => {
        loadPromos();
    }, []);

    const loadPromos = async () => {
        setLoading(true);
        try {
            const data = await api.get('/admin/promos');
            setPromos(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await api.put(`/admin/promos/${isEditing.id}`, form);
            } else {
                await api.post('/admin/promos', form);
            }
            setIsEditing(null);
            setForm({ title: '', description: '', discount: '', valid_until: '', icon: '🎁', color: '#F59E0B', bg: 'from-amber-500 to-amber-400', is_active: true });
            loadPromos();
        } catch (err) {
            console.error(err);
        }
    };

    const handleEdit = (promo: any) => {
        setIsEditing(promo);
        setForm(promo);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Seguro que quieres eliminar esta promoción?')) return;
        try {
            await api.delete(`/admin/promos/${id}`);
            loadPromos();
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Cargando promociones...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Promociones Estáticas</h2>
                <button
                    onClick={() => { setIsEditing(null); setForm({ title: '', description: '', discount: '', valid_until: '', icon: '🎁', color: '#F59E0B', bg: 'from-amber-500 to-amber-400', is_active: true }); }}
                    className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-red-700 transition"
                >
                    <Plus size={16} /> Nueva Promoción
                </button>
            </div>

            <form onSubmit={handleSave} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-full mb-2">
                    <h3 className="font-bold text-gray-800">{isEditing ? 'Editar Promoción' : 'Añadir Promoción'}</h3>
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Título</label>
                    <input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-red-500" />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Descuento (ej: -20%, Regalo)</label>
                    <input required value={form.discount} onChange={e => setForm({ ...form, discount: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-red-500" />
                </div>
                <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 mb-1">Descripción</label>
                    <input required value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-red-500" />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Válido hasta (texto)</label>
                    <input value={form.valid_until} onChange={e => setForm({ ...form, valid_until: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-red-500" />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Icono (Emoji)</label>
                    <input required value={form.icon} onChange={e => setForm({ ...form, icon: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-red-500" />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Color Principal (HEX)</label>
                    <input required value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-red-500" />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Gradiente Tailwind (bg-gradient-to-br ...)</label>
                    <input required value={form.bg} onChange={e => setForm({ ...form, bg: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-red-500" placeholder="from-red-600 to-red-500" />
                </div>
                <div className="md:col-span-2 flex items-center justify-between mt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} className="accent-red-600" />
                        <span className="text-sm font-bold text-gray-700">Activa (visible al público)</span>
                    </label>
                    <button type="submit" className="bg-gray-900 text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-black transition">
                        Guardar
                    </button>
                </div>
            </form>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100 text-xs text-gray-500 uppercase">
                            <th className="p-4 font-bold">Promo</th>
                            <th className="p-4 font-bold">Estado</th>
                            <th className="p-4 font-bold">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {promos.map((p) => (
                            <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl" style={{ backgroundColor: p.color }}>
                                            {p.icon}
                                        </div>
                                        <div>
                                            <div className="font-bold text-gray-900">{p.title} <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full ml-1">{p.discount}</span></div>
                                            <div className="text-xs text-gray-500 truncate max-w-[250px]">{p.description}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4">
                                    {p.is_active ? <span className="flex items-center gap-1 text-green-600 text-xs font-bold"><CheckCircle size={14} /> Activa</span> : <span className="flex items-center gap-1 text-gray-400 text-xs font-bold"><XCircle size={14} /> Inactiva</span>}
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => handleEdit(p)} className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition"><Edit2 size={16} /></button>
                                        <button onClick={() => handleDelete(p.id)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"><Trash2 size={16} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {promos.length === 0 && (
                            <tr>
                                <td colSpan={3} className="p-8 text-center text-gray-500">No hay promociones.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
