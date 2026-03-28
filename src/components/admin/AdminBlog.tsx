import { useState } from 'react';
import { Plus, Edit2, Trash2, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../utils/api';

interface Props {
    language?: 'ru' | 'es';
}

const BLOG_TRANSLATIONS = {
    ru: { title: 'Блог / Новости', subtitle: 'Управление статьями и объявлениями' },
    es: { title: 'Blog / Noticias', subtitle: 'Gestión de artículos y anuncios' },
};

export default function AdminBlog({ language = 'es' }: Props) {
    const t = BLOG_TRANSLATIONS[language] || BLOG_TRANSLATIONS.es;
    const queryClient = useQueryClient();
    const [isEditing, setIsEditing] = useState<any>(null);
    const [form, setForm] = useState({
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        imageUrl: '',
        author: '',
        published_at: null as string | null,
    });

    const { data: posts = [], isLoading } = useQuery({
        queryKey: ['admin-blog'],
        queryFn: () => api.get('/admin/blog'),
    });

    const mutation = useMutation({
        mutationFn: (data: any) => {
            if (isEditing) {
                return api.put(`/admin/blog/${isEditing.id}`, data);
            }
            return api.post('/admin/blog', data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-blog'] });
            setIsEditing(null);
            setForm({
                title: '',
                slug: '',
                excerpt: '',
                content: '',
                imageUrl: '',
                author: '',
                published_at: null,
            });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => api.delete(`/admin/blog/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-blog'] });
        },
    });

    const togglePublishMutation = useMutation({
        mutationFn: ({ id, published }: { id: string; published: boolean }) =>
            api.patch(`/admin/blog/${id}/publish`, { published }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-blog'] });
        },
    });

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <RefreshCw className="animate-spin text-gray-400" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-black tracking-tight mb-1">{t.title}</h2>
                    <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest px-1">
                        {t.subtitle}
                    </p>
                </div>
                {!isEditing && (
                    <button
                        onClick={() => setIsEditing({})}
                        className="flex items-center gap-2 px-6 py-4 bg-black text-white rounded-3xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-black/20 hover:scale-105 active:scale-95 transition-all"
                    >
                        <Plus size={20} />
                        Создать пост
                    </button>
                )}
            </div>

            {isEditing ? (
                <div className="bg-white border border-gray-100 rounded-[2.5rem] p-10 shadow-sm">
                    <div className="flex justify-between items-center mb-10">
                        <h3 className="text-xl font-black uppercase tracking-tight">
                            {isEditing.id ? 'Редактировать пост' : 'Новый пост'}
                        </h3>
                        <button
                            onClick={() => {
                                setIsEditing(null);
                                setForm({
                                    title: '',
                                    slug: '',
                                    excerpt: '',
                                    content: '',
                                    imageUrl: '',
                                    author: '',
                                    published_at: null,
                                });
                            }}
                            className="p-3 bg-gray-50 text-gray-400 hover:text-red-500 rounded-2xl transition"
                        >
                            <XCircle size={24} />
                        </button>
                    </div>

                    <form
                        onSubmit={e => {
                            e.preventDefault();
                            mutation.mutate(form);
                        }}
                        className="space-y-8"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">
                                    Заголовок
                                </label>
                                <input
                                    type="text"
                                    value={form.title}
                                    onChange={e => setForm({ ...form, title: e.target.value })}
                                    className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-black/5 font-bold transition"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">
                                    URL-адрес (Slug)
                                </label>
                                <input
                                    type="text"
                                    value={form.slug}
                                    onChange={e => setForm({ ...form, slug: e.target.value })}
                                    className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-black/5 font-bold transition"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">
                                    Автор
                                </label>
                                <input
                                    type="text"
                                    value={form.author}
                                    onChange={e => setForm({ ...form, author: e.target.value })}
                                    className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-black/5 font-bold transition"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">
                                    Картинка (URL)
                                </label>
                                <input
                                    type="text"
                                    value={form.imageUrl}
                                    onChange={e => setForm({ ...form, imageUrl: e.target.value })}
                                    className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-black/5 font-bold transition"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">
                                Краткий анонс
                            </label>
                            <textarea
                                value={form.excerpt}
                                onChange={e => setForm({ ...form, excerpt: e.target.value })}
                                className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-black/5 font-bold transition resize-none h-24"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">
                                Содержание (Markdown или Текст)
                            </label>
                            <textarea
                                value={form.content}
                                onChange={e => setForm({ ...form, content: e.target.value })}
                                className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-black/5 font-bold transition resize-none min-h-[300px]"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={mutation.isPending}
                            className="w-full py-6 bg-black text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:bg-gray-900 transition flex items-center justify-center gap-2"
                        >
                            {mutation.isPending && <RefreshCw size={20} className="animate-spin" />}
                            {isEditing.id ? 'Сохранить изменения' : 'Опубликовать'}
                        </button>
                    </form>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {posts.map((post: any) => (
                        <div
                            key={post.id}
                            className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm flex flex-col group transition-all hover:shadow-xl hover:shadow-black/5"
                        >
                            <div className="flex gap-6 mb-8">
                                <div className="w-32 h-32 rounded-3xl overflow-hidden bg-gray-50 flex-shrink-0">
                                    <img
                                        src={post.imageUrl}
                                        alt={post.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between mb-2">
                                        <h4 className="font-black text-lg line-clamp-2 leading-tight">
                                            {post.title}
                                        </h4>
                                        <div
                                            className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-tighter ${
                                                post.published_at
                                                    ? 'bg-green-50 text-green-600'
                                                    : 'bg-gray-50 text-gray-400'
                                            }`}
                                        >
                                            {post.published_at ? 'Опубликован' : 'Черновик'}
                                        </div>
                                    </div>
                                    <p className="text-gray-400 text-[10px] font-bold uppercase mb-4 tracking-widest">
                                        Автор: {post.author}
                                    </p>
                                    <p className="text-gray-500 text-xs line-clamp-2 leading-relaxed">
                                        {post.excerpt}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-auto flex items-center justify-between pt-6 border-t border-gray-50">
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => {
                                            setIsEditing(post);
                                            setForm({
                                                title: post.title,
                                                slug: post.slug,
                                                excerpt: post.excerpt,
                                                content: post.content,
                                                imageUrl: post.imageUrl,
                                                author: post.author,
                                                published_at: post.published_at,
                                            });
                                        }}
                                        className="p-3 bg-gray-50 text-gray-400 hover:text-black hover:bg-gray-100 rounded-2xl transition-all"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                    <button
                                        onClick={() =>
                                            togglePublishMutation.mutate({
                                                id: post.id,
                                                published: !post.published_at,
                                            })
                                        }
                                        disabled={togglePublishMutation.isPending}
                                        className={`p-3 rounded-2xl transition-all ${
                                            post.published_at
                                                ? 'bg-red-50 text-red-400 hover:bg-red-100'
                                                : 'bg-green-50 text-green-400 hover:bg-green-100'
                                        }`}
                                    >
                                        {post.published_at ? (
                                            <XCircle size={18} />
                                        ) : (
                                            <CheckCircle size={18} />
                                        )}
                                    </button>
                                </div>
                                <button
                                    onClick={() => {
                                        if (confirm('Удалить этот пост?')) {
                                            deleteMutation.mutate(post.id);
                                        }
                                    }}
                                    className="p-3 bg-gray-50 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                    {posts.length === 0 && (
                        <div className="col-span-full py-32 text-center bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-100">
                            <div className="inline-flex p-8 bg-white rounded-full shadow-sm mb-6">
                                <Plus size={48} className="text-gray-200" />
                            </div>
                            <h4 className="text-xl font-black text-gray-400 uppercase tracking-widest">
                                Статей пока нет
                            </h4>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
