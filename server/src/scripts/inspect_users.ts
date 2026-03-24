import { supabase } from '../db/supabase.js';

async function inspectUsers() {
    console.log('Inspecting users table...');
    const { data: user, error } = await supabase.from('users').select('*').limit(1).single();
    if (error) {
        console.error('Error:', error);
    } else {
        console.log('User sample:', user);
        console.log('ID type:', typeof user.id);
    }
}

inspectUsers();
