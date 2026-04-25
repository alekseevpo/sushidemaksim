import { Router, Request, Response } from 'express';
import { supabase } from '../db/supabase.js';
import { config } from '../config.js';

const router = Router();

const STATIC_ROUTES = [
    { url: '', changefreq: 'daily', priority: '1.0' },
    { url: '/menu', changefreq: 'weekly', priority: '0.9' },
    { url: '/promo', changefreq: 'weekly', priority: '0.8' },
    { url: '/contacts', changefreq: 'weekly', priority: '0.7' },
    { url: '/blog', changefreq: 'weekly', priority: '0.8' },
];

const MENU_CATEGORIES = [
    'entrantes',
    'rollos-grandes',
    'rollos-clasicos',
    'rollos-fritos',
    'sopas',
    'menus',
    'extras',
    'postre',
];

router.get('/', async (req: Request, res: Response) => {
    try {
        const baseUrl = config.frontendUrl || 'https://www.sushidemaksim.com';
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

        // 2. Menu Categories
        const categoryItems = MENU_CATEGORIES.map(
            cat => `    <url>
        <loc>${baseUrl}/menu?category=${cat}</loc>
        <lastmod>${today}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.7</priority>
    </url>`
        ).join('\n');
        xmlItems += '\n' + categoryItems;

        // 3. Dynamic Blog Posts with Images
        const { data: posts } = await supabase
            .from('blog_posts')
            .select('title, slug, image_url, updated_at')
            .eq('published', true);

        if (posts && posts.length > 0) {
            const blogItems = posts
                .map(post => {
                    let imgXml = '';
                    if (post.image_url) {
                        const imgUrl = post.image_url.startsWith('http')
                            ? post.image_url
                            : `${baseUrl}${post.image_url.startsWith('/') ? '' : '/'}${post.image_url}`;
                        imgXml = `
        <image:image>
            <image:loc>${imgUrl}</image:loc>
            <image:title>${post.title.replace(/[<>&"']/g, '')}</image:title>
        </image:image>`;
                    }

                    return `    <url>
        <loc>${baseUrl}/blog/${post.slug}</loc>
        <lastmod>${post.updated_at ? new Date(post.updated_at).toISOString().split('T')[0] : today}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.6</priority>${imgXml}
    </url>`;
                })
                .join('\n');
            xmlItems += '\n' + blogItems;
        }

        const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
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
