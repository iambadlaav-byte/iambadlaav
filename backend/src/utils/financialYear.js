/**
 * financialYear.js — Indian Financial Year helper.
 * Indian FY runs 1 April – 31 March.
 * 2026-04-01 → "2026-27"  |  2026-03-31 → "2025-26"
 * Pure function — no Prisma, no side effects.
 */

/**
 * Returns the Indian financial year string for the given date.
 * @param {Date} [date=new Date()]
 * @returns {string} e.g. "2026-27"
 */
export function getFinancialYear(date = new Date()) {
  const y = date.getFullYear();
  // getMonth() is 0-indexed; April = 3
  const m = date.getMonth();
  if (m >= 3) {
    // April–December: FY starts this year
    return `${y}-${String(y + 1).slice(-2)}`;
  }
  // January–March: FY started last year
  return `${y - 1}-${String(y).slice(-2)}`;
}
