import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), 'server', '.env') });

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!);

async function check() {
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', 'pabloescobarg1985@gmail.com');
    if (error) console.error(error);
    else console.log(JSON.stringify(data, null, 2));
}

check();
