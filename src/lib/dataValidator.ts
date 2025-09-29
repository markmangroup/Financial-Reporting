import { BankTransaction, ParsedCSVData } from '@/types'

export interface ValidationReport {
  currentBalance: {
    calculated: number
    expected: number
    isValid: boolean
    mostRecentDate: string
    mostRecentTransaction: BankTransaction
  }
  transactionCount: {
    parsed: number
    expectedFromCSV: number
    isValid: boolean
  }
  dateRange: {
    earliest: string
    latest: string
    isChronological: boolean
  }
  totals: {
    credits: number
    debits: number
    netCalculated: number
    balanceVerification: number
  }
  categoryValidation: {
    uncategorized: number
    majorCategories: { [key: string]: number }
  }
}

export function validateCheckingData(data: ParsedCSVData, rawCSV: string): ValidationReport {
  const lines = rawCSV.split('\n').filter(line => line.trim())
  const [header, ...dataLines] = lines

  // Parse raw data to verify our parsing
  const rawTransactions = dataLines.map(line => {
    const columns = parseCSVLineStrict(line)
    return {
      date: columns[1],
      amount: parseFloat(columns[3]),
      balance: parseFloat(columns[5]),
      description: columns[2]
    }
  }).filter(t => t.date && !isNaN(t.amount))

  // Sort by date to find chronological order
  const sortedByDate = [...rawTransactions].sort((a, b) =>
    new Date(a.date).getTime() - new Date(b.date).getTime()
  )

  // Find the most recent transaction (latest date)
  const mostRecentTransaction = sortedByDate[sortedByDate.length - 1]
  const mostRecentInParsed = data.transactions.find(t =>
    t.date === mostRecentTransaction.date &&
    Math.abs(t.amount - mostRecentTransaction.amount) < 0.01
  )

  // Verify totals
  const totalCredits = rawTransactions
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0)

  const totalDebits = rawTransactions
    .filter(t => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0)

  // Check chronological order
  const isChronological = checkChronologicalOrder(data.transactions)

  // Category validation
  const uncategorized = data.transactions.filter(t =>
    !t.category || t.category === 'Other' || t.category === ''
  ).length

  const categoryMap = new Map<string, number>()
  data.transactions.forEach(t => {
    const cat = t.category || 'Uncategorized'
    categoryMap.set(cat, (categoryMap.get(cat) || 0) + 1)
  })

  return {
    currentBalance: {
      calculated: data.summary.balance || 0,
      expected: mostRecentTransaction.balance,
      isValid: Math.abs((data.summary.balance || 0) - mostRecentTransaction.balance) < 0.01,
      mostRecentDate: mostRecentTransaction.date,
      mostRecentTransaction: mostRecentInParsed || data.transactions[0]
    },
    transactionCount: {
      parsed: data.transactions.length,
      expectedFromCSV: rawTransactions.length,
      isValid: data.transactions.length === rawTransactions.length
    },
    dateRange: {
      earliest: sortedByDate[0]?.date || '',
      latest: sortedByDate[sortedByDate.length - 1]?.date || '',
      isChronological
    },
    totals: {
      credits: totalCredits,
      debits: totalDebits,
      netCalculated: totalCredits - totalDebits,
      balanceVerification: mostRecentTransaction.balance - sortedByDate[0]?.balance || 0
    },
    categoryValidation: {
      uncategorized,
      majorCategories: Object.fromEntries(categoryMap)
    }
  }
}

function parseCSVLineStrict(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]

    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }

  result.push(current.trim())
  return result
}

function checkChronologicalOrder(transactions: BankTransaction[]): boolean {
  for (let i = 1; i < transactions.length; i++) {
    if (new Date(transactions[i].date) < new Date(transactions[i-1].date)) {
      return false
    }
  }
  return true
}