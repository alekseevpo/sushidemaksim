import { supabase } from './db/supabase.js';

async function checkReservations() {
    console.log('--- Checking Reservations in Supabase ---');
    const { data, error } = await supabase.from('reservations').select('*').limit(5);
    if (error) {
        console.error('❌ Supabase Query Error:', error);
    } else {
        console.log('✅ Found', data.length, 'reservations:');
        console.log(JSON.stringify(data, null, 2));
    }
}

checkReservations();
