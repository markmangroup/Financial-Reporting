import { ParsedCSVData, BankTransaction } from '@/types'
import { CreditCardData, CreditCardTransaction } from '@/lib/creditCardParser'

export interface StatementPeriod {
  periodId: string // e.g., "2024-05" for May 2024 statement
  startDate: Date
  endDate: Date
  paymentDate: Date | null
  paymentAmount: number
  charges: CreditCardTransaction[]
  chargesTotal: number
  variance: number
  percentVariance: number
  isReconciled: boolean
  notes: string[]
}

export interface SubledgerReconciliation {
  periods: StatementPeriod[]
  summary: {
    totalPayments: number
    totalCharges: number
    totalVariance: number
    reconciledPeriods: number
    unreconciledPeriods: number
  }
  oneOffPayments: {
    count: number
    totalAmount: number
    payments: Array<{
      date: string
      amount: number
      description: string
    }>
  }
  auditTrail: Array<{
    step: string
    description: string
    data: any
  }>
}

export function buildSubledgerReconciliation(
  checkingData: ParsedCSVData,
  creditCardData: CreditCardData
): SubledgerReconciliation {
  const auditTrail: Array<{ step: string; description: string; data: any }> = []

  // Step 1: Extract checking account credit card payments (MASTER)
  // FILTER OUT ONE-OFF PAYMENTS: Only include regular billing cycle payments
  const allCreditCardPayments = creditCardData.transactions
    .filter(t => t.type === 'credit')
    .sort((a, b) => (a.postDate?.getTime() || 0) - (b.postDate?.getTime() || 0))

  // Separate regular vs one-off payments based on description patterns
  const regularCreditCardPayments = allCreditCardPayments.filter(t =>
    t.description.includes('AUTOMATIC PAYMENT') ||
    t.description.includes('ATT*BILL PAYMENT')
  )

  const oneOffPayments = allCreditCardPayments.filter(t =>
    t.description.includes('Payment Thank You') ||
    (!t.description.includes('AUTOMATIC PAYMENT') && !t.description.includes('ATT*BILL PAYMENT'))
  )

  // Extract corresponding checking account payments for regular payments only
  const creditCardPayments = checkingData.transactions
    .filter(t => t.description.includes('CHASE CREDIT CRD') && t.amount < 0)
    .map(t => ({
      date: new Date(t.date),
      amount: Math.abs(t.amount),
      description: t.description,
      originalTransaction: t
    }))
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .filter(payment => {
      // Only include payments that match regular payment amounts (not one-off amounts)
      const matchingOneOff = oneOffPayments.find(oneOff =>
        Math.abs(oneOff.amount - payment.amount) < 0.01 &&
        Math.abs(oneOff.postDate?.getTime() || 0 - new Date(payment.date).getTime()) < 7 * 24 * 60 * 60 * 1000 // Within 7 days
      )
      return !matchingOneOff
    })

  auditTrail.push({
    step: 'extract_payments',
    description: 'Extracted regular credit card payments (excluding one-offs) from checking account',
    data: {
      allCreditCardPayments: allCreditCardPayments.length,
      regularPayments: regularCreditCardPayments.length,
      oneOffPayments: oneOffPayments.length,
      regularPaymentAmount: regularCreditCardPayments.reduce((sum, p) => sum + p.amount, 0),
      oneOffPaymentAmount: oneOffPayments.reduce((sum, p) => sum + p.amount, 0),
      checkingPaymentCount: creditCardPayments.length,
      checkingTotalAmount: creditCardPayments.reduce((sum, p) => sum + p.amount, 0),
      dateRange: {
        first: creditCardPayments[0]?.date.toISOString().split('T')[0],
        last: creditCardPayments[creditCardPayments.length - 1]?.date.toISOString().split('T')[0]
      },
      oneOffDetails: oneOffPayments.map(p => ({
        date: p.postDate?.toISOString() || new Date().toISOString().split('T')[0],
        amount: p.amount,
        description: p.description
      }))
    }
  })

  // Step 2: Extract credit card charges (SUBLEDGER)
  const creditCardCharges = creditCardData.transactions
    .filter(t => t.type === 'debit')
    .sort((a, b) => a.date.getTime() - b.date.getTime())

  auditTrail.push({
    step: 'extract_charges',
    description: 'Extracted credit card charges',
    data: {
      chargeCount: creditCardCharges.length,
      totalAmount: creditCardCharges.reduce((sum, c) => sum + c.amount, 0),
      dateRange: {
        first: creditCardCharges[0]?.date.toISOString().split('T')[0],
        last: creditCardCharges[creditCardCharges.length - 1]?.date.toISOString().split('T')[0]
      }
    }
  })

  // Step 3: Map payments to statement periods
  const periods: StatementPeriod[] = []

  creditCardPayments.forEach((payment, index) => {
    // CORRECTED LOGIC: Based on actual CSV analysis
    // Billing cycle: 26th to 25th of next month
    // July payment (Aug 19) covers charges from June 26 - July 25
    const paymentDate = payment.date

    // Calculate statement period that this payment covers
    // Payment in month N covers billing cycle ending in month N-1
    let statementEndYear = paymentDate.getMonth() === 0
      ? paymentDate.getFullYear() - 1
      : paymentDate.getFullYear()
    let statementEndMonth = paymentDate.getMonth() === 0
      ? 11
      : paymentDate.getMonth() - 1

    // Statement period: 26th of previous month to 25th of statement month
    let statementStartYear = statementEndMonth === 0 ? statementEndYear - 1 : statementEndYear
    let statementStartMonth = statementEndMonth === 0 ? 11 : statementEndMonth - 1

    const periodStart = new Date(statementStartYear, statementStartMonth, 26)
    const periodEnd = new Date(statementEndYear, statementEndMonth, 25, 23, 59, 59) // End of 25th

    // Find charges in this period
    const periodCharges = creditCardCharges.filter(charge =>
      charge.date >= periodStart && charge.date <= periodEnd
    )

    const chargesTotal = periodCharges.reduce((sum, charge) => sum + charge.amount, 0)
    const variance = payment.amount - chargesTotal
    const percentVariance = chargesTotal > 0
      ? Math.abs(variance) / chargesTotal * 100
      : (payment.amount > 0 ? 100 : 0)

    const periodId = `${statementEndYear}-${String(statementEndMonth + 1).padStart(2, '0')}`

    const notes: string[] = []
    if (percentVariance > 0.1) {
      notes.push(`Variance: ${percentVariance.toFixed(3)}%`)
    }
    if (periodCharges.length === 0) {
      notes.push('No charges found in period')
    }
    if (variance > 1000) {
      notes.push('Payment significantly exceeds charges')
    }
    if (variance < -1000) {
      notes.push('Charges significantly exceed payment')
    }

    const period: StatementPeriod = {
      periodId,
      startDate: periodStart,
      endDate: periodEnd,
      paymentDate: paymentDate,
      paymentAmount: payment.amount,
      charges: periodCharges,
      chargesTotal,
      variance,
      percentVariance,
      isReconciled: Math.abs(percentVariance) <= 0.1, // Zero tolerance since accounts are fully aligned
      notes
    }

    periods.push(period)

    auditTrail.push({
      step: 'map_period',
      description: `Mapped payment ${index + 1} to statement period`,
      data: {
        periodId,
        paymentDate: paymentDate.toISOString().split('T')[0],
        paymentAmount: payment.amount,
        periodStart: periodStart.toISOString().split('T')[0],
        periodEnd: periodEnd.toISOString().split('T')[0],
        chargesCount: periodCharges.length,
        chargesTotal,
        variance,
        percentVariance: percentVariance.toFixed(2) + '%'
      }
    })
  })

  // Step 4: Calculate summary
  const totalPayments = periods.reduce((sum, p) => sum + p.paymentAmount, 0)
  const totalCharges = periods.reduce((sum, p) => sum + p.chargesTotal, 0)
  const totalVariance = totalPayments - totalCharges
  const reconciledPeriods = periods.filter(p => p.isReconciled).length
  const unreconciledPeriods = periods.length - reconciledPeriods

  auditTrail.push({
    step: 'calculate_summary',
    description: 'Calculated overall reconciliation summary',
    data: {
      totalPeriods: periods.length,
      totalPayments,
      totalCharges,
      totalVariance,
      reconciledPeriods,
      unreconciledPeriods,
      overallReconciliationRate: `${(reconciledPeriods / periods.length * 100).toFixed(1)}%`
    }
  })

  return {
    periods,
    summary: {
      totalPayments,
      totalCharges,
      totalVariance,
      reconciledPeriods,
      unreconciledPeriods
    },
    oneOffPayments: {
      count: oneOffPayments.length,
      totalAmount: oneOffPayments.reduce((sum, p) => sum + p.amount, 0),
      payments: oneOffPayments.map(p => ({
        date: p.postDate?.toISOString() || new Date().toISOString().split('T')[0],
        amount: p.amount,
        description: p.description
      }))
    },
    auditTrail
  }
}

