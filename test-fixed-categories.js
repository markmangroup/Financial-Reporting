// Test the corrected Highland North Hills categorization
const fs = require('fs')
const path = require('path')

function testHighlandCategorization() {
  console.log('🏢 TESTING HIGHLAND NORTH HILLS CATEGORIZATION FIX')
  console.log()

  // Load credit card data
  const csvPath = path.join(__dirname, 'data', 'Chase8008_Activity20230929_20250929_20250929.CSV')
  const csvContent = fs.readFileSync(csvPath, 'utf-8')
  const lines = csvContent.trim().split('\n')

  // Find Highland North Hills transactions
  const highlandTransactions = []
  const barTacoTransactions = []

  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].split(',')
    if (row.length >= 6) {
      const description = row[3]?.replace(/"/g, '').trim()
      const amountStr = row[6]?.replace(/"/g, '').trim()
      const amount = Math.abs(parseFloat(amountStr.replace(/[$,()]/g, '')))

      if (description.includes('YSI*Highland') || description.includes('YSI*HIGHLAND')) {
        highlandTransactions.push({ description, amount })
      }
      if (description.includes('BAR TACO NORTH HILLS')) {
        barTacoTransactions.push({ description, amount })
      }
    }
  }

  console.log('🔍 YSI*Highland Transactions (Should be Office Rent):')
  highlandTransactions.slice(0, 5).forEach((tx, index) => {
    console.log(`  ${index + 1}. ${tx.description} - $${tx.amount.toLocaleString()}`)
  })
  console.log(`  Total YSI*Highland: ${highlandTransactions.length} transactions, $${highlandTransactions.reduce((sum, tx) => sum + tx.amount, 0).toLocaleString()}`)
  console.log()

  console.log('🍽️ BAR TACO NORTH HILLS Transactions (Should be Client Meals):')
  barTacoTransactions.slice(0, 5).forEach((tx, index) => {
    console.log(`  ${index + 1}. ${tx.description} - $${tx.amount.toLocaleString()}`)
  })
  console.log(`  Total Bar Taco: ${barTacoTransactions.length} transactions, $${barTacoTransactions.reduce((sum, tx) => sum + tx.amount, 0).toLocaleString()}`)
  console.log()

  console.log('✅ EXPECTED RESULTS AFTER FIX:')
  console.log('  • YSI*Highland North Hills → Office & Real Estate - Office Rent')
  console.log('  • BAR TACO NORTH HILLS → Meals & Entertainment - Client Meals')
  console.log('  • Highland office rent should be ~$100K+ (not in meals category)')
  console.log('  • Meals category should be much smaller, realistic for client meals')
}

testHighlandCategorization()