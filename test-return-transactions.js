// Test return transaction handling for Highland North Hills
const fs = require('fs')
const path = require('path')

// Copy the updated categorization function from the TypeScript file
function categorizeCreditCardTransaction(description) {
  const upperDesc = description.toUpperCase()

  const VENDOR_CATEGORY_MAPPING = {
    // Office & Real Estate (MUST come before restaurant patterns)
    'YSI*HIGHLAND': { category: 'Office & Real Estate', subcategory: 'Office Rent' }, // Matches "YSI*Highland North Hills"
    'YSI*': { category: 'Office & Real Estate', subcategory: 'Office Rent' }, // Property management company
    // ... other mappings would be here
  }

  // Check for vendor-specific matches first (most specific)
  for (const [vendor, mapping] of Object.entries(VENDOR_CATEGORY_MAPPING)) {
    if (upperDesc.includes(vendor)) {
      return {
        category: mapping.category,
        subcategory: mapping.subcategory
      }
    }
  }

  return { category: 'Miscellaneous', subcategory: 'Uncategorized' }
}

function testReturnTransactions() {
  console.log('🔄 TESTING RETURN TRANSACTION HANDLING')
  console.log()

  // Load credit card data
  const csvPath = path.join(__dirname, 'data', 'Chase8008_Activity20230929_20250929_20250929.CSV')
  const csvContent = fs.readFileSync(csvPath, 'utf-8')
  const lines = csvContent.trim().split('\n')

  const categoryBreakdown = {}
  const allTransactions = []
  const highlandTransactions = []

  // Process transactions with the same logic as the parser
  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].split(',')
    if (row.length >= 6) {
      const dateStr = row[1]?.replace(/"/g, '').trim()
      const description = row[3]?.replace(/"/g, '').trim()
      const chaseCategory = row[4]?.replace(/"/g, '').trim()
      const typeStr = row[5]?.replace(/"/g, '').trim()
      const amountStr = row[6]?.replace(/"/g, '').trim()
      const amount = Math.abs(parseFloat(amountStr.replace(/[$,()]/g, '')))

      if (isNaN(amount)) continue

      // Apply same transaction type logic as the parser
      let transactionType = 'debit'
      if (typeStr?.toLowerCase().includes('payment') ||
          description.toLowerCase().includes('payment') ||
          description.toLowerCase().includes('autopay')) {
        transactionType = 'credit'
      } else if (typeStr?.toLowerCase().includes('return') ||
                 typeStr?.toLowerCase().includes('refund') ||
                 description.toLowerCase().includes('return') ||
                 description.toLowerCase().includes('refund')) {
        transactionType = 'credit'
      }

      // Categorize
      const { category, subcategory } = categorizeCreditCardTransaction(description)
      const fullCategory = `${category} - ${subcategory}`

      // Track category spending with return logic
      if (transactionType === 'debit') {
        categoryBreakdown[fullCategory] = (categoryBreakdown[fullCategory] || 0) + amount
      } else if (transactionType === 'credit' &&
                 (typeStr?.toLowerCase().includes('return') ||
                  typeStr?.toLowerCase().includes('refund') ||
                  description.toLowerCase().includes('return') ||
                  description.toLowerCase().includes('refund'))) {
        categoryBreakdown[fullCategory] = (categoryBreakdown[fullCategory] || 0) - amount
      }

      // Collect all transactions for analysis
      allTransactions.push({
        date: dateStr,
        description,
        chaseCategory,
        typeStr,
        amount,
        transactionType,
        fullCategory
      })

      // Focus on Highland transactions
      if (description.includes('Highland') || description.includes('YSI*')) {
        highlandTransactions.push({
          date: dateStr,
          description,
          typeStr,
          amount,
          transactionType,
          fullCategory,
          originalAmount: amountStr
        })
      }
    }
  }

  console.log('🏢 HIGHLAND NORTH HILLS TRANSACTION ANALYSIS:')
  console.log()

  highlandTransactions
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .forEach((tx, index) => {
      const sign = tx.transactionType === 'credit' ? '+' : '-'
      console.log(`${index + 1}. ${tx.date}: ${tx.description}`)
      console.log(`   Type: ${tx.typeStr} → ${tx.transactionType.toUpperCase()}`)
      console.log(`   Amount: ${sign}$${tx.amount.toLocaleString()} (Original: ${tx.originalAmount})`)
      console.log(`   Category: ${tx.fullCategory}`)
      console.log()
    })

  const officeRentTotal = categoryBreakdown['Office & Real Estate - Office Rent'] || 0
  console.log('📊 HIGHLAND OFFICE RENT CATEGORY TOTAL:')
  console.log(`   Net Total: $${officeRentTotal.toLocaleString()}`)
  console.log()

  const returnTransactions = highlandTransactions.filter(tx => tx.transactionType === 'credit')
  const saleTransactions = highlandTransactions.filter(tx => tx.transactionType === 'debit')

  console.log('💰 BREAKDOWN:')
  console.log(`   Sale Transactions: ${saleTransactions.length} transactions, $${saleTransactions.reduce((sum, tx) => sum + tx.amount, 0).toLocaleString()}`)
  console.log(`   Return Transactions: ${returnTransactions.length} transactions, $${returnTransactions.reduce((sum, tx) => sum + tx.amount, 0).toLocaleString()}`)
  console.log(`   Net Total: $${officeRentTotal.toLocaleString()}`)
  console.log()

  console.log('✅ EXPECTED BEHAVIOR:')
  console.log('  • Return transactions should REDUCE the Office Rent category total')
  console.log('  • Net total should be lower than the sum of all Sale transactions')
  console.log('  • Highland return on 08/03/2025 should offset the sale on same date')

  const expectedTotal = saleTransactions.reduce((sum, tx) => sum + tx.amount, 0) - returnTransactions.reduce((sum, tx) => sum + tx.amount, 0)
  console.log(`  • Expected Net: $${expectedTotal.toLocaleString()} (${expectedTotal === officeRentTotal ? '✅ MATCHES' : '❌ MISMATCH'})`)
}

testReturnTransactions()