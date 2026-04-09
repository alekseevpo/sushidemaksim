/**
 * Business schedule from the user's screenshot.
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

export function getNextOpeningTime(now: Date = new Date()): Date | null {
    const day = now.getDay();
    const timeStr =
        now.getHours().toString().padStart(2, '0') +
        ':' +
        now.getMinutes().toString().padStart(2, '0');

    const todayIntervals = BUSINESS_HOURS[day] || [];

    // Check remaining intervals today
    for (const interval of todayIntervals) {
        if (interval.start > timeStr) {
            const [h, m] = interval.start.split(':').map(Number);
            const d = new Date(now);
            d.setHours(h, m, 0, 0);
            return d;
        }
    }

    // Check next days
    for (let i = 1; i <= 7; i++) {
        const nextDay = (day + i) % 7;
        const intervals = BUSINESS_HOURS[nextDay];
        if (intervals && intervals.length > 0) {
            const [h, m] = intervals[0].start.split(':').map(Number);
            const d = new Date(now);
            d.setDate(d.getDate() + i);
            d.setHours(h, m, 0, 0);
            return d;
        }
    }

    return null;
}

export function formatTimeLeft(diff: number): string {
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    let format = '';
    if (hours > 0) format += `${hours}h `;
    format += `${minutes}m ${seconds}s`;
    return format;
}
