import { useState, useEffect, useRef } from 'react';
import {
    Plus,
    Edit2,
    Trash2,
    Search,
    X,
    RefreshCw,
    Upload,
    Image as ImageIcon,
} from 'lucide-react';
import { api, ApiError } from '../../utils/api';

interface MenuItem {
    id: number;
    name: string;
    description: string;
    price: number;
    image: string;
    category: string;
    pieces?: number;
    spicy?: boolean;
    vegetarian?: boolean;
    is_promo?: boolean;
    is_popular?: boolean;
    is_chef_choice?: boolean;
    is_new?: boolean;
    allergens?: string[];
}

export default function AdminMenu() {
    const [items, setItems] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

    // Form state
    const [formData, setFormData] = useState<Partial<MenuItem>>({});
    const [saving, setSaving] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        loadMenu();
    }, []);

    const loadMenu = async () => {
        setLoading(true);
        try {
            const data = await api.get('/admin/menu');
            setItems(data.items || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const filteredItems = items.filter(
        item =>
            item.name.toLowerCase().includes(search.toLowerCase()) ||
            item.category.toLowerCase().includes(search.toLowerCase())
    );

    const openAddModal = () => {
        setEditingItem(null);
        setFormData({
            name: '',
            description: '',
            price: 0,
            image: '',
            category: 'entrantes',
            pieces: 0,
            spicy: false,
            vegetarian: false,
            is_promo: false,
            is_popular: false,
            is_chef_choice: false,
            is_new: false,
            allergens: [],
        });
        setError('');
        setIsModalOpen(true);
    };

    const openEditModal = (item: MenuItem) => {
        setEditingItem(item);
        setFormData({ ...item });
        setError('');
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('¿Estás seguro de eliminar este plato?')) return;
        try {
            await api.delete(`/admin/menu/${id}`);
            setItems(items.filter(i => i.id !== id));
        } catch (err) {
            alert(err instanceof ApiError ? err.message : 'Error al eliminar');
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingImage(true);
        setError('');
        try {
            const formDataUpload = new FormData();
            formDataUpload.append('image', file);

            const token = localStorage.getItem('sushi_token');
            const res = await fetch('/api/admin/menu/upload-image', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    // Browser automatically sets Content-Type for FormData
                },
                body: formDataUpload,
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({ error: 'Error del servidor' }));
                throw new Error(errorData.error || `Error ${res.status}`);
            }

            const data = await res.json();
            setFormData(prev => ({ ...prev, image: data.url }));
        } catch (err: any) {
            console.error('Upload fail:', err);
            setError(
                err.message === 'Failed to fetch'
                    ? 'Error de red: No se pudo conectar al servidor. Inténtalo de nuevo o refresca la página.'
                    : err.message
            );
        } finally {
            setUploadingImage(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError('');

        try {
            const payload = {
                ...formData,
                price: Number(formData.price),
                pieces: formData.pieces ? Number(formData.pieces) : undefined,
            };

            if (editingItem) {
                const data = await api.put(`/admin/menu/${editingItem.id}`, payload);
                setItems(items.map(i => (i.id === editingItem.id ? data.item : i)));
            } else {
                const data = await api.post('/admin/menu', payload);
                setItems([...items, data.item]);
            }
            setIsModalOpen(false);
        } catch (err) {
            setError(err instanceof ApiError ? err.message : 'Error al guardar');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Top Controls */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="relative w-full sm:w-96">
                    <Search
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                        type="text"
                        placeholder="Buscar por nombre o categoría..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:border-red-400 focus:outline-none transition"
                    />
                </div>
                <button
                    onClick={openAddModal}
                    className="w-full sm:w-auto bg-red-600 text-white px-5 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-red-700 transition"
                >
                    <Plus size={16} /> Nuevo Plato
                </button>
            </div>

            {/* Loading state */}
            {loading ? (
                <div className="text-center py-12 text-gray-400">
                    <RefreshCw size={32} className="mx-auto mb-4 animate-spin" />
                    <p>Cargando menú...</p>
                </div>
            ) : (
                <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-600">
                            <thead className="bg-gray-50 text-gray-700 font-bold border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4">Imagen</th>
                                    <th className="px-6 py-4">Nombre</th>
                                    <th className="px-6 py-4">Categoría</th>
                                    <th className="px-6 py-4 text-right">Precio</th>
                                    <th className="px-6 py-4 text-center">Etiquetas</th>
                                    <th className="px-6 py-4 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredItems.map(item => (
                                    <tr
                                        key={item.id}
                                        className="hover:bg-gray-50 transition-colors"
                                    >
                                        <td className="px-6 py-3">
                                            <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex items-center justify-center">
                                                {item.image ? (
                                                    <img
                                                        src={item.image}
                                                        alt={item.name}
                                                        className="w-full h-full object-cover"
                                                        onError={e =>
                                                            (e.currentTarget.style.display = 'none')
                                                        }
                                                    />
                                                ) : (
                                                    '🍣'
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-3 font-semibold text-gray-900">
                                            {item.name}
                                        </td>
                                        <td className="px-6 py-3 capitalize">
                                            {item.category.replace('-', ' ')}
                                        </td>
                                        <td className="px-6 py-3 text-right font-bold text-red-600">
                                            {Number(item.price).toFixed(2).replace('.', ',')} €
                                        </td>
                                        <td className="px-6 py-3 text-center">
                                            <div className="flex items-center justify-center gap-1 flex-wrap">
                                                {item.spicy && (
                                                    <span className="text-[10px] bg-red-100 text-red-700 font-bold px-2 py-1 rounded-full">
                                                        Picante
                                                    </span>
                                                )}
                                                {item.vegetarian && (
                                                    <span className="text-[10px] bg-green-100 text-green-700 font-bold px-2 py-1 rounded-full">
                                                        Veggie
                                                    </span>
                                                )}
                                                {item.is_popular && (
                                                    <span className="text-[10px] bg-red-100 text-red-700 font-bold px-2 py-1 rounded-full">
                                                        Top
                                                    </span>
                                                )}
                                                {item.is_chef_choice && (
                                                    <span className="text-[10px] bg-purple-100 text-purple-700 font-bold px-2 py-1 rounded-full">
                                                        Chef
                                                    </span>
                                                )}
                                                {item.is_new && (
                                                    <span className="text-[10px] bg-blue-100 text-blue-700 font-bold px-2 py-1 rounded-full">
                                                        Nuevo
                                                    </span>
                                                )}
                                                {item.allergens && item.allergens.length > 0 && (
                                                    <span className="text-[10px] bg-gray-100 text-gray-700 font-bold px-2 py-1 rounded-full">
                                                        {item.allergens.length} Alérg.
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-3 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => openEditModal(item)}
                                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(item.id)}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {filteredItems.length === 0 && (
                        <div className="p-8 text-center text-gray-500">
                            No se encontraron platos.
                        </div>
                    )}
                </div>
            )}

            {/* Modal CRUD */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h2 className="text-xl font-bold text-gray-900">
                                {editingItem ? 'Editar Plato' : 'Añadir Plato'}
                            </h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto">
                            <form id="menu-form" onSubmit={handleSave} className="space-y-4">
                                {error && (
                                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-200">
                                        {error}
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label
                                            htmlFor="item-name"
                                            className="text-sm font-semibold text-gray-700"
                                        >
                                            Nombre *
                                        </label>
                                        <input
                                            id="item-name"
                                            required
                                            type="text"
                                            value={formData.name}
                                            onChange={e =>
                                                setFormData({ ...formData, name: e.target.value })
                                            }
                                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-red-400"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label
                                            htmlFor="item-category"
                                            className="text-sm font-semibold text-gray-700"
                                        >
                                            Categoría *
                                        </label>
                                        <select
                                            id="item-category"
                                            required
                                            value={formData.category}
                                            onChange={e =>
                                                setFormData({
                                                    ...formData,
                                                    category: e.target.value,
                                                })
                                            }
                                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-red-400"
                                        >
                                            <option value="entrantes">Entrantes</option>
                                            <option value="rollos-grandes">Rollos Grandes</option>
                                            <option value="rollos-clasicos">Rollos Clásicos</option>
                                            <option value="rollos-fritos">Rollos Fritos</option>
                                            <option value="sopas">Sopas</option>
                                            <option value="menus">Menús</option>
                                            <option value="extras">Extras</option>
                                            <option value="postre">Postre</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label
                                            htmlFor="item-price"
                                            className="text-sm font-semibold text-gray-700"
                                        >
                                            Precio (€) *
                                        </label>
                                        <input
                                            id="item-price"
                                            required
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={formData.price}
                                            onChange={e =>
                                                setFormData({
                                                    ...formData,
                                                    price: e.target.value as any,
                                                })
                                            }
                                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-red-400"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm font-semibold text-gray-700">
                                            Piezas (opcional)
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={formData.pieces || ''}
                                            onChange={e =>
                                                setFormData({
                                                    ...formData,
                                                    pieces: e.target.value as any,
                                                })
                                            }
                                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-red-400"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label
                                        htmlFor="item-description"
                                        className="text-sm font-semibold text-gray-700"
                                    >
                                        Descripción *
                                    </label>
                                    <textarea
                                        id="item-description"
                                        required
                                        rows={3}
                                        value={formData.description}
                                        onChange={e =>
                                            setFormData({
                                                ...formData,
                                                description: e.target.value,
                                            })
                                        }
                                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-red-400 resize-none"
                                    ></textarea>
                                </div>

                                <div className="space-y-1 md:col-span-2">
                                    <label className="text-sm font-semibold text-gray-700 block">
                                        Imagen del Plato
                                    </label>

                                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                                        {formData.image ? (
                                            <div className="relative group w-24 h-24 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 flex-shrink-0">
                                                <img
                                                    src={formData.image}
                                                    alt="Preview"
                                                    className="w-full h-full object-cover"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setFormData({ ...formData, image: '' })
                                                    }
                                                    className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="w-24 h-24 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center flex-shrink-0 text-gray-400">
                                                <ImageIcon size={24} />
                                            </div>
                                        )}

                                        <div className="flex-1 w-full space-y-2">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    disabled={uploadingImage}
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-bold transition disabled:opacity-50"
                                                >
                                                    {uploadingImage ? (
                                                        <RefreshCw
                                                            size={16}
                                                            className="animate-spin"
                                                        />
                                                    ) : (
                                                        <Upload size={16} />
                                                    )}
                                                    {uploadingImage
                                                        ? 'Subiendo...'
                                                        : 'Subir desde dispositivo'}
                                                </button>
                                                <input
                                                    type="file"
                                                    ref={fileInputRef}
                                                    onChange={handleImageUpload}
                                                    className="hidden"
                                                    accept="image/*"
                                                />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-gray-400 uppercase font-bold">
                                                    O usa un enlace:
                                                </span>
                                            </div>
                                            <input
                                                type="text"
                                                value={formData.image || ''}
                                                onChange={e =>
                                                    setFormData({
                                                        ...formData,
                                                        image: e.target.value,
                                                    })
                                                }
                                                placeholder="https://..."
                                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-red-400 text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-4 pt-2">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.spicy}
                                            onChange={e =>
                                                setFormData({
                                                    ...formData,
                                                    spicy: e.target.checked,
                                                })
                                            }
                                            className="w-4 h-4 text-red-600 rounded border-gray-300 focus:ring-red-500"
                                        />
                                        <span className="text-sm font-medium text-gray-700">
                                            🌶️ Picante
                                        </span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.vegetarian}
                                            onChange={e =>
                                                setFormData({
                                                    ...formData,
                                                    vegetarian: e.target.checked,
                                                })
                                            }
                                            className="w-4 h-4 text-green-600 rounded border-gray-300 focus:ring-green-500"
                                        />
                                        <span className="text-sm font-medium text-gray-700">
                                            🥬 Vegetariano
                                        </span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.is_promo}
                                            onChange={e =>
                                                setFormData({
                                                    ...formData,
                                                    is_promo: e.target.checked,
                                                })
                                            }
                                            className="w-4 h-4 text-amber-500 rounded border-gray-300 focus:ring-amber-500"
                                        />
                                        <span className="text-sm font-medium text-gray-700">
                                            🏷️ Promoción
                                        </span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.is_popular}
                                            onChange={e =>
                                                setFormData({
                                                    ...formData,
                                                    is_popular: e.target.checked,
                                                })
                                            }
                                            className="w-4 h-4 text-orange-500 rounded border-gray-300 focus:ring-orange-500"
                                        />
                                        <span className="text-sm font-medium text-gray-700">
                                            🔥 Popular (Top)
                                        </span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.is_chef_choice}
                                            onChange={e =>
                                                setFormData({
                                                    ...formData,
                                                    is_chef_choice: e.target.checked,
                                                })
                                            }
                                            className="w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                                        />
                                        <span className="text-sm font-medium text-gray-700">
                                            👨‍🍳 Selección del Chef
                                        </span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.is_new}
                                            onChange={e =>
                                                setFormData({
                                                    ...formData,
                                                    is_new: e.target.checked,
                                                })
                                            }
                                            className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                        />
                                        <span className="text-sm font-medium text-gray-700">
                                            🆕 Nuevo Producto
                                        </span>
                                    </label>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">
                                        Alérgenos
                                    </label>
                                    <div className="flex flex-wrap gap-3">
                                        {['gluten', 'lactose', 'fish', 'soy', 'nuts'].map(
                                            allergen => (
                                                <label
                                                    key={allergen}
                                                    className="flex items-center gap-2 cursor-pointer"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.allergens?.includes(
                                                            allergen
                                                        )}
                                                        onChange={e => {
                                                            const current =
                                                                formData.allergens || [];
                                                            const updated = e.target.checked
                                                                ? [...current, allergen]
                                                                : current.filter(
                                                                      a => a !== allergen
                                                                  );
                                                            setFormData({
                                                                ...formData,
                                                                allergens: updated,
                                                            });
                                                        }}
                                                        className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                                    />
                                                    <span className="text-xs font-medium text-gray-600 capitalize">
                                                        {allergen}
                                                    </span>
                                                </label>
                                            )
                                        )}
                                    </div>
                                </div>
                            </form>
                        </div>

                        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 mt-auto">
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="px-5 py-2 text-sm font-bold text-gray-600 hover:bg-gray-200 rounded-lg transition"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                form="menu-form"
                                disabled={saving}
                                className="px-6 py-2 text-sm font-bold bg-red-600 text-white hover:bg-red-700 rounded-lg transition shadow-md disabled:bg-red-300"
                            >
                                {saving ? 'Guardando...' : 'Guardar Plato'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
