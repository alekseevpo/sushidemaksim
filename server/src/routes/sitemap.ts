import { Router, Request, Response } from 'express';
import { supabase } from '../db/supabase.js';
import { config } from '../config.js';

const router = Router();

const STATIC_ROUTES = [
    { url: '', changefreq: 'daily', priority: '1.0' },
    { url: '/menu', changefreq: 'weekly', priority: '0.8' },
    { url: '/promo', changefreq: 'weekly', priority: '0.8' },
    { url: '/contacts', changefreq: 'weekly', priority: '0.8' },
    { url: '/blog', changefreq: 'weekly', priority: '0.8' },
];

router.get('/', async (req: Request, res: Response) => {
    try {
        const baseUrl = config.frontendUrl || 'https://sushidemaksim.vercel.app';
        const today = new Date().toISOString().split('T')[0];

        // 1. Static Routes
        let xmlItems = STATIC_ROUTES.map(
            route => `    <url>
        <loc>${baseUrl}${route.url}</loc>
        <lastmod>${today}</lastmod>
        <changefreq>${route.changefreq}</changefreq>
        <priority>${route.priority}</priority>
    </url>`
        ).join('\n');

        // 2. Dynamic Blog Posts
        const { data: posts } = await supabase
            .from('blog_posts')
            .select('slug, updated_at')
            .eq('published', true);

        if (posts && posts.length > 0) {
            const blogItems = posts
                .map(
                    post => `    <url>
        <loc>${baseUrl}/blog/${post.slug}</loc>
        <lastmod>${post.updated_at ? new Date(post.updated_at).toISOString().split('T')[0] : today}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.6</priority>
    </url>`
                )
                .join('\n');
            xmlItems += '\n' + blogItems;
        }

        const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${xmlItems}
</urlset>`;

        res.header('Content-Type', 'application/xml');
        res.send(sitemap);
    } catch (error) {
        console.error('Sitemap generation error:', error);
        res.status(500).send('Error generating sitemap');
    }
});

export default router;
