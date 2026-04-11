import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnose() {
  console.log('🚀 Starting Diagnostic Probe...');
  console.log(`📡 Connecting to: ${supabaseUrl}`);

  // 1. Get a random user to test with
  console.log('👥 Fetching a test user...');
  const { data: users, error: fetchError } = await supabase
    .from('users')
    .select('id, email, last_seen_at')
    .limit(1);

  if (fetchError) {
    console.error('❌ Error fetching users table:', fetchError);
    if (fetchError.code === '42P01') {
      console.log('💡 REASON: The "users" table does not exist!');
    }
    return;
  }

  if (!users || users.length === 0) {
    console.warn('⚠️ No users found in the "users" table. Cannot test update.');
    return;
  }

  const testUser = users[0];
  console.log(`✅ Found test user: ${testUser.email} (ID: ${testUser.id})`);
  console.log(`Current last_seen_at: ${testUser.last_seen_at}`);

  // 2. Try to update last_seen_at
  console.log('🔄 Attempting to update last_seen_at...');
  const { error: updateError } = await supabase
    .from('users')
    .update({ last_seen_at: new Date().toISOString() })
    .eq('id', testUser.id);

  if (updateError) {
    console.error('❌ UPDATE FAILED!');
    console.error('Error Details:', JSON.stringify(updateError, null, 2));
    
    if (updateError.code === '42703') {
      console.log('💡 REASON: The column "last_seen_at" is missing from the "users" table.');
      console.log('🛠️ SOLUTION: Run the migration SQL to add the column.');
    } else if (updateError.code === '42501') {
       console.log('💡 REASON: Permission denied (Row Level Security).');
    }
  } else {
    console.log('✅ Update successful! The heartbeat logic should work.');
  }
}

diagnose();
