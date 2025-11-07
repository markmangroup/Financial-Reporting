// Analyze the July 2024 example to determine correct billing cycle
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
      const typeStr = row[5]?.replace(/"/g, '').trim() // Type field
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
        typeStr,
        amount,
        originalRow: row
      })
    }
  }

  return { transactions }
}

function analyzeJulyExample() {
  try {
    console.log('🔍 ANALYZING JULY 2024 BILLING CYCLE')
    console.log()

    // Load credit card data
    const creditCardPath = path.join(__dirname, 'data', 'Chase8008_Activity20230929_20250929_20250929.CSV')
    const creditCardCSV = fs.readFileSync(creditCardPath, 'utf-8')
    const creditCardData = parseCreditCardCSV(creditCardCSV)

    // Find the July payment: $14,536.69 made on 8/19/24
    const julyPayment = creditCardData.transactions.find(t =>
      t.type === 'credit' &&
      Math.abs(t.amount - 14536.69) < 0.01 &&
      t.postDate >= new Date('2024-08-15') &&
      t.postDate <= new Date('2024-08-25')
    )

    if (!julyPayment) {
      console.log('❌ Could not find July payment of $14,536.69')
      return
    }

    console.log(`✅ FOUND JULY PAYMENT:`)
    console.log(`   Amount: $${julyPayment.amount.toLocaleString()}`)
    console.log(`   Post Date: ${julyPayment.postDate.toISOString().split('T')[0]}`)
    console.log(`   Description: ${julyPayment.description}`)
    console.log()

    // Find all "Sale" transactions in the expected period (7/3/24 - 7/21/24)
    const userExpectedStart = new Date('2024-07-03')
    const userExpectedEnd = new Date('2024-07-21')

    console.log(`🎯 USER EXPECTED PERIOD: ${userExpectedStart.toISOString().split('T')[0]} to ${userExpectedEnd.toISOString().split('T')[0]}`)

    const expectedPeriodSales = creditCardData.transactions.filter(t =>
      t.type === 'debit' &&
      t.typeStr === 'Sale' &&
      t.postDate >= userExpectedStart &&
      t.postDate <= userExpectedEnd
    )

    const expectedTotal = expectedPeriodSales.reduce((sum, t) => sum + t.amount, 0)
    const variance = Math.abs(julyPayment.amount - expectedTotal)

    console.log(`   Sales transactions found: ${expectedPeriodSales.length}`)
    console.log(`   Total sales amount: $${expectedTotal.toLocaleString()}`)
    console.log(`   Payment amount: $${julyPayment.amount.toLocaleString()}`)
    console.log(`   Variance: $${variance.toLocaleString()}`)
    console.log(`   Match: ${variance < 0.01 ? '✅ PERFECT' : '❌ MISMATCH'}`)
    console.log()

    if (variance >= 0.01) {
      // Try different date ranges to find the actual billing cycle
      console.log('🔍 SEARCHING FOR ACTUAL BILLING CYCLE...')
      console.log()

      // Try different start dates around the 25th
      for (let startDay = 22; startDay <= 28; startDay++) {
        const testStart = new Date('2024-06-' + startDay.toString().padStart(2, '0'))
        const testEnd = new Date('2024-07-' + (startDay - 1).toString().padStart(2, '0'))

        const testSales = creditCardData.transactions.filter(t =>
          t.type === 'debit' &&
          t.typeStr === 'Sale' &&
          t.postDate >= testStart &&
          t.postDate <= testEnd
        )

        const testTotal = testSales.reduce((sum, t) => sum + t.amount, 0)
        const testVariance = Math.abs(julyPayment.amount - testTotal)

        console.log(`   Testing: ${testStart.toISOString().split('T')[0]} to ${testEnd.toISOString().split('T')[0]}`)
        console.log(`     Sales: ${testSales.length} txns, $${testTotal.toLocaleString()}`)
        console.log(`     Variance: $${testVariance.toLocaleString()} ${testVariance < 0.01 ? '✅ MATCH!' : ''}`)

        if (testVariance < 0.01) {
          console.log()
          console.log(`🎯 FOUND PERFECT MATCH!`)
          console.log(`   Billing cycle: ${startDay}th to ${startDay-1}th of next month`)
          console.log(`   July period: ${testStart.toISOString().split('T')[0]} to ${testEnd.toISOString().split('T')[0]}`)

          console.log()
          console.log(`💰 MATCHING TRANSACTIONS:`)
          testSales.slice(0, 10).forEach((sale, index) => {
            console.log(`     ${index + 1}. ${sale.postDate.toISOString().split('T')[0]} | $${sale.amount.toLocaleString()} | ${sale.description}`)
          })
          if (testSales.length > 10) {
            console.log(`     ... and ${testSales.length - 10} more`)
          }

          return { startDay, testStart, testEnd, testSales, testTotal }
        }
      }
    } else {
      console.log('✅ USER EXPECTED PERIOD MATCHES PERFECTLY!')
    }

  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

analyzeJulyExample()