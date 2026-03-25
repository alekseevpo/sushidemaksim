import { supabase } from '../db/supabase.js';

async function listCategories() {
    console.log('--- Fetching Category Inventory ---');
    const { data: items, error } = await supabase
        .from('menu_items')
        .select('id, name, category, image');

    if (error) {
        console.error('Error:', error);
        return;
    }

    const report: Record<string, { total: number; withImage: number; sampleImage: string | null }> = {};

    items?.forEach(item => {
        if (!report[item.category]) {
            report[item.category] = { total: 0, withImage: 0, sampleImage: null };
        }
        report[item.category].total++;
        if (item.image) {
            report[item.category].withImage++;
            if (!report[item.category].sampleImage) {
                report[item.category].sampleImage = item.image;
            }
        }
    });

    console.table(report);
}

listCategories();
