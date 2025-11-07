import { ParsedCSVData } from '@/types'
import { CreditCardData } from '@/lib/creditCardParser'
import { calculateFinancialTotals } from '@/lib/financialCalculations'

export interface DataAuditResult {
  summary: {
    checkingTotalTransactions: number
    creditCardTotalTransactions: number
    dateRangeMismatch: boolean
    calculationDiscrepancies: DiscrepancyDetail[]
  }
  checkingAccount: {
    dateRange: { start: string, end: string }
    creditCardPayments: {
      totalAmount: number
      transactionCount: number
      transactions: Array<{
        date: string
        amount: number
        description: string
        category: string
      }>
    }
    otherExpenses: {
      totalAmount: number
      transactionCount: number
    }
  }
  creditCard: {
    dateRange: { start: string, end: string }
    charges: {
      totalAmount: number
      transactionCount: number
      byMonth: Record<string, number>
    }
    payments: {
      totalAmount: number
      transactionCount: number
    }
  }
  reconciliation: {
    timingAnalysis: TimingAnalysis
    periodMismatch: PeriodMismatch[]
    unpaidCharges: UnpaidChargeAnalysis
  }
  auditTrail: AuditTrailEntry[]
}

export interface DiscrepancyDetail {
  source: string
  description: string
  expectedValue: number
  actualValue: number
  variance: number
  severity: 'critical' | 'warning' | 'info'
}

export interface TimingAnalysis {
  lastPaymentDate: string
  chargesAfterLastPayment: {
    amount: number
    count: number
    transactions: Array<{
      date: string
      amount: number
      description: string
    }>
  }
  averagePaymentCycle: number // days
}

export interface PeriodMismatch {
  month: string
  checkingPayments: number
  creditCardCharges: number
  variance: number
}

export interface UnpaidChargeAnalysis {
  totalUnpaidAmount: number
  oldestUnpaidDate: string
  newestUnpaidDate: string
  transactionCount: number
}

export interface AuditTrailEntry {
  timestamp: string
  calculation: string
  source: string
  value: number
  formula: string
  dataPoints: number
}

