/**
 * Formats a number as a currency string with a comma as decimal separator.
 * @param price The price to format.
 * @returns Formatted price with ' €' suffix.
 */
export function formatCurrency(price: number): string {
    return `${price.toFixed(2).replace('.', ',')} €`;
}
