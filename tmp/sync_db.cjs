const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config({ path: path.join(__dirname, '../server/.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function sync() {
  try {
    const rawData = fs.readFileSync(path.join(__dirname, 'menu_items.json'), 'utf8');
    const items = JSON.parse(rawData);
    console.log(`Found ${items.length} items in local JSON.`);

    // Map SQLite fields to Supabase fields (with boolean conversion)
    const supabaseItems = items.map(item => ({
      ...item,
      spicy: item.spicy === 1,
      vegetarian: item.vegetarian === 1,
      is_promo: item.is_promo === 1,
      // Default new fields if missing in SQLite
      is_popular: false,
      is_chef_choice: false,
      is_new: false,
      allergens: []
    }));

    // Insert into Supabase
    const { data, error } = await supabase.from('menu_items').upsert(supabaseItems, { onConflict: 'id' });
    if (error) throw error;

    console.log('✅ Successfully synced items to Supabase.');
  } catch (err) {
    console.error('❌ Sync failed:', err);
  }
}

sync();
