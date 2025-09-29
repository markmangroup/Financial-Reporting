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

  // Major client payments - specific to your business
  if (desc.includes('laurel managemen')) {
    return 'Client Payment - Laurel Management'
  }
  if (desc.includes('metropolitan') && (desc.includes('par') || desc.includes('eq'))) {
    return 'Client Payment - Metropolitan Partners'
  }

  // International consultant payments - very specific patterns
  if (desc.includes('wire transfer') && desc.includes('consultancy')) {
    if (desc.includes('spain') || desc.includes('bilbao') || desc.includes('carmen')) {
      return 'Consultant - Spain (Carmen)'
    }
    if (desc.includes('bulgaria') || desc.includes('unicredit bulbank') || desc.includes('pepi')) {
      return 'Consultant - Bulgaria (Pepi)'
    }
    if (desc.includes('slovakia') || desc.includes('tatra banka') || desc.includes('ivana')) {
      return 'Consultant - Slovakia (Ivana)'
    }
    if (desc.includes('london') || desc.includes('jpmorgan chase bank na - london')) {
      if (desc.includes('petrana')) return 'Consultant - UK (Petrana)'
      if (desc.includes('beata')) return 'Consultant - UK (Beata)'
      if (desc.includes('marianna')) return 'Consultant - UK (Marianna)'
      if (desc.includes('nikoleta')) return 'Consultant - UK (Nikoleta)'
      if (desc.includes('jan dzubak')) return 'Consultant - UK (Jan)'
      return 'Consultant - UK (Other)'
    }
    return 'Consultant Payment - International'
  }

  // Credit card autopay - exact pattern
  if (desc.includes('chase credit crd') && desc.includes('autopaybussec') && type === 'ACH_DEBIT') {
    return 'Credit Card Autopay'
  }

  // Business software and services
  if (desc.includes('bill.com')) {
    return 'Business Services - Bill.com'
  }
  if (desc.includes('swan softweb')) {
    return 'Development Services - Swan'
  }

  // Auto loan payments - specific pattern
  if (desc.includes('online payment') && desc.includes('auto loan 1105')) {
    return 'Auto Loan Payment'
  }

  // Monthly fees
  if (type === 'FEE_TRANSACTION' || desc.includes('service charges for the month')) {
    return 'Monthly Bank Fees'
  }

  // Account transfers
  if (type === 'ACCT_XFER' || desc.includes('online transfer')) {
    return 'Account Transfer'
  }

  // Specific payment services
  if (desc.includes('abri') && type === 'ACH_PAYMENT') {
    return 'Business Service - Abri'
  }

  // Wire reversals
  if (desc.includes('wire reversal')) {
    return 'Wire Transfer Reversal'
  }

  // Account verification micro-transactions
  if (desc.includes('acctverifysec')) {
    return 'Account Verification'
  }

  // Default categorization
  if (type === 'ACH_CREDIT') return 'ACH Credit - Unknown'
  if (type === 'ACH_DEBIT') return 'ACH Debit - Unknown'
  if (type === 'WIRE_OUTGOING') return 'Wire Transfer - Outgoing'
  if (type === 'WIRE_INCOMING') return 'Wire Transfer - Incoming'
  if (type === 'MISC_DEBIT') return 'Miscellaneous Debit'
  if (type === 'MISC_CREDIT') return 'Miscellaneous Credit'

  return type || 'Uncategorized'
}

function generateSummaryData(transactions: BankTransaction[], accountType: 'checking' | 'credit'): ParsedCSVData {
  const sortedTransactions = transactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const totalDebits = transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0)
  const totalCredits = transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0)

  // Find the most recent transaction (latest date) for current balance
  const mostRecentTransaction = sortedTransactions[sortedTransactions.length - 1]

  const summary: AccountSummary = {
    account: transactions[0]?.account || '',
    accountType,
    totalTransactions: transactions.length,
    dateRange: {
      start: sortedTransactions[0]?.date || '',
      end: mostRecentTransaction?.date || ''
    },
    balance: mostRecentTransaction?.balance, // Use balance from most recent transaction
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