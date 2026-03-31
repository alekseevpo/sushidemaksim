import { supabase } from './db/supabase.js';

async function checkSchema() {
    console.log('--- Detailed Schema Check ---');

    const tables = ['users', 'orders', 'site_events', 'funnel_events', 'reservations'];

    for (const table of tables) {
        console.log(`\nTable: ${table}`);
        const { data, error } = await supabase.rpc('get_table_columns_info', {
            table_name_input: table,
        });

        if (error) {
            // If RPC doesn't exist, try a direct query to information_schema if possible,
            // or just guess from a sample record's keys
            const { data: sample, error: sampleError } = await supabase
                .from(table)
                .select('*')
                .limit(1);
            if (sampleError) {
                console.error(`  ❌ Error fetching sample: ${sampleError.message}`);
            } else if (sample && sample.length > 0) {
                console.log(`  Columns found in sample: ${Object.keys(sample[0]).join(', ')}`);
                const record = sample[0];
                for (const key of Object.keys(record)) {
                    console.log(`    - ${key}: ${typeof record[key]} (Value: ${record[key]})`);
                }
            } else {
                console.log('  No records found to inspect.');
            }
        } else {
            console.log('  RPC results:', data);
        }
    }
}

checkSchema();
