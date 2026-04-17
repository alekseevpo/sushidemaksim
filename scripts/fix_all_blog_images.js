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

async function fixAllImages() {
    console.log('🚀 Checking all blog posts for .png images...');

    const { data: posts, error } = await supabase.from('blog_posts').select('id, title, image_url');

    if (error) {
        console.error('❌ Error fetching posts:', error);
        return;
    }

    const updates = posts?.filter(p => p.image_url?.endsWith('.png')) || [];

    if (updates.length === 0) {
        console.log('✅ No .png images found in any blog posts.');
        return;
    }

    console.log(`📝 Found ${updates.length} posts to update...`);

    for (const post of updates) {
        const newUrl = post.image_url.replace('.png', '.jpg');
        const { error: updError } = await supabase
            .from('blog_posts')
            .update({ image_url: newUrl })
            .eq('id', post.id);

        if (updError) {
            console.error(`❌ Failed to update post ${post.id}:`, updError);
        } else {
            console.log(`✅ Updated: "${post.title}" -> ${newUrl}`);
        }
    }

    console.log('🎉 Database optimization complete.');
}

fixAllImages();