// Helper function to get detailed analysis for a specific period
export function analyzePeriod(period: StatementPeriod): string {
  let analysis = `📊 PERIOD ${period.periodId} ANALYSIS\n\n`

  analysis += `💳 PAYMENT (MASTER):\n`
  analysis += `  Date: ${period.paymentDate?.toISOString().split('T')[0] || 'N/A'}\n`
  analysis += `  Amount: $${period.paymentAmount.toLocaleString()}\n\n`

  analysis += `🧾 CHARGES (SUBLEDGER):\n`
  analysis += `  Period: ${period.startDate.toISOString().split('T')[0]} to ${period.endDate.toISOString().split('T')[0]}\n`
  analysis += `  Total: $${period.chargesTotal.toLocaleString()}\n`
  analysis += `  Count: ${period.charges.length} transactions\n\n`

  analysis += `🔍 RECONCILIATION:\n`
  analysis += `  Variance: $${Math.abs(period.variance).toLocaleString()} (${period.variance > 0 ? 'Payment > Charges' : 'Charges > Payment'})\n`
  analysis += `  Percent: ${period.percentVariance.toFixed(2)}%\n`
  analysis += `  Status: ${period.isReconciled ? '✅ RECONCILED' : '⚠️ VARIANCE'}\n\n`

  if (period.notes.length > 0) {
    analysis += `📝 NOTES:\n`
    period.notes.forEach(note => {
      analysis += `  • ${note}\n`
    })
    analysis += `\n`
  }

  if (period.charges.length > 0 && period.charges.length <= 10) {
    analysis += `💰 TOP CHARGES:\n`
    period.charges.forEach((charge, index) => {
      analysis += `  ${index + 1}. ${charge.date.toISOString().split('T')[0]} | $${charge.amount.toLocaleString()} | ${charge.description}\n`
    })
  } else if (period.charges.length > 10) {
    analysis += `💰 TOP 10 CHARGES:\n`
    period.charges.slice(0, 10).forEach((charge, index) => {
      analysis += `  ${index + 1}. ${charge.date.toISOString().split('T')[0]} | $${charge.amount.toLocaleString()} | ${charge.description}\n`
    })
    analysis += `  ... and ${period.charges.length - 10} more\n`
  }

  return analysis
}

