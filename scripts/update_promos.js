import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), 'server', '.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function run() {
    try {
        console.log('Updating Primer pedido promo...');
        
        const res = await supabase.from('promos').update({
            description: '10% de descuento en tu primer pedido al registrarte en la web',
            discount: '−10%'
        }).eq('title', 'Primer pedido');

        console.log('Update:', res.error ? res.error : 'Success');
        console.log('DONE!');
        process.exit(0);
    } catch(err) {
        console.error(err);
        process.exit(1);
    }
}
run();
