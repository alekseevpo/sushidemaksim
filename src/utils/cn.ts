import { clsx, type ClassValue } from 'clsx';

/**
 * Utility for conditionally joining class names.
 * Based on project rules to use cn() utility.
 */
export function cn(...inputs: ClassValue[]) {
    return clsx(inputs);
}
