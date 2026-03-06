/**
 * Shared helpers used across multiple route files.
 * Avoids duplication between menu.ts and admin.ts.
 */

/** Convert SQLite integer booleans (0/1) to JS booleans for menu items */
export function formatMenuItem(item: any) {
    return {
        ...item,
        spicy: !!item.spicy,
        vegetarian: !!item.vegetarian,
        is_promo: !!item.is_promo,
        isPromo: !!item.is_promo,
    };
}
