export function getOptimizedImageUrl(
    url: string | null | undefined,
    width: number = 640,
    quality: number = 75
): string {
    if (!url) return '';

    // If it's already a Vercel optimization URL, don't double wrap
    if (
        url.startsWith('/_vercel/image') ||
        url.startsWith('https://sushidemaksim.vercel.app/_vercel/image')
    ) {
        return url;
    }

    // In development or if URL is local, return as is
    if (import.meta.env.DEV || url.startsWith('/') || url.startsWith('http://localhost')) {
        return url;
    }

    // Apply Vercel Image Optimization for Supabase images
    // We whitelist *.supabase.co in vercel.json
    if (url.includes('supabase.co')) {
        return `/_vercel/image?url=${encodeURIComponent(url)}&w=${width}&q=${quality}`;
    }

    // Return original for other domains unless we whitelist them in vercel.json
    return url;
}
