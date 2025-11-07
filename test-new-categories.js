// Test the new vendor-based categorization system
const fs = require('fs')
const path = require('path')

// Copy the categorization function from the TypeScript file
function categorizeCreditCardTransaction(description) {
  const upperDesc = description.toUpperCase()

  const VENDOR_CATEGORY_MAPPING = {
    // AI & Software Development Services (Most common expenses)
    'ANTHROPIC': { category: 'Software & Subscriptions', subcategory: 'AI Services' },
    'OPENAI': { category: 'Software & Subscriptions', subcategory: 'AI Services' },
    'CHATGPT': { category: 'Software & Subscriptions', subcategory: 'AI Services' },
    'MIDJOURNEY': { category: 'Software & Subscriptions', subcategory: 'AI Services' },
    'GITHUB': { category: 'Software & Subscriptions', subcategory: 'Development Tools' },
    'VERCEL': { category: 'Software & Subscriptions', subcategory: 'Cloud Services' },
    'MONGODBCLOUD': { category: 'Software & Subscriptions', subcategory: 'Cloud Services' },
    'FIVERR': { category: 'Software & Subscriptions', subcategory: 'Freelance Services' },
    'UPWORK': { category: 'Software & Subscriptions', subcategory: 'Freelance Services' }, // ~$39K in freelance development

    // Cloud & Infrastructure
    'MICROSOFT': { category: 'Software & Subscriptions', subcategory: 'Office Software' },
    'GOOGLE': { category: 'Software & Subscriptions', subcategory: 'Cloud Services' },
    'AWS': { category: 'Software & Subscriptions', subcategory: 'Cloud Services' },
    'FIREBASE': { category: 'Software & Subscriptions', subcategory: 'Cloud Services' },
    'YOUTUBE': { category: 'Software & Subscriptions', subcategory: 'Media Services' },
    'GODADDY': { category: 'Software & Subscriptions', subcategory: 'Domain & Hosting' },

    // Transportation (High volume - Tesla charging)
    'TESLA SUPERCHARGER': { category: 'Travel & Transportation', subcategory: 'Vehicle Fuel' },
    'UBER': { category: 'Travel & Transportation', subcategory: 'Ground Transportation' },
    'DELTA AIR': { category: 'Travel & Transportation', subcategory: 'Air Travel' },
    'AMERICAN AIRLINES': { category: 'Travel & Transportation', subcategory: 'Air Travel' },
    'UNITED': { category: 'Travel & Transportation', subcategory: 'Air Travel' },
    'TOBACCO ROAD HARLEY': { category: 'Travel & Transportation', subcategory: 'Vehicle Maintenance' }, // Motorcycle expenses

    // Office & Real Estate (MUST come before restaurant patterns)
    'YSI*HIGHLAND': { category: 'Office & Real Estate', subcategory: 'Office Rent' }, // Matches "YSI*Highland North Hills"
    'YSI*': { category: 'Office & Real Estate', subcategory: 'Office Rent' }, // Property management company

    // Business Meals & Entertainment
    'BAR TACO NORTH HILLS': { category: 'Meals & Entertainment', subcategory: 'Client Meals' },
    'BAR TACO': { category: 'Meals & Entertainment', subcategory: 'Client Meals' },
    'RUTH\'S CHRIS': { category: 'Meals & Entertainment', subcategory: 'Client Meals' },
    'FIREBIRDS': { category: 'Meals & Entertainment', subcategory: 'Client Meals' },
    'CAPITAL GRILLE': { category: 'Meals & Entertainment', subcategory: 'Client Meals' },
    'RH RALEIGH RESTAURANT': { category: 'Meals & Entertainment', subcategory: 'Client Meals' },
    'J ALEXANDER': { category: 'Meals & Entertainment', subcategory: 'Client Meals' },
    'YARD HOUSE': { category: 'Meals & Entertainment', subcategory: 'Client Meals' },
    'ANGUS BARN': { category: 'Meals & Entertainment', subcategory: 'Client Meals' },
    'TST*': { category: 'Meals & Entertainment', subcategory: 'Client Meals' },

    // Utilities & Bills
    'ATT*BILL': { category: 'Bills & Utilities', subcategory: 'Telecommunications' },
    'SPECTRUM': { category: 'Bills & Utilities', subcategory: 'Internet' },
    'DUKE-ENERGY': { category: 'Bills & Utilities', subcategory: 'Electricity' },
    'SPI*DUKE-ENERGY': { category: 'Bills & Utilities', subcategory: 'Electricity' },
    'GOV*': { category: 'Bills & Utilities', subcategory: 'Government Fees' }, // DMV, permits, licenses

    // Office & Equipment
    'RESTORATION HARDWARE': { category: 'Office & Equipment', subcategory: 'Office Furniture' },
    'AMAZON': { category: 'Office & Equipment', subcategory: 'Office Supplies' },
    'STAPLES': { category: 'Office & Equipment', subcategory: 'Office Supplies' },
    'APPLE STORE': { category: 'Office & Equipment', subcategory: 'Technology Equipment' }, // ~$4.5K in tech purchases
    'COSTCO WHSE': { category: 'Office & Equipment', subcategory: 'Office Supplies' }, // Bulk office supplies

    // Bank & Financial
    'ANNUAL MEMBERSHIP FEE': { category: 'Bank Fees', subcategory: 'Annual Fees' },
    'INTEREST CHARGE': { category: 'Bank Fees', subcategory: 'Interest & Fees' },
    'LATE FEE': { category: 'Bank Fees', subcategory: 'Interest & Fees' },

    // Payments (Should be excluded from expense analysis)
    'AUTOMATIC PAYMENT': { category: 'Payments', subcategory: 'Credit Card Payment' },
    'PAYMENT THANK YOU': { category: 'Payments', subcategory: 'Credit Card Payment' },
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

  // Pattern-based categorization for common business patterns
  if (upperDesc.includes('PAYMENT') || upperDesc.includes('AUTOPAY')) {
    return { category: 'Payments', subcategory: 'Credit Card Payment' }
  }

  if (upperDesc.includes('INTEREST') || upperDesc.includes('FEE') || upperDesc.includes('ANNUAL')) {
    return { category: 'Bank Fees', subcategory: 'Interest & Fees' }
  }

  if (upperDesc.includes('TRANSFER')) {
    return { category: 'Transfers', subcategory: 'Account Transfer' }
  }

  // Restaurant/dining patterns (fallback for unmapped restaurants)
  if (upperDesc.includes('RESTAURANT') || upperDesc.includes('GRILL') ||
      upperDesc.includes('BISTRO') || upperDesc.includes('CAFE') ||
      upperDesc.includes('STEAKHOUSE') || upperDesc.includes('TAVERN')) {
    return { category: 'Meals & Entertainment', subcategory: 'Client Meals' }
  }

  // Software/SaaS patterns (fallback for unmapped services)
  if (upperDesc.includes('*') && (upperDesc.includes('SUBSCRIPTION') ||
      upperDesc.includes('MONTHLY') || upperDesc.includes('ANNUAL'))) {
    return { category: 'Software & Subscriptions', subcategory: 'Subscription Services' }
  }

  // Default categorization for unmatched transactions
  return { category: 'Miscellaneous', subcategory: 'Uncategorized' }
}

function testNewCategorization() {
  console.log('🧪 TESTING NEW VENDOR-BASED CATEGORIZATION')
  console.log()

  // Load credit card data
  const csvPath = path.join(__dirname, 'data', 'Chase8008_Activity20230929_20250929_20250929.CSV')
  const csvContent = fs.readFileSync(csvPath, 'utf-8')
  const lines = csvContent.trim().split('\n')

  const categoryTotals = {}
  const testSamples = []

  // Process transactions and categorize
  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].split(',')
    if (row.length >= 6) {
      const description = row[3]?.replace(/"/g, '').trim()
      const chaseCategory = row[4]?.replace(/"/g, '').trim()
      const typeStr = row[5]?.replace(/"/g, '').trim()
      const amountStr = row[6]?.replace(/"/g, '').trim()
      const amount = Math.abs(parseFloat(amountStr.replace(/[$,()]/g, '')))

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

      const { category, subcategory } = categorizeCreditCardTransaction(description)
      const fullCategory = `${category} - ${subcategory}`

      // Track category spending with return logic (same as parser)
      if (transactionType === 'debit') {
        categoryTotals[fullCategory] = (categoryTotals[fullCategory] || 0) + amount
      } else if (transactionType === 'credit' &&
                 (typeStr?.toLowerCase().includes('return') ||
                  typeStr?.toLowerCase().includes('refund') ||
                  description.toLowerCase().includes('return') ||
                  description.toLowerCase().includes('refund'))) {
        categoryTotals[fullCategory] = (categoryTotals[fullCategory] || 0) - amount
      }

      // Only collect samples for non-payment transactions
      if (transactionType !== 'credit' || typeStr?.toLowerCase().includes('return')) {

        // Collect interesting samples
        if (testSamples.length < 20) {
          testSamples.push({
            description,
            chaseCategory,
            newCategory: fullCategory,
            amount
          })
        }
      }
    }
  }

  // Show samples of categorization
  console.log('📝 SAMPLE CATEGORIZATIONS:')
  testSamples.forEach((sample, index) => {
    console.log(`${index + 1}. ${sample.description}`)
    console.log(`   Chase: "${sample.chaseCategory}" → New: "${sample.newCategory}"`)
    console.log(`   Amount: $${sample.amount.toLocaleString()}`)
    console.log()
  })

  // Show category totals
  const sortedCategories = Object.entries(categoryTotals)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)

  console.log('💰 TOP 10 NEW CATEGORIES BY SPENDING:')
  sortedCategories.forEach(([category, amount], index) => {
    console.log(`${index + 1}. ${category}: $${amount.toLocaleString()}`)
  })
  console.log()

  const totalSpending = Object.values(categoryTotals).reduce((sum, amount) => sum + amount, 0)
  const miscellaneousSpending = categoryTotals['Miscellaneous - Uncategorized'] || 0
  const categorizedPercentage = ((totalSpending - miscellaneousSpending) / totalSpending) * 100

  console.log('📊 CATEGORIZATION EFFECTIVENESS:')
  console.log(`Total Spending: $${totalSpending.toLocaleString()}`)
  console.log(`Miscellaneous: $${miscellaneousSpending.toLocaleString()} (${(miscellaneousSpending/totalSpending*100).toFixed(1)}%)`)
  console.log(`Categorized: ${categorizedPercentage.toFixed(1)}%`)
  console.log()

  console.log('✅ IMPROVEMENTS MADE:')
  console.log('  • Tesla Supercharger → Travel & Transportation - Vehicle Fuel')
  console.log('  • ANTHROPIC → Software & Subscriptions - AI Services')
  console.log('  • Business dining → Meals & Entertainment - Client Meals')
  console.log('  • ATT*BILL → Bills & Utilities - Telecommunications')
  console.log('  • GitHub, Vercel → Software & Subscriptions - Development Tools/Cloud')
}

testNewCategorization()