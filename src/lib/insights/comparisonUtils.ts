// Utilities for comparing financial metrics across time periods

import { ParsedCSVData, BankTransaction } from '@/types'
import { calculateFinancialTotals } from '@/lib/financialCalculations'

export interface PeriodComparison {
  current: {
    value: number
    label: string
    period: { start: Date; end: Date }
  }
  previous: {
    value: number
    label: string
    period: { start: Date; end: Date }
  }
  change: {
    absolute: number
    percentage: number
    direction: 'up' | 'down' | 'flat'
    isImprovement?: boolean // Context-dependent (revenue up = good, expense up = bad)
  }
}

export interface MonthlyMetrics {
  month: string // YYYY-MM
  revenue: number
  expenses: number
  netIncome: number
  consultantExpenses: number
  creditCardPayments: number // Payments from checking to credit card (for trending only)
  transactionCount: number
}

/**
 * Get transactions within a date range
 */
export function getTransactionsInRange(
  transactions: BankTransaction[],
  startDate: Date,
  endDate: Date
): BankTransaction[] {
  return transactions.filter(t => {
    const txDate = new Date(t.date)
    return txDate >= startDate && txDate <= endDate
  })
}

/**
 * Calculate financial metrics for a specific date range
 */
export function calculateMetricsForPeriod(
  checkingData: ParsedCSVData,
  startDate: Date,
  endDate: Date
) {
  const filteredTransactions = getTransactionsInRange(
    checkingData.transactions,
    startDate,
    endDate
  )

  const filteredData: ParsedCSVData = {
    ...checkingData,
    transactions: filteredTransactions
  }

  return calculateFinancialTotals(filteredData)
}

/**
 * Compare two values and return percentage change
 */
export function calculatePercentageChange(
  current: number,
  previous: number
): number {
  if (previous === 0) return current > 0 ? 100 : 0
  return ((current - previous) / Math.abs(previous)) * 100
}

/**
 * Get the direction of change
 */
export function getChangeDirection(
  current: number,
  previous: number,
  threshold: number = 0.5 // 0.5% threshold for "flat"
): 'up' | 'down' | 'flat' {
  const percentChange = Math.abs(calculatePercentageChange(current, previous))

  if (percentChange < threshold) return 'flat'
  return current > previous ? 'up' : 'down'
}

/**
 * Compare current period to previous period
 */
export function comparePeriods(
  current: number,
  previous: number,
  currentLabel: string,
  previousLabel: string,
  currentPeriod: { start: Date; end: Date },
  previousPeriod: { start: Date; end: Date },
  isGoodWhenUp: boolean = true // Revenue/profit up = good, expenses up = bad
): PeriodComparison {
  const absoluteChange = current - previous
  const percentageChange = calculatePercentageChange(current, previous)
  const direction = getChangeDirection(current, previous)

  const isImprovement = direction === 'flat'
    ? true
    : direction === 'up'
      ? isGoodWhenUp
      : !isGoodWhenUp

  return {
    current: {
      value: current,
      label: currentLabel,
      period: currentPeriod
    },
    previous: {
      value: previous,
      label: previousLabel,
      period: previousPeriod
    },
    change: {
      absolute: absoluteChange,
      percentage: percentageChange,
      direction,
      isImprovement
    }
  }
}

/**
 * Get last N months from a date
 */
export function getLastNMonthsRange(
  endDate: Date,
  months: number
): { start: Date; end: Date } {
  const start = new Date(endDate)
  start.setMonth(start.getMonth() - months)
  start.setDate(1) // First day of the start month

  const end = new Date(endDate)

  return { start, end }
}

/**
 * Get previous month date range
 */
export function getPreviousMonthRange(
  referenceDate: Date = new Date()
): { start: Date; end: Date } {
  const start = new Date(referenceDate)
  start.setMonth(start.getMonth() - 1)
  start.setDate(1)

  const end = new Date(start)
  end.setMonth(end.getMonth() + 1)
  end.setDate(0) // Last day of previous month

  return { start, end }
}

/**
 * Get current month date range
 */
export function getCurrentMonthRange(
  referenceDate: Date = new Date()
): { start: Date; end: Date } {
  const start = new Date(referenceDate)
  start.setDate(1)

  const end = new Date(referenceDate)

  return { start, end }
}

