import { supabase } from './db/supabase.js';

async function verifyMigration() {
    console.log('--- Verifying Migration Success ---');

    // Check users table for id column (should be UUID now)
    const { data: users, error: usersErr } = await supabase.from('users').select('id').limit(1);
    if (usersErr) {
        console.error('❌ Users Table Error:', usersErr.message);
    } else {
        const uId = users[0]?.id;
        console.log(`✅ User ID: ${uId} (Type: ${typeof uId})`);
    }

    // Check relationship orders -> users
    const { data: orders, error: ordersErr } = await supabase
        .from('orders')
        .select('id, user_id, users(name)')
        .not('user_id', 'is', null)
        .limit(1);

    if (ordersErr) {
        console.error('❌ Orders Relationship Error:', ordersErr.message);
    } else if (orders && orders.length > 0) {
        console.log('✅ Orders Relationship OK:', JSON.stringify(orders[0], null, 2));
    } else {
        console.log('⚠️ No non-null user_id orders found to test relationship.');
    }
}

verifyMigration();
