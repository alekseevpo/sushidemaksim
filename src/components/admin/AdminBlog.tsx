import { useState } from 'react';
import { Plus, Edit2, Trash2, CheckCircle, XCircle, RefreshCw, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../utils/api';

interface Props {
    language?: 'ru' | 'es';
}

const BLOG_TRANSLATIONS = {
    ru: {
        title: 'Блог / Новости',
        subtitle: 'Управление статьями и объявлениями',
        newPost: 'Новый пост',
        editPost: 'Редактировать пост',
        save: 'Сохранить изменения',
        publish: 'Опубликовать',
        create: 'Создать пост',
        noPosts: 'Статей пока нет',
        fields: {
            title: 'Заголовок',
            slug: 'URL-адрес (Slug)',
            author: 'Автор',
            image: 'Картинка (URL)',
            excerpt: 'Краткий анонс',
            content: 'Содержание (Markdown или текст)',
        },
        hints: {
            title: 'Заголовок статьи (например, "Топ-5 роллов для вечеринки")',
            slug: 'Человекочитаемый URL (например, top-5-rolls-v-madride)',
            author: 'Имя автора, которое будет отображаться под статьей',
            image: 'Ссылка на обложку статьи. Рекомендуемый размер: 1200x630px',
            excerpt: 'Короткий текст (1-2 предложения), который видно в списке статей',
            content: 'Основной текст статьи. Можно использовать Markdown разметку',
            info: 'Подсказка',
        },
    },
    es: {
        title: 'Blog / Noticias',
        subtitle: 'Gestión de artículos y anuncios',
        newPost: 'Nuevo Post',
        editPost: 'Editar Post',
        save: 'Guardar Cambios',
        publish: 'Publicar',
        create: 'Crear Post',
        noPosts: 'No hay artículos aún',
        fields: {
            title: 'Título',
            slug: 'Dirección URL (Slug)',
            author: 'Autor',
            image: 'Imagen (URL)',
            excerpt: 'Resumen corto',
            content: 'Contenido (Markdown o texto)',
        },
        hints: {
            title: 'Título del artículo (ej: "Top 5 rolls para fiestas")',
            slug: 'URL amigable (ej: top-5-rolls-en-madrid)',
            author: 'Nombre del autor que se mostrará en el artículo',
            image: 'Enlace a la imagen de portada. Tamaño recomendado: 1200x630px',
            excerpt: 'Breve texto (1-2 frases) visible en la lista de artículos',
            content: 'Texto principal del artículo. Se puede usar formato Markdown',
            info: 'Ayuda',
        },
    },
};

const FieldLabel = ({ title, hint, language, align = 'left', className = '' }: any) => {
    const [showHint, setShowHint] = useState(false);
    const infoLabel = language === 'ru' ? 'Подсказка' : 'Ayuda';

    return (
        <div className={`w-full relative flex items-center justify-between mb-1 pl-1 ${className}`}>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none pointer-events-none">
                {title}
            </label>
            <div className="relative">
                <button
                    type="button"
                    onMouseEnter={() => setShowHint(true)}
                    onMouseLeave={() => setShowHint(false)}
                    onClick={() => setShowHint(!showHint)}
                    className={`w-4 h-4 rounded-full flex items-center justify-center transition-all border-none cursor-pointer ${
                        showHint
                            ? 'bg-orange-500 text-white shadow-lg'
                            : 'bg-gray-100 text-gray-400 hover:bg-orange-50 hover:text-orange-500'
                    }`}
                >
                    <HelpCircle size={10} strokeWidth={3} />
                </button>

                <AnimatePresence>
                    {showHint && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 5 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 5 }}
                            className={`absolute ${align === 'right' ? 'right-0' : 'left-0 sm:left-auto sm:right-0'} bottom-full mb-3 w-64 bg-white/95 rounded-2xl shadow-2xl border border-gray-100 z-[100] overflow-hidden backdrop-blur-md pointer-events-none`}
                        >
                            <div className="bg-gray-900 px-4 py-2 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                                    <span className="text-[9px] font-black text-white uppercase tracking-widest">
                                        {infoLabel}
                                    </span>
                                </div>
                            </div>
                            <div className="p-4">
                                <p className="text-[11px] font-bold text-gray-600 leading-relaxed uppercase tracking-tight">
                                    {hint}
                                </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
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
        queryFn: () => api.get('/admin/blog_posts'),
    });

    const mutation = useMutation({
        mutationFn: (data: any) => {
            if (isEditing && isEditing.id) {
                return api.put(`/admin/blog_posts/${isEditing.id}`, data);
            }
            return api.post('/admin/blog_posts', {
                ...data,
                published: true, // Default to published on creation
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-blog'] });
            alert(language === 'ru' ? 'Изменения сохранены!' : 'Cambios guardados!');
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
        onError: (err: any) => {
            console.error('mutation error:', err);
            alert(
                (language === 'ru' ? 'Ошибка: ' : 'Error: ') +
                    (err.response?.data?.error || err.message)
            );
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => api.delete(`/admin/blog_posts/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-blog'] });
            alert(language === 'ru' ? 'Пост удален' : 'Post eliminado');
        },
        onError: (err: any) => {
            alert(
                (language === 'ru' ? 'Ошибка при удалении: ' : 'Error al eliminar: ') + err.message
            );
        },
    });

    const togglePublishMutation = useMutation({
        mutationFn: ({ id, published }: { id: string; published: boolean }) =>
            api.patch(`/admin/blog_posts/${id}/publish`, { published }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-blog'] });
        },
        onError: (err: any) => {
            alert((language === 'ru' ? 'Ошибка: ' : 'Error: ') + err.message);
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
                        {t.create}
                    </button>
                )}
            </div>

            {isEditing ? (
                <div className="bg-white border border-gray-100 rounded-[2.5rem] p-10 shadow-sm">
                    <div className="flex justify-between items-center mb-10">
                        <h3 className="text-xl font-black uppercase tracking-tight">
                            {isEditing.id ? t.editPost : t.newPost}
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
                            className="p-3 bg-gray-50 text-gray-400 hover:text-orange-500 rounded-2xl transition"
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
                            <FieldLabel
                                title={t.fields.title}
                                hint={t.hints.title}
                                language={language}
                            />
                            <FieldLabel
                                title={t.fields.slug}
                                hint={t.hints.slug}
                                language={language}
                                align="right"
                            />
                            <input
                                type="text"
                                value={form.title}
                                onChange={e => setForm({ ...form, title: e.target.value })}
                                className="w-full px-5 py-3.5 bg-white border border-gray-100 rounded-2xl text-sm font-black text-gray-900 outline-none focus:bg-white focus:border-orange-400 transition-all shadow-inner mb-4"
                                required
                            />
                            <input
                                type="text"
                                value={form.slug}
                                onChange={e => setForm({ ...form, slug: e.target.value })}
                                className="w-full px-5 py-3.5 bg-white border border-gray-100 rounded-2xl text-sm font-black text-gray-900 outline-none focus:bg-white focus:border-orange-400 transition-all shadow-inner mb-4"
                                required
                            />

                            <FieldLabel
                                title={t.fields.author}
                                hint={t.hints.author}
                                language={language}
                            />
                            <FieldLabel
                                title={t.fields.image}
                                hint={t.hints.image}
                                language={language}
                                align="right"
                            />
                            <input
                                type="text"
                                value={form.author}
                                onChange={e => setForm({ ...form, author: e.target.value })}
                                className="w-full px-5 py-3.5 bg-white border border-gray-100 rounded-2xl text-sm font-black text-gray-900 outline-none focus:bg-white focus:border-orange-400 transition-all shadow-inner"
                                required
                            />
                            <input
                                type="text"
                                value={form.imageUrl}
                                onChange={e => setForm({ ...form, imageUrl: e.target.value })}
                                className="w-full px-5 py-3.5 bg-white border border-gray-100 rounded-2xl text-sm font-black text-gray-900 outline-none focus:bg-white focus:border-orange-400 transition-all shadow-inner"
                                required
                            />
                        </div>

                        <div className="space-y-1">
                            <FieldLabel
                                title={t.fields.excerpt}
                                hint={t.hints.excerpt}
                                language={language}
                            />
                            <textarea
                                value={form.excerpt}
                                onChange={e => setForm({ ...form, excerpt: e.target.value })}
                                className="w-full px-5 py-3.5 bg-white border border-gray-100 rounded-2xl text-sm font-black text-gray-900 outline-none focus:bg-white focus:border-orange-400 transition-all shadow-inner resize-none h-24"
                                required
                            />
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <FieldLabel
                                    title={t.fields.content}
                                    hint={t.hints.content}
                                    language={language}
                                />
                                <div className="flex gap-2 mb-2">
                                    {[
                                        { label: 'H2', tag: 'h2' },
                                        { label: 'P', tag: 'p' },
                                        { label: 'B', tag: 'strong' },
                                        { label: 'UL', tag: 'ul' },
                                        { label: 'LI', tag: 'li' },
                                    ].map(tool => (
                                        <button
                                            key={tool.label}
                                            type="button"
                                            onClick={() => {
                                                const textarea = document.querySelector(
                                                    'textarea[name="content"]'
                                                ) as HTMLTextAreaElement;
                                                const start = textarea.selectionStart;
                                                const end = textarea.selectionEnd;
                                                const text = textarea.value;
                                                const selectedText = text.substring(start, end);
                                                const before = text.substring(0, start);
                                                const after = text.substring(end);

                                                const replacement =
                                                    tool.tag === 'ul'
                                                        ? `<ul>\n  <li>${selectedText || 'item'}</li>\n</ul>`
                                                        : `<${tool.tag}>${selectedText || ''}</${tool.tag}>`;

                                                const newValue = before + replacement + after;
                                                setForm({ ...form, content: newValue });

                                                // Focus back
                                                setTimeout(() => {
                                                    textarea.focus();
                                                    textarea.setSelectionRange(
                                                        start + tool.tag.length + 2,
                                                        start +
                                                            tool.tag.length +
                                                            2 +
                                                            selectedText.length
                                                    );
                                                }, 0);
                                            }}
                                            className="px-3 py-1 bg-gray-100 hover:bg-orange-500 hover:text-white rounded-lg text-[10px] font-black transition-all border border-gray-200 uppercase tracking-widest"
                                        >
                                            {tool.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                                <div className="relative">
                                    <textarea
                                        name="content"
                                        value={form.content}
                                        onChange={e =>
                                            setForm({ ...form, content: e.target.value })
                                        }
                                        className="w-full px-5 py-4 bg-gray-50/50 border border-gray-100 rounded-[2rem] text-sm font-medium text-gray-900 outline-none focus:bg-white focus:border-orange-400 transition-all shadow-inner resize-none min-h-[400px] font-mono leading-relaxed"
                                        required
                                        placeholder="Escribe el contenido HTML aquí..."
                                    />
                                    <div className="absolute bottom-4 right-6 text-[9px] font-black text-gray-300 uppercase tracking-widest pointer-events-none">
                                        Editor HTML
                                    </div>
                                </div>

                                <div className="relative flex flex-col h-full min-h-[400px]">
                                    <div className="absolute top-4 right-6 z-10 text-[9px] font-black text-orange-400/50 uppercase tracking-widest pointer-events-none">
                                        Vista Previa Viva
                                    </div>
                                    <div className="flex-1 w-full p-8 bg-white border border-dashed border-gray-200 rounded-[2rem] overflow-y-auto max-h-[600px] no-scrollbar">
                                        {form.content ? (
                                            <div
                                                className="prose prose-sm md:prose-base prose-orange max-w-none text-gray-700 blog-preview"
                                                dangerouslySetInnerHTML={{ __html: form.content }}
                                            />
                                        ) : (
                                            <div className="h-full flex items-center justify-center text-gray-300 italic text-sm text-center px-10">
                                                El contenido aparecerá aquí formateado en tiempo
                                                real
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={mutation.isPending}
                            className="w-full py-6 bg-black text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:bg-orange-600 transition flex items-center justify-center gap-2 shadow-2xl shadow-black/10 active:scale-[0.98]"
                        >
                            {mutation.isPending && <RefreshCw size={20} className="animate-spin" />}
                            {isEditing.id ? t.save : t.publish}
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
                                                ? 'bg-orange-50 text-orange-400 hover:bg-orange-100'
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
                                    className="p-3 bg-gray-50 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-2xl transition-all"
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
                                {t.noPosts}
                            </h4>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
