import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function for combining CSS classes with Tailwind CSS support
 * Combines clsx for conditional classes and tailwind-merge for proper Tailwind merging
 */
export function cn(...inputs: ClassValue[]): string {
    return twMerge(clsx(inputs));
}

/**
 * Alternative export name for consistency
 */
export const classNames = cn; 