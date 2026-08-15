/**
 * Format a number to a human-readable format.
 * Examples: 1234 → "1.2k", 1000000 → "1m", 500 → "500"
 * Edge cases: 0 → "0", negative → "0"
 */
export function formatNumber(num: number): string {
  // Handle edge cases: 0 or negative
  if (num <= 0) return "0";

  if (num < 1000) return num.toString();
  if (num < 1000000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  }
  return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "m";
}

