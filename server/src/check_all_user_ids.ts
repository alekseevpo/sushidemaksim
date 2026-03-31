import { supabase } from './db/supabase.js';

async function checkDatabaseValues() {
    console.log('--- Checking USERS table sample ---');
    const { data: users, error: userError } = await supabase
        .from('users')
        .select('id, email')
        .limit(3);
    if (userError) {
        console.log(`❌ Users error: ${userError.message}`);
    } else {
        users.forEach(u => console.log(`User: ${u.email} | ID: ${u.id} (${typeof u.id})`));
    }

    const tables = ['orders', 'site_events', 'funnel_events', 'user_addresses', 'promo_codes'];

    console.log('\n--- Checking table user_id samples ---');
    for (const table of tables) {
        const { data, error } = await supabase
            .from(table)
            .select('user_id')
            .limit(1)
            .not('user_id', 'is', null);
        if (error) {
            console.log(`❌ Table ${table}: ${error.message}`);
        } else if (data && data.length > 0) {
            const val = data[0].user_id;
            const isUUID = typeof val === 'string' && val.includes('-');
            console.log(`✅ Table ${table}: user_id = ${val} (isUUID: ${isUUID})`);
        } else {
            console.log(`✅ Table ${table}: (no rows with user_id)`);
        }
    }
}

checkDatabaseValues();
