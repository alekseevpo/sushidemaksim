import { supabase } from '../db/supabase.js';

interface ThreadPost {
    id: string;
    text: string;
    media_url?: string;
    media_type?: string;
    timestamp: string;
}

export async function syncThreadsPosts() {
    const accessToken = process.env.THREADS_ACCESS_TOKEN;
    const threadsUserId = process.env.THREADS_USER_ID;
    const authorUserId = '000c662b-477b-43bc-b42a-d9c4d21c7064'; // Maksim's user ID

    if (!accessToken || !threadsUserId) {
        console.warn('Threads API credentials not found. Skipping sync.');
        return { success: false, message: 'Missing API credentials' };
    }

    try {
        // 1. Get the category ID for 'Threads'
        const { data: category } = await supabase
            .from('tablon_categories')
            .select('id')
            .eq('name', 'Threads')
            .single();

        if (!category) {
            throw new Error('Threads category not found in the database.');
        }

        const categoryId = category.id;

        // 2. Fetch posts from Threads API
        // Depending on Meta API fields, typically: id, text, media_url, media_type, timestamp
        const url = `https://graph.threads.net/v1.0/${threadsUserId}/threads?fields=id,text,media_url,media_type,timestamp&access_token=${accessToken}`;
        const response = await fetch(url);

        if (!response.ok) {
            const err = await response.text();
            throw new Error(`Threads API Error: ${err}`);
        }

        const data = (await response.json()) as { data: ThreadPost[] };
        const threads = data.data || [];

        let insertedCount = 0;
        let skippedCount = 0;

        // 3. Insert into database
        for (const thread of threads) {
            if (!thread.text && !thread.media_url) continue; // Skip empty

            // Check if already exists
            const { data: existing } = await supabase
                .from('tablon_posts')
                .select('id')
                .eq('external_id', thread.id)
                .single();

            if (existing) {
                skippedCount++;
                continue;
            }

            // Insert new thread
            const { error: insertError } = await supabase.from('tablon_posts').insert({
                message: thread.text || '📸 (Imagen/Video adjunto)',
                category_id: categoryId,
                user_id: authorUserId,
                tags: ['threads'],
                media_url: thread.media_url || null,
                is_approved: true,
                status: 'active',
                external_id: thread.id,
                created_at: new Date(thread.timestamp).toISOString(),
            });

            if (insertError) {
                console.error(`Error inserting thread ${thread.id}:`, insertError);
            } else {
                insertedCount++;
            }
        }

        return { success: true, insertedCount, skippedCount };
    } catch (error: any) {
        console.error('Threads Sync Error:', error);
        return { success: false, message: error.message };
    }
}
