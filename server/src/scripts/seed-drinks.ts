import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const drinks = [
  {
    name: 'Refresco',
    description: 'Refrescos variados (Coca-Cola, Fanta, Sprite, etc.)',
    price: 2.50,
    category: 'bebidas',
    image: '',
    is_popular: false,
    is_new: false,
  },
  {
    name: 'Tinto de verano',
    description: 'Bebida refrescante de vino tinto con gaseosa o limón.',
    price: 5.00,
    category: 'bebidas',
    image: '',
    is_popular: false,
    is_new: false,
  },
  {
    name: 'Copa de vino blanco o tinto',
    description: 'Copa de vino de la casa (Blanco o Tinto).',
    price: 3.00,
    category: 'bebidas',
    image: '',
    is_popular: false,
    is_new: false,
  },
  {
    name: 'Cerveza 0,33l',
    description: 'Cerveza nacional en formato 33cl.',
    price: 2.70,
    category: 'bebidas',
    image: '',
    is_popular: false,
    is_new: false,
  },
  {
    name: 'Copa',
    description: 'Copa de licor o combinado estándar.',
    price: 8.00,
    category: 'bebidas',
    image: '',
    is_popular: false,
    is_new: false,
  },
  {
    name: 'Cervezas Artesanas',
    description: 'Cerveza artesana de la elaboración propia con recetas clásicas y originales. Sabores diferentes y siempre deliciosos.',
    price: 6.00,
    category: 'bebidas',
    image: '',
    is_popular: true,
    is_new: false,
  }
];

async function seed() {
  console.log('🌱 Seeding drinks...');
  
  for (const drink of drinks) {
    const { data, error } = await supabase
      .from('menu_items')
      .insert(drink)
      .select();

    if (error) {
      console.error(`❌ Error inserting ${drink.name}:`, error.message);
    } else {
      console.log(`✅ Inserted: ${drink.name}`);
    }
  }

  console.log('✨ Seeding complete!');
}

seed();
