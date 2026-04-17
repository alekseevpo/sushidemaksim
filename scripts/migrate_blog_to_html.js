/* eslint-env node */
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../server/.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://dvsmzciknlfevgxpnefr.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_KEY;

if (!supabaseServiceKey) {
    console.error('❌ Missing SUPABASE_KEY in server/.env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

function isHtml(text) {
    return /<[a-z][\s\S]*>/i.test(text);
}

function convertToHtml(text) {
    if (!text) return '';
    // Split by double newlines or single newlines that look like paragraphs
    const paragraphs = text
        .split(/\n\s*\n/)
        .filter(p => p.trim() !== '')
        .map(p => `<p>${p.replace(/\n/g, '<br />')}</p>`)
        .join('\n');
    return paragraphs;
}

async function migrateBlog() {
    console.log('🚀 Loading blog posts for migration...');

    const { data: posts, error } = await supabase.from('blog_posts').select('id, title, content');

    if (error) {
        console.error('❌ Error fetching posts:', error);
        return;
    }

    const postsToMigrate = posts.filter(p => !isHtml(p.content));

    if (postsToMigrate.length === 0) {
        console.log('✅ All blog posts are already in HTML format.');
        return;
    }

    console.log(`📝 Found ${postsToMigrate.length} posts to migrate to HTML...`);

    for (const post of postsToMigrate) {
        const htmlContent = convertToHtml(post.content);

        const { error: updError } = await supabase
            .from('blog_posts')
            .update({ content: htmlContent })
            .eq('id', post.id);

        if (updError) {
            console.error(`❌ Failed to migrate post ${post.id}:`, updError);
        } else {
            console.log(`✅ Migrated: "${post.title}" (ID: ${post.id})`);
        }
    }

    console.log('🎉 Migration complete.');
}

migrateBlog();
