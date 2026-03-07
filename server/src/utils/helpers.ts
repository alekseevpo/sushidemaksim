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

/**
 * Returns a JS Date object representing 00:00:00 of the current day in Madrid (Europe/Madrid).
 * Use this to fetch "Today" records from Supabase correctly.
 */
export function getMadridStartOfDay() {
    // Current time specifically in Madrid timezone
    const madridNowString = new Date().toLocaleString('en-US', {
        timeZone: 'Europe/Madrid',
        hour12: false,
    });
    // This creates a date object that "thinks" its local time is Madrid time
    const madridDate = new Date(madridNowString);

    // Set it to midnight
    const madridMidnight = new Date(madridDate);
    madridMidnight.setHours(0, 0, 0, 0);

    // Calculate how many milliseconds have passed since midnight IN MADRID
    const msSinceMidnightInMadrid = madridDate.getTime() - madridMidnight.getTime();

    // Subtract those milliseconds from the TRUE global now (Date.now())
    // This gives us the global UTC time corresponding to 00:00:00 Madrid time
    return new Date(Date.now() - msSinceMidnightInMadrid);
}

/**
 * Returns a JS Date object representing 00:00:00 of YESTERDAY in Madrid.
 * Perfect for daily CRON reports that run at 0:01 AM.
 */
export function getMadridYesterdayStartOfDay() {
    const today = getMadridStartOfDay();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    return yesterday;
}

/** Get the current hour in Madrid (0-23) */
export function getMadridHour() {
    return parseInt(
        new Date().toLocaleString('en-GB', {
            timeZone: 'Europe/Madrid',
            hour: '2-digit',
            hour12: false,
        })
    );
}
