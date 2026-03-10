import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { api } from '../../utils/api';

export default function AdminBlog() {
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState<any>(null);
    const [form, setForm] = useState({
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        image_url: '',
        author: '',
        read_time: '',
        category: '',
        published: true,
    });
    const [postToDelete, setPostToDelete] = useState<any>(null);

    useEffect(() => {
        loadPosts();
    }, []);

    const loadPosts = async () => {
        setLoading(true);
        try {
            const data = await api.get('/admin/blog_posts');
            setPosts(data);
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
                await api.put(`/admin/blog_posts/${isEditing.id}`, form);
            } else {
                await api.post('/admin/blog_posts', form);
            }
            setIsEditing(null);
            setForm({
                title: '',
                slug: '',
                excerpt: '',
                content: '',
                image_url: '',
                author: '',
                read_time: '',
                category: '',
                published: true,
            });
            loadPosts();
        } catch (err) {
            console.error(err);
        }
    };

    const handleEdit = (post: any) => {
        setIsEditing(post);
        setForm(post);
    };

    const handleDelete = (post: any) => {
        setPostToDelete(post);
    };

    const confirmDelete = async () => {
        if (!postToDelete) return;
        try {
            await api.delete(`/admin/blog_posts/${postToDelete.id}`);
            setPostToDelete(null);
            loadPosts();
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Cargando blog...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Entradas del Blog</h2>
                <button
                    onClick={() => {
                        setIsEditing(null);
                        setForm({
                            title: '',
                            slug: '',
                            excerpt: '',
                            content: '',
                            image_url: '',
                            author: '',
                            read_time: '',
                            category: '',
                            published: true,
                        });
                    }}
                    className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-red-700 transition"
                >
                    <Plus size={16} strokeWidth={1.5} /> Nuevo Artículo
                </button>
            </div>

            <form
                onSubmit={handleSave}
                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8 grid grid-cols-1 md:grid-cols-2 gap-4"
            >
                <div className="col-span-full mb-2">
                    <h3 className="font-bold text-gray-800">
                        {isEditing ? 'Editar Artículo' : 'Añadir Artículo'}
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
                        Slug (URL amigable ej: mi-articulo)
                    </label>
                    <input
                        required
                        value={form.slug}
                        onChange={e => setForm({ ...form, slug: e.target.value })}
                        className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-red-500"
                    />
                </div>
                <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 mb-1">
                        Extracto corto
                    </label>
                    <textarea
                        required
                        value={form.excerpt}
                        onChange={e => setForm({ ...form, excerpt: e.target.value })}
                        className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-red-500 h-16 resize-none"
                    />
                </div>
                <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 mb-1">
                        Contenido HTML / Texto
                    </label>
                    <textarea
                        required
                        value={form.content}
                        onChange={e => setForm({ ...form, content: e.target.value })}
                        className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-red-500 h-32 resize-none cursor-text font-mono"
                    />
                </div>
                <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 mb-1">
                        URL Imagen Portada
                    </label>
                    <input
                        required
                        value={form.image_url}
                        onChange={e => setForm({ ...form, image_url: e.target.value })}
                        className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-red-500"
                        placeholder="https://..."
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Autor</label>
                    <input
                        required
                        value={form.author}
                        onChange={e => setForm({ ...form, author: e.target.value })}
                        className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-red-500"
                        placeholder="Chef Maksim"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Categoría</label>
                    <input
                        required
                        value={form.category}
                        onChange={e => setForm({ ...form, category: e.target.value })}
                        className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-red-500"
                        placeholder="Gastronomía"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">
                        Tiempo de lectura (ej: 5 min)
                    </label>
                    <input
                        required
                        value={form.read_time}
                        onChange={e => setForm({ ...form, read_time: e.target.value })}
                        className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-red-500"
                        placeholder="5 min"
                    />
                </div>

                <div className="md:col-span-2 flex items-center justify-between mt-2 pt-4 border-t border-gray-100">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={form.published}
                            onChange={e => setForm({ ...form, published: e.target.checked })}
                            className="accent-red-600"
                        />
                        <span className="text-sm font-bold text-gray-700">Publicado</span>
                    </label>
                    <button
                        type="submit"
                        className="bg-gray-900 text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-black transition"
                    >
                        Guardar Entrada
                    </button>
                </div>
            </form>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100 text-xs text-gray-500 uppercase">
                            <th className="p-4 font-bold">Artículo</th>
                            <th className="p-4 font-bold hidden md:table-cell">Autor / Cat</th>
                            <th className="p-4 font-bold">Estado</th>
                            <th className="p-4 font-bold">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {posts.map(p => (
                            <tr
                                key={p.id}
                                className="border-b border-gray-50 hover:bg-gray-50 transition"
                            >
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={p.image_url}
                                            alt=""
                                            className="w-12 h-12 rounded-lg object-cover bg-gray-100"
                                        />
                                        <div>
                                            <div className="font-bold text-gray-900 line-clamp-1">
                                                {p.title}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {new Date(p.created_at).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4 hidden md:table-cell">
                                    <div className="text-sm text-gray-700">{p.author}</div>
                                    <div className="text-xs text-gray-500 bg-gray-100 inline-block px-1.5 py-0.5 rounded">
                                        {p.category}
                                    </div>
                                </td>
                                <td className="p-4">
                                    {p.published ? (
                                        <span className="flex items-center gap-1 text-green-600 text-xs font-bold">
                                            <CheckCircle size={14} strokeWidth={1.5} /> Publicado
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1 text-gray-400 text-xs font-bold">
                                            <XCircle size={14} strokeWidth={1.5} /> Oculto
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
                                            title="Eliminar artículo"
                                        >
                                            <Trash2 size={16} strokeWidth={1.5} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {posts.length === 0 && (
                            <tr>
                                <td colSpan={4} className="p-8 text-center text-gray-500">
                                    No hay artículos en el blog.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Delete Confirmation Modal */}
            {postToDelete && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
                        onClick={() => setPostToDelete(null)}
                    />
                    <div className="relative bg-white rounded-[32px] p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <Trash2 size={32} strokeWidth={1.5} />
                            </div>
                            <h3 className="text-xl font-black text-gray-900 mb-2">
                                ¿Eliminar artículo?
                            </h3>
                            <p className="text-sm text-gray-500 font-medium mb-8 text-pretty">
                                Estás a punto de borrar{' '}
                                <span className="text-red-600 font-bold uppercase">
                                    "{postToDelete.title}"
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
                                    onClick={() => setPostToDelete(null)}
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
