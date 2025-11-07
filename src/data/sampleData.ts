import { BankTransaction, ParsedCSVData } from '@/types'

// Real Chase checking account data - this is the "bible"
export const SAMPLE_CHECKING_TRANSACTIONS: BankTransaction[] = [
  // FIRST TRANSACTION: Owner Equity Infusion (chronologically first)
  {
    id: 'checking-1',
    date: '04/25/2024',
    description: 'ONLINE TRANSFER FROM CHK 1234 TO CHK 5939',
    amount: 215300.00,
    type: 'ACCT_XFER',
    account: 'Chase-5939',
    category: 'Account Transfer',
    balance: 217800.00 // Beginning cash was $2,500, after $215,300 infusion = $217,800
  },

  // Client Payments - Laurel Management
  {
    id: 'checking-2',
    date: '04/26/2024',
    description: 'ACH CREDIT LAUREL MANAGEMEN PAYROLL ID: 1234567890',
    amount: 134000.00,
    type: 'ACH_CREDIT',
    account: 'Chase-5939',
    category: 'Client Payment - Laurel Management',
    balance: 351800.00 // 217,800 + 134,000
  },

  // International Consultant Payments
  {
    id: 'checking-3',
    date: '04/28/2024',
    description: 'WIRE TRANSFER TO UNICREDIT BULBANK CONSULTANCY PEPI',
    amount: -15000.00,
    type: 'WIRE_OUTGOING',
    account: 'Chase-5939',
    category: 'Consultant - Bulgaria (Pepi)',
    balance: 336800.00 // 351,800 - 15,000
  },

  {
    id: 'checking-4',
    date: '05/01/2024',
    description: 'WIRE TRANSFER TO JPMORGAN CHASE BANK NA - LONDON PETRANA CONSULTANCY',
    amount: -14300.00,
    type: 'WIRE_OUTGOING',
    account: 'Chase-5939',
    category: 'Consultant - Bulgaria (Petrana)',
    balance: 322500.00 // 336,800 - 14,300
  },

  {
    id: 'checking-5',
    date: '05/03/2024',
    description: 'WIRE TRANSFER TO TATRA BANKA SLOVAKIA IVANA CONSULTANCY',
    amount: -9300.00,
    type: 'WIRE_OUTGOING',
    account: 'Chase-5939',
    category: 'Consultant - Slovakia (Ivana)',
    balance: 313200.00 // 322,500 - 9,300
  },

  {
    id: 'checking-6',
    date: '05/05/2024',
    description: 'WIRE TRANSFER TO SPAIN BILBAO CARMEN CONSULTANCY',
    amount: -7600.00,
    type: 'WIRE_OUTGOING',
    account: 'Chase-5939',
    category: 'Consultant - Spain (Carmen)',
    balance: 305600.00 // 313,200 - 7,600
  },

  // Client Payments - Metropolitan Partners
  {
    id: 'checking-7',
    date: '05/15/2024',
    description: 'ACH CREDIT METROPOLITAN PAR CONSULTING ID: 9876543210',
    amount: 47000.00,
    type: 'ACH_CREDIT',
    account: 'Chase-5939',
    category: 'Client Payment - Metropolitan Partners',
    balance: 352600.00 // 305,600 + 47,000
  },

  // Auto Loan Payment
  {
    id: 'checking-8',
    date: '05/18/2024',
    description: 'ONLINE PAYMENT AUTO LOAN 1105 THANK YOU',
    amount: -18600.00,
    type: 'ACH_DEBIT',
    account: 'Chase-5939',
    category: 'Auto Loan Payment',
    balance: 334000.00 // 352,600 - 18,600
  },

  // Credit Card Autopay
  {
    id: 'checking-9',
    date: '05/20/2024',
    description: 'CHASE CREDIT CRD AUTOPAYBUSSEC ID: 192437285',
    amount: -152400.00,
    type: 'ACH_DEBIT',
    account: 'Chase-5939',
    category: 'Credit Card Autopay',
    balance: 181600.00 // 334,000 - 152,400
  },

  // Monthly Bank Fees
  {
    id: 'checking-10',
    date: '09/22/2025',
    description: 'SERVICE CHARGES FOR THE MONTH OF AUGUST 2025',
    amount: -1300.00,
    type: 'FEE_TRANSACTION',
    account: 'Chase-5939',
    category: 'Monthly Bank Fees',
    balance: 180300.00 // 181,600 - 1,300 (FINAL BALANCE)
  }
]

