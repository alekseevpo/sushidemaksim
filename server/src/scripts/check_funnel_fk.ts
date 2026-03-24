import { supabase } from '../db/supabase.js';

async function checkForeignKeys() {
    console.log('Checking foreign keys for funnel_events...');

    // Query to find foreign key relationships in PostgreSQL

    // Wait, Supabase only allows RPC for such things if it's defined.
    // I will try to use information_schema directly via .from() which might work depending on permissions.
    // But most likely I need an RPC or a raw query if available.

    // Actually, I'll just check if there's any data in funnel_events with non-null user_id.
    const { data: nonNullUsers, error: selectErr } = await supabase
        .from('funnel_events')
        .select('user_id')
        .not('user_id', 'is', null)
        .limit(5);

    if (selectErr) {
        console.error('Error selecting from funnel_events:', selectErr);
    } else {
        console.log('Sample non-null UserIDs in funnel_events:', nonNullUsers);
    }
}

checkForeignKeys();
