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

const updates = [
    { old: 'Аренда', new: 'Alquiler' },
    { old: 'Бизнес', new: 'Negocios' },
    { old: 'Жду заказ', new: 'Esperando pedido' },
    { old: 'Идеи', new: 'Ideas' },
    { old: 'Мероприятия', new: 'Eventos' },
    { old: 'Работа', new: 'Empleo' },
    { old: 'Разное', new: 'Varios' },
    { old: 'Предложения', new: 'Sugerencias' },
    { old: 'Курилка', new: 'General' },
];

async function main() {
    try {
        console.log('Connecting to database via Supabase...');
        for (const update of updates) {
            const { error } = await supabase
                .from('tablon_categories')
                .update({ name: update.new })
                .eq('name', update.old);

            if (error) {
                console.error(`Error updating "${update.old}":`, error.message);
            } else {
                console.log(`Updated "${update.old}" -> "${update.new}"`);
            }
        }
        console.log('Categories translated successfully!');
    } catch (e) {
        console.error('Error:', e);
    }
}

main();
