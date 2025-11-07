// Test script for subledger reconciliation system
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

function buildSubledgerReconciliation(checkingData, creditCardData) {
  const auditTrail = []

  // Step 1: Extract checking account credit card payments (MASTER)
  const creditCardPayments = checkingData.transactions
    .filter(t => t.description.includes('CHASE CREDIT CRD') && t.amount < 0)
    .map(t => ({
      date: new Date(t.date),
      amount: Math.abs(t.amount),
      description: t.description,
      originalTransaction: t
    }))
    .sort((a, b) => a.date.getTime() - b.date.getTime())

  auditTrail.push({
    step: 'extract_payments',
    description: 'Extracted credit card payments from checking account',
    data: {
      paymentCount: creditCardPayments.length,
      totalAmount: creditCardPayments.reduce((sum, p) => sum + p.amount, 0),
      dateRange: {
        first: creditCardPayments[0]?.date.toISOString().split('T')[0],
        last: creditCardPayments[creditCardPayments.length - 1]?.date.toISOString().split('T')[0]
      }
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
  const periods = []

  creditCardPayments.forEach((payment, index) => {
    // Determine statement period for this payment
    const paymentDate = payment.date

    // Statement period ends approximately 1 day before payment
    const periodEnd = new Date(paymentDate.getTime() - 1 * 24 * 60 * 60 * 1000)

    let periodStart
    if (index === 0) {
      // For first payment, assume 30-day period
      periodStart = new Date(periodEnd.getTime() - 30 * 24 * 60 * 60 * 1000)
    } else {
      // For subsequent payments, start from previous period's end + 1 day
      periodStart = new Date(periods[index - 1].endDate.getTime() + 1 * 24 * 60 * 60 * 1000)
    }

    // Find charges in this period
    const periodCharges = creditCardCharges.filter(charge =>
      charge.date >= periodStart && charge.date <= periodEnd
    )

    const chargesTotal = periodCharges.reduce((sum, charge) => sum + charge.amount, 0)
    const variance = payment.amount - chargesTotal
    const percentVariance = chargesTotal > 0
      ? Math.abs(variance) / chargesTotal * 100
      : (payment.amount > 0 ? 100 : 0)

    const periodId = `${periodStart.getFullYear()}-${String(periodStart.getMonth() + 1).padStart(2, '0')}`

    const period = {
      periodId,
      startDate: periodStart,
      endDate: periodEnd,
      paymentDate: paymentDate,
      paymentAmount: payment.amount,
      charges: periodCharges,
      chargesTotal,
      variance,
      percentVariance,
      isReconciled: Math.abs(percentVariance) <= 10 // 10% tolerance
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

  return {
    periods,
    summary: {
      totalPayments,
      totalCharges,
      totalVariance,
      reconciledPeriods,
      unreconciledPeriods
    },
    auditTrail
  }
}

function testSubledgerReconciliation() {
  try {
    console.log('🔍 SUBLEDGER RECONCILIATION SYSTEM TEST\n')

    // Load data
    const checkingPath = path.join(__dirname, 'data', 'Chase5939_Activity_20250929.CSV')
    const creditCardPath = path.join(__dirname, 'data', 'Chase8008_Activity20230929_20250929_20250929.CSV')

    const checkingCSV = fs.readFileSync(checkingPath, 'utf-8')
    const creditCardCSV = fs.readFileSync(creditCardPath, 'utf-8')

    const checkingData = parseCheckingCSV(checkingCSV)
    const creditCardData = parseCreditCardCSV(creditCardCSV)

    // Build subledger reconciliation
    const reconciliation = buildSubledgerReconciliation(checkingData, creditCardData)

    console.log('📋 RECONCILIATION SUMMARY:')
    console.log(`🏛️  MASTER (Checking Payments): $${reconciliation.summary.totalPayments.toLocaleString()}`)
    console.log(`📄 SUBLEDGER (Credit Charges): $${reconciliation.summary.totalCharges.toLocaleString()}`)
    console.log(`🔍 NET VARIANCE: $${Math.abs(reconciliation.summary.totalVariance).toLocaleString()}`)
    console.log(`📊 RECONCILED PERIODS: ${reconciliation.summary.reconciledPeriods}/${reconciliation.periods.length} (${(reconciliation.summary.reconciledPeriods / reconciliation.periods.length * 100).toFixed(1)}%)`)
    console.log()

    console.log('📅 PERIOD-BY-PERIOD ANALYSIS:')
    console.log()

    // Show first 3 periods in detail
    reconciliation.periods.slice(0, 3).forEach((period, index) => {
      const status = period.isReconciled ? '✅' : '⚠️'
      console.log(`${status} PERIOD ${index + 1}: ${period.periodId}`)
      console.log(`   Payment: ${period.paymentDate.toISOString().split('T')[0]} | $${period.paymentAmount.toLocaleString()}`)
      console.log(`   Charges: ${period.startDate.toISOString().split('T')[0]} to ${period.endDate.toISOString().split('T')[0]} | $${period.chargesTotal.toLocaleString()} (${period.charges.length} txns)`)
      console.log(`   Variance: $${Math.abs(period.variance).toLocaleString()} (${period.percentVariance.toFixed(1)}%)`)

      if (period.charges.length > 0) {
        console.log(`   Top charges:`)
        period.charges.slice(0, 3).forEach((charge, chargeIndex) => {
          console.log(`     ${chargeIndex + 1}. ${charge.date.toISOString().split('T')[0]} | $${charge.amount.toLocaleString()} | ${charge.description}`)
        })
        if (period.charges.length > 3) {
          console.log(`     ... and ${period.charges.length - 3} more`)
        }
      }
      console.log()
    })

    if (reconciliation.periods.length > 3) {
      console.log(`... and ${reconciliation.periods.length - 3} more periods`)
      console.log()
    }

    // Show periods with high variances
    const highVariancePeriods = reconciliation.periods.filter(p => !p.isReconciled)
    if (highVariancePeriods.length > 0) {
      console.log('⚠️ PERIODS WITH HIGH VARIANCES:')
      highVariancePeriods.forEach(period => {
        console.log(`   ${period.periodId}: $${Math.abs(period.variance).toLocaleString()} (${period.percentVariance.toFixed(1)}%)`)
      })
      console.log()
    }

    // Show audit trail highlights
    console.log('📝 AUDIT TRAIL HIGHLIGHTS:')
    reconciliation.auditTrail.forEach(entry => {
      if (entry.step === 'extract_payments') {
        console.log(`   ✓ Found ${entry.data.paymentCount} payments totaling $${entry.data.totalAmount.toLocaleString()}`)
      } else if (entry.step === 'extract_charges') {
        console.log(`   ✓ Found ${entry.data.chargeCount} charges totaling $${entry.data.totalAmount.toLocaleString()}`)
      }
    })

  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

testSubledgerReconciliation()