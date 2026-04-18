import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl!, supabaseKey!);

async function consolidateDrinks() {
    console.log('Consolidating drinks...');

    // 1. Update Coca-Cola (ID 116)
    const { error: updateError } = await supabase
        .from('menu_items')
        .update({
            name: 'Coca-Cola / Fanta / Sprite',
            description:
                'Refresco de 33cl. Elige tu favorito: Coca-Cola, Fanta o Sprite (indícalo en los comentarios del pedido).',
            image: '/placeholder-sushi.webp',
        })
        .eq('id', 116);

    if (updateError) {
        console.error('Error updating item 116:', updateError);
        return;
    }
    console.log('Updated item 116 successfully.');

    // 2. Clear references for 117 and 118 (optional but safe)
    await supabase.from('cart_items').delete().in('menu_item_id', [117, 118]);
    await supabase
        .from('order_items')
        .update({ menu_item_id: null })
        .in('menu_item_id', [117, 118]);

    // 3. Delete Fanta (ID 117) and Sprite (ID 118)
    const { error: deleteError } = await supabase.from('menu_items').delete().in('id', [117, 118]);

    if (deleteError) {
        console.error('Error deleting items 117 and 118:', deleteError);
        return;
    }
    console.log('Deleted items 117 and 118 successfully.');

    console.log('Consolidation complete.');
}

consolidateDrinks();
