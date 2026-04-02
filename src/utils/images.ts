export function getOptimizedImageUrl(
    url: string | null | undefined,
    width: number = 640,
    quality: number = 75
): string {
    if (!url) return '';

    // If it's already a Vercel optimization URL, don't double wrap
    if (url.startsWith('/_vercel/image') || url.includes('_vercel/image')) {
        return url;
    }

    // Ensure we have a string
    const baseUrl = String(url);

    // In development environment, we return as-is to avoid proxy overhead and rate limits
    if (import.meta.env.DEV) {
        return baseUrl.startsWith('http') || baseUrl.startsWith('/') ? baseUrl : '/' + baseUrl;
    }

    // Only optimize absolute URLs that point to Supabase or specific external stores
    // Relative local paths starting with / are served by the app directly
    if (baseUrl.startsWith('/') && !baseUrl.includes('supabase.co')) {
        return baseUrl;
    }

    // Apply Vercel Image Optimization
    // We whitelist domains in vercel.json.
    // Standardizing on specific widths (multiples of 320) helps stay within the 5K limit.
    const optimizedWidth = width <= 320 ? 320 : width <= 640 ? 640 : 1080;

    // Use Vercel's optimized proxy
    // This will work for any domain whitelisted in vercel.json (like supabase.co)
    if (baseUrl.includes('supabase.co') || baseUrl.startsWith('http')) {
        return `/_vercel/image?url=${encodeURIComponent(baseUrl)}&w=${optimizedWidth}&q=${quality}`;
    }

    return baseUrl;
}
