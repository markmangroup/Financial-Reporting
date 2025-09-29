import { BankTransaction, AccountSummary, CategorySummary, MonthlyData, ParsedCSVData } from '@/types'

export function parseChaseCheckingCSV(csvContent: string): ParsedCSVData {
  const lines = csvContent.split('\n').filter(line => line.trim())
  const [header, ...dataLines] = lines

  // Chase checking CSV columns: Details,Posting Date,Description,Amount,Type,Balance,Check or Slip #
  const transactions: BankTransaction[] = dataLines.map((line, index) => {
    const columns = parseCSVLine(line)

    return {
      id: `checking-${index}`,
      date: columns[1] || '',
      description: columns[2] || '',
      amount: parseFloat(columns[3]) || 0,
      type: columns[4] || '',
      balance: parseFloat(columns[5]) || undefined,
      account: 'Chase-5939',
      category: categorizeCheckingTransaction(columns[2], columns[4])
    }
  }).filter(t => t.date && t.amount !== 0)

  return generateSummaryData(transactions, 'checking')
}

export function parseChaseCreditCSV(csvContent: string): ParsedCSVData {
  const lines = csvContent.split('\n').filter(line => line.trim())
  const [header, ...dataLines] = lines

  // Chase credit CSV columns: Card,Transaction Date,Post Date,Description,Category,Type,Amount,Memo
  const transactions: BankTransaction[] = dataLines.map((line, index) => {
    const columns = parseCSVLine(line)

    return {
      id: `credit-${index}`,
      date: columns[1] || '',
      postDate: columns[2] || '',
      description: columns[3] || '',
      category: columns[4] || '',
      type: columns[5] || '',
      amount: parseFloat(columns[6]) || 0,
      account: 'Chase-8008'
    }
  }).filter(t => t.date && t.amount !== 0)

  return generateSummaryData(transactions, 'credit')
}

function parseCSVLine(line: string): string[] {
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

function categorizeCheckingTransaction(description: string, type: string): string {
  const desc = description.toLowerCase()

  // Major client payments
  if (desc.includes('laurel managemen') || desc.includes('metropolitan')) {
    return 'Client Payments'
  }

  // Consultant payments
  if (desc.includes('wire transfer') && (desc.includes('consultancy') || desc.includes('spain') || desc.includes('bulgaria') || desc.includes('slovakia'))) {
    return 'Consultant Payments'
  }

  // Credit card payments
  if (desc.includes('chase credit') && type === 'ACH_DEBIT') {
    return 'Credit Card Payment'
  }

  // Business services
  if (desc.includes('bill.com') || desc.includes('swan softweb')) {
    return 'Business Services'
  }

  // Auto loan
  if (desc.includes('auto loan') || type === 'LOAN_PMT') {
    return 'Auto Loan'
  }

  // Fees
  if (type === 'FEE_TRANSACTION' || desc.includes('service charges')) {
    return 'Bank Fees'
  }

  // Transfers
  if (type === 'ACCT_XFER') {
    return 'Account Transfer'
  }

  return type || 'Other'
}

function generateSummaryData(transactions: BankTransaction[], accountType: 'checking' | 'credit'): ParsedCSVData {
  const sortedTransactions = transactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const totalDebits = transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0)
  const totalCredits = transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0)

  const summary: AccountSummary = {
    account: transactions[0]?.account || '',
    accountType,
    totalTransactions: transactions.length,
    dateRange: {
      start: sortedTransactions[0]?.date || '',
      end: sortedTransactions[sortedTransactions.length - 1]?.date || ''
    },
    balance: transactions[0]?.balance,
    totalDebits,
    totalCredits,
    netAmount: totalCredits - totalDebits
  }

  // Category analysis
  const categoryMap = new Map<string, { amount: number, count: number }>()

  transactions.forEach(t => {
    const category = t.category || 'Other'
    const existing = categoryMap.get(category) || { amount: 0, count: 0 }
    categoryMap.set(category, {
      amount: existing.amount + Math.abs(t.amount),
      count: existing.count + 1
    })
  })

  const totalAmount = totalDebits + totalCredits
  const categories: CategorySummary[] = Array.from(categoryMap.entries()).map(([category, data]) => ({
    category,
    amount: data.amount,
    count: data.count,
    percentage: totalAmount > 0 ? (data.amount / totalAmount) * 100 : 0
  })).sort((a, b) => b.amount - a.amount)

  // Monthly analysis
  const monthlyMap = new Map<string, { debits: number, credits: number, count: number }>()

  transactions.forEach(t => {
    const month = new Date(t.date).toISOString().substring(0, 7) // YYYY-MM
    const existing = monthlyMap.get(month) || { debits: 0, credits: 0, count: 0 }

    monthlyMap.set(month, {
      debits: existing.debits + (t.amount < 0 ? Math.abs(t.amount) : 0),
      credits: existing.credits + (t.amount > 0 ? t.amount : 0),
      count: existing.count + 1
    })
  })

  const monthlyData: MonthlyData[] = Array.from(monthlyMap.entries())
    .map(([month, data]) => ({
      month,
      totalDebits: data.debits,
      totalCredits: data.credits,
      netFlow: data.credits - data.debits,
      transactionCount: data.count
    }))
    .sort((a, b) => a.month.localeCompare(b.month))

  return {
    transactions: sortedTransactions,
    summary,
    categories,
    monthlyData
  }
}