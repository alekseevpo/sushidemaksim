/**
 * Formats a number as a currency string with a comma as decimal separator.
 * @param price The price to format.
 * @returns Formatted price with ' €' suffix.
 */
export function formatCurrency(price: number): string {
    return `${price.toFixed(2).replace('.', ',')} €`;
}
/**
 * Converts a string into a URL-friendly slug, handling Spanish characters.
 * @param text The text to slugify.
 * @returns Slugified version of the text.
 */
export function slugify(text: string): string {
    if (!text) return '';
    return text
        .toString()
        .toLowerCase()
        .normalize('NFD') // Split accented characters into their base characters and diacritical marks
        .replace(/[\u0300-\u036f]/g, '') // Remove diacritical marks (e.g., á -> a, ñ -> n)
        .trim()
        .replace(/\s+/g, '-') // Replace spaces with -
        .replace(/[^\w-]+/g, '') // Remove all non-word characters
        .replace(/--+/g, '-'); // Replace multiple - with single -
}
