import { supabase } from './db/supabase.js';

async function diagnose() {
    console.log('--- Diagnosing Database IDs ---');

    console.log('\n--- Users Table ---');
    const { data: users, error: usersError } = await supabase.from('users').select('*').limit(3);
    if (usersError) {
        console.error('❌ Users Error:', usersError.message);
    } else {
        console.log(
            '✅ Found Users:',
            users.map(u => ({ id: u.id, type: typeof u.id, email: u.email }))
        );
    }

    console.log('\n--- Orders Table ---');
    const { data: orders, error: ordersError } = await supabase.from('orders').select('*').limit(3);
    if (ordersError) {
        console.error('❌ Orders Error:', ordersError.message);
    } else {
        console.log(
            '✅ Found Orders:',
            orders.map(o => ({ id: o.id, type: typeof o.id, user_id: o.user_id }))
        );
    }

    console.log('\n--- Analytics (site_events) Table ---');
    const { data: events, error: eventsError } = await supabase
        .from('site_events')
        .select('*')
        .limit(1);
    if (eventsError) {
        console.error('❌ Site Events Error:', eventsError.message);
    } else {
        console.log(
            '✅ Found Events:',
            events.map(e => ({ id: e.id, user_id: e.user_id }))
        );
    }
}

diagnose();
