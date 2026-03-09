
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), 'server', '.env') });

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

const email = process.argv[2];

if (!email) {
    console.error('No email provided');
    process.exit(1);
}

async function verify() {
    const { error } = await supabase
        .from('users')
        .update({ is_verified: true })
        .eq('email', email);

    if (error) {
        console.error('Error verifying user:', error.message);
        process.exit(1);
    }
    console.log(`Verified ${email}`);
}

verify();
