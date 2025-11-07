/**
 * Consistent rounding utility for all financial calculations
 * Ensures exact balance sheet reconciliation by using consistent rounding
 * throughout all monetary calculations
 */

/**
 * Rounds a number to exactly 2 decimal places using proper financial rounding
 * This prevents floating-point precision errors that cause balance sheet imbalances
 */
export function roundToCents(amount: number): number {
  return Math.round(amount * 100) / 100
}

/**
 * Rounds an array of amounts and returns the sum
 * This ensures consistent rounding in summation operations
 */
export function roundAndSum(amounts: number[]): number {
  return roundToCents(amounts.reduce((sum, amount) => sum + roundToCents(amount), 0))
}

/**
 * Rounds a calculation result to ensure consistency
 * Use this for all intermediate financial calculations
 */
export function roundCalculation(amount: number): number {
  return roundToCents(amount)
}

/**
 * Validates that two monetary amounts are equal within acceptable precision
 * Used for balance sheet reconciliation checks
 */
export function amountsEqual(amount1: number, amount2: number, tolerance: number = 0.01): boolean {
  return Math.abs(roundToCents(amount1) - roundToCents(amount2)) <= tolerance
}
