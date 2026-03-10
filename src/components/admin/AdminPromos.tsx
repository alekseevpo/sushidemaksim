import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { api } from '../../utils/api';

export default function AdminPromos() {
    const [promos, setPromos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState<any>(null);
    const [form, setForm] = useState({
        title: '',
        description: '',
        discount: '',
        valid_until: '',
        icon: '🎁',
        color: '#F59E0B',
        bg: 'from-amber-500 to-amber-400',
        is_active: true,
    });
    const [promoToDelete, setPromoToDelete] = useState<any>(null);

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
                alert('Promoción actualizada con éxito');
            } else {
                await api.post('/admin/promos', form);
                alert('Promoción creada con éxito');
            }
            setIsEditing(null);
            setForm({
                title: '',
                description: '',
                discount: '',
                valid_until: '',
                icon: '🎁',
                color: '#F59E0B',
                bg: 'from-amber-500 to-amber-400',
                is_active: true,
            });
            loadPromos();
        } catch (err: any) {
            console.error(err);
            alert('Error al guardar: ' + (err.message || 'Error desconocido'));
        }
    };

    const handleEdit = (promo: any) => {
        setIsEditing(promo);
        setForm(promo);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = (promo: any) => {
        setPromoToDelete(promo);
    };

    const confirmDelete = async () => {
        if (!promoToDelete) return;
        try {
            await api.delete(`/admin/promos/${promoToDelete.id}`);
            alert('Promoción eliminada');
            setPromoToDelete(null);
            loadPromos();
        } catch (err: any) {
            console.error(err);
            alert('Error al eliminar');
        }
    };

    if (loading)
        return <div className="p-8 text-center text-gray-500">Cargando promociones...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Promociones Estáticas</h2>
                <button
                    onClick={() => {
                        setIsEditing(null);
                        setForm({
                            title: '',
                            description: '',
                            discount: '',
                            valid_until: '',
                            icon: '🎁',
                            color: '#F59E0B',
                            bg: 'from-amber-500 to-amber-400',
                            is_active: true,
                        });
                    }}
                    className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-red-700 transition"
                >
                    <Plus size={16} strokeWidth={1.5} /> Nueva Promoción
                </button>
            </div>

            <form
                onSubmit={handleSave}
                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8 grid grid-cols-1 md:grid-cols-2 gap-4"
            >
                <div className="col-span-full mb-2">
                    <h3 className="font-bold text-gray-800">
                        {isEditing ? 'Editar Promoción' : 'Añadir Promoción'}
                    </h3>
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Título</label>
                    <input
                        required
                        value={form.title}
                        onChange={e => setForm({ ...form, title: e.target.value })}
                        className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-red-500"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">
                        Descuento (ej: -20%, Regalo)
                    </label>
                    <input
                        required
                        value={form.discount}
                        onChange={e => setForm({ ...form, discount: e.target.value })}
                        className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-red-500"
                    />
                </div>
                <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 mb-1">
                        Descripción
                    </label>
                    <input
                        required
                        value={form.description}
                        onChange={e => setForm({ ...form, description: e.target.value })}
                        className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-red-500"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">
                        Válido hasta (texto)
                    </label>
                    <input
                        value={form.valid_until}
                        onChange={e => setForm({ ...form, valid_until: e.target.value })}
                        className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-red-500"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">
                        Icono (Emoji)
                    </label>
                    <input
                        required
                        value={form.icon}
                        onChange={e => setForm({ ...form, icon: e.target.value })}
                        className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-red-500"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">
                        Color Principal (HEX)
                    </label>
                    <input
                        required
                        value={form.color}
                        onChange={e => setForm({ ...form, color: e.target.value })}
                        className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-red-500"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">
                        Gradiente Tailwind (bg-gradient-to-br ...)
                    </label>
                    <input
                        required
                        value={form.bg}
                        onChange={e => setForm({ ...form, bg: e.target.value })}
                        className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-red-500"
                        placeholder="from-red-600 to-red-500"
                    />
                </div>
                <div className="md:col-span-2 flex items-center justify-between mt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={form.is_active}
                            onChange={e => setForm({ ...form, is_active: e.target.checked })}
                            className="accent-red-600"
                        />
                        <span className="text-sm font-bold text-gray-700">
                            Activa (visible al público)
                        </span>
                    </label>
                    <button
                        type="submit"
                        className="bg-gray-900 text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-black transition"
                    >
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
                        {promos.map(p => (
                            <tr
                                key={p.id}
                                className="border-b border-gray-50 hover:bg-gray-50 transition"
                            >
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                                            style={{ backgroundColor: p.color }}
                                        >
                                            {p.icon}
                                        </div>
                                        <div>
                                            <div className="font-bold text-gray-900">
                                                {p.title}{' '}
                                                <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full ml-1">
                                                    {p.discount}
                                                </span>
                                            </div>
                                            <div className="text-xs text-gray-500 truncate max-w-[250px]">
                                                {p.description}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4">
                                    {p.is_active ? (
                                        <span className="flex items-center gap-1 text-green-600 text-xs font-bold">
                                            <CheckCircle size={14} strokeWidth={1.5} /> Activa
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1 text-gray-400 text-xs font-bold">
                                            <XCircle size={14} strokeWidth={1.5} /> Inactiva
                                        </span>
                                    )}
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleEdit(p)}
                                            className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition"
                                        >
                                            <Edit2 size={16} strokeWidth={1.5} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(p)}
                                            className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
                                            title="Eliminar promoción"
                                        >
                                            <Trash2 size={16} strokeWidth={1.5} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {promos.length === 0 && (
                            <tr>
                                <td colSpan={3} className="p-8 text-center text-gray-500">
                                    No hay promociones.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Delete Confirmation Modal */}
            {promoToDelete && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
                        onClick={() => setPromoToDelete(null)}
                    />
                    <div className="relative bg-white rounded-[32px] p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <Trash2 size={32} strokeWidth={1.5} />
                            </div>
                            <h3 className="text-xl font-black text-gray-900 mb-2">
                                ¿Eliminar promoción?
                            </h3>
                            <p className="text-sm text-gray-500 font-medium mb-8">
                                Estás a punto de borrar{' '}
                                <span className="text-red-600 font-bold uppercase">
                                    "{promoToDelete.title}"
                                </span>
                                . <br />
                                Esta acción no se puede deshacer.
                            </p>
                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={confirmDelete}
                                    className="w-full py-4 bg-red-600 text-white rounded-2xl font-black text-sm hover:bg-black transition-all"
                                >
                                    SÍ, ELIMINAR
                                </button>
                                <button
                                    onClick={() => setPromoToDelete(null)}
                                    className="w-full py-4 bg-gray-100 text-gray-500 rounded-2xl font-black text-sm hover:bg-gray-200 transition-all"
                                >
                                    CANCELAR
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