// Helper function to format overall reconciliation summary
export function formatSubledgerSummary(reconciliation: SubledgerReconciliation): string {
  const { periods, summary } = reconciliation

  let report = `📋 SUBLEDGER RECONCILIATION SUMMARY\n\n`

  report += `🏛️ MASTER (Checking Account Payments): $${summary.totalPayments.toLocaleString()}\n`
  report += `📄 SUBLEDGER (Credit Card Charges): $${summary.totalCharges.toLocaleString()}\n`
  report += `🔍 NET VARIANCE: $${Math.abs(summary.totalVariance).toLocaleString()}\n\n`

  report += `📊 RECONCILIATION STATUS:\n`
  report += `  Total Periods: ${periods.length}\n`
  report += `  Reconciled: ${summary.reconciledPeriods} (${(summary.reconciledPeriods / periods.length * 100).toFixed(1)}%)\n`
  report += `  Variances: ${summary.unreconciledPeriods}\n\n`

  if (summary.unreconciledPeriods > 0) {
    report += `⚠️ PERIODS WITH VARIANCES:\n`
    periods.filter(p => !p.isReconciled).forEach(period => {
      report += `  ${period.periodId}: $${Math.abs(period.variance).toLocaleString()} (${period.percentVariance.toFixed(1)}%)\n`
    })
  }

  return report
}