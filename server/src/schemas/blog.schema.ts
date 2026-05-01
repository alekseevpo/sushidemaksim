import { z } from 'zod';

/**
 * Base schema for blog post fields.
 */
const blogPostBase = {
    title: z
        .string()
        .min(1, 'El título es obligatorio')
        .max(200, 'El título no puede superar los 200 caracteres'),
    slug: z
        .string()
        .min(1, 'El slug es obligatorio')
        .max(200, 'El slug no puede superar los 200 caracteres')
        .regex(/^[a-z0-9-]+$/, 'El slug solo puede contener letras minúsculas, números y guiones'),
    excerpt: z
        .string()
        .min(1, 'El resumen es obligatorio')
        .max(500, 'El resumen no puede exceder los 500 caracteres'),
    content: z.string().min(1, 'El contenido es obligatorio'),
    author: z
        .string()
        .min(1, 'El autor es obligatorio')
        .max(100, 'El nombre del autor es demasiado largo'),
    category: z.string().optional().default('General'),
    published: z.boolean().optional().default(false),
};

/**
 * Schema for creating a blog post.
 * Handles both snake_case (DB/Legacy) and camelCase (Frontend) for image and read time.
 */
export const createBlogPostSchema = z.object({
    body: z
        .object({
            ...blogPostBase,
            image_url: z.string().optional(),
            imageUrl: z.string().optional(),
            read_time: z.union([z.string(), z.number()]).optional(),
            readTime: z.union([z.string(), z.number()]).optional(),
        })
        .refine(data => data.image_url || data.imageUrl, {
            message: 'La imagen es obligatoria',
            path: ['imageUrl'],
        }),
});

/**
 * Schema for updating a blog post (all fields optional).
 */
export const updateBlogPostSchema = z.object({
    body: z.object({
        title: blogPostBase.title.optional(),
        slug: blogPostBase.slug.optional(),
        excerpt: blogPostBase.excerpt.optional(),
        content: blogPostBase.content.optional(),
        author: blogPostBase.author.optional(),
        category: blogPostBase.category.optional(),
        published: blogPostBase.published.optional(),
        image_url: z.string().optional(),
        imageUrl: z.string().optional(),
        read_time: z.union([z.string(), z.number()]).optional(),
        readTime: z.union([z.string(), z.number()]).optional(),
    }),
    params: z.object({
        id: z.string().min(1, 'ID is required'),
    }),
});

/**
 * Schema for toggling publication status.
 */
export const publishBlogPostSchema = z.object({
    body: z.object({
        published: z.boolean({
            required_error: 'El estado de publicación es obligatorio',
        }),
    }),
    params: z.object({
        id: z.string().min(1, 'ID is required'),
    }),
});

/**
 * Schema for public blog post query parameters (pagination).
 */
export const getBlogPostsSchema = z.object({
    query: z.object({
        page: z
            .string()
            .optional()
            .transform(val => {
                const parsed = val ? parseInt(val, 10) : 1;
                return isNaN(parsed) ? 1 : parsed;
            }),
        limit: z
            .string()
            .optional()
            .transform(val => {
                const parsed = val ? parseInt(val, 10) : 5;
                return isNaN(parsed) ? 5 : parsed;
            }),
        category: z.string().optional(),
    }),
});

export type CreateBlogPostInput = z.infer<typeof createBlogPostSchema>['body'];
export type UpdateBlogPostInput = z.infer<typeof updateBlogPostSchema>['body'];
