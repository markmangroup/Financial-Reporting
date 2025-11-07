// Analyze the $50K+ Miscellaneous category to find other potential miscategorizations
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

    // Office & Equipment
    'RESTORATION HARDWARE': { category: 'Office & Equipment', subcategory: 'Office Furniture' },
    'AMAZON': { category: 'Office & Equipment', subcategory: 'Office Supplies' },
    'STAPLES': { category: 'Office & Equipment', subcategory: 'Office Supplies' },

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

function analyzeMiscellaneous() {
  console.log('🔍 ANALYZING MISCELLANEOUS CATEGORY ($50K+ UNCATEGORIZED)')
  console.log()

  // Load credit card data
  const csvPath = path.join(__dirname, 'data', 'Chase8008_Activity20230929_20250929_20250929.CSV')
  const csvContent = fs.readFileSync(csvPath, 'utf-8')
  const lines = csvContent.trim().split('\n')

  const miscellaneousTransactions = []
  const vendorPatterns = {}

  // Process transactions and find uncategorized ones
  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].split(',')
    if (row.length >= 6) {
      const description = row[3]?.replace(/"/g, '').trim()
      const chaseCategory = row[4]?.replace(/"/g, '').trim()
      const typeStr = row[5]?.replace(/"/g, '').trim()
      const amountStr = row[6]?.replace(/"/g, '').trim()
      const amount = Math.abs(parseFloat(amountStr.replace(/[$,()]/g, '')))

      // Only process debit transactions (expenses)
      if (typeStr?.toLowerCase() !== 'payment' && !description.toLowerCase().includes('payment')) {
        const { category, subcategory } = categorizeCreditCardTransaction(description)

        if (category === 'Miscellaneous' && subcategory === 'Uncategorized') {
          miscellaneousTransactions.push({
            description,
            chaseCategory,
            amount,
            originalRow: row
          })

          // Extract potential vendor patterns
          const cleanDesc = description.toUpperCase()
          // Look for patterns like "VENDOR*", "VENDOR ", "VENDOR-"
          const patterns = [
            cleanDesc.split('*')[0],
            cleanDesc.split(' ')[0],
            cleanDesc.split('-')[0],
            cleanDesc.split('#')[0]
          ]

          patterns.forEach(pattern => {
            if (pattern && pattern.length >= 3) {
              vendorPatterns[pattern] = (vendorPatterns[pattern] || 0) + amount
            }
          })
        }
      }
    }
  }

  // Sort miscellaneous transactions by amount
  miscellaneousTransactions.sort((a, b) => b.amount - a.amount)

  console.log('💰 LARGEST MISCELLANEOUS TRANSACTIONS:')
  miscellaneousTransactions.slice(0, 20).forEach((tx, index) => {
    console.log(`${index + 1}. ${tx.description} - $${tx.amount.toLocaleString()}`)
    console.log(`   Chase Category: "${tx.chaseCategory}"`)
    console.log()
  })

  const totalMisc = miscellaneousTransactions.reduce((sum, tx) => sum + tx.amount, 0)
  console.log(`📊 TOTAL MISCELLANEOUS: $${totalMisc.toLocaleString()} (${miscellaneousTransactions.length} transactions)`)
  console.log()

  // Show vendor patterns that might be categorizable
  const significantVendors = Object.entries(vendorPatterns)
    .filter(([vendor, amount]) => amount >= 100) // Only show vendors with $100+ spending
    .sort(([,a], [,b]) => b - a)
    .slice(0, 15)

  console.log('🏪 SIGNIFICANT VENDOR PATTERNS IN MISCELLANEOUS:')
  significantVendors.forEach(([vendor, amount], index) => {
    console.log(`${index + 1}. "${vendor}*" - $${amount.toLocaleString()}`)
  })
  console.log()

  console.log('🎯 RECOMMENDATIONS FOR NEW MAPPINGS:')
  significantVendors.forEach(([vendor, amount]) => {
    let suggestion = 'Review manually'

    // Auto-suggest categories based on common patterns
    if (vendor.includes('BILL') || vendor.includes('PAY')) {
      suggestion = 'Bills & Utilities or Payments'
    } else if (vendor.includes('HOTEL') || vendor.includes('TRAVEL') || vendor.includes('AIR')) {
      suggestion = 'Travel & Transportation'
    } else if (vendor.includes('RESTAURANT') || vendor.includes('FOOD')) {
      suggestion = 'Meals & Entertainment'
    } else if (vendor.includes('OFFICE') || vendor.includes('SUPPLY')) {
      suggestion = 'Office & Equipment'
    } else if (vendor.includes('SOFTWARE') || vendor.includes('TECH') || vendor.includes('DIGITAL')) {
      suggestion = 'Software & Subscriptions'
    }

    console.log(`  • "${vendor}" ($${amount.toLocaleString()}) → Consider: ${suggestion}`)
  })
  console.log()

  console.log('📝 NEXT STEPS:')
  console.log('  1. Review the largest transactions manually')
  console.log('  2. Add vendor mappings for significant patterns')
  console.log('  3. Target reducing miscellaneous from $50K to <$10K')
  console.log('  4. Focus on vendors with $500+ total spending first')
}

analyzeMiscellaneous()