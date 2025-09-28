/**
 * Money utilities for QCSv1
 * Canonical unit: cents (integers)
 * Display unit: major units (dollars) with 2 decimal places
 */

/**
 * Convert major units (dollars) to cents
 * Handles strings, numbers, and edge cases
 * @param major - Amount in major units (dollars)
 * @returns Amount in cents (integer)
 */
export function toCents(major: number | string): number {
  if (typeof major === 'string') {
    // Remove currency symbols and whitespace
    const cleaned = major.replace(/[$,\s]/g, '');
    const parsed = parseFloat(cleaned);
    if (isNaN(parsed)) {
      throw new Error(`Invalid money string: "${major}"`);
    }
    return Math.round(parsed * 100);
  }
  
  if (typeof major !== 'number' || isNaN(major) || !isFinite(major)) {
    throw new Error(`Invalid money value: ${major}`);
  }
  
  // Round to nearest cent to avoid floating point precision issues
  return Math.round(major * 100);
}

/**
 * Convert cents to formatted major units string
 * @param cents - Amount in cents (integer)
 * @param locale - Locale for formatting (default: 'en-US')
 * @param currency - Currency code (default: 'USD')
 * @returns Formatted currency string (e.g., "$1,234.56")
 */
export function toMajor(cents: number, locale: string = 'en-US', currency: string = 'USD'): string {
  if (typeof cents !== 'number' || isNaN(cents)) {
    throw new Error(`Invalid cents value: ${cents}`);
  }
  
  const major = cents / 100;
  return major.toLocaleString(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

/**
 * Validate that a value is a valid cents amount
 * @param cents - Value to validate
 * @returns true if valid cents amount
 */
export function isValidCents(cents: unknown): cents is number {
  return typeof cents === 'number' && 
         !isNaN(cents) && 
         Number.isInteger(cents) && 
         cents >= 0;
}

/**
 * Safely convert to cents with fallback
 * @param major - Amount in major units
 * @param fallback - Fallback value if conversion fails (default: 0)
 * @returns Amount in cents or fallback
 */
export function toCentsSafe(major: number | string, fallback: number = 0): number {
  try {
    return toCents(major);
  } catch {
    return fallback;
  }
}

/**
 * Safely convert to major units with fallback
 * @param cents - Amount in cents
 * @param fallback - Fallback string if conversion fails (default: "$0.00")
 * @param locale - Locale for formatting
 * @param currency - Currency code
 * @returns Formatted currency string or fallback
 */
export function toMajorSafe(cents: number, fallback: string = '$0.00', locale: string = 'en-US', currency: string = 'USD'): string {
  try {
    return toMajor(cents, locale, currency);
  } catch {
    return fallback;
  }
}
