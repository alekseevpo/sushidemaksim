import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), 'server', '.env') });

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!);

const email = 'pabloescobarg1985@gmail.com';

async function deleteUser() {
    console.log(`Deleting user ${email}...`);

    // Find ID
    const { data: user } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .maybeSingle();

    if (!user) {
        console.log('User not found.');
        return;
    }

    const userId = user.id;

    // Delete related
    await supabase.from('user_addresses').delete().eq('user_id', userId);
    await supabase.from('user_favorites').delete().eq('user_id', userId);
    await supabase.from('orders').delete().eq('user_id', userId);
    await supabase.from('promo_codes').delete().eq('user_id', userId);

    // Delete user
    const { error } = await supabase.from('users').delete().eq('id', userId);

    if (error) {
        console.error('Error:', error.message);
    } else {
        console.log('User Pablito successfully deleted.');
    }
}

deleteUser();
