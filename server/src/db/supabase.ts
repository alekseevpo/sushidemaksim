import { createClient } from '@supabase/supabase-js';
import { config } from '../config.js';

if (!config.supabase.url || !config.supabase.key) {
    throw new Error('Missing Supabase credentials in environment variables');
}

export const supabase = createClient(config.supabase.url, config.supabase.key);

// Helper for complex queries if needed
// export const getDb = () => supabase;
