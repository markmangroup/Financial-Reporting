// Test script with corrected period mapping based on user guidance
const fs = require('fs')
const path = require('path')

function parseCheckingCSV(csvContent) {
  const lines = csvContent.trim().split('\n')
  const transactions = []

  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].split(',')
    if (row.length >= 6) {
      const details = row[0].replace(/"/g, '').trim()
      const date = row[1].replace(/"/g, '').trim()
      const description = row[2].replace(/"/g, '').trim()
      const amount = parseFloat(row[3].replace(/"/g, '').trim())
      const type = row[4].replace(/"/g, '').trim()

      transactions.push({
        date,
        description,
        amount,
        category: type,
        details
      })
    }
  }

  return { transactions }
}

function parseCreditCardCSV(csvContent) {
  const lines = csvContent.trim().split('\n')
  const transactions = []

  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].split(',')
    if (row.length >= 6) {
      const dateStr = row[1]?.replace(/"/g, '').trim()
      const description = row[3]?.replace(/"/g, '').trim()
      const category = row[4]?.replace(/"/g, '').trim()
      const typeStr = row[5]?.replace(/"/g, '').trim()
      const amountStr = row[6]?.replace(/"/g, '').trim()

      const date = new Date(dateStr)
      const amount = Math.abs(parseFloat(amountStr.replace(/[$,()]/g, '')))

      let type = 'debit'
      if (typeStr?.toLowerCase().includes('payment') ||
          description?.toLowerCase().includes('payment')) {
        type = 'credit'
      }

      transactions.push({
        date,
        description,
        category: category || 'Uncategorized',
        type,
        amount
      })
    }
  }

  return { transactions }
}

function buildCorrectedReconciliation(checkingData, creditCardData) {
  // Extract payments and charges
  const creditCardPayments = checkingData.transactions
    .filter(t => t.description.includes('CHASE CREDIT CRD') && t.amount < 0)
    .map(t => ({
      date: new Date(t.date),
      amount: Math.abs(t.amount),
      description: t.description
    }))
    .sort((a, b) => a.date.getTime() - b.date.getTime())

  const creditCardCharges = creditCardData.transactions
    .filter(t => t.type === 'debit')
    .sort((a, b) => a.date.getTime() - b.date.getTime())

  console.log('🔧 CORRECTED PERIOD MAPPING LOGIC')
  console.log()

  // CORRECTED LOGIC: Based on user guidance
  // June 19, 2024 payment covers charges from 5/1/24-5/21/24
  // This suggests statement cycles run from 1st to ~21st of month
  // and payment is made ~19th of next month

  const periods = []

  creditCardPayments.forEach((payment, index) => {
    const paymentDate = payment.date

    // Calculate statement period that this payment covers
    // Payment in June covers May 1-21, so payment month-1 = statement month
    const statementYear = paymentDate.getMonth() === 0
      ? paymentDate.getFullYear() - 1
      : paymentDate.getFullYear()
    const statementMonth = paymentDate.getMonth() === 0
      ? 11
      : paymentDate.getMonth() - 1

    // Statement period: 1st to 21st of the statement month
    const periodStart = new Date(statementYear, statementMonth, 1)
    const periodEnd = new Date(statementYear, statementMonth, 21, 23, 59, 59) // End of 21st

    // Find charges in this period
    const periodCharges = creditCardCharges.filter(charge =>
      charge.date >= periodStart && charge.date <= periodEnd
    )

    const chargesTotal = periodCharges.reduce((sum, charge) => sum + charge.amount, 0)
    const variance = payment.amount - chargesTotal
    const percentVariance = chargesTotal > 0
      ? Math.abs(variance) / chargesTotal * 100
      : (payment.amount > 0 ? 100 : 0)

    const periodId = `${statementYear}-${String(statementMonth + 1).padStart(2, '0')}`

    const period = {
      periodId,
      statementMonth: `${statementYear}-${String(statementMonth + 1).padStart(2, '0')}`,
      startDate: periodStart,
      endDate: periodEnd,
      paymentDate: paymentDate,
      paymentAmount: payment.amount,
      charges: periodCharges,
      chargesTotal,
      variance,
      percentVariance,
      isReconciled: Math.abs(percentVariance) <= 15 // 15% tolerance
    }

    periods.push(period)
  })

  return { periods, creditCardPayments, creditCardCharges }
}

function testCorrectedPeriods() {
  try {
    // Load data
    const checkingPath = path.join(__dirname, 'data', 'Chase5939_Activity_20250929.CSV')
    const creditCardPath = path.join(__dirname, 'data', 'Chase8008_Activity20230929_20250929_20250929.CSV')

    const checkingCSV = fs.readFileSync(checkingPath, 'utf-8')
    const creditCardCSV = fs.readFileSync(creditCardPath, 'utf-8')

    const checkingData = parseCheckingCSV(checkingCSV)
    const creditCardData = parseCreditCardCSV(creditCardCSV)

    // Build corrected reconciliation
    const { periods } = buildCorrectedReconciliation(checkingData, creditCardData)

    console.log('📊 CORRECTED RECONCILIATION RESULTS:')
    console.log()

    // Test the specific example from user: June 19, 2024 payment
    const junePayment = periods.find(p =>
      p.paymentDate.getMonth() === 5 && p.paymentDate.getFullYear() === 2024
    )

    if (junePayment) {
      console.log('🎯 VALIDATING USER EXAMPLE:')
      console.log(`Payment: June 19, 2024 - $${junePayment.paymentAmount.toLocaleString()}`)
      console.log(`Expected to cover: May 1-21, 2024`)
      console.log(`Actual period mapped: ${junePayment.startDate.toISOString().split('T')[0]} to ${junePayment.endDate.toISOString().split('T')[0]}`)
      console.log(`Charges found: $${junePayment.chargesTotal.toLocaleString()} (${junePayment.charges.length} transactions)`)
      console.log(`Variance: $${Math.abs(junePayment.variance).toLocaleString()} (${junePayment.percentVariance.toFixed(1)}%)`)
      console.log(`Status: ${junePayment.isReconciled ? '✅ RECONCILED' : '⚠️ VARIANCE'}`)
      console.log()

      // Show the charges in that period
      if (junePayment.charges.length > 0) {
        console.log('💰 CHARGES IN MAY 1-21, 2024:')
        junePayment.charges.slice(0, 8).forEach((charge, index) => {
          console.log(`  ${index + 1}. ${charge.date.toISOString().split('T')[0]} | $${charge.amount.toLocaleString()} | ${charge.description}`)
        })
        if (junePayment.charges.length > 8) {
          console.log(`  ... and ${junePayment.charges.length - 8} more`)
        }
        console.log()
      }
    }

    // Show overall results
    const totalPayments = periods.reduce((sum, p) => sum + p.paymentAmount, 0)
    const totalCharges = periods.reduce((sum, p) => sum + p.chargesTotal, 0)
    const reconciledCount = periods.filter(p => p.isReconciled).length

    console.log('📈 OVERALL RESULTS:')
    console.log(`Total Periods: ${periods.length}`)
    console.log(`Reconciled: ${reconciledCount} (${(reconciledCount / periods.length * 100).toFixed(1)}%)`)
    console.log(`Total Payments: $${totalPayments.toLocaleString()}`)
    console.log(`Total Charges (in periods): $${totalCharges.toLocaleString()}`)
    console.log(`Variance: $${Math.abs(totalPayments - totalCharges).toLocaleString()}`)
    console.log()

    // Show first 5 periods
    console.log('📅 FIRST 5 PERIODS:')
    periods.slice(0, 5).forEach((period, index) => {
      const status = period.isReconciled ? '✅' : '⚠️'
      console.log(`${status} ${period.statementMonth}: Payment $${period.paymentAmount.toLocaleString()} vs Charges $${period.chargesTotal.toLocaleString()} (${period.percentVariance.toFixed(1)}% var)`)
    })

  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

testCorrectedPeriods()