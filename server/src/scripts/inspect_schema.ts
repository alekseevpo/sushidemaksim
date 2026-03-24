import { supabase } from '../db/supabase.js';

async function inspect() {
    const { data, error } = await supabase.from('delivery_zones').select('*').limit(1);

    if (error) {
        console.error('Error fetching data:', error);
        return;
    }

    if (data && data.length > 0) {
        console.log('Columns found in delivery_zones:');
        console.log(Object.keys(data[0]));
    } else {
        console.log('No data in delivery_zones, checking RPC or information_schema...');
        const { data: cols, error: colError } = await supabase.rpc('get_table_columns', {
            table_name: 'delivery_zones',
        });
        if (colError) {
            console.log('RPC failed, trying query...');
            const { data: schemaData, error: schemaError } = await supabase
                .from('information_schema.columns')
                .select('column_name')
                .eq('table_name', 'delivery_zones');
            console.log('Schema:', schemaData || schemaError);
        } else {
            console.log('Columns:', cols);
        }
    }
}

inspect();
