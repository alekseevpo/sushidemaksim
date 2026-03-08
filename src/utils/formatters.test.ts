import { describe, it, expect } from 'vitest';
import { formatCurrency } from './formatters';

describe('formatCurrency', () => {
    it('should format numbers with two decimal places and a comma correctly', () => {
        expect(formatCurrency(10.5)).toBe('10,50 €');
        expect(formatCurrency(12.0)).toBe('12,00 €');
        expect(formatCurrency(0)).toBe('0,00 €');
    });

    it('should work with integer inputs', () => {
        expect(formatCurrency(123)).toBe('123,00 €');
    });

    it('should format high numbers with two decimal places and a comma correctly', () => {
        expect(formatCurrency(999.988)).toBe('999,99 €'); // toFixed(2) rounds last digit
    });
});
