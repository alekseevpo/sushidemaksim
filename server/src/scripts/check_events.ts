import { supabase } from '../db/supabase.js';

async function checkSiteEvents() {
    console.log('Inspecting site_events table...');
    const { data: events, error } = await supabase
        .from('site_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
    if (error) {
        console.error('Error fetching site_events:', error);
    } else {
        console.log('Recent site events captured:');
        events?.forEach(e => {
            console.log(`- ${e.event_name} [${e.path}] ${JSON.stringify(e.metadata)}`);
        });
    }
}

checkSiteEvents();
