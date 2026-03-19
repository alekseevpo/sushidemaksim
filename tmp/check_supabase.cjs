const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../server/.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function check() {
  const { data, error } = await supabase.from('menu_items').select('count');
  if (error) {
    console.error('Error fetching menu_items:', error);
  } else {
    console.log('Menu items count:', data);
  }

  const { data: tables, error: tablesError } = await supabase.from('users').select('count');
  if (tablesError) {
    console.error('Error fetching users:', tablesError);
  } else {
    console.log('Users count:', tables);
  }
}

check();
