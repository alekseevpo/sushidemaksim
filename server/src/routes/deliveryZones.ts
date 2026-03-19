import { Router, Response, Request } from 'express';
import { supabase } from '../db/supabase.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

import axios from 'axios';

const router = Router();

// GET /api/delivery-zones
router.get(
    '/',
    asyncHandler(async (_req: Request, res: Response) => {
        const { data: zones, error } = await supabase
            .from('delivery_zones')
            .select('*')
            .eq('is_active', true)
            .order('updated_at', { ascending: false });

        if (error) throw error;
        res.json({ zones });
    })
);

// Simple in-memory cache to stay within Nominatim's 1 req/sec limit and avoid 429 errors
const searchCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 30; // 30 minutes

// Proxy search because Nominatim blocks direct browser access (CORS/UA)
router.get(
    '/search',
    asyncHandler(async (req: Request, res: Response) => {
        const { q } = req.query;
        if (!q || typeof q !== 'string') {
            return res.status(400).json({ error: 'Query required' });
        }

        const query = q.trim().toLowerCase();
        const now = Date.now();

        // Check cache
        const cached = searchCache.get(query);
        if (cached && now - cached.timestamp < CACHE_TTL) {
            return res.json(cached.data);
        }

        try {
            // Respect Nominatim's limit by spacing out requests if many users hit it
            // Simple sleep to reduce chance of 429 on bursts
            await new Promise(r => setTimeout(r, 200));

            const response = await axios.get('https://nominatim.openstreetmap.org/search', {
                params: {
                    format: 'json',
                    q: `${query}, Madrid`,
                    limit: 10,
                    addressdetails: 1,
                    // Madrid and surrounding Community of Madrid bounding box
                    // Format: left, top, right, bottom (lon, lat)
                    viewbox: '-4.6, 41.2, -3.0, 39.8',
                    bounded: 1,
                },
                headers: {
                    'User-Agent': 'SushiDeMaksim-App/1.0 (alekseevpo@gmail.com)',
                },
            });

            // Filter results to ensure they are in Madrid region
            const madridResults = response.data.filter((item: any) => {
                const displayName = item.display_name.toLowerCase();
                return (
                    displayName.includes('madrid') ||
                    (item.address &&
                        (item.address.state === 'Comunidad de Madrid' ||
                            item.address.province === 'Madrid' ||
                            item.address.city === 'Madrid'))
                );
            });

            // Update cache
            searchCache.set(query, { data: madridResults, timestamp: now });

            // Periodically clean cache
            if (searchCache.size > 500) {
                for (const [key, val] of searchCache.entries()) {
                    if (now - val.timestamp > CACHE_TTL) searchCache.delete(key);
                }
            }

            res.json(response.data);
        } catch (err: any) {
            console.error('Nominatim proxy error:', err.message);

            // If we have a stale cache, return it on error instead of 429
            if (cached) return res.json(cached.data);

            res.status(err.response?.status || 500).json({ error: 'Search failed' });
        }
    })
);

// Proxy reverse geocode
router.get(
    '/reverse',
    asyncHandler(async (req: Request, res: Response) => {
        const { lat, lon } = req.query;
        if (!lat || !lon) {
            return res.status(400).json({ error: 'Lat and Lon required' });
        }

        try {
            const response = await axios.get('https://nominatim.openstreetmap.org/reverse', {
                params: {
                    format: 'json',
                    lat,
                    lon,
                    zoom: 18,
                    addressdetails: 1,
                },
                headers: {
                    'User-Agent': 'SushiDeMaksim-App/1.0 (alekseevpo@gmail.com)',
                },
            });

            res.json(response.data);
        } catch (err: any) {
            console.error('Nominatim reverse error:', err.message);
            res.status(err.response?.status || 500).json({ error: 'Reverse geocode failed' });
        }
    })
);

export default router;
