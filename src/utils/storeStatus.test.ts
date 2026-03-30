import { describe, it, expect } from 'vitest';
import {
    isStoreOpen,
    isTimeWithinBusinessHours,
    getNextOpeningTime,
    formatTimeLeft,
} from './storeStatus';

describe('storeStatus Utility', () => {
    describe('isStoreOpen', () => {
        it('returns false on closed days (Monday)', () => {
            // Monday = 1
            const monday = new Date('2026-03-30T21:00:00Z'); // 2026-03-30 is Monday
            expect(isStoreOpen(monday)).toBe(false);
        });

        it('returns true during business hours (Wednesday 21:00)', () => {
            // Wednesday = 3
            // 2026-04-01 is Wednesday
            const wednesday = new Date('2026-04-01T21:00:00');
            expect(isStoreOpen(wednesday)).toBe(true);
        });

        it('returns false outside business hours (Wednesday 10:00)', () => {
            const wednesdayMorning = new Date('2026-04-01T10:00:00');
            expect(isStoreOpen(wednesdayMorning)).toBe(false);
        });

        it('handles boundary cases (exactly at start and end)', () => {
            const start = new Date('2026-04-01T20:00:00');
            const end = new Date('2026-04-01T23:00:00');
            expect(isStoreOpen(start)).toBe(true);
            expect(isStoreOpen(end)).toBe(false); // Should be false because of timeStr < interval.end
        });

        it('handles complex intervals (Saturday 15:00)', () => {
            // Saturday = 6, intervals: 14:00-17:00, 20:00-23:00
            const saturdayAfternoon = new Date('2026-04-04T15:00:00');
            expect(isStoreOpen(saturdayAfternoon)).toBe(true);
        });
    });

    describe('isTimeWithinBusinessHours', () => {
        it('validates a time string for a given date', () => {
            const date = new Date('2026-04-01T00:00:00'); // Wednesday
            expect(isTimeWithinBusinessHours(date, '21:00')).toBe(true);
            expect(isTimeWithinBusinessHours(date, '10:00')).toBe(false);
        });
    });

    describe('getNextOpeningTime', () => {
        it('finds the next opening time today', () => {
            const wednesdayReady = new Date('2026-04-01T18:00:00'); // Wed 18:00
            const next = getNextOpeningTime(wednesdayReady);
            expect(next?.getHours()).toBe(20);
            expect(next?.getMinutes()).toBe(0);
            expect(next?.getDay()).toBe(3);
        });

        it('finds the next opening time tomorrow or later', () => {
            const monday = new Date('2026-03-30T10:00:00'); // Monday
            const next = getNextOpeningTime(monday);
            // Next is Wednesday at 20:00
            expect(next?.getDay()).toBe(3);
            expect(next?.getHours()).toBe(20);
        });
    });

    describe('formatTimeLeft', () => {
        it('formats hours and minutes', () => {
            const diff = 1000 * 60 * 60 * 2 + 1000 * 60 * 5 + 1000; // 2h 5m 1s
            expect(formatTimeLeft(diff)).toBe('2h 5m 1s');
        });

        it('formats only minutes and seconds when hours is 0', () => {
            const diff = 1000 * 60 * 45 + 1000 * 30; // 45m 30s
            expect(formatTimeLeft(diff)).toBe('45m 30s');
        });
    });
});
