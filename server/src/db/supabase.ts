import { createClient } from '@supabase/supabase-js';
import { config } from '../config.js';

if (!config.supabase.url || !config.supabase.key) {
    throw new Error('Missing Supabase credentials in environment variables');
}

// Use Service Role Key if available (admin access for backend), fallback to Anon Key
const supabaseKey = config.supabase.serviceRoleKey || config.supabase.key;

export const supabase = createClient(config.supabase.url, supabaseKey);

// Helper for complex queries if needed
// export const getDb = () => supabase;
