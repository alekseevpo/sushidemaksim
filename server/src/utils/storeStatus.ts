/**
 * Business schedule (Shared with frontend)
 * 0 = Sunday, 1 = Monday, ..., 6 = Saturday
 */
export const BUSINESS_HOURS: Record<number, { start: string; end: string }[]> = {
    1: [], // Lunes: Cerrado
    2: [], // Martes: Cerrado
    3: [{ start: '19:00', end: '23:00' }], // Miércoles
    4: [{ start: '19:00', end: '23:00' }], // Jueves
    5: [{ start: '19:00', end: '23:00' }], // Viernes
    6: [{ start: '14:00', end: '23:00' }], // Sábado
    0: [{ start: '14:00', end: '23:00' }], // Domingo
};

/**
 * Returns the day of the week (0-6) from a YYYY-MM-DD string.
 */
export function getDayOfWeekFromDateString(dateStr: string): number {
    const [y, m, d] = dateStr.split('-').map(Number);
    // Use UTC for server-side if normalized, but let's stay consistent with frontend's "local" intent (which is Madrid time)
    // Actually, on server, we should probably use a safer way.
    return new Date(y, m - 1, d).getDay();
}

export function isStoreOpen(date: Date = new Date()): boolean {
    const day = date.getDay();
    const h = date.getHours().toString().padStart(2, '0');
    const m = date.getMinutes().toString().padStart(2, '0');
    const timeStr = `${h}:${m}`;

    const todayIntervals = BUSINESS_HOURS[day] || [];
    return todayIntervals.some(interval => timeStr >= interval.start && timeStr < interval.end);
}

/**
 * Checks if a specific date string (YYYY-MM-DD) and time string (HH:MM) is within business hours.
 */
export function isTimeWithinBusinessHours(dateStr: string, timeStr: string): boolean {
    const day = getDayOfWeekFromDateString(dateStr);
    const todayIntervals = BUSINESS_HOURS[day] || [];
    return todayIntervals.some(interval => timeStr >= interval.start && timeStr < interval.end);
}
