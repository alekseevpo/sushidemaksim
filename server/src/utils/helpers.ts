/**
 * Shared helpers used across multiple route files.
 * Provides clean camelCase formatting for frontend consumption.
 */

/** Cleanly maps a menu item from DB (snake_case) to Frontend (camelCase) - PUBLIC version */
export function formatMenuItem(item: any) {
    if (!item) return null;
    return {
        id: item.id,
        name: item.name,
        description: item.description,
        price: Number(item.price),
        image: item.image,
        category: item.category,
        weight: item.weight,
        pieces: item.pieces,
        spicy: !!item.spicy,
        vegetarian: !!item.vegetarian,
        isPromo: !!item.is_promo,
        isPopular: !!item.is_popular,
        isChefChoice: !!item.is_chef_choice,
        isNew: !!item.is_new,
        allergens: Array.isArray(item.allergens) ? item.allergens : [],
    };
}

/** Cleanly maps a menu item from DB (snake_case) to Frontend (camelCase) - ADMIN version */
export function formatAdminMenuItem(item: any) {
    if (!item) return null;
    return {
        ...formatMenuItem(item),
        costPrice: Number(item.cost_price || 0),
    };
}

/** Cleanly maps a user from DB (snake_case) to Frontend (camelCase) */
export function formatUser(
    u: any,
    orderCount: number = 0,
    addresses: any[] = [],
    totalSpent: number = 0,
    promoCodes: any[] = []
) {
    if (!u) return null;
    return {
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        avatar: u.avatar,
        role: u.role,
        isSuperadmin: !!u.is_superadmin,
        isVerified: !!u.is_verified,
        birthDate: u.birth_date,
        isBirthDateVerified: !!u.birth_date_verified,
        createdAt: u.created_at,
        lastSeenAt: u.last_seen_at,
        deletedAt: u.deleted_at,
        orderCount: orderCount,
        totalSpent: totalSpent,
        addresses: (addresses || []).map(a => ({
            id: a.id,
            label: a.label,
            street: a.street,
            house: a.house,
            apartment: a.apartment,
            city: a.city,
            postalCode: a.postal_code,
            phone: a.phone,
            isDefault: !!a.is_default,
            lat: a.lat,
            lon: a.lon,
        })),
        promoCodes: (promoCodes || []).map(p => ({
            code: p.code,
            discountPercentage: p.discount_percentage,
            isUsed: !!p.is_used,
            createdAt: p.created_at,
        })),
    };
}

/** Cleanly maps an order from DB (snake_case) to Frontend (camelCase) */
export function formatOrder(o: any, userStats: any = null) {
    if (!o) return null;
    const allItems = (o.order_items || o.items || []).map((item: any) => ({
        id: item.id,
        orderId: item.order_id,
        menuItemId: Number(item.menu_item_id),
        name: item.name,
        price: Number(item.price),
        priceAtTime: Number(item.price_at_time || item.price),
        quantity: Number(item.quantity),
        image: item.image,
        description: item.description,
        category: item.category,
        selectedOption: item.selected_option,
    }));

    // Extract the special delivery item (id: -1 or by name)
    const deliveryItem = allItems.find(
        (i: any) => i.menuItemId === -1 || i.name === 'Gastos de Envío'
    );
    const deliveryFee = deliveryItem ? deliveryItem.priceAtTime : 0;

    // Filter out delivery item from the regular items list if needed,
    // or keep it but let the UI filter.
    // We'll keep all for now but provide the helper field.
    const items = allItems.filter((i: any) => i.menuItemId !== -1);

    return {
        id: o.id,
        userId: o.user_id,
        total: Number(o.total),
        deliveryFee,
        deliveryAddress: o.delivery_address,
        phoneNumber: o.phone_number,
        status: o.status,
        notes: o.notes,
        paymentMethod: o.payment_method,
        paymentStatus: o.payment_status,
        createdAt: o.created_at,
        updatedAt: o.updated_at,
        estimatedDeliveryTime: o.estimated_delivery_time,
        promoCode: o.promo_code,
        items,
        users: o.users
            ? {
                  name: o.users.name,
                  email: o.users.email,
                  avatar: o.users.avatar,
              }
            : undefined,
        userStats: userStats || o.userStats || undefined,
    };
}

/** Cleanly maps a delivery zone from DB (snake_case) to Frontend (camelCase) */
export function formatDeliveryZone(z: any) {
    if (!z) return null;
    return {
        id: z.id,
        name: z.name,
        cost: Number(z.cost),
        minOrder: Number(z.min_order || 0),
        color: z.color,
        opacity: Number(z.opacity || 0.3),
        coordinates: z.coordinates,
        isActive: !!z.is_active,
        type: z.type || 'polygon',
        minRadius: z.min_radius ? Number(z.min_radius) : 0,
        maxRadius: z.max_radius ? Number(z.max_radius) : 0,
        freeThreshold: z.free_threshold ? Number(z.free_threshold) : null,
    };
}

/** Cleanly maps a blog post from DB (snake_case) to Frontend (camelCase) */
export function formatBlogPost(p: any) {
    if (!p) return null;
    return {
        id: p.id,
        title: p.title,
        slug: p.slug,
        excerpt: p.excerpt,
        content: p.content,
        imageUrl: p.image_url,
        author: p.author,
        readTime: Number(p.read_time),
        category: p.category,
        published: !!p.published,
        createdAt: p.created_at,
        updatedAt: p.updated_at,
    };
}

/** Madrid Time Helpers */
export function getMadridStartOfDay() {
    const madridNowString = new Date().toLocaleString('en-US', {
        timeZone: 'Europe/Madrid',
        hour12: false,
    });
    const madridDate = new Date(madridNowString);
    const madridMidnight = new Date(madridDate);
    madridMidnight.setHours(0, 0, 0, 0);
    const msSinceMidnightInMadrid = madridDate.getTime() - madridMidnight.getTime();
    return new Date(Date.now() - msSinceMidnightInMadrid);
}

export function getMadridYesterdayStartOfDay() {
    const today = getMadridStartOfDay();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    return yesterday;
}

export function getMadridHour() {
    return parseInt(
        new Date().toLocaleString('en-GB', {
            timeZone: 'Europe/Madrid',
            hour: '2-digit',
            hour12: false,
        })
    );
}

/**
 * Validates if a string is a valid UUID format (v4 or similar).
 * Prevents PostgreSQL 'invalid input syntax for type uuid' 500 errors.
 */
export function isValidUUID(uuid: string): boolean {
    if (!uuid || typeof uuid !== 'string') return false;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
}
