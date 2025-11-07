// Identify one-off payments vs regular billing cycle payments
const fs = require('fs')
const path = require('path')

function parseCreditCardCSV(csvContent) {
  const lines = csvContent.trim().split('\n')
  const transactions = []

  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].split(',')
    if (row.length >= 6) {
      const dateStr = row[1]?.replace(/"/g, '').trim() // Transaction Date
      const postDateStr = row[2]?.replace(/"/g, '').trim() // Post Date
      const description = row[3]?.replace(/"/g, '').trim()
      const category = row[4]?.replace(/"/g, '').trim()
      const typeStr = row[5]?.replace(/"/g, '').trim() // Type field (Column F)
      const amountStr = row[6]?.replace(/"/g, '').trim()

      const date = new Date(dateStr)
      const postDate = new Date(postDateStr)
      const amount = Math.abs(parseFloat(amountStr.replace(/[$,()]/g, '')))

      let type = 'debit'
      if (typeStr?.toLowerCase().includes('payment') ||
          description?.toLowerCase().includes('payment')) {
        type = 'credit'
      }

      transactions.push({
        date,
        postDate,
        description,
        category: category || 'Uncategorized',
        type,
        typeStr, // Column F - Payment vs Sale
        amount,
        originalRow: row
      })
    }
  }

  return { transactions }
}

function identifyPaymentTypes() {
  try {
    console.log('🔍 IDENTIFYING ONE-OFF vs REGULAR PAYMENTS')
    console.log()

    // Load credit card data
    const creditCardPath = path.join(__dirname, 'data', 'Chase8008_Activity20230929_20250929_20250929.CSV')
    const creditCardCSV = fs.readFileSync(creditCardPath, 'utf-8')
    const creditCardData = parseCreditCardCSV(creditCardCSV)

    // Find all payment transactions (credits)
    const allPayments = creditCardData.transactions
      .filter(t => t.type === 'credit')
      .sort((a, b) => a.postDate.getTime() - b.postDate.getTime())

    console.log(`📊 FOUND ${allPayments.length} PAYMENT TRANSACTIONS:`)
    console.log()

    // Analyze each payment
    allPayments.forEach((payment, index) => {
      const isAutopay = payment.description.includes('AUTOMATIC PAYMENT')
      const isManual = payment.description.includes('Payment Thank You')
      const isATT = payment.description.includes('ATT*BILL PAYMENT')

      let paymentType = 'Unknown'
      if (isAutopay) paymentType = 'Autopay (Regular)'
      else if (isManual) paymentType = 'Manual (One-off)'
      else if (isATT) paymentType = 'ATT Bill (Regular)'
      else paymentType = 'Other'

      const typeIndicator = paymentType.includes('One-off') ? '⚠️' :
                           paymentType.includes('Regular') ? '✅' : '❓'

      console.log(`${typeIndicator} ${index + 1}. ${payment.postDate.toISOString().split('T')[0]} | $${payment.amount.toLocaleString()} | ${payment.description}`)
      console.log(`     Type: ${paymentType} | Column F: ${payment.typeStr}`)
      console.log()
    })

    // Separate regular vs one-off payments
    const regularPayments = allPayments.filter(p =>
      p.description.includes('AUTOMATIC PAYMENT') ||
      p.description.includes('ATT*BILL PAYMENT')
    )

    const oneOffPayments = allPayments.filter(p =>
      p.description.includes('Payment Thank You') ||
      (!p.description.includes('AUTOMATIC PAYMENT') && !p.description.includes('ATT*BILL PAYMENT'))
    )

    console.log('📈 PAYMENT SUMMARY:')
    console.log(`   Regular Payments: ${regularPayments.length} (${regularPayments.reduce((sum, p) => sum + p.amount, 0).toLocaleString()})`)
    console.log(`   One-off Payments: ${oneOffPayments.length} (${oneOffPayments.reduce((sum, p) => sum + p.amount, 0).toLocaleString()})`)
    console.log()

    // Focus on the $10,000 payment mentioned
    const tenThousandPayment = oneOffPayments.find(p => Math.abs(p.amount - 10000) < 0.01)
    if (tenThousandPayment) {
      console.log('🎯 FOUND $10,000 ONE-OFF PAYMENT:')
      console.log(`   Date: ${tenThousandPayment.postDate.toISOString().split('T')[0]}`)
      console.log(`   Description: ${tenThousandPayment.description}`)
      console.log(`   Type: ${tenThousandPayment.typeStr}`)
      console.log(`   ⚠️ This should NOT be included in billing cycle reconciliation`)
      console.log()
    }

    console.log('💡 RECONCILIATION STRATEGY:')
    console.log('   ✅ Include: AUTOMATIC PAYMENT transactions (regular billing cycle)')
    console.log('   ⚠️ Exclude: Payment Thank You transactions (one-off payments)')
    console.log('   ✅ Include: ATT*BILL PAYMENT transactions (regular bills)')
    console.log()

    return { regularPayments, oneOffPayments, allPayments }

  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

identifyPaymentTypes()