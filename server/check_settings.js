
import { supabase } from './src/db/supabase.js';

async function checkSettings() {
    const { data, error } = await supabase.from('site_settings').select('*').single();
    if (error) {
        console.error('Error fetching settings:', error);
        return;
    }
    console.log('Current Settings:', JSON.stringify(data, null, 2));
}

checkSettings();
