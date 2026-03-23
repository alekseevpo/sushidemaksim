import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load server env
dotenv.config({ path: path.join(process.cwd(), 'server', '.env') });

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!);

const email = process.argv[2];

if (!email) {
    console.error('Please provide an email address as an argument.');
    process.exit(1);
}

async function deleteUserByEmail() {
    console.log(`🔍 Searching for user with email: ${email}...`);

    // Find User ID in the 'users' table (Public schema)
    const { data: user, error: findError } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .maybeSingle();

    if (findError) {
        console.error('❌ Error searching for user:', findError.message);
        return;
    }

    if (!user) {
        console.log('⚠️ User not found in public.users table.');
        return;
    }

    const userId = user.id;
    console.log(`✅ Found user ID: ${userId}. Deleting related records...`);

    // Delete related data to satisfy foreign key constraints
    await supabase.from('user_addresses').delete().eq('user_id', userId);
    await supabase.from('user_favorites').delete().eq('user_id', userId);
    await supabase.from('orders').delete().eq('user_id', userId);
    await supabase.from('promo_codes').delete().eq('user_id', userId);
    await supabase.from('menu_item_analytics').delete().eq('user_id', userId);
    await supabase.from('notifications').delete().eq('user_id', userId);

    // Finally delete the user from public.users
    const { error: deleteError } = await supabase.from('users').delete().eq('id', userId);

    if (deleteError) {
        console.error('❌ Error deleting user record:', deleteError.message);
    } else {
        console.log(`🚀 User ${email} (ID: ${userId}) has been successfully removed from the database.`);
    }
}

deleteUserByEmail();
