import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSettings() {
    const { data: settings, error } = await supabase.from('site_settings').select('*');
    if (error) {
        console.error('Error fetching settings:', error);
        return;
    }

    const settingsMap = settings.reduce((acc, curr) => {
        try {
            acc[curr.key] = typeof curr.value === 'string' ? JSON.parse(curr.value) : curr.value;
        } catch {
            acc[curr.key] = curr.value;
        }
        return acc;
    }, {});

    console.log('--- SETTINGS START ---');
    console.log(JSON.stringify(settingsMap, null, 2));
    console.log('--- SETTINGS END ---');
}

checkSettings();
