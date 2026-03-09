import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), 'server', '.env') });

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!);

async function checkColumn() {
    // Try to select the column
    const { error } = await supabase.from('users').select('deleted_at').limit(1);

    if (error) {
        if (error.message.includes('column "deleted_at" does not exist')) {
            console.log('COLUMN_MISSING');
        } else {
            console.error('Error:', error.message);
        }
    } else {
        console.log('COLUMN_EXISTS');
    }
}

checkColumn();
