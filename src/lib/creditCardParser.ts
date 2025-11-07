import { ParsedCSVData, BankTransaction, AccountSummary } from '@/types'

export interface CreditCardTransaction {
  date: Date
  description: string
  category: string
  type: 'debit' | 'credit'
  amount: number
  balance?: number
  memo?: string
  originalRow: string[]
  // Enhanced parsed data for filtering
  cardNumber?: string
  postDate?: Date
  chaseCategory?: string
  chaseType?: string // Sale, Payment, Return, etc.
  vendor?: string // Extracted from description
  // Hierarchical categorization
  majorCategory?: string // Top-level grouping (Operating Expenses, Travel, etc.)
  subCategory?: string // Mid-level category (Software & Subscriptions, etc.)
  detailCategory?: string // Detailed subcategory (AI Services, etc.)
}

export interface CreditCardData {
  transactions: CreditCardTransaction[]
  summary: {
    totalDebits: number
    totalCredits: number
    netAmount: number
    transactionCount: number
    dateRange: {
      start: string
      end: string
    }
    categoryBreakdown: Record<string, number>
  }
}

// Enhanced vendor-based category mapping for business expense classification
const VENDOR_CATEGORY_MAPPING: Record<string, {
  majorCategory: string
  category: string
  subcategory: string
}> = {
  // AI & Software Development Services (Most common expenses)
  'ANTHROPIC': { majorCategory: 'Operating Expenses', category: 'Software & Subscriptions', subcategory: 'AI Services' },
  'OPENAI': { majorCategory: 'Operating Expenses', category: 'Software & Subscriptions', subcategory: 'AI Services' },
  'CHATGPT': { majorCategory: 'Operating Expenses', category: 'Software & Subscriptions', subcategory: 'AI Services' },
  'MIDJOURNEY': { majorCategory: 'Operating Expenses', category: 'Software & Subscriptions', subcategory: 'AI Services' },
  'GITHUB': { majorCategory: 'Operating Expenses', category: 'Software & Subscriptions', subcategory: 'Development Tools' },
  'VERCEL': { majorCategory: 'Operating Expenses', category: 'Software & Subscriptions', subcategory: 'Cloud Services' },
  'MONGODBCLOUD': { majorCategory: 'Operating Expenses', category: 'Software & Subscriptions', subcategory: 'Cloud Services' },
  'FIVERR': { majorCategory: 'Operating Expenses', category: 'Software & Subscriptions', subcategory: 'Freelance Services' },
  'UPWORK': { majorCategory: 'Operating Expenses', category: 'Software & Subscriptions', subcategory: 'Freelance Services' },
  'PANDADOC': { majorCategory: 'Operating Expenses', category: 'Software & Subscriptions', subcategory: 'Document Management' },
  'ESET': { majorCategory: 'Operating Expenses', category: 'Software & Subscriptions', subcategory: 'Security Software' },
  'ELEMENTOR': { majorCategory: 'Operating Expenses', category: 'Software & Subscriptions', subcategory: 'Website Builder' },
  'SQUARESPACE': { majorCategory: 'Operating Expenses', category: 'Software & Subscriptions', subcategory: 'Website Hosting' },
  'BILL*BILL': { majorCategory: 'Operating Expenses', category: 'Software & Subscriptions', subcategory: 'Payment Processing' },

  // Cloud & Infrastructure
  'MICROSOFT': { majorCategory: 'Operating Expenses', category: 'Software & Subscriptions', subcategory: 'Office Software' },
  'GOOGLE': { majorCategory: 'Operating Expenses', category: 'Software & Subscriptions', subcategory: 'Cloud Services' },
  'AWS': { majorCategory: 'Operating Expenses', category: 'Software & Subscriptions', subcategory: 'Cloud Services' },
  'FIREBASE': { majorCategory: 'Operating Expenses', category: 'Software & Subscriptions', subcategory: 'Cloud Services' },
  'YOUTUBE': { majorCategory: 'Operating Expenses', category: 'Software & Subscriptions', subcategory: 'Media Services' },
  'GODADDY': { majorCategory: 'Operating Expenses', category: 'Software & Subscriptions', subcategory: 'Domain & Hosting' },

  // Transportation (High volume - Tesla charging)
  'TESLA SUPERCHARGER': { majorCategory: 'Travel', category: 'Travel & Transportation', subcategory: 'Vehicle Fuel' },
  'TESLA SERVICE': { majorCategory: 'Travel', category: 'Travel & Transportation', subcategory: 'Vehicle Maintenance' },
  'UBER': { majorCategory: 'Travel', category: 'Travel & Transportation', subcategory: 'Ground Transportation' },
  'DELTA AIR': { majorCategory: 'Travel', category: 'Travel & Transportation', subcategory: 'Air Travel' },
  'AMERICAN AIRLINES': { majorCategory: 'Travel', category: 'Travel & Transportation', subcategory: 'Air Travel' },
  'UNITED': { majorCategory: 'Travel', category: 'Travel & Transportation', subcategory: 'Air Travel' },
  'TOBACCO ROAD HARLEY': { majorCategory: 'Travel', category: 'Travel & Transportation', subcategory: 'Vehicle Maintenance' }, // Motorcycle expenses

  // Hotels & Lodging
  'RENAISSANCE': { majorCategory: 'Travel', category: 'Travel & Lodging', subcategory: 'Hotels' },
  'WESTIN': { majorCategory: 'Travel', category: 'Travel & Lodging', subcategory: 'Hotels' },
  'W SAN FRANCISCO': { majorCategory: 'Travel', category: 'Travel & Lodging', subcategory: 'Hotels' },
  'MARRIOTT': { majorCategory: 'Travel', category: 'Travel & Lodging', subcategory: 'Hotels' },
  'HILTON': { majorCategory: 'Travel', category: 'Travel & Lodging', subcategory: 'Hotels' },
  'HYATT': { majorCategory: 'Travel', category: 'Travel & Lodging', subcategory: 'Hotels' },

  // Office & Real Estate (MUST come before restaurant patterns)
  'YSI*HIGHLAND': { majorCategory: 'Operating Expenses', category: 'Office & Real Estate', subcategory: 'Office Rent' }, // Matches "YSI*Highland North Hills"
  'YSI*': { majorCategory: 'Operating Expenses', category: 'Office & Real Estate', subcategory: 'Office Rent' }, // Property management company

  // Business Meals & Entertainment
  'BAR TACO NORTH HILLS': { majorCategory: 'Meals & Entertainment', category: 'Meals & Entertainment', subcategory: 'Client Meals' },
  'BAR TACO': { majorCategory: 'Meals & Entertainment', category: 'Meals & Entertainment', subcategory: 'Client Meals' },
  'RUTH\'S CHRIS': { majorCategory: 'Meals & Entertainment', category: 'Meals & Entertainment', subcategory: 'Client Meals' },
  'FIREBIRDS': { majorCategory: 'Meals & Entertainment', category: 'Meals & Entertainment', subcategory: 'Client Meals' },
  'CAPITAL GRILLE': { majorCategory: 'Meals & Entertainment', category: 'Meals & Entertainment', subcategory: 'Client Meals' },
  'RH RALEIGH RESTAURANT': { majorCategory: 'Meals & Entertainment', category: 'Meals & Entertainment', subcategory: 'Client Meals' },
  'J ALEXANDER': { majorCategory: 'Meals & Entertainment', category: 'Meals & Entertainment', subcategory: 'Client Meals' },
  'YARD HOUSE': { majorCategory: 'Meals & Entertainment', category: 'Meals & Entertainment', subcategory: 'Client Meals' },
  'ANGUS BARN': { majorCategory: 'Meals & Entertainment', category: 'Meals & Entertainment', subcategory: 'Client Meals' },
  'TST*': { majorCategory: 'Meals & Entertainment', category: 'Meals & Entertainment', subcategory: 'Client Meals' }, // The Steakhouse brands
  'CLYDES': { majorCategory: 'Meals & Entertainment', category: 'Meals & Entertainment', subcategory: 'Client Meals' },
  'PICCOLO FORNO': { majorCategory: 'Meals & Entertainment', category: 'Meals & Entertainment', subcategory: 'Client Meals' },
  'UMSTEAD': { majorCategory: 'Meals & Entertainment', category: 'Meals & Entertainment', subcategory: 'Client Meals' },
  'CHUY\'S': { majorCategory: 'Meals & Entertainment', category: 'Meals & Entertainment', subcategory: 'Client Meals' },
  'GOODNIGHTS': { majorCategory: 'Meals & Entertainment', category: 'Meals & Entertainment', subcategory: 'Client Meals' },
  'LAWRENCE FOOD CO': { majorCategory: 'Meals & Entertainment', category: 'Meals & Entertainment', subcategory: 'Client Meals' },
  'CHUKO RAMEN': { majorCategory: 'Meals & Entertainment', category: 'Meals & Entertainment', subcategory: 'Client Meals' },
  'CAVA': { majorCategory: 'Meals & Entertainment', category: 'Meals & Entertainment', subcategory: 'Client Meals' },
  'COQUETTE': { majorCategory: 'Meals & Entertainment', category: 'Meals & Entertainment', subcategory: 'Client Meals' },
  'SHARKYS': { majorCategory: 'Meals & Entertainment', category: 'Meals & Entertainment', subcategory: 'Client Meals' },

  // Team Events & Entertainment
  'CARY SPORTS': { majorCategory: 'Meals & Entertainment', category: 'Meals & Entertainment', subcategory: 'Team Events' },
  'TOP GOLF': { majorCategory: 'Meals & Entertainment', category: 'Meals & Entertainment', subcategory: 'Team Events' },

  // Utilities & Bills
  'ATT*BILL': { majorCategory: 'Operating Expenses', category: 'Bills & Utilities', subcategory: 'Telecommunications' },
  'SPECTRUM': { majorCategory: 'Operating Expenses', category: 'Bills & Utilities', subcategory: 'Internet' },
  'DUKE-ENERGY': { majorCategory: 'Operating Expenses', category: 'Bills & Utilities', subcategory: 'Electricity' },
  'SPI*DUKE-ENERGY': { majorCategory: 'Operating Expenses', category: 'Bills & Utilities', subcategory: 'Electricity' },
  'GOV*': { majorCategory: 'Operating Expenses', category: 'Bills & Utilities', subcategory: 'Government Fees' }, // DMV, permits, licenses
  'STATE FARM': { majorCategory: 'Operating Expenses', category: 'Bills & Utilities', subcategory: 'Insurance' },

  // Office & Equipment
  'RESTORATION HARDWARE': { majorCategory: 'Operating Expenses', category: 'Office & Equipment', subcategory: 'Office Furniture' },
  'AMAZON': { majorCategory: 'Operating Expenses', category: 'Office & Equipment', subcategory: 'Office Supplies' },
  'STAPLES': { majorCategory: 'Operating Expenses', category: 'Office & Equipment', subcategory: 'Office Supplies' },
  'APPLE STORE': { majorCategory: 'Operating Expenses', category: 'Office & Equipment', subcategory: 'Technology Equipment' }, // ~$4.5K in tech purchases
  'COSTCO WHSE': { majorCategory: 'Operating Expenses', category: 'Office & Equipment', subcategory: 'Office Supplies' }, // Bulk office supplies

  // Bank & Financial
  'ANNUAL MEMBERSHIP FEE': { majorCategory: 'Payments & Fees', category: 'Bank Fees', subcategory: 'Annual Fees' },
  'INTEREST CHARGE': { majorCategory: 'Payments & Fees', category: 'Bank Fees', subcategory: 'Interest & Fees' },
  'LATE FEE': { majorCategory: 'Payments & Fees', category: 'Bank Fees', subcategory: 'Interest & Fees' },

  // Payments (Should be excluded from expense analysis)
  'AUTOMATIC PAYMENT': { majorCategory: 'Payments & Fees', category: 'Payments', subcategory: 'Credit Card Payment' },
  'PAYMENT THANK YOU': { majorCategory: 'Payments & Fees', category: 'Payments', subcategory: 'Credit Card Payment' },
}

