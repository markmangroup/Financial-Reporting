export interface BankTransaction {
  id: string
  date: string
  postDate?: string
  description: string
  amount: number
  type: string
  category?: string
  balance?: number
  account: string
}

export interface AccountSummary {
  account: string
  accountType: 'checking' | 'credit'
  totalTransactions: number
  dateRange: {
    start: string
    end: string
  }
  balance?: number
  totalDebits: number
  totalCredits: number // Business revenue only
  netAmount: number // Business net (revenue - expenses)
  // Extended fields for better categorization
  businessRevenue?: number
  ownerEquity?: number
  otherCredits?: number
  totalAllCredits?: number
}

export interface CategorySummary {
  category: string
  amount: number
  count: number
  percentage: number
}

export interface MonthlyData {
  month: string
  totalDebits: number
  totalCredits: number
  netFlow: number
  transactionCount: number
}

export interface ParsedCSVData {
  transactions: BankTransaction[]
  summary: AccountSummary
  categories: CategorySummary[]
  monthlyData: MonthlyData[]
}