import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../server/.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixPromoText() {
    console.log('Searching for promos with "10% OFF"...');
    const { data: promos, error } = await supabase
        .from('promos')
        .select('*')
        .ilike('discount', '%10% OFF%');

    if (error) {
        console.error('Error fetching promos:', error);
        return;
    }

    if (!promos || promos.length === 0) {
        console.log('No promos found with "10% OFF"');
        return;
    }

    console.log(`Found ${promos.length} promos to update.`);

    for (const promo of promos) {
        const newDiscount = promo.discount.replace(/10% OFF/gi, '-10%');
        console.log(`Updating promo "${promo.title}": "${promo.discount}" -> "${newDiscount}"`);

        const { error: updateError } = await supabase
            .from('promos')
            .update({ discount: newDiscount })
            .eq('id', promo.id);

        if (updateError) {
            console.error(`Error updating promo ${promo.id}:`, updateError);
        } else {
            console.log(`Successfully updated promo ${promo.id}`);
        }
    }
}

fixPromoText();
