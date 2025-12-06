// Data access functions for Fortrea financial data
// These functions provide a clean interface to access Fortrea financial data
// and can be easily swapped out to fetch from an API or database in the future.

import {
  fortreaQuarters,
  fortreaAnnual,
  fortreaMockLegacy
} from '@/data/fortrea/financials'
import type {
  IncomeStatementRow,
  BalanceSheetRow,
  CashFlowRow,
  FortreaQuarterRow,
  FortreaAnnualRow
} from '@/types/fortrea'

// Real Fortrea data access functions

/**
 * Get Fortrea quarterly data
 * @returns Array of quarterly rows, ordered by time
 */
export function getFortreaQuarters(): FortreaQuarterRow[] {
  return [...fortreaQuarters].sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year
    return a.quarter - b.quarter
  })
}

/**
 * Get Fortrea annual data
 * @returns Array of annual rows, ordered by year
 */
export function getFortreaAnnual(): FortreaAnnualRow[] {
  return [...fortreaAnnual].sort((a, b) => a.year - b.year)
}

/**
 * Get the latest quarter
 */
export function getLatestQuarter(): FortreaQuarterRow | null {
  const quarters = getFortreaQuarters()
  return quarters[quarters.length - 1] || null
}

/**
 * Get the latest annual data
 */
export function getLatestAnnual(): FortreaAnnualRow | null {
  const annual = getFortreaAnnual()
  return annual[annual.length - 1] || null
}

/**
 * Get last N quarters (default: 4)
 */
export function getLastNQuarters(n: number = 4): FortreaQuarterRow[] {
  const quarters = getFortreaQuarters()
  return quarters.slice(-n)
}

// Legacy functions (kept for backward compatibility)

/**
 * Get Fortrea income statement data (legacy - uses annual data)
 * @returns Array of income statement rows by year
 */
export function getFortreaIncomeStatement(): IncomeStatementRow[] {
  // Convert annual data to legacy format
  return fortreaAnnual.map(row => ({
    year: row.year,
    revenue: row.revenue,
    operatingIncome: row.adjEbitda, // Using adjusted EBITDA as proxy
    netIncome: row.gaapNetIncome,
    eps: 0 // Not available in annual data
  }))
}

/**
 * Get Fortrea balance sheet data (legacy - placeholder)
 * @returns Array of balance sheet rows by year
 */
export function getFortreaBalanceSheet(): BalanceSheetRow[] {
  return fortreaMockLegacy.balanceSheet
}

/**
 * Get Fortrea cash flow statement data (legacy - placeholder)
 * @returns Array of cash flow rows by year
 */
export function getFortreaCashFlow(): CashFlowRow[] {
  return fortreaMockLegacy.cashFlow
}

/**
 * Get the latest year's data for quick access
 */
export function getLatestYear(): number {
  const annual = getFortreaAnnual()
  return annual[annual.length - 1]?.year || 2024
}

/**
 * Get the latest income statement row (legacy)
 */
export function getLatestIncomeStatement(): IncomeStatementRow | null {
  const data = getFortreaIncomeStatement()
  return data[data.length - 1] || null
}

/**
 * Get the latest balance sheet row (legacy)
 */
export function getLatestBalanceSheet(): BalanceSheetRow | null {
  const data = getFortreaBalanceSheet()
  return data[data.length - 1] || null
}

/**
 * Get the latest cash flow row (legacy)
 */
export function getLatestCashFlow(): CashFlowRow | null {
  const data = getFortreaCashFlow()
  return data[data.length - 1] || null
}

