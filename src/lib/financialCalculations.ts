// SINGLE GOLDEN RECORD for all financial calculations
// Both Income Statement and Balance Sheet MUST use these functions

import { ParsedCSVData } from '@/types'
import { roundToCents, roundAndSum, roundCalculation, amountsEqual } from '@/lib/utils/rounding'
import { CreditCardData } from '@/lib/creditCardParser'

// Category-level expense breakdown (for detailed Income Statement display)
export interface ExpenseCategory {
  name: string
  amount: number
  source: 'checking' | 'credit-card'
  majorCategory?: string // For grouping reference
}

export interface ConsultantBreakdown {
  name: string
  amount: number
}

export interface FinancialTotals {
  // Revenue
  businessRevenue: number

  // Expenses (business operations only)
  consultantExpenses: number
  consultantBreakdown: ConsultantBreakdown[] // Individual consultant details

  // Credit Card Subledger Breakdown (replaces single creditCardExpenses)
  creditCardOperatingExpenses: number // Software, office, equipment
  creditCardTravelExpenses: number // Travel, hotels, vehicle
  creditCardMealsExpenses: number // Client meals, team events
  creditCardUtilitiesExpenses: number // Internet, phone, utilities
  creditCardOtherExpenses: number // Any other credit card charges
  creditCardTotalExpenses: number // Sum of all subledger categories
  creditCardCategoryBreakdown: ExpenseCategory[] // Detailed category breakdown

  // Other Expenses
  autoLoanExpenses: number
  bankFeesExpenses: number
  totalBusinessExpenses: number

  // Net Income (Revenue - Business Expenses)
  netIncome: number

  // Reconciliation (not part of P&L calculation)
  creditCardPayments: number // Checking account payments to credit card (for reconciliation only)
  creditCardReconciliationVariance: number // Difference between payments and charges

  // Equity Components
  initialCapital: number // Starting balance from first transaction
  ownerCapitalContributions: number // Net positive transfers IN
  otherCredits: number // Wire reversals, etc.
  unaccountedCredits: number // Credits that affect cash but not categorized equity
  totalOwnerEquity: number

  // Cash Position
  currentCashBalance: number
}

/**
 * Calculate consultant expense breakdown by individual consultant
 */
function calculateConsultantBreakdown(checkingData: ParsedCSVData): ConsultantBreakdown[] {
  const consultantMap = new Map<string, number>()

  // Aggregate consultant expenses by consultant name (use category, not description)
  checkingData.transactions
    .filter(t => t.category && t.category.includes('Consultant'))
    .forEach(t => {
      // Extract clean consultant name from category
      // Examples: "Consultant - Spain (Carmen)" -> "Carmen"
      //          "Consultant - Swan" -> "Swan"
      //          "Consultant - Slovakia (Ivana)" -> "Ivana"
      let consultantName = (t.category || '').replace('Consultant - ', '').trim()

      // If format is "Country (Name)", extract just the name
      const nameMatch = consultantName.match(/\(([^)]+)\)/)
      if (nameMatch) {
        consultantName = nameMatch[1].trim()
      }

      const existing = consultantMap.get(consultantName) || 0
      consultantMap.set(consultantName, existing + Math.abs(t.amount))
    })

  // Convert to array and sort by amount (largest first)
  return Array.from(consultantMap.entries())
    .map(([name, amount]) => ({ name, amount: roundToCents(amount) }))
    .sort((a, b) => b.amount - a.amount)
}

/**
 * Calculate credit card category breakdown by detailCategory (subcategory)
 * This provides the granular expense categories (Office Rent, Freelance Services, etc.)
 */
