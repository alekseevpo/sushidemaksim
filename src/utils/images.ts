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

    // Do not optimize if it's not an absolute URL
    if (!baseUrl.startsWith('http')) {
        return baseUrl;
    }

    // Apply Vercel Image Optimization
    // We whitelist domains in vercel.json.
    const optimizedWidth = width <= 320 ? 320 : width <= 640 ? 640 : 1080;

    // Use Vercel's optimized proxy for Supabase and absolute URLs
    if (baseUrl.includes('supabase.co') || baseUrl.startsWith('http')) {
        // If it's a blob or data URL, return as is
        if (baseUrl.startsWith('blob:') || baseUrl.startsWith('data:')) {
            return baseUrl;
        }

        // Avoid double optimization if already has vercel params
        if (baseUrl.includes('_vercel/image')) return baseUrl;

        return `/_vercel/image?url=${encodeURIComponent(baseUrl)}&w=${optimizedWidth}&q=${quality}`;
    }

    return baseUrl;
}
