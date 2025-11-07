// Debug reconciliation payment count discrepancy
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

function debugReconciliationDiscrepancy() {
  console.log('🔄 DEBUGGING RECONCILIATION PAYMENT DISCREPANCY')
  console.log()

  // Load checking account data
  const checkingPath = path.join(__dirname, 'data', 'Chase5939_Activity_20250929.CSV')
  const checkingCSV = fs.readFileSync(checkingPath, 'utf-8')
  const checkingData = parseCheckingCSV(checkingCSV)

  // Find credit card payments in checking account (same logic as reconciliation)
  const creditCardPayments = checkingData.transactions
    .filter(t => t.category?.includes('Credit Card Autopay') && t.amount < 0)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  console.log('🏛️ CHECKING ACCOUNT CREDIT CARD PAYMENTS:')
  console.log(`Found: ${creditCardPayments.length} payments`)
  console.log()

  creditCardPayments.forEach((payment, index) => {
    console.log(`${index + 1}. ${payment.date}: ${payment.description}`)
    console.log(`   Amount: $${Math.abs(payment.amount).toLocaleString()} | Category: "${payment.category}"`)
    console.log()
  })

  const totalCheckingPayments = creditCardPayments.reduce((sum, p) => sum + Math.abs(p.amount), 0)
  console.log(`💰 Total Checking Account CC Payments: $${totalCheckingPayments.toLocaleString()}`)
  console.log()

  // Now count credit card payment receipts
  const csvPath = path.join(__dirname, 'data', 'Chase8008_Activity20230929_20250929_20250929.CSV')
  const csvContent = fs.readFileSync(csvPath, 'utf-8')
  const lines = csvContent.trim().split('\n')

  const ccPaymentReceipts = []

  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].split(',').map(cell => cell.replace(/"/g, '').trim())
    if (row.length >= 6) {
      const dateStr = row[1]
      const description = row[3]
      const typeStr = row[5]
      const amountStr = row[6]
      const amount = Math.abs(parseFloat(amountStr.replace(/[$,()]/g, '')))

      // Only count Type="Payment" (actual credit card payment receipts)
      if (typeStr?.toLowerCase().includes('payment')) {
        ccPaymentReceipts.push({
          date: dateStr,
          description,
          amount,
          type: typeStr
        })
      }
    }
  }

  console.log('💳 CREDIT CARD PAYMENT RECEIPTS:')
  console.log(`Found: ${ccPaymentReceipts.length} payment receipts`)
  console.log()

  ccPaymentReceipts
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .forEach((receipt, index) => {
      console.log(`${index + 1}. ${receipt.date}: ${receipt.description}`)
      console.log(`   Amount: $${receipt.amount.toLocaleString()}`)
      console.log()
    })

  const totalCCReceipts = ccPaymentReceipts.reduce((sum, p) => sum + p.amount, 0)
  console.log(`💰 Total Credit Card Payment Receipts: $${totalCCReceipts.toLocaleString()}`)
  console.log()

  console.log('📊 RECONCILIATION ANALYSIS:')
  console.log(`Checking Account Payments: ${creditCardPayments.length} ($${totalCheckingPayments.toLocaleString()})`)
  console.log(`Credit Card Payment Receipts: ${ccPaymentReceipts.length} ($${totalCCReceipts.toLocaleString()})`)
  console.log(`Payment Count Difference: ${ccPaymentReceipts.length - creditCardPayments.length}`)
  console.log(`Payment Amount Difference: $${(totalCCReceipts - totalCheckingPayments).toLocaleString()}`)
  console.log()

  if (ccPaymentReceipts.length > creditCardPayments.length) {
    console.log('🔍 CONCLUSION:')
    console.log(`The ${ccPaymentReceipts.length - creditCardPayments.length} extra credit card payment receipts likely came from:`)
    console.log('  • Different checking account')
    console.log('  • Manual payments (web/mobile)')
    console.log('  • Transfer from savings/other account')
    console.log('  • Business account payments not in this checking CSV')
  }
}

debugReconciliationDiscrepancy()