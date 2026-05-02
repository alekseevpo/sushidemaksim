import { useState, useRef, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import {
    useTablonCategories,
    useCreateTablonPost,
    useUploadTablonImage,
    useSuggestCategory,
} from '../../hooks/queries/useTablon';
import { TABLON_MAX_IMAGES, TABLON_MAX_TAGS } from '../../constants/tablon';

interface CreatePostModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function CreatePostModal({ isOpen, onClose }: CreatePostModalProps) {
    const { user } = useAuth();
    const { data: categoriesData } = useTablonCategories();
    const createPost = useCreateTablonPost();
    const uploadImage = useUploadTablonImage();
    const suggestCategory = useSuggestCategory();

    const [categoryId, setCategoryId] = useState<number | ''>('');
    const [message, setMessage] = useState('');
    const [whatsappPhone, setWhatsappPhone] = useState(user?.phone || '');
    const [tagInput, setTagInput] = useState('');
    const [tags, setTags] = useState<string[]>([]);
    const [images, setImages] = useState<string[]>([]);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    // New category suggestion
    const [showSuggestCategory, setShowSuggestCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [newCategoryEmoji, setNewCategoryEmoji] = useState('📌');

    const fileInputRef = useRef<HTMLInputElement>(null);

    const categories = categoriesData?.categories || [];

    const handleAddTag = useCallback(() => {
        const clean = tagInput.trim().toLowerCase().replace(/^#/, '');
        if (!clean) return;
        if (tags.includes(clean)) return;
        if (tags.length >= TABLON_MAX_TAGS) return;
        setTags(prev => [...prev, clean]);
        setTagInput('');
    }, [tagInput, tags]);

    const handleRemoveTag = useCallback((tag: string) => {
        setTags(prev => prev.filter(t => t !== tag));
    }, []);

    const handleImageUpload = useCallback(
        async (files: FileList | null) => {
            if (!files) return;
            if (images.length + files.length > TABLON_MAX_IMAGES) {
                setError(`Máximo ${TABLON_MAX_IMAGES} imágenes`);
                return;
            }

            setUploading(true);
            setError('');

            try {
                for (const file of Array.from(files)) {
                    if (file.size > 5 * 1024 * 1024) {
                        setError('Cada imagen debe pesar menos de 5MB');
                        continue;
                    }
                    const result = await uploadImage.mutateAsync(file);
                    setImages(prev => [...prev, result.url]);
                }
            } catch {
                setError('Error al subir las imágenes');
            } finally {
                setUploading(false);
            }
        },
        [images.length, uploadImage]
    );

    const handleRemoveImage = useCallback((idx: number) => {
        setImages(prev => prev.filter((_, i) => i !== idx));
    }, []);

    const handleSuggestCategory = useCallback(async () => {
        if (!newCategoryName.trim()) return;
        try {
            await suggestCategory.mutateAsync({
                name: newCategoryName.trim(),
                emoji: newCategoryEmoji || '📌',
            });
            setShowSuggestCategory(false);
            setNewCategoryName('');
            setNewCategoryEmoji('📌');
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : 'Error al sugerir categoría');
        }
    }, [newCategoryName, newCategoryEmoji, suggestCategory]);

    const handleSubmit = useCallback(async () => {
        setError('');

        if (!categoryId) {
            setError('Selecciona una categoría');
            return;
        }
        if (message.trim().length < 10) {
            setError('El mensaje debe tener al menos 10 caracteres');
            return;
        }
        if (!whatsappPhone.trim()) {
            setError('Introduce tu número de WhatsApp');
            return;
        }

        try {
            await createPost.mutateAsync({
                categoryId,
                tags,
                message: message.trim(),
                whatsappPhone: whatsappPhone.trim(),
                images,
            });
            setSuccess(true);
            setTimeout(() => {
                onClose();
                // Reset
                setCategoryId('');
                setMessage('');
                setTags([]);
                setImages([]);
                setSuccess(false);
            }, 2000);
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : 'Error al publicar');
        }
    }, [categoryId, message, whatsappPhone, tags, images, createPost, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-modal flex items-end md:items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
                data-testid="create-post-backdrop"
            />

            {/* Modal */}
            <div
                className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-gray-900 border border-white/10 rounded-t-3xl md:rounded-2xl p-6 animate-slide-up"
                data-testid="create-post-modal"
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-white">📢 Publicar anuncio</h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-white transition-colors"
                        data-testid="create-post-close"
                    >
                        ✕
                    </button>
                </div>

                {success ? (
                    <div className="text-center py-8">
                        <div className="text-5xl mb-4">✅</div>
                        <p className="text-lg font-medium text-white">
                            ¡Tu anuncio ha sido enviado!
                        </p>
                        <p className="text-sm text-gray-400 mt-2">
                            Un moderador lo revisará pronto.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-5">
                        {/* Category Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Categoría *
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {categories.map(cat => (
                                    <button
                                        key={cat.id}
                                        type="button"
                                        data-testid={`category-option-${cat.name.toLowerCase().replace(/\s+/g, '-')}`}
                                        onClick={() => setCategoryId(cat.id)}
                                        className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                                            categoryId === cat.id
                                                ? 'bg-orange-500 text-white'
                                                : 'bg-white/10 text-gray-300 hover:bg-white/20'
                                        }`}
                                    >
                                        {cat.emoji} {cat.name}
                                    </button>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => setShowSuggestCategory(!showSuggestCategory)}
                                    className="px-3 py-1.5 rounded-full text-sm bg-white/5 text-gray-500 hover:bg-white/10 transition-all border border-dashed border-gray-600"
                                    data-testid="suggest-category-btn"
                                >
                                    ➕ Otra
                                </button>
                            </div>

                            {/* Suggest new category inline form */}
                            {showSuggestCategory && (
                                <div className="mt-3 flex gap-2 items-end">
                                    <input
                                        type="text"
                                        value={newCategoryName}
                                        onChange={e => setNewCategoryName(e.target.value)}
                                        placeholder="Nombre de categoría"
                                        className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-orange-500/50"
                                        maxLength={40}
                                        data-testid="suggest-category-name"
                                    />
                                    <input
                                        type="text"
                                        value={newCategoryEmoji}
                                        onChange={e => setNewCategoryEmoji(e.target.value)}
                                        className="w-12 bg-white/5 border border-white/10 rounded-lg px-2 py-2 text-sm text-center text-white focus:outline-none focus:border-orange-500/50"
                                        maxLength={4}
                                        data-testid="suggest-category-emoji"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleSuggestCategory}
                                        disabled={
                                            suggestCategory.isPending || !newCategoryName.trim()
                                        }
                                        className="px-3 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 disabled:opacity-50 transition-all"
                                        data-testid="suggest-category-submit"
                                    >
                                        {suggestCategory.isPending ? '...' : 'Enviar'}
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Message */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Mensaje *
                            </label>
                            <textarea
                                value={message}
                                onChange={e => setMessage(e.target.value)}
                                placeholder="Escribe tu anuncio aquí..."
                                rows={4}
                                maxLength={2000}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-500 resize-none focus:outline-none focus:border-orange-500/50 transition-colors"
                                data-testid="post-message"
                            />
                            <p className="text-xs text-gray-500 mt-1 text-right">
                                {message.length}/2000
                            </p>
                        </div>

                        {/* WhatsApp phone */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                📱 WhatsApp *
                            </label>
                            <input
                                type="tel"
                                value={whatsappPhone}
                                onChange={e => setWhatsappPhone(e.target.value)}
                                placeholder="+34 612 345 678"
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-orange-500/50 transition-colors"
                                data-testid="post-whatsapp"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Solo visible para usuarios registrados
                            </p>
                        </div>

                        {/* Tags */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                🏷️ Etiquetas ({tags.length}/{TABLON_MAX_TAGS})
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={tagInput}
                                    onChange={e => setTagInput(e.target.value)}
                                    onKeyDown={e => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleAddTag();
                                        }
                                    }}
                                    placeholder="Añadir etiqueta..."
                                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-orange-500/50"
                                    disabled={tags.length >= TABLON_MAX_TAGS}
                                    data-testid="post-tag-input"
                                />
                                <button
                                    type="button"
                                    onClick={handleAddTag}
                                    disabled={tags.length >= TABLON_MAX_TAGS || !tagInput.trim()}
                                    className="px-3 py-2 bg-white/10 text-white rounded-lg text-sm hover:bg-white/20 disabled:opacity-30 transition-all"
                                    data-testid="post-tag-add"
                                >
                                    +
                                </button>
                            </div>
                            {tags.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {tags.map(tag => (
                                        <span
                                            key={tag}
                                            className="inline-flex items-center gap-1 px-2 py-1 bg-white/10 text-gray-300 rounded-md text-xs"
                                        >
                                            #{tag}
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveTag(tag)}
                                                className="text-gray-500 hover:text-white ml-1"
                                            >
                                                ✕
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Images */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                📷 Fotos ({images.length}/{TABLON_MAX_IMAGES})
                            </label>
                            <div className="flex gap-3 flex-wrap">
                                {images.map((url, idx) => (
                                    <div
                                        key={idx}
                                        className="relative w-20 h-20 rounded-xl overflow-hidden border border-white/10"
                                    >
                                        <img
                                            src={url}
                                            alt={`Foto ${idx + 1}`}
                                            className="w-full h-full object-cover"
                                            width={80}
                                            height={80}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveImage(idx)}
                                            className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/70 text-white rounded-full text-xs flex items-center justify-center"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                                {images.length < TABLON_MAX_IMAGES && (
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={uploading}
                                        className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-600 flex items-center justify-center text-gray-500 hover:border-orange-500/50 hover:text-orange-400 transition-all"
                                        data-testid="post-upload-btn"
                                    >
                                        {uploading ? (
                                            <div className="w-5 h-5 border-2 border-gray-400 border-t-orange-500 rounded-full animate-spin" />
                                        ) : (
                                            <span className="text-2xl">+</span>
                                        )}
                                    </button>
                                )}
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={e => handleImageUpload(e.target.files)}
                                className="hidden"
                                data-testid="post-file-input"
                            />
                        </div>

                        {/* Error */}
                        {error && (
                            <p
                                className="text-sm text-red-400 bg-red-500/10 rounded-lg px-3 py-2"
                                data-testid="post-error"
                            >
                                {error}
                            </p>
                        )}

                        {/* Submit */}
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={createPost.isPending || uploading}
                            className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-red-600 disabled:opacity-50 transition-all shadow-lg shadow-orange-500/20"
                            data-testid="post-submit"
                        >
                            {createPost.isPending ? 'Publicando...' : '📢 Publicar anuncio'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
