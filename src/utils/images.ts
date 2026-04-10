export function getOptimizedImageUrl(
    url: string | null | undefined,
    _width: number = 640,
    _quality: number = 75
): string {
    if (!url) return '';

    // Always return the direct URL to avoid Vercel Image Optimization limits (402 errors).
    // The width and quality parameters are kept for compatibility but prefixed with _ to satisfy strict linting.
    
    // Ensure we have a string
    const baseUrl = String(url);

    // If it's a relative local path, ensure it starts with /
    if (baseUrl.startsWith('/') && !baseUrl.includes('supabase.co')) {
        return baseUrl;
    }

    // In development environment, we return as-is
    if (import.meta.env.DEV) {
        return baseUrl.startsWith('http') || baseUrl.startsWith('/') ? baseUrl : '/' + baseUrl;
    }

    // For all other cases (Supabase, external URLs), return the direct URL
    return baseUrl;
}