/**
 * Get month-over-month comparison for any metric
 */
export function getMonthOverMonthComparison(
  checkingData: ParsedCSVData,
  metricExtractor: (data: ParsedCSVData) => number,
  isGoodWhenUp: boolean = true
): PeriodComparison {
  const now = new Date()

  const currentMonth = getCurrentMonthRange(now)
  const previousMonth = getPreviousMonthRange(now)

  const currentData: ParsedCSVData = {
    ...checkingData,
    transactions: getTransactionsInRange(
      checkingData.transactions,
      currentMonth.start,
      currentMonth.end
    )
  }

  const previousData: ParsedCSVData = {
    ...checkingData,
    transactions: getTransactionsInRange(
      checkingData.transactions,
      previousMonth.start,
      previousMonth.end
    )
  }

  const currentValue = metricExtractor(currentData)
  const previousValue = metricExtractor(previousData)

  const currentLabel = currentMonth.start.toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric'
  })
  const previousLabel = previousMonth.start.toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric'
  })

  return comparePeriods(
    currentValue,
    previousValue,
    currentLabel,
    previousLabel,
    currentMonth,
    previousMonth,
    isGoodWhenUp
  )
}

/**
 * Get all monthly metrics for trending
 */
export function getMonthlyMetricsBreakdown(
  checkingData: ParsedCSVData
): MonthlyMetrics[] {
  const monthlyData: { [key: string]: MonthlyMetrics } = {}

  checkingData.transactions.forEach(tx => {
    const txDate = new Date(tx.date)
    const monthKey = `${txDate.getFullYear()}-${String(txDate.getMonth() + 1).padStart(2, '0')}`

    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = {
        month: monthKey,
        revenue: 0,
        expenses: 0,
        netIncome: 0,
        consultantExpenses: 0,
        creditCardPayments: 0,
        transactionCount: 0
      }
    }

    const metrics = monthlyData[monthKey]
    metrics.transactionCount++

    const category = tx.category || ''

    // Revenue
    if (category.includes('Client Payment')) {
      metrics.revenue += tx.amount
    }

    // Consultant expenses
    if (category.includes('Consultant')) {
      metrics.consultantExpenses += Math.abs(tx.amount)
      metrics.expenses += Math.abs(tx.amount)
    }

    // Credit card payments (for reconciliation tracking, not actual business expense)
    // Note: Actual credit card expenses are in the subledger and included via calculateFinancialTotals
    if (category.includes('Credit Card')) {
      metrics.creditCardPayments += Math.abs(tx.amount)
      // DO NOT add to expenses here - this is handled by subledger
    }

    // Other business expenses
    if (category.includes('Auto Loan') || category.includes('Bank Fee')) {
      metrics.expenses += Math.abs(tx.amount)
    }
  })

  // Calculate net income for each month
  Object.values(monthlyData).forEach(metrics => {
    metrics.netIncome = metrics.revenue - metrics.expenses
  })

  // Sort by month
  return Object.values(monthlyData).sort((a, b) =>
    a.month.localeCompare(b.month)
  )
}

/**
 * Generate sparkline data points (simplified trend)
 */
export function generateSparklineData(
  values: number[],
  maxPoints: number = 12
): number[] {
  if (values.length <= maxPoints) return values

  // Sample evenly from the array
  const step = values.length / maxPoints
  const sampled: number[] = []

  for (let i = 0; i < maxPoints; i++) {
    const index = Math.floor(i * step)
    sampled.push(values[index])
  }

  return sampled
}

/**
 * Format comparison text
 */
export function formatComparisonText(comparison: PeriodComparison): string {
  const { change } = comparison
  const sign = change.direction === 'up' ? '+' : change.direction === 'down' ? '-' : '±'
  const emoji = change.isImprovement
    ? (change.direction === 'up' ? '📈' : change.direction === 'down' ? '📉' : '➡️')
    : (change.direction === 'up' ? '⚠️' : change.direction === 'down' ? '✅' : '➡️')

  return `${emoji} ${sign}${Math.abs(change.percentage).toFixed(1)}% vs ${comparison.previous.label}`
}