export function categorizeCreditCardTransaction(description: string, amount?: number): {
  majorCategory: string
  category: string
  subcategory: string
} {
  const upperDesc = description.toUpperCase()

  // Check for vendor-specific matches first (most specific)
  for (const [vendor, mapping] of Object.entries(VENDOR_CATEGORY_MAPPING)) {
    if (upperDesc.includes(vendor)) {
      return {
        majorCategory: mapping.majorCategory,
        category: mapping.category,
        subcategory: mapping.subcategory
      }
    }
  }

  // Filter out test transactions and self-payments (very small amounts)
  if (amount !== undefined && Math.abs(amount) <= 1.00) {
    if (upperDesc.includes('MARKMAN GROUP') || upperDesc.includes('TEST')) {
      return { majorCategory: 'Excluded', category: 'Excluded', subcategory: 'Test Transaction' }
    }
  }

  // Pattern-based categorization for common business patterns
  if (upperDesc.includes('PAYMENT') || upperDesc.includes('AUTOPAY')) {
    return { majorCategory: 'Payments & Fees', category: 'Payments', subcategory: 'Credit Card Payment' }
  }

  if (upperDesc.includes('INTEREST') || upperDesc.includes('FEE') || upperDesc.includes('ANNUAL')) {
    return { majorCategory: 'Payments & Fees', category: 'Bank Fees', subcategory: 'Interest & Fees' }
  }

  if (upperDesc.includes('TRANSFER')) {
    return { majorCategory: 'Payments & Fees', category: 'Transfers', subcategory: 'Account Transfer' }
  }

  // Restaurant/dining patterns (fallback for unmapped restaurants)
  if (upperDesc.includes('RESTAURANT') || upperDesc.includes('GRILL') ||
      upperDesc.includes('BISTRO') || upperDesc.includes('CAFE') ||
      upperDesc.includes('STEAKHOUSE') || upperDesc.includes('TAVERN')) {
    return { majorCategory: 'Meals & Entertainment', category: 'Meals & Entertainment', subcategory: 'Client Meals' }
  }

  // Software/SaaS patterns (fallback for unmapped services)
  if (upperDesc.includes('*') && (upperDesc.includes('SUBSCRIPTION') ||
      upperDesc.includes('MONTHLY') || upperDesc.includes('ANNUAL'))) {
    return { majorCategory: 'Operating Expenses', category: 'Software & Subscriptions', subcategory: 'Subscription Services' }
  }

  // Default categorization for unmatched transactions
  return { majorCategory: 'Uncategorized', category: 'Miscellaneous', subcategory: 'Uncategorized' }
}

