// Type definitions for Fortrea financial data

// Legacy types (kept for backward compatibility)
export interface IncomeStatementRow {
  year: number
  revenue: number
  operatingIncome: number
  netIncome: number
  eps: number // Earnings per share
}

export interface BalanceSheetRow {
  year: number
  totalAssets: number
  totalLiabilities: number
  totalEquity: number
  cash: number
  debt: number
}

export interface CashFlowRow {
  year: number
  operatingCashFlow: number
  investingCashFlow: number
  financingCashFlow: number
  freeCashFlow: number
}

export interface FortreaFinancials {
  incomeStatement: IncomeStatementRow[]
  balanceSheet: BalanceSheetRow[]
  cashFlow: CashFlowRow[]
}

// Real Fortrea quarterly and annual data types
export type FortreaQuarterId = '2023Q3' | '2023Q4' | '2024Q1' | '2024Q2' | '2024Q3' | '2024Q4' | '2025Q1' | '2025Q2' | '2025Q3'

export interface FortreaQuarterRow {
  id: FortreaQuarterId
  year: number
  quarter: number
  label: string // "Q3 2024"
  revenue: number          // in millions USD
  gaapNetIncome: number    // in millions USD (negative = loss)
  gaapEPS?: number         // in USD (GAAP earnings per share)
  adjEbitda: number        // in millions USD
  adjEbitdaMarginPct: number
  adjNetIncome?: number    // in millions
  adjDilutedEPS?: number   // in USD
  backlog?: number         // in millions
  bookToBill?: number      // ratio
  freeCashFlow?: number    // in millions USD
  operatingCashFlow?: number // in millions USD
}

export interface FortreaAnnualRow {
  year: number
  revenue: number          // in millions USD
  gaapNetIncome: number    // in millions
  adjEbitda: number        // in millions
  adjEbitdaMarginPct: number
  backlog?: number         // in millions
}

