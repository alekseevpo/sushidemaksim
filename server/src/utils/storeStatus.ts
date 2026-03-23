/**
 * Business schedule (Shared with frontend)
 * 0 = Sunday, 1 = Monday, ..., 6 = Saturday
 */
export const BUSINESS_HOURS: Record<number, { start: string; end: string }[]> = {
    1: [], // понедельник: Закрыто
    2: [], // вторник: Закрыто
    3: [{ start: '20:00', end: '23:00' }], // среда
    4: [{ start: '20:00', end: '23:00' }], // четверг
    5: [{ start: '20:00', end: '23:00' }], // пятница
    6: [
        { start: '14:00', end: '17:00' },
        { start: '20:00', end: '23:00' },
    ], // суббота
    0: [{ start: '14:00', end: '17:00' }], // воскресенье
};

export function isStoreOpen(date: Date = new Date()): boolean {
    const day = date.getDay();
    const h = date.getHours().toString().padStart(2, '0');
    const m = date.getMinutes().toString().padStart(2, '0');
    const timeStr = `${h}:${m}`;

    const todayIntervals = BUSINESS_HOURS[day] || [];
    return todayIntervals.some(interval => timeStr >= interval.start && timeStr < interval.end);
}

/**
 * Checks if a specific date and time string (HH:MM) is within business hours.
 */
export function isTimeWithinBusinessHours(date: Date, timeStr: string): boolean {
    const day = date.getDay();
    const todayIntervals = BUSINESS_HOURS[day] || [];
    return todayIntervals.some(interval => timeStr >= interval.start && timeStr < interval.end);
}
