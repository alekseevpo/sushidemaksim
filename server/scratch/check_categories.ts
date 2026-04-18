import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl!, supabaseKey!);

async function checkItems() {
    const { data, error } = await supabase
        .from('menu_items')
        .select('id, name, category')
        .limit(100);

    if (error) {
        console.error(error);
        return;
    }

    console.log('Categories found:', [...new Set(data.map(i => i.category))]);
    console.log('Sample items:', data.slice(0, 10));
}

checkItems();
