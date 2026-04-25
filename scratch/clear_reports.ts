import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load env vars from server/.env relative to current working directory (root)
dotenv.config({ path: 'server/.env' });

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials');
    console.log('Available env vars:', Object.keys(process.env).filter(k => k.includes('SUPABASE')));
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function clearReports() {
    console.log('🧹 Clearing daily_reports history...');
    
    // We can use a large range or just try to delete all
    // In Supabase, you need a filter to delete. 
    // If we don't have is_archived, we use a filter that matches all.
    const { error } = await supabase
        .from('daily_reports')
        .delete()
        .neq('total_revenue', -1); // Revenue is never -1

    if (error) {
        console.error('❌ Error clearing reports:', error.message);
    } else {
        console.log('✅ Daily reports history cleared successfully.');
    }
}

clearReports();
