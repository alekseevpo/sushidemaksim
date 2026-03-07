
import { supabase } from './src/db/supabase.js';

async function seedReports() {
    try {
        // 5 March
        await supabase.from('daily_reports').upsert({
            date: '2026-03-05',
            total_revenue: 245.50,
            orders_count: 5,
            new_users_count: 2,
            avg_ticket: 49.10,
        });
        console.log('✅ Added 5 March');
        process.exit(0);
    } catch (e) {
        console.error('❌ Error seeding report:', e);
        process.exit(1);
    }
}

seedReports();
