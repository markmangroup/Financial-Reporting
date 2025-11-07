// Test script to analyze monthly reconciliation
const fs = require('fs')
const path = require('path')

// Import our analysis functions (we'll simulate them here for Node.js)

function parseCheckingCSV(csvContent) {
  const lines = csvContent.trim().split('\n')
  const transactions = []

  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].split(',')
    if (row.length >= 6) {
      // CSV structure: Details, Posting Date, Description, Amount, Type, Balance, Check or Slip #
      const details = row[0].replace(/"/g, '').trim()
      const date = row[1].replace(/"/g, '').trim()
      const description = row[2].replace(/"/g, '').trim()
      const amount = parseFloat(row[3].replace(/"/g, '').trim())
      const type = row[4].replace(/"/g, '').trim()

      transactions.push({
        date,
        description,
        amount,
        category: type, // Using Type field as category
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
    const row = lines[i].split(',').map(cell => cell.replace(/"/g, '').trim())
    if (row.length >= 6) {
      const dateStr = row[1] // Transaction Date
      const description = row[3] // Description
      const category = row[4] // Category
      const typeStr = row[5] // Type
      const amountStr = row[6] // Amount

      const date = new Date(dateStr)
      const amount = Math.abs(parseFloat(amountStr.replace(/[$,()]/g, '')))

      let type = 'debit'
      if (typeStr?.toLowerCase().includes('payment') ||
          description.toLowerCase().includes('payment')) {
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

function analyzeFirstMonth() {
  try {
    // Load checking account data
    const checkingPath = path.join(__dirname, 'data', 'Chase5939_Activity_20250929.CSV')
    const checkingCSV = fs.readFileSync(checkingPath, 'utf-8')
    const checkingData = parseCheckingCSV(checkingCSV)

    // Load credit card data
    const creditCardPath = path.join(__dirname, 'data', 'Chase8008_Activity20230929_20250929_20250929.CSV')
    const creditCardCSV = fs.readFileSync(creditCardPath, 'utf-8')
    const creditCardData = parseCreditCardCSV(creditCardCSV)

    console.log('📊 DATA LOADED:')
    console.log(`Checking transactions: ${checkingData.transactions.length}`)
    console.log(`Credit card transactions: ${creditCardData.transactions.length}`)
    console.log()

    // Find credit card payments from checking account
    const creditCardPayments = checkingData.transactions
      .filter(t => t.description.includes('CHASE CREDIT CRD') && t.amount < 0)
      .map(t => ({
        date: new Date(t.date),
        amount: Math.abs(t.amount),
        description: t.description
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime())

    console.log('💳 CREDIT CARD PAYMENTS FROM CHECKING:')
    creditCardPayments.forEach((payment, index) => {
      console.log(`${index + 1}. ${payment.date.toISOString().split('T')[0]} | $${payment.amount.toLocaleString()} | ${payment.description}`)
    })
    console.log()

    if (creditCardPayments.length === 0) {
      console.log('❌ No credit card payments found in checking account')
      return
    }

    // Analyze first payment
    const firstPayment = creditCardPayments[0]
    console.log('🔍 ANALYZING FIRST PAYMENT:')
    console.log(`Date: ${firstPayment.date.toISOString().split('T')[0]}`)
    console.log(`Amount: $${firstPayment.amount.toLocaleString()}`)
    console.log()

    // Find charges in the 35 days before first payment
    const periodStart = new Date(firstPayment.date.getTime() - 35 * 24 * 60 * 60 * 1000)
    const periodEnd = firstPayment.date

    console.log(`🗓️ CHARGE PERIOD: ${periodStart.toISOString().split('T')[0]} to ${periodEnd.toISOString().split('T')[0]}`)

    const periodCharges = creditCardData.transactions
      .filter(t => t.type === 'debit' && t.date >= periodStart && t.date <= periodEnd)
      .sort((a, b) => a.date.getTime() - b.date.getTime())

    const totalCharges = periodCharges.reduce((sum, charge) => sum + charge.amount, 0)
    const variance = firstPayment.amount - totalCharges
    const percentVariance = Math.abs(variance) / Math.max(firstPayment.amount, totalCharges) * 100

    console.log()
    console.log('🧾 CREDIT CARD CHARGES IN PERIOD:')
    console.log(`Total charges: $${totalCharges.toLocaleString()}`)
    console.log(`Number of transactions: ${periodCharges.length}`)
    console.log()

    console.log('TOP 10 CHARGES:')
    periodCharges.slice(0, 10).forEach((charge, index) => {
      console.log(`${index + 1}. ${charge.date.toISOString().split('T')[0]} | $${charge.amount.toLocaleString()} | ${charge.description}`)
    })

    if (periodCharges.length > 10) {
      console.log(`... and ${periodCharges.length - 10} more charges`)
    }

    console.log()
    console.log('🔍 RECONCILIATION RESULT:')
    console.log(`Payment amount: $${firstPayment.amount.toLocaleString()}`)
    console.log(`Charges total: $${totalCharges.toLocaleString()}`)
    console.log(`Variance: $${Math.abs(variance).toLocaleString()} (${variance > 0 ? 'Payment > Charges' : 'Charges > Payment'})`)
    console.log(`Percent variance: ${percentVariance.toFixed(2)}%`)
    console.log(`Status: ${percentVariance <= 5 ? '✅ RECONCILED' : '⚠️ NEEDS REVIEW'}`)

  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

analyzeFirstMonth()