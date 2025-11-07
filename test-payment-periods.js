// Test script to analyze different payment period theories
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

function testPaymentPeriods() {
  try {
    // Load data
    const checkingPath = path.join(__dirname, 'data', 'Chase5939_Activity_20250929.CSV')
    const creditCardPath = path.join(__dirname, 'data', 'Chase8008_Activity20230929_20250929_20250929.CSV')

    const checkingCSV = fs.readFileSync(checkingPath, 'utf-8')
    const creditCardCSV = fs.readFileSync(creditCardPath, 'utf-8')

    const checkingData = parseCheckingCSV(checkingCSV)
    const creditCardData = parseCreditCardCSV(creditCardCSV)

    // Get credit card payments
    const creditCardPayments = checkingData.transactions
      .filter(t => t.description.includes('CHASE CREDIT CRD') && t.amount < 0)
      .map(t => ({
        date: new Date(t.date),
        amount: Math.abs(t.amount),
        description: t.description
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime())

    // Get credit card charges
    const creditCardCharges = creditCardData.transactions
      .filter(t => t.type === 'debit')
      .sort((a, b) => a.date.getTime() - b.date.getTime())

    console.log('🔍 TESTING DIFFERENT PAYMENT PERIOD THEORIES FOR FIRST PAYMENT')
    console.log()

    if (creditCardPayments.length === 0) {
      console.log('No payments found')
      return
    }

    const firstPayment = creditCardPayments[0]
    console.log(`📅 FIRST PAYMENT: ${firstPayment.date.toISOString().split('T')[0]} - $${firstPayment.amount.toLocaleString()}`)
    console.log()

    // Theory 1: Payment covers charges in the 30 days BEFORE payment date
    const theory1Start = new Date(firstPayment.date.getTime() - 30 * 24 * 60 * 60 * 1000)
    const theory1End = firstPayment.date
    const theory1Charges = creditCardCharges.filter(c => c.date >= theory1Start && c.date < theory1End)
    const theory1Total = theory1Charges.reduce((sum, c) => sum + c.amount, 0)

    console.log(`🧪 THEORY 1: Previous 30 days (${theory1Start.toISOString().split('T')[0]} to ${theory1End.toISOString().split('T')[0]})`)
    console.log(`   Charges: $${theory1Total.toLocaleString()} (${theory1Charges.length} transactions)`)
    console.log(`   Variance: $${Math.abs(firstPayment.amount - theory1Total).toLocaleString()} (${Math.abs((firstPayment.amount - theory1Total) / Math.max(firstPayment.amount, theory1Total) * 100).toFixed(1)}%)`)
    console.log()

    // Theory 2: Payment covers charges in the previous calendar month
    const paymentMonth = firstPayment.date.getMonth()
    const paymentYear = firstPayment.date.getFullYear()
    const prevMonth = paymentMonth === 0 ? 11 : paymentMonth - 1
    const prevYear = paymentMonth === 0 ? paymentYear - 1 : paymentYear

    const theory2Start = new Date(prevYear, prevMonth, 1)
    const theory2End = new Date(paymentYear, paymentMonth, 1)
    const theory2Charges = creditCardCharges.filter(c => c.date >= theory2Start && c.date < theory2End)
    const theory2Total = theory2Charges.reduce((sum, c) => sum + c.amount, 0)

    console.log(`🧪 THEORY 2: Previous calendar month (${theory2Start.toISOString().split('T')[0]} to ${theory2End.toISOString().split('T')[0]})`)
    console.log(`   Charges: $${theory2Total.toLocaleString()} (${theory2Charges.length} transactions)`)
    console.log(`   Variance: $${Math.abs(firstPayment.amount - theory2Total).toLocaleString()} (${Math.abs((firstPayment.amount - theory2Total) / Math.max(firstPayment.amount, theory2Total) * 100).toFixed(1)}%)`)
    console.log()

    // Theory 3: Payment covers statement period ending ~20 days before payment
    const theory3End = new Date(firstPayment.date.getTime() - 20 * 24 * 60 * 60 * 1000) // Statement close ~20 days before payment
    const theory3Start = new Date(theory3End.getTime() - 30 * 24 * 60 * 60 * 1000) // 30-day statement period
    const theory3Charges = creditCardCharges.filter(c => c.date >= theory3Start && c.date < theory3End)
    const theory3Total = theory3Charges.reduce((sum, c) => sum + c.amount, 0)

    console.log(`🧪 THEORY 3: Statement period ending ~20 days before (${theory3Start.toISOString().split('T')[0]} to ${theory3End.toISOString().split('T')[0]})`)
    console.log(`   Charges: $${theory3Total.toLocaleString()} (${theory3Charges.length} transactions)`)
    console.log(`   Variance: $${Math.abs(firstPayment.amount - theory3Total).toLocaleString()} (${Math.abs((firstPayment.amount - theory3Total) / Math.max(firstPayment.amount, theory3Total) * 100).toFixed(1)}%)`)
    console.log()

    // Find the best matching theory
    const theories = [
      { name: 'Theory 1 (30 days before)', variance: Math.abs(firstPayment.amount - theory1Total), percent: Math.abs((firstPayment.amount - theory1Total) / Math.max(firstPayment.amount, theory1Total) * 100) },
      { name: 'Theory 2 (previous month)', variance: Math.abs(firstPayment.amount - theory2Total), percent: Math.abs((firstPayment.amount - theory2Total) / Math.max(firstPayment.amount, theory2Total) * 100) },
      { name: 'Theory 3 (statement period)', variance: Math.abs(firstPayment.amount - theory3Total), percent: Math.abs((firstPayment.amount - theory3Total) / Math.max(firstPayment.amount, theory3Total) * 100) }
    ]

    theories.sort((a, b) => a.percent - b.percent)

    console.log('🏆 BEST MATCH:')
    console.log(`   ${theories[0].name}: ${theories[0].percent.toFixed(1)}% variance ($${theories[0].variance.toLocaleString()})`)

    if (theories[0].percent <= 10) {
      console.log('   ✅ ACCEPTABLE MATCH FOUND!')
    } else {
      console.log('   ⚠️ ALL THEORIES SHOW HIGH VARIANCE - MAY NEED DIFFERENT APPROACH')
    }

    // Show first few charges for context
    console.log()
    console.log('📊 FIRST 10 CREDIT CARD CHARGES FOR CONTEXT:')
    creditCardCharges.slice(0, 10).forEach((charge, index) => {
      console.log(`${index + 1}. ${charge.date.toISOString().split('T')[0]} | $${charge.amount.toLocaleString()} | ${charge.description}`)
    })

  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

testPaymentPeriods()