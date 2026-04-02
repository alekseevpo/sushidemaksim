export function getOptimizedImageUrl(
    url: string | null | undefined,
    width: number = 640,
    quality: number = 75
): string {
    if (!url) return '';

    const isDev = import.meta.env.DEV;
    const isMobileLocal =
        isDev &&
        (window.location.hostname === 'localhost' ||
            window.location.hostname === '127.0.0.1' ||
            window.location.protocol === 'capacitor:') &&
        window.location.port !== '5173';

    const SERVER_URL = 'https://sushidemaksim.vercel.app';

    // If it's already a Vercel optimization URL, don't double wrap
    if (
        url.startsWith('/_vercel/image') ||
        url.startsWith('https://sushidemaksim.vercel.app/_vercel/image')
    ) {
        if (isMobileLocal && url.startsWith('/')) {
            return `${SERVER_URL}${url}`;
        }
        return url;
    }

    // In development or if URL is local, return as is
    if (isDev || url.startsWith('/') || url.startsWith('http')) {
        let finalUrl = url;
        // Ensure local paths have a leading slash
        if (!finalUrl.startsWith('http') && !finalUrl.startsWith('/')) {
            finalUrl = '/' + finalUrl;
        }

        // Fix for mobile local development
        if (isMobileLocal && finalUrl.startsWith('/')) {
            // Note: server/src/index.ts serves uploads at /api/uploads
            // But some paths might already include /api
            return `${SERVER_URL}${finalUrl}`;
        }

        return finalUrl;
    }

    // Apply Vercel Image Optimization for Supabase images
    // We whitelist *.supabase.co in vercel.json
    if (url.includes('supabase.co')) {
        return `/_vercel/image?url=${encodeURIComponent(url)}&w=${width}&q=${quality}`;
    }

    // Return original for other domains unless we whitelist them in vercel.json
    return url;
}