function calculateCreditCardCategoryBreakdown(creditCardData: CreditCardData | null): ExpenseCategory[] {
  if (!creditCardData || !creditCardData.transactions) {
    return []
  }

  const categoryMap = new Map<string, { amount: number, majorCategory: string }>()

  // Aggregate by detailCategory (subcategory) - only count debits (actual expenses)
  creditCardData.transactions
    .filter((t: any) => t.type === 'debit' && t.majorCategory !== 'Payments & Fees' && t.majorCategory !== 'Excluded')
    .forEach((t: any) => {
      // Use detailCategory (most specific) as the primary grouping
      const categoryName = t.detailCategory || t.subCategory || t.majorCategory || 'Other'
      const existing = categoryMap.get(categoryName) || { amount: 0, majorCategory: t.majorCategory }
      categoryMap.set(categoryName, {
        amount: existing.amount + Math.abs(t.amount),
        majorCategory: t.majorCategory
      })
    })

  // Convert to array and sort by amount (largest first)
  return Array.from(categoryMap.entries())
    .map(([name, data]) => ({
      name,
      amount: roundToCents(data.amount),
      source: 'credit-card' as const,
      majorCategory: data.majorCategory
    }))
    .sort((a, b) => b.amount - a.amount)
}

/**
 * Calculate credit card subledger expense breakdown
 * Takes credit card data as parameter to avoid async issues
 */
function calculateCreditCardSubledger(creditCardData: CreditCardData | null): {
  operatingExpenses: number
  travelExpenses: number
  mealsExpenses: number
  utilitiesExpenses: number
  otherExpenses: number
  totalExpenses: number
} {
  if (!creditCardData || !creditCardData.transactions) {
    console.warn('Credit card data not available, using zero values for subledger')
    return {
      operatingExpenses: 0,
      travelExpenses: 0,
      mealsExpenses: 0,
      utilitiesExpenses: 0,
      otherExpenses: 0,
      totalExpenses: 0
    }
  }

  // Categorize transactions by major category - only count debits (actual expenses)
  const operating = creditCardData.transactions.filter((t: any) =>
    t.majorCategory === 'Operating Expenses' && t.type === 'debit'
  )
  const travel = creditCardData.transactions.filter((t: any) =>
    t.majorCategory === 'Travel' && t.type === 'debit'
  )
  const meals = creditCardData.transactions.filter((t: any) =>
    t.majorCategory === 'Meals & Entertainment' && t.type === 'debit'
  )
  const utilities = creditCardData.transactions.filter((t: any) =>
    t.majorCategory === 'Bills & Utilities' && t.type === 'debit'
  )
  const other = creditCardData.transactions.filter((t: any) =>
    t.type === 'debit' && (
      !t.majorCategory || (
        t.majorCategory !== 'Operating Expenses' &&
        t.majorCategory !== 'Travel' &&
        t.majorCategory !== 'Meals & Entertainment' &&
        t.majorCategory !== 'Bills & Utilities' &&
        t.majorCategory !== 'Payments & Fees' &&
        t.majorCategory !== 'Excluded'
      )
    )
  )

  const operatingExpenses = roundAndSum(operating.map((t: any) => Math.abs(t.amount)))
  const travelExpenses = roundAndSum(travel.map((t: any) => Math.abs(t.amount)))
  const mealsExpenses = roundAndSum(meals.map((t: any) => Math.abs(t.amount)))
  const utilitiesExpenses = roundAndSum(utilities.map((t: any) => Math.abs(t.amount)))
  const otherExpenses = roundAndSum(other.map((t: any) => Math.abs(t.amount)))
  const totalExpenses = roundCalculation(operatingExpenses + travelExpenses + mealsExpenses + utilitiesExpenses + otherExpenses)

  return {
    operatingExpenses,
    travelExpenses,
    mealsExpenses,
    utilitiesExpenses,
    otherExpenses,
    totalExpenses
  }
}