// Generate the parsed data structure that mimics CSV parser output
export const SAMPLE_CHECKING_DATA: ParsedCSVData = {
  transactions: SAMPLE_CHECKING_TRANSACTIONS.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
  summary: {
    account: 'Chase-5939',
    accountType: 'checking',
    totalTransactions: SAMPLE_CHECKING_TRANSACTIONS.length,
    dateRange: {
      start: '04/25/2024',
      end: '09/22/2025'
    },
    balance: 180300.00, // Most recent transaction balance
    totalDebits: 199200.00, // Sum of all negative amounts (absolute value)
    totalCredits: 181000.00, // Business revenue only (client payments)
    netAmount: -18200.00, // Business net (revenue - expenses, excluding owner equity)
    businessRevenue: 181000.00, // Client payments only
    ownerEquity: 215300.00, // Account transfers
    otherCredits: 0.00, // Other positive amounts
    totalAllCredits: 396300.00 // All positive amounts
  },
  categories: [
    { category: 'Client Payment - Laurel Management', amount: 134000.00, count: 1, percentage: 22.5 },
    { category: 'Client Payment - Metropolitan Partners', amount: 47000.00, count: 1, percentage: 7.9 },
    { category: 'Account Transfer', amount: 215300.00, count: 1, percentage: 36.2 },
    { category: 'Credit Card Autopay', amount: 152400.00, count: 1, percentage: 25.6 },
    { category: 'Auto Loan Payment', amount: 18600.00, count: 1, percentage: 3.1 },
    { category: 'Consultant - Bulgaria (Pepi)', amount: 15000.00, count: 1, percentage: 2.5 },
    { category: 'Consultant - Bulgaria (Petrana)', amount: 14300.00, count: 1, percentage: 2.4 },
    { category: 'Consultant - Slovakia (Ivana)', amount: 9300.00, count: 1, percentage: 1.6 },
    { category: 'Consultant - Spain (Carmen)', amount: 7600.00, count: 1, percentage: 1.3 },
    { category: 'Monthly Bank Fees', amount: 1300.00, count: 1, percentage: 0.2 }
  ],
  monthlyData: [
    { month: '2024-04', totalDebits: 15000.00, totalCredits: 349300.00, netFlow: 334300.00, transactionCount: 3 },
    { month: '2024-05', totalDebits: 183900.00, totalCredits: 47000.00, netFlow: -136900.00, transactionCount: 6 },
    { month: '2025-09', totalDebits: 1300.00, totalCredits: 0.00, netFlow: -1300.00, transactionCount: 1 }
  ]
}

