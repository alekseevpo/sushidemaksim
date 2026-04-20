/**
 * Central configuration for the frontend.
 * SITE_URL is used for SEO canonical tags, Open Graph meta tags, and JSON-LD schema.
 */
export const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://www.sushidemaksim.com';

export const CONFIG = {
    SITE_URL,
    BRAND_NAME: 'Sushi de Maksim',
    DEFAULT_OG_IMAGE: `${SITE_URL}/og-image-v16.jpg`,
};