export function auditDataSources(
  checkingData: ParsedCSVData,
  creditCardData: CreditCardData
): DataAuditResult {
  console.log('🔍 Starting comprehensive data audit...')

  const auditTrail: AuditTrailEntry[] = []
  const timestamp = new Date().toISOString()

  // Audit checking account data
  const financials = calculateFinancialTotals(checkingData)

  auditTrail.push({
    timestamp,
    calculation: 'Checking Credit Card Payments',
    source: 'calculateFinancialTotals()',
    value: financials.creditCardPayments,
    formula: 'Sum of Credit Card Autopay transactions',
    dataPoints: checkingData.transactions.filter(t =>
      t.category?.includes('Credit Card Autopay')).length
  })

  // Extract checking account credit card payments
  const checkingCCPayments = checkingData.transactions
    .filter(t => t.category?.includes('Credit Card Autopay') && t.amount < 0)
    .map(t => ({
      date: t.date,
      amount: Math.abs(t.amount),
      description: t.description,
      category: t.category || 'Unknown'
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const checkingCCTotal = checkingCCPayments.reduce((sum, p) => sum + p.amount, 0)

  auditTrail.push({
    timestamp,
    calculation: 'Checking CC Payments (Manual Sum)',
    source: 'Direct transaction filter',
    value: checkingCCTotal,
    formula: 'Manual sum of filtered Credit Card Autopay transactions',
    dataPoints: checkingCCPayments.length
  })

  // Audit credit card data
  const creditCardCharges = creditCardData.transactions.filter(t => t.type === 'debit')
  const creditCardPayments = creditCardData.transactions.filter(t => t.type === 'credit')

  const ccChargesTotal = creditCardCharges.reduce((sum, t) => sum + t.amount, 0)
  const ccPaymentsTotal = creditCardPayments.reduce((sum, t) => sum + t.amount, 0)

  auditTrail.push({
    timestamp,
    calculation: 'Credit Card Charges (Debits)',
    source: 'Credit Card CSV - debit transactions',
    value: ccChargesTotal,
    formula: 'Sum of all debit/charge transactions',
    dataPoints: creditCardCharges.length
  })

  auditTrail.push({
    timestamp,
    calculation: 'Credit Card Summary Total Debits',
    source: 'creditCardData.summary.totalDebits',
    value: creditCardData.summary.totalDebits,
    formula: 'Parser calculated total debits',
    dataPoints: creditCardData.summary.transactionCount
  })

  // Identify the $11,212.83 discrepancy source
  const heroKPIValue = ccChargesTotal // This is what's shown in the hero section
  const reconciliationValue = creditCardData.summary.totalDebits // This is what's shown in reconciliation

  const discrepancies: DiscrepancyDetail[] = []

  if (Math.abs(heroKPIValue - reconciliationValue) > 0.01) {
    discrepancies.push({
      source: 'Credit Card KPI vs Reconciliation',
      description: 'Hero KPI total differs from reconciliation total',
      expectedValue: reconciliationValue,
      actualValue: heroKPIValue,
      variance: heroKPIValue - reconciliationValue,
      severity: 'critical'
    })
  }

  // Timing analysis - find charges after last payment
  const lastPaymentDate = checkingCCPayments.length > 0
    ? new Date(checkingCCPayments[checkingCCPayments.length - 1].date)
    : new Date('1970-01-01')

  const chargesAfterLastPayment = creditCardCharges.filter(charge =>
    charge.date > lastPaymentDate
  )

  const unpaidAmount = chargesAfterLastPayment.reduce((sum, t) => sum + t.amount, 0)

  // Monthly breakdown for period mismatch analysis
  const monthlyPayments: Record<string, number> = {}
  const monthlyCharges: Record<string, number> = {}

  checkingCCPayments.forEach(payment => {
    const month = payment.date.slice(0, 7) // YYYY-MM
    monthlyPayments[month] = (monthlyPayments[month] || 0) + payment.amount
  })

  creditCardCharges.forEach(charge => {
    const month = charge.date.toISOString().slice(0, 7) // YYYY-MM
    monthlyCharges[month] = (monthlyCharges[month] || 0) + charge.amount
  })

  const periodMismatches: PeriodMismatch[] = []
  const allMonths = new Set([...Object.keys(monthlyPayments), ...Object.keys(monthlyCharges)])

  allMonths.forEach(month => {
    const payments = monthlyPayments[month] || 0
    const charges = monthlyCharges[month] || 0
    const variance = payments - charges

    if (Math.abs(variance) > 100) { // Only flag significant variances
      periodMismatches.push({
        month,
        checkingPayments: payments,
        creditCardCharges: charges,
        variance
      })
    }
  })

  // Calculate average payment cycle
  let totalDaysBetweenPayments = 0
  let paymentGaps = 0

  for (let i = 1; i < checkingCCPayments.length; i++) {
    const prevDate = new Date(checkingCCPayments[i - 1].date)
    const currentDate = new Date(checkingCCPayments[i].date)
    const daysDiff = (currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
    totalDaysBetweenPayments += daysDiff
    paymentGaps++
  }

  const averagePaymentCycle = paymentGaps > 0 ? totalDaysBetweenPayments / paymentGaps : 30

  console.log('📊 Audit Results Summary:', {
    checkingCCTotal: checkingCCTotal.toFixed(2),
    creditCardChargesTotal: ccChargesTotal.toFixed(2),
    reconciliationTotal: reconciliationValue.toFixed(2),
    heroKPITotal: heroKPIValue.toFixed(2),
    unpaidAmount: unpaidAmount.toFixed(2),
    lastPaymentDate: lastPaymentDate.toISOString().split('T')[0],
    chargesAfterPayment: chargesAfterLastPayment.length,
    discrepancies: discrepancies.length
  })

  return {
    summary: {
      checkingTotalTransactions: checkingData.transactions.length,
      creditCardTotalTransactions: creditCardData.transactions.length,
      dateRangeMismatch: checkingData.summary.dateRange.start !== creditCardData.summary.dateRange.start ||
                        checkingData.summary.dateRange.end !== creditCardData.summary.dateRange.end,
      calculationDiscrepancies: discrepancies
    },
    checkingAccount: {
      dateRange: checkingData.summary.dateRange,
      creditCardPayments: {
        totalAmount: checkingCCTotal,
        transactionCount: checkingCCPayments.length,
        transactions: checkingCCPayments
      },
      otherExpenses: {
        totalAmount: financials.totalBusinessExpenses - financials.creditCardTotalExpenses,
        transactionCount: checkingData.transactions.filter(t =>
          t.amount < 0 && !t.category?.includes('Credit Card Autopay')).length
      }
    },
    creditCard: {
      dateRange: creditCardData.summary.dateRange,
      charges: {
        totalAmount: ccChargesTotal,
        transactionCount: creditCardCharges.length,
        byMonth: monthlyCharges
      },
      payments: {
        totalAmount: ccPaymentsTotal,
        transactionCount: creditCardPayments.length
      }
    },
    reconciliation: {
      timingAnalysis: {
        lastPaymentDate: lastPaymentDate.toISOString().split('T')[0],
        chargesAfterLastPayment: {
          amount: unpaidAmount,
          count: chargesAfterLastPayment.length,
          transactions: chargesAfterLastPayment.slice(0, 10).map(t => ({
            date: t.date.toISOString().split('T')[0],
            amount: t.amount,
            description: t.description
          }))
        },
        averagePaymentCycle: Math.round(averagePaymentCycle)
      },
      periodMismatch: periodMismatches,
      unpaidCharges: {
        totalUnpaidAmount: unpaidAmount,
        oldestUnpaidDate: chargesAfterLastPayment.length > 0
          ? chargesAfterLastPayment[0].date.toISOString().split('T')[0]
          : '',
        newestUnpaidDate: chargesAfterLastPayment.length > 0
          ? chargesAfterLastPayment[chargesAfterLastPayment.length - 1].date.toISOString().split('T')[0]
          : '',
        transactionCount: chargesAfterLastPayment.length
      }
    },
    auditTrail
  }
}

// Helper function to format audit results for executive reporting
export function formatAuditSummary(audit: DataAuditResult): string {
  const { summary, reconciliation } = audit

  let report = `🔍 DATA AUDIT SUMMARY\n\n`

  if (summary.calculationDiscrepancies.length > 0) {
    report += `⚠️ CRITICAL DISCREPANCIES FOUND:\n`
    summary.calculationDiscrepancies.forEach((disc, i) => {
      report += `${i + 1}. ${disc.description}\n`
      report += `   Expected: $${disc.expectedValue.toLocaleString()}\n`
      report += `   Actual: $${disc.actualValue.toLocaleString()}\n`
      report += `   Variance: $${Math.abs(disc.variance).toLocaleString()}\n\n`
    })
  }

  report += `📈 TIMING ANALYSIS:\n`
  report += `Last Payment: ${reconciliation.timingAnalysis.lastPaymentDate}\n`
  report += `Unpaid Charges: $${reconciliation.unpaidCharges.totalUnpaidAmount.toLocaleString()}\n`
  report += `Payment Cycle: ${reconciliation.timingAnalysis.averagePaymentCycle} days\n\n`

  if (reconciliation.periodMismatch.length > 0) {
    report += `📅 PERIOD MISMATCHES:\n`
    reconciliation.periodMismatch.forEach(mismatch => {
      report += `${mismatch.month}: $${Math.abs(mismatch.variance).toLocaleString()} variance\n`
    })
  }

  return report
}