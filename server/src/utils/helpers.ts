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
        is_popular: !!item.is_popular,
        isPopular: !!item.is_popular,
        is_chef_choice: !!item.is_chef_choice,
        isChefChoice: !!item.is_chef_choice,
        is_new: !!item.is_new,
        isNew: !!item.is_new,
        allergens: Array.isArray(item.allergens) ? item.allergens : [],
    };
}
