import { supabase } from './server/src/db/supabase.js';

async function checkSchema() {
    try {
        const { data, error } = await supabase.from('users').select('*').limit(1);
        if (error) {
            console.error('Error fetching users:', error);
            return;
        }
        if (data && data[0]) {
            console.log('User columns:', Object.keys(data[0]));
        } else {
            console.log('No users found to check columns');
        }
    } catch (err) {
        console.error('Catch error:', err);
    }
}

checkSchema();
