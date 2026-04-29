import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility for conditionally joining class names and correctly merging conflicting Tailwind classes.
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}
