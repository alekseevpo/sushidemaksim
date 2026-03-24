import { supabase } from '../db/supabase.js';

async function inspect() {
    console.log('Inspecting funnel_events table details...');

    // Try to get column types from information_schema
    const { data: cols, error: err } = await supabase
        .from('information_schema.columns' as any)
        .select('column_name, data_type, udt_name')
        .eq('table_name', 'funnel_events');

    if (err) {
        console.error('Error querying information_schema:', err);
    } else {
        console.table(cols);
    }

    // Also check if we have any data to see what values look like
    const { data: rows } = await supabase
        .from('funnel_events' as any)
        .select('*')
        .limit(3);
    console.log('Sample rows:', rows);
}

inspect();
