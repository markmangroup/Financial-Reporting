import { parseCreditCardCSV, CreditCardData } from './creditCardParser'

// Cache for parsed credit card data
let creditCardCache: CreditCardData | null = null
let cacheTimestamp: number = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

// Client-side data loading via API
export async function loadCreditCardData(): Promise<CreditCardData | null> {
  try {
    // Check cache first
    const now = Date.now()
    if (creditCardCache && (now - cacheTimestamp) < CACHE_DURATION) {
      console.log('Returning cached credit card data')
      return creditCardCache
    }

    // Fetch from API endpoint
    const response = await fetch('/api/credit-card-data')
    if (!response.ok) {
      console.warn('Failed to load credit card data from API')
      return null
    }

    const csvContent = await response.text()
    if (csvContent.trim().length === 0) {
      console.warn('Empty credit card data received')
      return null
    }

    // Parse the CSV data
    const creditCardData = parseCreditCardCSV(csvContent)

    // Cache the parsed data
    creditCardCache = creditCardData
    cacheTimestamp = now

    console.log('Successfully loaded credit card data:', {
      transactions: creditCardData.transactions.length,
      dateRange: creditCardData.summary.dateRange,
      totalDebits: creditCardData.summary.totalDebits.toFixed(2),
      categories: Object.keys(creditCardData.summary.categoryBreakdown).length
    })

    return creditCardData

  } catch (error) {
    console.error('Error loading credit card data:', error)
    return null
  }
}

// Server-side data loading (for API routes only)
export function loadCreditCardDataSync(): CreditCardData | null {
  // For client-side components, return null and use async loading
  if (typeof window !== 'undefined') {
    console.warn('loadCreditCardDataSync called on client-side, returning null')
    return null
  }

  try {
    // Only import fs on server-side
    const fs = require('fs')
    const path = require('path')

    // Check cache first
    const now = Date.now()
    if (creditCardCache && (now - cacheTimestamp) < CACHE_DURATION) {
      return creditCardCache
    }

    // Try to load from file system
    const possibleFiles = [
      'Chase8008_Activity20230929_20250929_20250929.CSV',
      'chase_credit_card.csv',
      'credit_card.csv'
    ]

    const dataDir = path.join(process.cwd(), 'data')

    for (const fileName of possibleFiles) {
      try {
        const filePath = path.join(dataDir, fileName)
        const csvContent = fs.readFileSync(filePath, 'utf-8')

        if (csvContent.trim().length === 0) continue

        const creditCardData = parseCreditCardCSV(csvContent)

        // Update cache
        creditCardCache = creditCardData
        cacheTimestamp = now

        return creditCardData

      } catch (fileError) {
        continue
      }
    }

    return null

  } catch (error) {
    console.error('Error in loadCreditCardDataSync:', error)
    return null
  }
}

// Reconciliation helpers
export function getCreditCardPaymentTotal(creditCardData: CreditCardData): number {
  // Sum all debits (expenses) - this should match the payment amount from checking
  return creditCardData.summary.totalDebits
}

export function getCreditCardPaymentsByMonth(creditCardData: CreditCardData): Record<string, number> {
  const monthlyTotals: Record<string, number> = {}

  creditCardData.transactions.forEach(transaction => {
    if (transaction.type === 'debit') {
      const month = transaction.date.toISOString().slice(0, 7) // YYYY-MM format
      monthlyTotals[month] = (monthlyTotals[month] || 0) + transaction.amount
    }
  })

  return monthlyTotals
}

// Get top expense categories for executive insights
export function getTopExpenseCategories(creditCardData: CreditCardData, limit: number = 5): Array<{
  category: string
  amount: number
  percentage: number
}> {
  const categoryEntries = Object.entries(creditCardData.summary.categoryBreakdown)
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: (amount / creditCardData.summary.totalDebits) * 100
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, limit)

  return categoryEntries
}