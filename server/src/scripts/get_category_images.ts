import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function getCategoryImages() {
    console.log('Fetching category images...');
    // Get distinct categories
    const { data: categories, error: catError } = await supabase
        .from('menu_items')
        .select('category')
        .not('category', 'is', null);

    if (catError) {
        console.error('Error fetching categories:', catError);
        return;
    }

    const uniqueCats = [...new Set(categories.map(c => c.category))];
    console.log('Categories found:', uniqueCats);

    const images: Record<string, string> = {};

    for (const cat of uniqueCats) {
        const { data: items, error } = await supabase
            .from('menu_items')
            .select('image, name')
            .eq('category', cat)
            .not('image', 'is', null)
            .limit(1);

        if (error) {
            console.error(`Error fetching image for ${cat}:`, error);
        } else if (items && items.length > 0) {
            images[cat] = items[0].image;
            console.log(`Found image for ${cat}: ${items[0].name}`);
        }
    }

    console.log('\nFINAL IMAGE LIST:');
    console.log(JSON.stringify(images, null, 2));
}

getCategoryImages();
