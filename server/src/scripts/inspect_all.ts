import { supabase } from '../db/supabase.js';

async function inspect(tableName: string) {
    const { data, error } = await supabase.from(tableName).select('*').limit(1);
    if (error) {
        console.error(`Error fetching ${tableName}:`, error);
        return;
    }
    if (data && data.length > 0) {
        console.log(`Columns in ${tableName}:`, Object.keys(data[0]));
        // console.log(`Sample row from ${tableName}:`, data[0]);
    } else {
        console.log(`No data in ${tableName}.`);
    }
}

async function run() {
    console.log('--- USERS ---');
    await inspect('users');
    console.log('--- ORDERS ---');
    await inspect('orders');
    console.log('--- ORDER_ITEMS ---');
    await inspect('order_items');
}

run();
