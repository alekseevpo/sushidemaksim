import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: 'server/.env' });

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkColumn() {
    const { data, error } = await supabase
        .from('daily_reports')
        .select('is_archived')
        .limit(1);

    if (error) {
        if (error.message.includes('column "is_archived" does not exist')) {
            console.log('❌ Column is_archived does NOT exist in daily_reports');
        } else {
            console.error('❌ Error checking column:', error.message);
        }
    } else {
        console.log('✅ Column is_archived exists in daily_reports');
    }
}

checkColumn();
