// Check credit card payments received on the credit card statement
const fs = require('fs')
const path = require('path')

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
        amount,
        originalRow: row
      })
    }
  }

  return { transactions }
}

function checkCreditCardPayments() {
  try {
    // Load credit card data
    const creditCardPath = path.join(__dirname, 'data', 'Chase8008_Activity20230929_20250929_20250929.CSV')
    const creditCardCSV = fs.readFileSync(creditCardPath, 'utf-8')
    const creditCardData = parseCreditCardCSV(creditCardCSV)

    console.log('🔍 ANALYZING CREDIT CARD PAYMENTS (CREDITS)')
    console.log()

    // Find all credit/payment transactions
    const payments = creditCardData.transactions
      .filter(t => t.type === 'credit')
      .sort((a, b) => a.date.getTime() - b.date.getTime())

    console.log(`📊 FOUND ${payments.length} PAYMENT TRANSACTIONS:`)
    console.log()

    payments.forEach((payment, index) => {
      console.log(`${index + 1}. ${payment.date.toISOString().split('T')[0]} | $${payment.amount.toLocaleString()} | ${payment.description}`)
    })

    // Focus on payments around June 2024
    console.log()
    console.log('🎯 PAYMENTS AROUND JUNE 2024:')
    const junePayments = payments.filter(p =>
      p.date >= new Date('2024-06-01') && p.date <= new Date('2024-07-31')
    )

    if (junePayments.length > 0) {
      junePayments.forEach(payment => {
        console.log(`   ${payment.date.toISOString().split('T')[0]} | $${payment.amount.toLocaleString()} | ${payment.description}`)
      })

      // Check if any payment matches our checking account payment of $4,686.09
      const matchingPayment = junePayments.find(p => Math.abs(p.amount - 4686.09) < 0.10)
      if (matchingPayment) {
        console.log()
        console.log(`✅ FOUND MATCHING PAYMENT: ${matchingPayment.date.toISOString().split('T')[0]} - $${matchingPayment.amount.toLocaleString()}`)
      } else {
        console.log()
        console.log('❌ NO EXACT MATCH for $4,686.09 payment found')
      }
    } else {
      console.log('   No payments found in June-July 2024 period')
    }

    // Calculate total credits vs total debits
    const totalCredits = creditCardData.transactions
      .filter(t => t.type === 'credit')
      .reduce((sum, t) => sum + t.amount, 0)

    const totalDebits = creditCardData.transactions
      .filter(t => t.type === 'debit')
      .reduce((sum, t) => sum + t.amount, 0)

    console.log()
    console.log('💰 CREDIT CARD SUMMARY:')
    console.log(`   Total Credits (Payments): $${totalCredits.toLocaleString()}`)
    console.log(`   Total Debits (Charges): $${totalDebits.toLocaleString()}`)
    console.log(`   Net Amount: $${(totalDebits - totalCredits).toLocaleString()}`)

  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

checkCreditCardPayments()