import { Router, Request, Response } from 'express';
import { supabase } from '../db/supabase.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = Router();

// GET /api/blog (Public) - Get all published blog posts
router.get('/', asyncHandler(async (req: Request, res: Response) => {
    const { data: posts, error } = await supabase
        .from('blog_posts')
        .select('id, title, slug, excerpt, image_url, author, read_time, category, published, created_at, updated_at')
        .eq('published', true)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching blog posts:', error);
        return res.status(500).json({ error: 'Error interno del servidor al obtener las publicaciones' });
    }

    res.json(posts);
}));

// GET /api/blog/:slug (Public) - Get a single post by its URL-friendly slug
router.get('/:slug', asyncHandler(async (req: Request, res: Response) => {
    const { slug } = req.params;

    const { data: post, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .eq('published', true)
        .single();

    if (error || !post) {
        if (error?.code !== 'PGRST116') { // Not "row not found" error
            console.error('Error fetching blog post:', error);
        }
        return res.status(404).json({ error: 'Publicación no encontrada' });
    }

    res.json(post);
}));

export default router;
