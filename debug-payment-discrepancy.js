// Debug payment transaction count discrepancy
const fs = require('fs')
const path = require('path')

function debugPaymentDiscrepancy() {
  console.log('🔍 DEBUGGING PAYMENT TRANSACTION DISCREPANCY')
  console.log('Expected: 18 payments (from Excel/CSV analysis)')
  console.log('Actual: 16 payments (from our parser)')
  console.log()

  // Load credit card data
  const csvPath = path.join(__dirname, 'data', 'Chase8008_Activity20230929_20250929_20250929.CSV')
  const csvContent = fs.readFileSync(csvPath, 'utf-8')
  const lines = csvContent.trim().split('\n')

  console.log(`📊 Total CSV lines: ${lines.length} (including header)`)
  console.log()

  const paymentTransactions = []
  const skippedRows = []
  let processedRows = 0

  // Process each transaction row with same logic as parser
  for (let i = 1; i < lines.length; i++) {
    try {
      const row = lines[i].split(',').map(cell => cell.replace(/"/g, '').trim())

      // Check if row has sufficient columns (same validation as parser)
      if (row.length < 6) {
        skippedRows.push({
          rowNumber: i + 1,
          reason: `Insufficient columns (${row.length})`,
          rawRow: lines[i]
        })
        continue
      }

      // Map Chase credit card CSV format
      const cardNumber = row[0] // Card
      const dateStr = row[1] // Transaction Date
      const postDateStr = row[2] // Post Date
      const description = row[3] // Description
      const categoryStr = row[4] || 'Uncategorized' // Category
      const typeStr = row[5] // Type
      const amountStr = row[6] // Amount

      // Parse date (same validation as parser)
      const transactionDate = new Date(dateStr)
      if (isNaN(transactionDate.getTime())) {
        skippedRows.push({
          rowNumber: i + 1,
          reason: `Invalid date '${dateStr}'`,
          rawRow: lines[i]
        })
        continue
      }

      // Parse amount (same validation as parser)
      const cleanAmount = amountStr.replace(/[$,()]/g, '')
      const amount = Math.abs(parseFloat(cleanAmount))

      if (isNaN(amount)) {
        skippedRows.push({
          rowNumber: i + 1,
          reason: `Invalid amount '${amountStr}'`,
          rawRow: lines[i]
        })
        continue
      }

      processedRows++

      // Check if this is a payment using same logic as parser
      const isPaymentByType = typeStr?.toLowerCase().includes('payment')
      const isPaymentByDesc = description.toLowerCase().includes('payment')
      const isAutopay = description.toLowerCase().includes('autopay')

      if (isPaymentByType || isPaymentByDesc || isAutopay) {
        paymentTransactions.push({
          rowNumber: i + 1,
          date: dateStr,
          description,
          type: typeStr,
          amount,
          matchedBy: isPaymentByType ? 'typeStr' : (isPaymentByDesc ? 'description' : 'autopay'),
          rawRow: lines[i].substring(0, 100) + '...'
        })
      }

    } catch (error) {
      skippedRows.push({
        rowNumber: i + 1,
        reason: `Parse error: ${error.message}`,
        rawRow: lines[i]
      })
    }
  }

  console.log('📈 PROCESSING SUMMARY:')
  console.log(`  Total rows processed: ${processedRows}`)
  console.log(`  Rows skipped: ${skippedRows.length}`)
  console.log(`  Payment transactions found: ${paymentTransactions.length}`)
  console.log()

  if (skippedRows.length > 0) {
    console.log('⚠️  SKIPPED ROWS:')
    skippedRows.forEach(skip => {
      console.log(`  Row ${skip.rowNumber}: ${skip.reason}`)
      console.log(`    ${skip.rawRow.substring(0, 80)}...`)
    })
    console.log()
  }

  console.log('💰 PAYMENT TRANSACTIONS FOUND BY OUR PARSER LOGIC:')
  paymentTransactions
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .forEach((payment, index) => {
      console.log(`${index + 1}. ${payment.date}: ${payment.description}`)
      console.log(`   Type: "${payment.type}" | Amount: $${payment.amount.toLocaleString()} | Matched by: ${payment.matchedBy}`)
      console.log()
    })

  console.log('🔍 ANALYSIS:')
  console.log(`Expected payments: 18`)
  console.log(`Found payments: ${paymentTransactions.length}`)
  console.log(`Missing payments: ${18 - paymentTransactions.length}`)

  if (paymentTransactions.length !== 18) {
    console.log()
    console.log('❗ DISCREPANCY DETECTED!')
    console.log('Next step: Compare this list with raw CSV to find missing payments')
  } else {
    console.log()
    console.log('✅ Payment count matches! Issue might be elsewhere.')
  }
}

debugPaymentDiscrepancy()