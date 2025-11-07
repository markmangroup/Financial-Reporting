// Bill.com Data Parser
// Parses vendor and bills data exported from Bill.com

export interface BillComVendor {
  id: string
  vendorName: string
  nameOnCheck: string
  companyName: string
  accountNumber: string
  taxId: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
  primaryEmail: string
  phone: string
  payBy: string
  paymentMethod: string
  paymentCurrency: string
  preferredPaymentMethod: string
  balance: number
  availableCredit: number
  status: 'Active' | 'Inactive'
  type: 'person' | 'business'
  lastPaymentDate?: string
}

export interface BillComBill {
  invoiceNo: string
  vendor: string
  description: string
  poNumber: string
  chartOfAccount: string
  billType: string
  createdDate: string
  invoiceDate: string
  dueDate: string
  currency: string
  invoiceAmount: number
  balanceDue: number
  paymentType: string
  paymentStatus: 'Paid' | 'Unpaid' | 'Partial'
  approvalStatus: 'Approved' | 'Approving' | 'Denied' | 'Pending'
  uploads?: string
  notes?: string
}

export interface BillComData {
  vendors: BillComVendor[]
  bills: BillComBill[]
  vendorMap: Map<string, BillComVendor>
  billsByVendor: Map<string, BillComBill[]>
}

// Parse Bill.com vendors CSV
export function parseBillComVendors(csvContent: string): BillComVendor[] {
  const lines = csvContent.trim().split('\n')

  if (lines.length < 2) {
    console.warn('Bill.com vendors CSV is empty')
    return []
  }

  const [header, ...dataLines] = lines
  const vendors: BillComVendor[] = []

  for (const line of dataLines) {
    try {
      const columns = parseCSVLine(line)

      if (columns.length < 20) continue

      const vendor: BillComVendor = {
        id: columns[2] || '',
        vendorName: columns[1] || '',
        nameOnCheck: columns[3] || '',
        companyName: columns[4] || '',
        accountNumber: columns[5] || '',
        taxId: columns[6] || '',
        address: [columns[10], columns[11], columns[12], columns[13]].filter(Boolean).join(', '),
        city: columns[14] || '',
        state: columns[15] || '',
        zipCode: columns[16] || '',
        country: columns[17] || '',
        primaryEmail: columns[18] || '',
        phone: columns[20] || '',
        payBy: columns[21] || '',
        paymentMethod: columns[57] || '',
        paymentCurrency: columns[42] || '',
        preferredPaymentMethod: columns[43] || '',
        balance: parseFloat(columns[32]) || 0,
        availableCredit: parseFloat(columns[33]) || 0,
        status: columns[0] === 'Active' ? 'Active' : 'Inactive',
        type: columns[31] === 'person' ? 'person' : 'business',
        lastPaymentDate: columns[60] || undefined
      }

      vendors.push(vendor)
    } catch (error) {
      console.warn('Error parsing Bill.com vendor record:', error)
    }
  }

  return vendors
}

// Parse Bill.com bills CSV
export function parseBillComBills(csvContent: string): BillComBill[] {
  const lines = csvContent.trim().split('\n')

  if (lines.length < 2) {
    console.warn('Bill.com bills CSV is empty')
    return []
  }

  const [header, ...dataLines] = lines
  const bills: BillComBill[] = []

  for (const line of dataLines) {
    try {
      const columns = parseCSVLine(line)

      if (columns.length < 15) continue

      const bill: BillComBill = {
        invoiceNo: columns[0] || '',
        vendor: columns[3] || '',
        description: columns[4] || '',
        poNumber: columns[5] || '',
        chartOfAccount: columns[6] || '',
        billType: columns[7] || '',
        createdDate: columns[8] || '',
        invoiceDate: columns[9] || '',
        dueDate: columns[10] || '',
        currency: columns[11] || 'USD',
        invoiceAmount: parseFloat(columns[12]) || 0,
        balanceDue: parseFloat(columns[13]) || 0,
        paymentType: columns[14] || '',
        paymentStatus: columns[15] === 'Paid' ? 'Paid' : columns[15] === 'Unpaid' ? 'Unpaid' : 'Partial',
        approvalStatus: (columns[16] as any) || 'Pending',
        uploads: columns[1] || undefined,
        notes: columns[2] || undefined
      }

      bills.push(bill)
    } catch (error) {
      console.warn('Error parsing Bill.com bill record:', error)
    }
  }

  return bills
}

// Combine vendors and bills into unified data structure
export function parseBillComData(vendorsCSV: string, billsCSV: string): BillComData {
  const vendors = parseBillComVendors(vendorsCSV)
  const bills = parseBillComBills(billsCSV)

  // Create vendor map for quick lookup
  const vendorMap = new Map<string, BillComVendor>()
  vendors.forEach(vendor => {
    vendorMap.set(vendor.vendorName.toLowerCase(), vendor)
    if (vendor.nameOnCheck) {
      vendorMap.set(vendor.nameOnCheck.toLowerCase(), vendor)
    }
  })

  // Group bills by vendor
  const billsByVendor = new Map<string, BillComBill[]>()
  bills.forEach(bill => {
    const vendorName = bill.vendor.toLowerCase()
    if (!billsByVendor.has(vendorName)) {
      billsByVendor.set(vendorName, [])
    }
    billsByVendor.get(vendorName)!.push(bill)
  })

  return {
    vendors,
    bills,
    vendorMap,
    billsByVendor
  }
}

// Helper to parse CSV line with proper quote handling
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

// Get outstanding bills for a vendor
export function getOutstandingBills(vendorName: string, billComData: BillComData): BillComBill[] {
  const bills = billComData.billsByVendor.get(vendorName.toLowerCase()) || []
  return bills.filter(bill => bill.paymentStatus === 'Unpaid' && bill.balanceDue > 0)
}

// Get total outstanding amount for a vendor
export function getOutstandingAmount(vendorName: string, billComData: BillComData): number {
  const outstandingBills = getOutstandingBills(vendorName, billComData)
  return outstandingBills.reduce((sum, bill) => sum + bill.balanceDue, 0)
}

// Get all unpaid bills across all vendors
export function getAllUnpaidBills(billComData: BillComData): BillComBill[] {
  return billComData.bills.filter(bill => bill.paymentStatus === 'Unpaid' && bill.balanceDue > 0)
}

// Match Bill.com vendor to consultant name
export function matchVendorToConsultant(vendorName: string): string | null {
  const name = vendorName.toLowerCase()

  // Direct mappings
  if (name.includes('ivana')) return 'Ivana'
  if (name.includes('nikoleta') || name.includes('nikyn')) return 'Nikoleta'
  if (name.includes('inversiones') || name.includes('teiz')) return 'Carmen'
  if (name.includes('trusted')) return 'Petrana'
  if (name.includes('jan') && name.includes('dzubak')) return 'Jan'
  if (name.includes('nikola') && name.includes('draganov')) return 'Nikola'

  return null
}
