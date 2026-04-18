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

async function listBebidas() {
    const { data, error } = await supabase
        .from('menu_items')
        .select('id, name, description, category')
        .eq('category', 'bebidas');

    if (error) {
        console.error(error);
        return;
    }

    console.log('Bebidas found:', JSON.stringify(data, null, 2));
}

listBebidas();