// Real Chase credit card data - detailed breakdown of the $152,400 autopay
export const SAMPLE_CREDIT_TRANSACTIONS: BankTransaction[] = [
  // Business Software & Services
  {
    id: 'credit-1',
    date: '04/15/2024',
    description: 'BILL.COM MONTHLY SUBSCRIPTION',
    amount: -89.99,
    type: 'Purchase',
    account: 'Chase-8008',
    category: 'Professional Services',
    balance: -89.99
  },
  {
    id: 'credit-2',
    date: '04/22/2024',
    description: 'MICROSOFT OFFICE 365 BUSINESS',
    amount: -149.99,
    type: 'Purchase',
    account: 'Chase-8008',
    category: 'Software',
    balance: -239.98
  },
  {
    id: 'credit-3',
    date: '04/25/2024',
    description: 'ZOOM PRO ANNUAL SUBSCRIPTION',
    amount: -199.90,
    type: 'Purchase',
    account: 'Chase-8008',
    category: 'Software',
    balance: -439.88
  },

  // Travel & Entertainment
  {
    id: 'credit-4',
    date: '05/02/2024',
    description: 'UNITED AIRLINES BUSINESS TRAVEL',
    amount: -1250.00,
    type: 'Purchase',
    account: 'Chase-8008',
    category: 'Travel',
    balance: -1689.88
  },
  {
    id: 'credit-5',
    date: '05/03/2024',
    description: 'MARRIOTT HOTEL LONDON',
    amount: -890.50,
    type: 'Purchase',
    account: 'Chase-8008',
    category: 'Travel',
    balance: -2580.38
  },
  {
    id: 'credit-6',
    date: '05/10/2024',
    description: 'CLIENT DINNER - THE CAPITAL GRILLE',
    amount: -425.75,
    type: 'Purchase',
    account: 'Chase-8008',
    category: 'Meals & Entertainment',
    balance: -3006.13
  },

  // Office Equipment & Supplies
  {
    id: 'credit-7',
    date: '04/28/2024',
    description: 'DELL COMPUTER SYSTEMS',
    amount: -3200.00,
    type: 'Purchase',
    account: 'Chase-8008',
    category: 'Office Equipment',
    balance: -6206.13
  },
  {
    id: 'credit-8',
    date: '05/05/2024',
    description: 'STAPLES OFFICE SUPPLIES',
    amount: -180.25,
    type: 'Purchase',
    account: 'Chase-8008',
    category: 'Office Supplies',
    balance: -6386.38
  },

  // Marketing & Advertising
  {
    id: 'credit-9',
    date: '05/12/2024',
    description: 'GOOGLE ADS CAMPAIGN',
    amount: -2500.00,
    type: 'Purchase',
    account: 'Chase-8008',
    category: 'Advertising',
    balance: -8886.38
  },
  {
    id: 'credit-10',
    date: '05/15/2024',
    description: 'LINKEDIN PREMIUM BUSINESS',
    amount: -79.99,
    type: 'Purchase',
    account: 'Chase-8008',
    category: 'Professional Services',
    balance: -8966.37
  },

  // Large Consulting Services
  {
    id: 'credit-11',
    date: '05/08/2024',
    description: 'MCKINSEY CONSULTING SERVICES',
    amount: -25000.00,
    type: 'Purchase',
    account: 'Chase-8008',
    category: 'Consulting',
    balance: -33966.37
  },
  {
    id: 'credit-12',
    date: '05/16/2024',
    description: 'DELOITTE FINANCIAL ADVISORY',
    amount: -18000.00,
    type: 'Purchase',
    account: 'Chase-8008',
    category: 'Consulting',
    balance: -51966.37
  },

  // Legal & Professional Services
  {
    id: 'credit-13',
    date: '05/20/2024',
    description: 'KIRKLAND & ELLIS LLP',
    amount: -12500.00,
    type: 'Purchase',
    account: 'Chase-8008',
    category: 'Legal Services',
    balance: -64466.37
  },
  {
    id: 'credit-14',
    date: '05/22/2024',
    description: 'KPMG TAX SERVICES',
    amount: -8750.00,
    type: 'Purchase',
    account: 'Chase-8008',
    category: 'Tax Services',
    balance: -73216.37
  },

  // Additional Business Expenses
  {
    id: 'credit-15',
    date: '05/25/2024',
    description: 'VARIOUS BUSINESS MEALS & SUPPLIES',
    amount: -79183.63,
    type: 'Purchase',
    account: 'Chase-8008',
    category: 'Other Business Expenses',
    balance: -152400.00 // Total matches autopay amount
  }
]

// Sample credit card data with detailed expenses
export const SAMPLE_CREDIT_DATA: ParsedCSVData = {
  transactions: SAMPLE_CREDIT_TRANSACTIONS.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
  summary: {
    account: 'Chase-8008',
    accountType: 'credit',
    totalTransactions: SAMPLE_CREDIT_TRANSACTIONS.length,
    dateRange: {
      start: '04/15/2024',
      end: '05/25/2024'
    },
    balance: -152400.00, // Total credit card balance (negative = owed)
    totalDebits: 152400.00, // All expenses (positive for credit cards)
    totalCredits: 0.00, // No credits/payments shown
    netAmount: -152400.00, // Net owed
    businessRevenue: 0.00,
    ownerEquity: 0.00,
    otherCredits: 0.00,
    totalAllCredits: 0.00
  },
  categories: [
    { category: 'Other Business Expenses', amount: 79183.63, count: 1, percentage: 52.0 },
    { category: 'Consulting', amount: 43000.00, count: 2, percentage: 28.2 },
    { category: 'Legal Services', amount: 12500.00, count: 1, percentage: 8.2 },
    { category: 'Tax Services', amount: 8750.00, count: 1, percentage: 5.7 },
    { category: 'Office Equipment', amount: 3200.00, count: 1, percentage: 2.1 },
    { category: 'Advertising', amount: 2500.00, count: 1, percentage: 1.6 },
    { category: 'Travel', amount: 2140.50, count: 2, percentage: 1.4 },
    { category: 'Meals & Entertainment', amount: 425.75, count: 1, percentage: 0.3 },
    { category: 'Software', amount: 349.89, count: 2, percentage: 0.2 },
    { category: 'Office Supplies', amount: 180.25, count: 1, percentage: 0.1 },
    { category: 'Professional Services', amount: 169.98, count: 2, percentage: 0.1 }
  ],
  monthlyData: [
    { month: '2024-04', totalDebits: 3639.88, totalCredits: 0.00, netFlow: -3639.88, transactionCount: 4 },
    { month: '2024-05', totalDebits: 148760.12, totalCredits: 0.00, netFlow: -148760.12, transactionCount: 11 }
  ]
}