export function calculateFinancialTotals(checkingData: ParsedCSVData, creditCardData?: CreditCardData | null): FinancialTotals {
  // REVENUE: All client payments (with consistent rounding)
  const businessRevenue = roundAndSum(
    checkingData.categories
      .filter(c => c.category.includes('Client Payment'))
      .map(c => c.amount)
  )

  // BUSINESS EXPENSES: Only legitimate business operations (with consistent rounding)
  const consultantExpenses = roundAndSum(
    checkingData.categories
      .filter(c => c.category.includes('Consultant'))
      .map(c => Math.abs(c.amount))
  )

  // CONSULTANT BREAKDOWN: Individual consultant details
  const consultantBreakdown = calculateConsultantBreakdown(checkingData)

  // CREDIT CARD SUBLEDGER: Actual expenses from credit card transactions
  const creditCardSubledger = calculateCreditCardSubledger(creditCardData || null)
  const creditCardOperatingExpenses = creditCardSubledger.operatingExpenses
  const creditCardTravelExpenses = creditCardSubledger.travelExpenses
  const creditCardMealsExpenses = creditCardSubledger.mealsExpenses
  const creditCardUtilitiesExpenses = creditCardSubledger.utilitiesExpenses
  const creditCardOtherExpenses = creditCardSubledger.otherExpenses
  const creditCardTotalExpenses = creditCardSubledger.totalExpenses

  // CREDIT CARD CATEGORY BREAKDOWN: Detailed category breakdown (Office Rent, Software, etc.)
  const creditCardCategoryBreakdown = calculateCreditCardCategoryBreakdown(creditCardData || null)

  // CREDIT CARD PAYMENTS: For reconciliation only (not counted as business expense)
  const creditCardPayments = roundAndSum(
    checkingData.categories
      .filter(c => c.category.includes('Credit Card Autopay'))
      .map(c => Math.abs(c.amount))
  )

  // RECONCILIATION: Check if payments match charges
  const creditCardReconciliationVariance = roundCalculation(creditCardPayments - creditCardTotalExpenses)

  // OTHER EXPENSES
  const autoLoanExpenses = roundAndSum(
    checkingData.categories
      .filter(c => c.category.includes('Auto Loan'))
      .map(c => Math.abs(c.amount))
  )

  const bankFeesExpenses = roundAndSum(
    checkingData.categories
      .filter(c => c.category.includes('Monthly Bank'))
      .map(c => Math.abs(c.amount))
  )

  // TOTAL BUSINESS EXPENSES: Now uses subledger breakdown instead of payments
  const totalBusinessExpenses = roundCalculation(
    consultantExpenses +
    creditCardTotalExpenses +  // Use actual charges, not payments
    autoLoanExpenses +
    bankFeesExpenses
  )

  // NET INCOME: Business revenue minus business expenses (with consistent rounding)
  const netIncome = roundCalculation(businessRevenue - totalBusinessExpenses)

  // OWNER EQUITY: Net capital contributions (all account transfers) - with consistent rounding
  const ownerCapitalContributions = roundAndSum(
    checkingData.transactions
      .filter(t => t.category === 'Account Transfer')
      .map(t => t.amount)
  )

  // INITIAL CAPITAL: Starting balance should be 0 for this business
  // The first transaction shows a balance after a transfer, not the starting balance
  const initialCapital = 0

  // OTHER CREDITS: Wire reversals, account verification, etc. - with consistent rounding
  const otherCredits = roundAndSum(
    checkingData.categories
      .filter(c =>
        c.category.includes('Wire Transfer Reversal') ||
        c.category.includes('Account Verification')
      )
      .map(c => c.amount)
  )

  // CURRENT CASH BALANCE: Use the bank statement balance (most recent transaction)
  // This is the authoritative source and should match the actual bank balance
  const currentCashBalance = roundToCents(checkingData.transactions
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    [checkingData.transactions.length - 1]?.balance || 0)

  // TOTAL OWNER EQUITY (with consistent rounding to ensure exact balance sheet reconciliation)
  // Includes: Initial Capital + Net Transfers + Net Income + Other Credits + Unaccounted Credits
  const unaccountedCredits = roundCalculation(currentCashBalance - (initialCapital + ownerCapitalContributions + netIncome + otherCredits))
  const totalOwnerEquity = roundCalculation(initialCapital + ownerCapitalContributions + netIncome + otherCredits + unaccountedCredits)

  return {
    businessRevenue,
    consultantExpenses,
    consultantBreakdown,
    creditCardOperatingExpenses,
    creditCardTravelExpenses,
    creditCardMealsExpenses,
    creditCardUtilitiesExpenses,
    creditCardOtherExpenses,
    creditCardTotalExpenses,
    creditCardCategoryBreakdown,
    autoLoanExpenses,
    bankFeesExpenses,
    totalBusinessExpenses,
    netIncome,
    creditCardPayments,
    creditCardReconciliationVariance,
    initialCapital,
    ownerCapitalContributions,
    otherCredits,
    unaccountedCredits,
    totalOwnerEquity,
    currentCashBalance
  }
}