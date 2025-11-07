import { ParsedCSVData, BankTransaction } from '@/types'
import { CreditCardData, CreditCardTransaction } from '@/lib/creditCardParser'

export interface MonthlyReconciliation {
  month: string // YYYY-MM format
  checkingPayment?: {
    date: string
    amount: number
    description: string
  }
  creditCardCharges: {
    totalAmount: number
    transactionCount: number
    transactions: Array<{
      date: string
      amount: number
      description: string
      category: string
    }>
  }
  variance: number
  isReconciled: boolean
}

export function analyzeMonthlyReconciliation(
  checkingData: ParsedCSVData,
  creditCardData: CreditCardData
): MonthlyReconciliation[] {

  // Get all credit card payments from checking account, sorted by date (earliest first)
  const creditCardPayments = checkingData.transactions
    .filter(t => t.category?.includes('Credit Card Autopay') && t.amount < 0)
    .map(t => ({
      date: new Date(t.date),
      amount: Math.abs(t.amount),
      description: t.description,
      originalTransaction: t
    }))
    .sort((a, b) => a.date.getTime() - b.date.getTime())

  // Get all credit card charges, sorted by date
  const creditCardCharges = creditCardData.transactions
    .filter(t => t.type === 'debit')
    .sort((a, b) => a.date.getTime() - b.date.getTime())

  console.log('🔍 Monthly Analysis Setup:', {
    totalCreditCardPayments: creditCardPayments.length,
    totalCreditCardCharges: creditCardCharges.length,
    earliestPayment: creditCardPayments[0]?.date.toISOString().split('T')[0],
    latestPayment: creditCardPayments[creditCardPayments.length - 1]?.date.toISOString().split('T')[0],
    earliestCharge: creditCardCharges[0]?.date.toISOString().split('T')[0],
    latestCharge: creditCardCharges[creditCardCharges.length - 1]?.date.toISOString().split('T')[0]
  })

  const monthlyResults: MonthlyReconciliation[] = []

  // Process each payment and try to match it to charges in the preceding period
  creditCardPayments.forEach((payment, index) => {
    const paymentMonth = payment.date.toISOString().slice(0, 7) // YYYY-MM

    // Define the charge period: from previous payment to current payment date
    const periodStart = index === 0
      ? new Date(payment.date.getTime() - 35 * 24 * 60 * 60 * 1000) // 35 days before first payment
      : creditCardPayments[index - 1].date

    const periodEnd = payment.date

    // Find charges in this period
    const periodCharges = creditCardCharges.filter(charge =>
      charge.date >= periodStart && charge.date <= periodEnd
    )

    const totalCharges = periodCharges.reduce((sum, charge) => sum + charge.amount, 0)
    const variance = payment.amount - totalCharges
    const percentVariance = Math.abs(variance) / Math.max(payment.amount, totalCharges) * 100

    console.log(`📊 Month ${paymentMonth}:`, {
      paymentAmount: payment.amount.toFixed(2),
      chargesTotal: totalCharges.toFixed(2),
      variance: variance.toFixed(2),
      percentVariance: percentVariance.toFixed(2) + '%',
      chargeCount: periodCharges.length,
      periodStart: periodStart.toISOString().split('T')[0],
      periodEnd: periodEnd.toISOString().split('T')[0]
    })

    monthlyResults.push({
      month: paymentMonth,
      checkingPayment: {
        date: payment.date.toISOString().split('T')[0],
        amount: payment.amount,
        description: payment.description
      },
      creditCardCharges: {
        totalAmount: totalCharges,
        transactionCount: periodCharges.length,
        transactions: periodCharges.map(charge => ({
          date: charge.date.toISOString().split('T')[0],
          amount: charge.amount,
          description: charge.description,
          category: charge.category
        }))
      },
      variance,
      isReconciled: percentVariance <= 5 // 5% tolerance
    })
  })

  return monthlyResults.sort((a, b) => a.month.localeCompare(b.month))
}

export function getFirstMonthAnalysis(
  checkingData: ParsedCSVData,
  creditCardData: CreditCardData
): MonthlyReconciliation | null {
  const monthlyResults = analyzeMonthlyReconciliation(checkingData, creditCardData)
  return monthlyResults[0] || null
}

export function formatMonthlyAnalysis(monthly: MonthlyReconciliation): string {
  const { month, checkingPayment, creditCardCharges, variance, isReconciled } = monthly

  let report = `📅 MONTH: ${month}\n\n`

  if (checkingPayment) {
    report += `💳 CHECKING PAYMENT:\n`
    report += `  Date: ${checkingPayment.date}\n`
    report += `  Amount: $${checkingPayment.amount.toLocaleString()}\n`
    report += `  Description: ${checkingPayment.description}\n\n`
  }

  report += `🧾 CREDIT CARD CHARGES:\n`
  report += `  Total Amount: $${creditCardCharges.totalAmount.toLocaleString()}\n`
  report += `  Transaction Count: ${creditCardCharges.transactionCount}\n\n`

  if (creditCardCharges.transactions.length > 0) {
    report += `  Transactions:\n`
    creditCardCharges.transactions.slice(0, 10).forEach(tx => {
      report += `    ${tx.date} | $${tx.amount.toLocaleString()} | ${tx.description}\n`
    })
    if (creditCardCharges.transactions.length > 10) {
      report += `    ... and ${creditCardCharges.transactions.length - 10} more\n`
    }
    report += `\n`
  }

  report += `🔍 RECONCILIATION:\n`
  report += `  Variance: $${Math.abs(variance).toLocaleString()}\n`
  report += `  Status: ${isReconciled ? '✅ RECONCILED' : '⚠️ VARIANCE DETECTED'}\n`

  return report
}