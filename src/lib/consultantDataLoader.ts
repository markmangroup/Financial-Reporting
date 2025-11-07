// Load and parse consultant subledger data
import fs from 'fs'
import path from 'path'

export interface Consultant {
  id: string
  name: string
  country: string
  role: string
  specialization: string
  hourlyRate: number
  contractType: string
  paymentMethod: string
  startDate: string
  endDate?: string
  status: 'Active' | 'Ended' | 'Inactive'
  email: string
  taxId?: string
  notes?: string
  totalPaid: number
}

export interface ConsultantSummary {
  totalConsultants: number
  activeConsultants: number
  endedConsultants: number
  totalPaid: number
  totalOutstanding: number
  byPaymentMethod: { [key: string]: number }
  byStatus: { [key: string]: number }
  byCountry: { [key: string]: number }
  byRole: { [key: string]: number }
}

function parseCSV(csv: string): any[] {
  // Remove BOM if present
  csv = csv.replace(/^\uFEFF/, '')

  const lines = csv.trim().split('\n')
  if (lines.length < 2) return []

  const result = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const row = []
    let current = ''
    let inQuotes = false

    for (let j = 0; j < line.length; j++) {
      const char = line[j]

      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === ',' && !inQuotes) {
        row.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
    row.push(current.trim())
    result.push(row)
  }

  // Convert to objects
  const headers = result[0]
  return result.slice(1).map(row => {
    const obj: any = {}
    headers.forEach((header, index) => {
      obj[header] = row[index] || ''
    })
    return obj
  })
}

export function loadConsultantData(): Consultant[] {
  try {
    const csvPath = path.join(process.cwd(), 'consultant-subledger-template.csv')
    const csvContent = fs.readFileSync(csvPath, 'utf-8')
    const rows = parseCSV(csvContent)

    return rows.map(row => ({
      id: row.ConsultantID || '',
      name: row.Name || '',
      country: row.Country || 'Unknown',
      role: row.Role || '',
      specialization: row.Specialization || '',
      hourlyRate: parseFloat(row.HourlyRate) || 0,
      contractType: row.ContractType || '',
      paymentMethod: row.PaymentMethod || '',
      startDate: row.StartDate || '',
      endDate: row.EndDate || undefined,
      status: (row.Status as 'Active' | 'Ended' | 'Inactive') || 'Active',
      email: row.Email || '',
      taxId: row.TaxID || undefined,
      notes: row.Notes || undefined,
      totalPaid: parseFloat(row.TotalPaid) || 0
    }))
  } catch (error) {
    console.error('Error loading consultant data:', error)
    return []
  }
}

export function getConsultantSummary(consultants: Consultant[]): ConsultantSummary {
  const summary: ConsultantSummary = {
    totalConsultants: consultants.length,
    activeConsultants: consultants.filter(c => c.status === 'Active').length,
    endedConsultants: consultants.filter(c => c.status === 'Ended').length,
    totalPaid: consultants.reduce((sum, c) => sum + c.totalPaid, 0),
    totalOutstanding: 0,
    byPaymentMethod: {},
    byStatus: {},
    byCountry: {},
    byRole: {}
  }

  // Extract outstanding amounts from notes
  consultants.forEach(c => {
    if (c.notes?.includes('OUTSTANDING')) {
      const match = c.notes.match(/\$(\d+(?:,\d+)?)/g)
      if (match) {
        const amount = parseFloat(match[0].replace(/[$,]/g, ''))
        summary.totalOutstanding += amount
      }
    }

    // Group by payment method
    const method = c.paymentMethod.split('+')[0].trim() // Take first method if multiple
    summary.byPaymentMethod[method] = (summary.byPaymentMethod[method] || 0) + c.totalPaid

    // Group by status
    summary.byStatus[c.status] = (summary.byStatus[c.status] || 0) + c.totalPaid

    // Group by country
    summary.byCountry[c.country] = (summary.byCountry[c.country] || 0) + c.totalPaid

    // Group by role
    summary.byRole[c.role] = (summary.byRole[c.role] || 0) + c.totalPaid
  })

  return summary
}

export function getTopConsultantsBySpend(consultants: Consultant[], limit: number = 5): Consultant[] {
  return consultants
    .filter(c => c.totalPaid > 0)
    .sort((a, b) => b.totalPaid - a.totalPaid)
    .slice(0, limit)
}

export function getActiveConsultants(consultants: Consultant[]): Consultant[] {
  return consultants.filter(c => c.status === 'Active')
}

export function getConsultantsByPaymentMethod(consultants: Consultant[], method: string): Consultant[] {
  return consultants.filter(c => c.paymentMethod.includes(method))
}

export function getOutstandingInvoices(consultants: Consultant[]): Array<{ name: string; amount: number; notes: string }> {
  return consultants
    .filter(c => c.notes?.includes('OUTSTANDING'))
    .map(c => {
      const match = c.notes?.match(/\$(\d+(?:,\d+)?)/g)
      const amount = match ? parseFloat(match[0].replace(/[$,]/g, '')) : 0
      return {
        name: c.name,
        amount,
        notes: c.notes || ''
      }
    })
    .filter(item => item.amount > 0)
}
