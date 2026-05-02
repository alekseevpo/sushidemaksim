import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });
dotenv.config({ path: path.join(__dirname, '../../.env.local') });
dotenv.config({ path: path.join(__dirname, '../../server/.env') });

const supabase = createClient(process.env.SUPABASE_URL || '', process.env.SUPABASE_KEY || '');

async function main() {
    try {
        console.log('Adding "Threads" category...');

        // Check if category exists
        const { data: existing } = await supabase
            .from('tablon_categories')
            .select('id')
            .eq('name', 'Threads')
            .single();

        if (!existing) {
            const { error: insertError } = await supabase.from('tablon_categories').insert({
                name: 'Threads',
                emoji: '🧵',
                is_approved: true,
            });
            if (insertError) {
                console.error('Error inserting category:', insertError);
            } else {
                console.log('Threads category inserted successfully.');
            }
        } else {
            console.log('Threads category already exists.');
        }

        // We can't use Supabase JS client to execute raw SQL (like ALTER TABLE).
        // We will need to use the REST API via RPC or a direct postgres connection to alter the table,
        // or ask the user to run it if they have migrations set up.
        // But since we want to be fully autonomous, let's use the local pg pool for raw SQL schema changes.
    } catch (e) {
        console.error('Error:', e);
    }
}

main();
