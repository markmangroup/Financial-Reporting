import { ParsedCSVData, BankTransaction } from '@/types'
import { CreditCardData, CreditCardTransaction } from '@/lib/creditCardParser'
import { calculateFinancialTotals } from '@/lib/financialCalculations'

export interface ReconciliationResult {
  isReconciled: boolean
  summary: {
    checkingPaymentTotal: number
    creditCardPaymentTotal: number
    creditCardChargeTotal: number
    paymentVariance: number
    paymentPercentVariance: number
    outstandingBalance: number
  }
  details: {
    matchedPayments: PaymentMatch[]
    unmatchedCreditCardCharges: CreditCardTransaction[]
    unmatchedCheckingPayments: BankTransaction[]
  }
  validation: {
    totalVarianceWithinTolerance: boolean
    allPaymentsMatched: boolean
    timingVariancesAcceptable: boolean
  }
  periodCutoff: {
    lastPaymentDate: string
    cutoffDate: string
    cutoffDays: number
    excludedCharges: {
      totalAmount: number
      transactionCount: number
      transactions: Array<{
        date: string
        amount: number
        description: string
        category: string
      }>
    }
  }
}

export interface PaymentMatch {
  checkingPayment: BankTransaction
  creditCardCharges: CreditCardTransaction[]
  periodStart: Date
  periodEnd: Date
  variance: number
  confidence: 'high' | 'medium' | 'low'
}

export function reconcileCreditCardSubledger(
  checkingData: ParsedCSVData,
  creditCardData: CreditCardData,
  tolerance: number = 0.01,
  cutoffDays: number = 30
): ReconciliationResult {
  const financials = calculateFinancialTotals(checkingData)

  // Get all credit card payments from checking account
  const creditCardPayments = checkingData.transactions
    .filter(t => t.category?.includes('Credit Card Autopay') && t.amount < 0)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  // Determine the period cut-off date based on the last payment
  const lastPaymentDate = creditCardPayments.length > 0
    ? new Date(creditCardPayments[creditCardPayments.length - 1].date)
    : new Date('1970-01-01')

  const cutoffDate = new Date(lastPaymentDate)
  cutoffDate.setDate(cutoffDate.getDate() + cutoffDays)

  // Get all credit card charges (debits/expenses) - split by cut-off period
  const allCreditCardCharges = creditCardData.transactions
    .filter(t => t.type === 'debit')
    .sort((a, b) => a.date.getTime() - b.date.getTime())

  const creditCardCharges = allCreditCardCharges
    .filter(t => t.date <= cutoffDate)

  const excludedCharges = allCreditCardCharges
    .filter(t => t.date > cutoffDate)

  // Calculate totals - CORRECTED LOGIC WITH PERIOD CUT-OFF
  const checkingPaymentTotal = Math.abs(financials.creditCardPayments) // Payments from checking to credit card
  const creditCardPaymentTotal = creditCardData.summary.totalCredits   // Should match checking payments
  const creditCardChargeTotal = creditCardCharges.reduce((sum, t) => sum + t.amount, 0) // Only charges within cut-off
  const excludedChargeTotal = excludedCharges.reduce((sum, t) => sum + t.amount, 0) // Charges after cut-off

  // Reconcile payments: checking outflow vs credit card payments received
  const paymentVariance = checkingPaymentTotal - creditCardPaymentTotal
  const paymentPercentVariance = Math.abs(paymentVariance) / Math.max(checkingPaymentTotal, creditCardPaymentTotal) * 100

  // Outstanding balance: charges minus payments
  const outstandingBalance = creditCardChargeTotal - creditCardPaymentTotal

  console.log('Reconciliation Analysis:', {
    lastPaymentDate: lastPaymentDate.toISOString().split('T')[0],
    cutoffDate: cutoffDate.toISOString().split('T')[0],
    checkingPaymentTotal: checkingPaymentTotal.toFixed(2),
    creditCardPaymentTotal: creditCardPaymentTotal.toFixed(2),
    creditCardChargeTotal: creditCardChargeTotal.toFixed(2),
    excludedChargeTotal: excludedChargeTotal.toFixed(2),
    paymentVariance: paymentVariance.toFixed(2),
    paymentPercentVariance: paymentPercentVariance.toFixed(2) + '%',
    creditCardPayments: creditCardPayments.length,
    creditCardCharges: creditCardCharges.length,
    excludedCharges: excludedCharges.length
  })

  // Match payments to charge periods
  const matchedPayments = matchPaymentsToPeriods(creditCardPayments, creditCardCharges)

  // Find unmatched items
  const matchedPaymentIds = new Set(matchedPayments.map(m => m.checkingPayment.id || `${m.checkingPayment.date}-${m.checkingPayment.amount}`))
  const matchedChargeIds = new Set(matchedPayments.flatMap(m =>
    m.creditCardCharges.map(c => `${c.date.toISOString()}-${c.amount}`)
  ))

  const unmatchedCheckingPayments = creditCardPayments.filter(p =>
    !matchedPaymentIds.has(p.id || `${p.date}-${p.amount}`)
  )

  const unmatchedCreditCardCharges = creditCardCharges.filter(c =>
    !matchedChargeIds.has(`${c.date.toISOString()}-${c.amount}`)
  )

  // Validation checks
  const totalVarianceWithinTolerance = Math.abs(paymentPercentVariance) <= (tolerance * 100)
  const allPaymentsMatched = unmatchedCheckingPayments.length === 0
  const timingVariancesAcceptable = matchedPayments.every(m => Math.abs(m.variance) <= 50) // $50 tolerance

  return {
    isReconciled: Math.abs(paymentPercentVariance) <= (tolerance * 100) && allPaymentsMatched,
    summary: {
      checkingPaymentTotal,
      creditCardPaymentTotal,
      creditCardChargeTotal,
      paymentVariance,
      paymentPercentVariance,
      outstandingBalance
    },
    details: {
      matchedPayments,
      unmatchedCreditCardCharges,
      unmatchedCheckingPayments
    },
    validation: {
      totalVarianceWithinTolerance,
      allPaymentsMatched,
      timingVariancesAcceptable
    },
    periodCutoff: {
      lastPaymentDate: lastPaymentDate.toISOString().split('T')[0],
      cutoffDate: cutoffDate.toISOString().split('T')[0],
      cutoffDays,
      excludedCharges: {
        totalAmount: excludedChargeTotal,
        transactionCount: excludedCharges.length,
        transactions: excludedCharges.slice(0, 20).map(t => ({ // Show first 20 excluded charges
          date: t.date.toISOString().split('T')[0],
          amount: t.amount,
          description: t.description,
          category: t.category
        }))
      }
    }
  }
}

