import fs from 'fs';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');
const SITEMAP_PATH = path.join(ROOT_DIR, 'public', 'sitemap.xml');

const BASE_URL = 'https://sushidemaksim.vercel.app';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

async function generateSitemap() {
    console.log('🚀 Starting Sitemap Generation...');

    const today = new Date().toISOString().split('T')[0];
    const staticRoutes = ['', '/menu', '/promo', '/contacts', '/blog'];

    let dynamicRoutes = [];

    // Try to fetch dynamic routes from Supabase if keys are available
    if (SUPABASE_URL && SUPABASE_KEY) {
        try {
            const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

    // 1. Fetch Blog Posts
            const { data: posts, error: postsError } = await supabase
                .from('blog_posts')
                .select('slug, updated_at')
                .eq('published', true);

            if (postsError) throw postsError;

            if (posts) {
                const blogRoutes = posts.map(post => ({
                    url: `/blog/${post.slug}`,
                    lastmod: post.updated_at
                        ? new Date(post.updated_at).toISOString().split('T')[0]
                        : today,
                }));
                dynamicRoutes.push(...blogRoutes);
                console.log(`✅ Found ${posts.length} published blog posts.`);
            }

            // 2. Add Menu Categories
            const categories = [
                'entrantes',
                'rollos-grandes',
                'rollos-clasicos',
                'rollos-fritos',
                'sopas',
                'menus',
                'extras',
                'postre',
            ];

            const categoryRoutes = categories.map(cat => ({
                url: `/menu?category=${cat}`,
                lastmod: today,
                priority: 0.7,
                changefreq: 'weekly',
            }));
            dynamicRoutes.push(...categoryRoutes);
            console.log(`✅ Added ${categories.length} menu categories to sitemap.`);
        } catch (err) {
            console.error('⚠️ Could not fetch dynamic routes:', err.message);
        }
    } else {
        console.log('ℹ️ No Supabase keys found. Generating static sitemap only.');
    }

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticRoutes
    .map(
        route => `    <url>
        <loc>${BASE_URL}${route}</loc>
        <lastmod>${today}</lastmod>
        <changefreq>${route === '' ? 'daily' : 'weekly'}</changefreq>
        <priority>${route === '' ? '1.0' : '0.8'}</priority>
    </url>`
    )
    .join('\n')}
${dynamicRoutes
    .map(
        route => `    <url>
        <loc>${BASE_URL}${route.url}</loc>
        <lastmod>${route.lastmod}</lastmod>
        <changefreq>${route.changefreq || 'monthly'}</changefreq>
        <priority>${route.priority || '0.6'}</priority>
    </url>`
    )
    .join('\n')}
</urlset>`;

    try {
        fs.writeFileSync(SITEMAP_PATH, sitemap);
        console.log(`✨ Sitemap successfully generated at: ${SITEMAP_PATH}`);
    } catch (err) {
        console.error('❌ Error writing sitemap file:', err);
        process.exit(1);
    }
}

generateSitemap();
