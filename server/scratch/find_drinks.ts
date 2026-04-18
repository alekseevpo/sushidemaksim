import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function findDrinks() {
    const { data, error } = await supabase
        .from('menu_items')
        .select('id, name, description, category')
        .ilike('name', '%coca%')
        .or('name.ilike.%fanta%,name.ilike.%sprite%');

    if (error) {
        console.error('Error fetching drinks:', error);
        return;
    }

    console.log('Found drinks:', JSON.stringify(data, null, 2));
}

findDrinks();
