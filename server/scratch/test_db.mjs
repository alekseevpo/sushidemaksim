
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing env vars');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log('Fetching site_settings...');
  const { data, error } = await supabase.from('site_settings').select('*');
  if (error) {
    console.error('Error fetching:', error);
  } else {
    console.log('Data:', data);
  }

  console.log('Attempting upsert...');
  const { error: upsertError } = await supabase.from('site_settings').upsert([
    { key: 'test_key', value: 'test_value', updated_at: new Date().toISOString() }
  ], { onConflict: 'key' });

  if (upsertError) {
    console.error('Upsert failed:', upsertError);
  } else {
    console.log('Upsert success!');
  }
}

test();