function matchPaymentsToPeriods(
  payments: BankTransaction[],
  charges: CreditCardTransaction[]
): PaymentMatch[] {
  const matches: PaymentMatch[] = []

  payments.forEach(payment => {
    const paymentDate = new Date(payment.date)
    const paymentAmount = Math.abs(payment.amount)

    // Look for charges in the 30 days before the payment
    const periodStart = new Date(paymentDate)
    periodStart.setDate(periodStart.getDate() - 35) // 35 days lookback

    const periodEnd = new Date(paymentDate)
    periodEnd.setDate(periodEnd.getDate() + 5) // 5 days forward for processing

    const periodCharges = charges.filter(charge =>
      charge.date >= periodStart && charge.date <= periodEnd
    )

    const totalCharges = periodCharges.reduce((sum, charge) => sum + charge.amount, 0)
    const variance = paymentAmount - totalCharges
    const percentVar = Math.abs(variance) / Math.max(paymentAmount, totalCharges) * 100

    // Determine confidence level
    let confidence: 'high' | 'medium' | 'low' = 'low'
    if (percentVar <= 1) confidence = 'high'      // Within 1%
    else if (percentVar <= 5) confidence = 'medium' // Within 5%

    matches.push({
      checkingPayment: payment,
      creditCardCharges: periodCharges,
      periodStart,
      periodEnd,
      variance,
      confidence
    })
  })

  return matches.sort((a, b) => new Date(a.checkingPayment.date).getTime() - new Date(b.checkingPayment.date).getTime())
}

// Helper function to format reconciliation results for display
export function formatReconciliationSummary(result: ReconciliationResult): string {
  const { summary, validation, periodCutoff } = result

  if (result.isReconciled) {
    return `✅ RECONCILED: Credit card payments match checking payments within tolerance (${summary.paymentPercentVariance.toFixed(2)}% variance)`
  }

  const issues = []
  if (Math.abs(summary.paymentPercentVariance) > 1) {
    issues.push(`Payment variance of ${summary.paymentPercentVariance.toFixed(1)}% exceeds tolerance`)
  }
  if (result.details.unmatchedCheckingPayments.length > 0) {
    issues.push(`${result.details.unmatchedCheckingPayments.length} unmatched payments`)
  }
  if (validation && !validation.timingVariancesAcceptable) {
    issues.push('Timing variances exceed acceptable limits')
  }

  let summary_text = ''
  if (issues.length === 0) {
    summary_text = `ℹ️ RECONCILIATION NOTE: $${Math.abs(summary.paymentVariance).toLocaleString()} variance in payment matching`
  } else {
    summary_text = `⚠️ RECONCILIATION ISSUES: ${issues.join(', ')}`
  }

  // Add period cutoff information
  if (periodCutoff.excludedCharges.transactionCount > 0) {
    summary_text += `\n📅 PERIOD CUTOFF: ${periodCutoff.excludedCharges.transactionCount} charges ($${periodCutoff.excludedCharges.totalAmount.toLocaleString()}) excluded after ${periodCutoff.cutoffDate}`
  }

  return summary_text
}

// Get detailed variance analysis for executive reporting
export function getVarianceAnalysis(result: ReconciliationResult) {
  const { matchedPayments } = result.details

  const variances = matchedPayments.map(match => ({
    paymentDate: match.checkingPayment.date,
    paymentAmount: Math.abs(match.checkingPayment.amount),
    chargeTotal: match.creditCardCharges.reduce((sum, c) => sum + c.amount, 0),
    variance: match.variance,
    confidence: match.confidence,
    daysInPeriod: Math.ceil((match.periodEnd.getTime() - match.periodStart.getTime()) / (1000 * 60 * 60 * 24))
  }))

  const totalVariance = variances.reduce((sum, v) => sum + Math.abs(v.variance), 0)
  const avgVariance = totalVariance / variances.length || 0
  const maxVariance = Math.max(...variances.map(v => Math.abs(v.variance)))

  return {
    variances,
    statistics: {
      totalVariance,
      avgVariance,
      maxVariance,
      highConfidenceMatches: variances.filter(v => v.confidence === 'high').length,
      mediumConfidenceMatches: variances.filter(v => v.confidence === 'medium').length,
      lowConfidenceMatches: variances.filter(v => v.confidence === 'low').length
    }
  }
}