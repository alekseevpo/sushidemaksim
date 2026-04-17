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

async function updateImage() {
    console.log('🚀 Updating history post image URL to .jpg...');

    const { data, error } = await supabase
        .from('blog_posts')
        .update({ image_url: '/uploads/blog/sushi_history_spain.jpg' })
        .eq('slug', 'el-origen-del-sushi-en-espana')
        .select();

    if (error) {
        console.error('❌ Error updating post:', error);
        return;
    }

    if (data.length === 0) {
        console.log('⚠️ Post with slug "el-origen-del-sushi-en-espana" not found.');
        return;
    }

    console.log('✅ Image URL updated successfully for:', data[0].title);
}

updateImage();