// Extract vendor name from transaction description
function extractVendor(description: string): string {
  const cleanDesc = description.toUpperCase().trim()

  // Check for known vendors first
  for (const vendor of Object.keys(VENDOR_CATEGORY_MAPPING)) {
    if (cleanDesc.includes(vendor)) {
      return vendor
    }
  }

  // Extract first meaningful word/phrase as vendor
  const words = cleanDesc.split(/[\s\*\-]+/)
  if (words.length > 0 && words[0].length > 2) {
    return words[0]
  }

  return 'Unknown'
}

export function parseCreditCardCSV(csvContent: string): CreditCardData {
  const lines = csvContent.trim().split('\n')

  if (lines.length < 2) {
    throw new Error('Invalid CSV format: insufficient data')
  }

  // Parse header to understand column structure
  const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim())
  console.log('Credit Card CSV Headers:', headers)

  const transactions: CreditCardTransaction[] = []
  let totalDebits = 0
  let totalCredits = 0
  const categoryBreakdown: Record<string, number> = {}
  let minDate = new Date()
  let maxDate = new Date(0)

  // Process each transaction row
  for (let i = 1; i < lines.length; i++) {
    try {
      const row = lines[i].split(',').map(cell => cell.replace(/"/g, '').trim())

      if (row.length < 6) {
        console.warn(`Skipping malformed row ${i}: insufficient columns (${row.length})`)
        continue
      }

      // Map Chase credit card CSV format based on discovered structure
      // Headers: Card, Transaction Date, Post Date, Description, Category, Type, Amount, Memo
      const cardNumber = row[0] // Card
      const dateStr = row[1] // Transaction Date
      const postDateStr = row[2] // Post Date
      const description = row[3] // Description
      const chaseCategory = row[4] || 'Uncategorized' // Chase's original Category
      const chaseType = row[5] // Type (Sale, Payment, Return)
      const amountStr = row[6] // Amount

      // Parse date
      const transactionDate = new Date(dateStr)
      if (isNaN(transactionDate.getTime())) {
        console.warn(`Skipping row ${i}: invalid date '${dateStr}'`)
        continue
      }

      // Parse amount - handle negative values and currency formatting
      const cleanAmount = amountStr.replace(/[$,()]/g, '')
      const amount = Math.abs(parseFloat(cleanAmount))

      if (isNaN(amount)) {
        console.warn(`Skipping row ${i}: invalid amount '${amountStr}'`)
        continue
      }

      // Determine transaction type based on Chase credit card CSV format
      // Chase Format: Charges/Expenses = "Sale" type with negative amounts (these are DEBITS)
      //              Payments = "Payment" type with positive amounts (these are CREDITS)
      //              Returns = "Return" type with positive amounts (these are CREDITS - refunds/reversals)
      let transactionType: 'debit' | 'credit' = 'debit'

      if (chaseType?.toLowerCase().includes('payment') ||
          description.toLowerCase().includes('payment') ||
          description.toLowerCase().includes('autopay')) {
        // This is a payment TO the credit card (credit)
        transactionType = 'credit'
        totalCredits += amount
      } else if (chaseType?.toLowerCase().includes('return') ||
                 chaseType?.toLowerCase().includes('refund') ||
                 description.toLowerCase().includes('return') ||
                 description.toLowerCase().includes('refund')) {
        // This is a return/refund (credit that reduces category spending)
        transactionType = 'credit'
        totalCredits += amount
      } else {
        // This is a charge/expense (debit) - most transactions
        transactionType = 'debit'
        totalDebits += amount
      }

      // Categorize transaction (pass amount for test transaction detection)
      const { majorCategory, category, subcategory } = categorizeCreditCardTransaction(description, amount)
      const fullCategory = subcategory ? `${category} - ${subcategory}` : category

      // Track category spending - debits add to spending, credits (returns/refunds) reduce spending
      if (transactionType === 'debit') {
        categoryBreakdown[fullCategory] = (categoryBreakdown[fullCategory] || 0) + amount
      } else if (transactionType === 'credit' &&
                 (chaseType?.toLowerCase().includes('return') ||
                  chaseType?.toLowerCase().includes('refund') ||
                  description.toLowerCase().includes('return') ||
                  description.toLowerCase().includes('refund'))) {
        // Returns/refunds reduce the category spending (don't track regular credit card payments as category reductions)
        categoryBreakdown[fullCategory] = (categoryBreakdown[fullCategory] || 0) - amount
      }

      // Extract vendor from description
      const vendor = extractVendor(description)

      // Create transaction object
      const transaction: CreditCardTransaction = {
        date: transactionDate,
        description: description,
        category: fullCategory,
        type: transactionType,
        amount: amount,
        originalRow: row,
        // Enhanced parsed data
        cardNumber,
        postDate: new Date(postDateStr),
        chaseCategory,
        chaseType,
        vendor,
        // Hierarchical categorization
        majorCategory,
        subCategory: category,
        detailCategory: subcategory
      }

      transactions.push(transaction)

      // Update date range
      if (transactionDate < minDate) minDate = transactionDate
      if (transactionDate > maxDate) maxDate = transactionDate

    } catch (error) {
      console.warn(`Error parsing row ${i}:`, error)
    }
  }

  // Sort transactions by date (newest first)
  transactions.sort((a, b) => b.date.getTime() - a.date.getTime())

  const summary = {
    totalDebits,
    totalCredits,
    netAmount: totalDebits - totalCredits,
    transactionCount: transactions.length,
    dateRange: {
      start: minDate.toISOString().split('T')[0],
      end: maxDate.toISOString().split('T')[0]
    },
    categoryBreakdown
  }

  console.log('Credit Card Parsing Summary:', {
    transactions: transactions.length,
    totalDebits: totalDebits.toFixed(2),
    totalCredits: totalCredits.toFixed(2),
    netAmount: summary.netAmount.toFixed(2),
    categories: Object.keys(categoryBreakdown).length
  })

  return {
    transactions,
    summary
  }
}

// Reconciliation helper functions
export function findMatchingPayments(
  creditCardData: CreditCardData,
  checkingAccountPayments: BankTransaction[]
): Array<{
  creditCardPayment: CreditCardTransaction
  checkingPayment: BankTransaction
  variance: number
}> {
  const matches: Array<{
    creditCardPayment: CreditCardTransaction
    checkingPayment: BankTransaction
    variance: number
  }> = []

  const creditPayments = creditCardData.transactions.filter(
    t => t.type === 'credit' && t.category.includes('Payment')
  )

  creditPayments.forEach(ccPayment => {
    const potentialMatches = checkingAccountPayments.filter(chkPayment => {
      // Look for payments within 3 days and similar amounts
      const daysDiff = Math.abs(ccPayment.date.getTime() - new Date(chkPayment.date).getTime()) / (1000 * 60 * 60 * 24)
      const amountDiff = Math.abs(ccPayment.amount - Math.abs(chkPayment.amount))
      const percentDiff = amountDiff / Math.max(ccPayment.amount, Math.abs(chkPayment.amount))

      return daysDiff <= 3 && percentDiff < 0.01 // Within 1% and 3 days
    })

    if (potentialMatches.length > 0) {
      const bestMatch = potentialMatches[0] // Take the closest match
      matches.push({
        creditCardPayment: ccPayment,
        checkingPayment: bestMatch,
        variance: ccPayment.amount - Math.abs(bestMatch.amount)
      })
    }
  })

  return matches
}

export function validateCreditCardReconciliation(
  creditCardData: CreditCardData,
  expectedPaymentTotal: number,
  tolerance: number = 0.01
): {
  isReconciled: boolean
  variance: number
  details: {
    creditCardTotal: number
    expectedTotal: number
    percentVariance: number
  }
} {
  const creditCardTotal = creditCardData.summary.netAmount
  const variance = creditCardTotal - expectedPaymentTotal
  const percentVariance = Math.abs(variance) / Math.max(creditCardTotal, expectedPaymentTotal)

  return {
    isReconciled: percentVariance <= tolerance,
    variance,
    details: {
      creditCardTotal,
      expectedTotal: expectedPaymentTotal,
      percentVariance: percentVariance * 100
    }
  }
}