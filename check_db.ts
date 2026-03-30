import { supabase } from './server/src/db/supabase.js';

async function check() {
  const { data, error } = await supabase
    .from('reservations')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

  if (error) {
    console.error('Error fetching reservations:', error);
    return;
  }

  console.log('Last 5 reservations:');
  data?.forEach(r => {
    console.log(`ID: ${r.id}, Name: ${r.name}, Date: ${r.reservation_date}, Created: ${r.created_at}`);
  });
}

check();
