/* eslint-env node */
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../server/.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function generatePromo() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let randomPart = '';
    for (let i = 0; i < 4; i++) {
        randomPart += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    const code = `SPECIAL10-${randomPart}`;

    console.log(`Generating code: ${code}...`);

    const { data, error } = await supabase
        .from('promo_codes')
        .insert([
            {
                code,
                discount_percentage: 10,
                is_used: false,
                user_id: null, // Accessible by anyone (first use claims it)
            },
        ])
        .select();

    if (error) {
        console.error('Error inserting promo code:', error);
    } else {
        console.log('Successfully generated promo code:', data[0]);
    }
}

generatePromo();
