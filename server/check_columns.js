import { supabase } from './src/db/supabase.js';

async function fix() {
    console.log('--- Checking delivery_zones table ---');

    // Try to select free_threshold
    const { error } = await supabase.from('delivery_zones').select('free_threshold').limit(1);

    if (error && error.message.includes('column "free_threshold" does not exist')) {
        console.log('Column "free_threshold" is missing. Adding it...');

        // We cannot add columns via PostgREST easily.
        // We need to use a raw query if we had it, but Supabase client doesn't support it directly.
        // However, I can try to use a function or just hope the user can run SQL.
        // Wait, I can try to see if there's a migration script or just use a known trick.

        console.log('Please run this SQL in Supabase dashboard:');
        console.log('ALTER TABLE delivery_zones ADD COLUMN free_threshold NUMERIC;');
    } else if (error) {
        console.error('Error:', error.message);
    } else {
        console.log('Column "free_threshold" already exists.');
    }
}

fix();
