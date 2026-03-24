import { supabase } from './src/db/supabase.js';

async function check() {
    console.log('Checking columns in delivery_zones...');
    const { data, error } = await supabase.from('delivery_zones').select('*').limit(1);

    if (error) {
        console.error('Error selecting from delivery_zones:', error.message);
        return;
    }

    if (data && data.length > 0) {
        const columns = Object.keys(data[0]);
        console.log('Available columns:', columns);
        if (!columns.includes('free_threshold')) {
            console.log('CRITICAL: free_threshold column is MISSING!');
        } else {
            console.log('free_threshold column is present.');
        }
    } else {
        console.log('No data in delivery_zones to check columns by keys.');
        // Check if we can select it specifically
        const { error: error2 } = await supabase
            .from('delivery_zones')
            .select('free_threshold')
            .limit(1);
        if (error2 && error2.message.includes('column "free_threshold" does not exist')) {
            console.log('CRITICAL: free_threshold column is definitely MISSING!');
        } else {
            console.log('free_threshold column seems to be there.');
        }
    }
}

check();
