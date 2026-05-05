import {
    Timer,
    Sparkles,
    Briefcase,
    Lightbulb,
    Megaphone,
    Hammer,
    Home,
    Box,
    Heart,
} from 'lucide-react';

export const CATEGORY_ICON_MAP: Record<string, any> = {
    // Waiting
    'espero mi pedido': Timer,
    'esperando pedido': Timer,
    esperando: Timer,

    // Events / Dates
    eventos: Sparkles,
    citas: Sparkles,

    // Flirting / Relationships
    ligar: Heart,

    // Business
    negocios: Briefcase,

    // Ideas
    ideas: Lightbulb,

    // Suggestions
    sugerencias: Megaphone,

    // Work
    trabajo: Hammer,
    empleo: Hammer,

    // Rent
    alquiler: Home,

    // Misc
    varios: Box,
};

export const getCategoryIcon = (name: string) => {
    const cleanName = name.toLowerCase().trim();

    // Exact match
    if (CATEGORY_ICON_MAP[cleanName]) {
        return CATEGORY_ICON_MAP[cleanName];
    }

    // Partial match
    for (const key in CATEGORY_ICON_MAP) {
        if (cleanName.includes(key) || key.includes(cleanName)) {
            return CATEGORY_ICON_MAP[key];
        }
    }

    return Box;
};
