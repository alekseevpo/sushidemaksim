import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function deleteUserByEmail(email: string) {
    console.log(`Searching for user with email: ${email}`);

    // 1. Get user ID
    const { data: user, error: fetchError } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .maybeSingle();

    if (fetchError) {
        console.error('Error fetching user:', fetchError);
        return;
    }

    if (!user) {
        console.log('User not found in public.users table.');
        return;
    }

    const userId = user.id;
    console.log(`User found! ID: ${userId}`);

    // 2. Delete from public.users
    console.log('Deleting from public.users...');
    const { error: deleteError } = await supabase.from('users').delete().eq('id', userId);

    if (deleteError) {
        console.error('Error deleting from users table:', deleteError);
    } else {
        console.log('Successfully deleted from public.users table.');
    }

    // Note: If using Supabase Auth (auth.users), it requires administrative privileges via the Auth Client
    // but the delete on public.users might be enough if registration checks the public table.
    // However, to be thorough, we should check if they can register again even if auth.users still has them.
    // Usually, registration in this app might check the public.users table for duplicates.
}

const targetEmail = 'lifepoker777@gmail.com';
deleteUserByEmail(targetEmail);
