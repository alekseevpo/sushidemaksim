import dotenv from 'dotenv';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Load .env
const envPath = path.join(process.cwd(), 'server', '.env');
dotenv.config({ path: envPath });

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials. Checked path:', envPath);
    console.error('URL:', supabaseUrl ? 'Found' : 'Missing');
    console.error('Key:', supabaseKey ? 'Found' : 'Missing');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function clearAbandonedEvents() {
    console.log('🚀 Starting abandoned events cleanup...');

    // 1. Get all events from the last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    console.log('📅 Fetching events since:', sevenDaysAgo);

    const { data: events, error: fetchError } = await supabase
        .from('site_events')
        .select('session_id, event_name')
        .gte('created_at', sevenDaysAgo);

    if (fetchError) {
        console.error('❌ Error fetching events:', fetchError);
        return;
    }

    if (!events || events.length === 0) {
        console.log('✅ No events found to clean up.');
        return;
    }

    // 2. Identify sessions that HAVE ordered (we keep these)
    const orderedSessions = new Set(
        events.filter(e => e.event_name === 'order_placed').map(e => e.session_id)
    );

    // 3. Identify orphaned session IDs (abandoned)
    const abandonedSessionIds = Array.from(
        new Set(
            events
                .filter(e => e.session_id && !orderedSessions.has(e.session_id))
                .map(e => e.session_id)
        )
    );

    if (abandonedSessionIds.length === 0) {
        console.log('✅ No abandoned sessions found.');
        return;
    }

    console.log(`🧹 Found ${abandonedSessionIds.length} abandoned sessions. Deleting events...`);

    // 4. Delete events for abandoned sessions
    const chunkSize = 100;
    for (let i = 0; i < abandonedSessionIds.length; i += chunkSize) {
        const chunk = abandonedSessionIds.slice(i, i + chunkSize);
        const { error: deleteError } = await supabase
            .from('site_events')
            .delete()
            .in('session_id', chunk);

        if (deleteError) {
            console.error(`❌ Error deleting chunk ${i / chunkSize}:`, deleteError);
        } else {
            console.log(
                `✅ Deleted chunk ${i / chunkSize + 1}/${Math.ceil(abandonedSessionIds.length / chunkSize)}`
            );
        }
    }

    console.log('✨ Cleanup complete!');
}

clearAbandonedEvents().catch(err => {
    console.error('💀 Fatal error during cleanup:', err);
    process.exit(1);
});
