// Consultant Sub-Ledger Parser
// Reads consultant master data and links it with transaction data

export interface ConsultantRecord {
  id: string
  name: string
  country: string
  role: string
  specialization: string
  hourlyRate: number
  contractType: 'Hourly' | 'Monthly Retainer' | 'Project-Based'
  paymentMethod: string
  startDate: string
  endDate?: string
  status: 'Active' | 'Inactive' | 'On Hold'
  email: string
  taxId: string
  companyName: string
  notes: string
}

export interface ConsultantSubledger {
  consultants: ConsultantRecord[]
  consultantMap: Map<string, ConsultantRecord> // Name -> Record for quick lookup
}

// Parse consultant sub-ledger CSV
export function parseConsultantSubledger(csvContent: string): ConsultantSubledger {
  const lines = csvContent.trim().split('\n')

  if (lines.length < 2) {
    console.warn('Consultant sub-ledger CSV is empty or invalid')
    return { consultants: [], consultantMap: new Map() }
  }

  const [header, ...dataLines] = lines
  const consultants: ConsultantRecord[] = []
  const consultantMap = new Map<string, ConsultantRecord>()

  for (const line of dataLines) {
    try {
      const columns = parseCSVLine(line)

      if (columns.length < 10) continue

      const consultant: ConsultantRecord = {
        id: columns[0],
        name: columns[1],
        country: columns[2],
        role: columns[3],
        specialization: columns[4],
        hourlyRate: parseFloat(columns[5]) || 0,
        contractType: (columns[6] as any) || 'Hourly',
        paymentMethod: columns[7],
        startDate: columns[8],
        endDate: columns[9] || undefined,
        status: (columns[10] as any) || 'Active',
        email: columns[11] || '',
        taxId: columns[12] || '',
        companyName: columns[13] || '',
        notes: columns[14] || ''
      }

      consultants.push(consultant)

      // Create multiple map entries for fuzzy matching
      consultantMap.set(consultant.name.toLowerCase(), consultant)

      // Add alternative keys for matching
      const simpleName = consultant.name.replace(/\(.*?\)/g, '').trim().toLowerCase()
      consultantMap.set(simpleName, consultant)

      // Add first name key
      const firstName = consultant.name.split(' ')[0].toLowerCase()
      consultantMap.set(firstName, consultant)

      // Add company name mapping if exists (for matching Trusted Ltd -> Petrana, etc.)
      if (consultant.companyName) {
        const companyKey = consultant.companyName.toLowerCase()
        consultantMap.set(companyKey, consultant)

        // Add simplified company name (remove Ltd, LLC, S.L., etc.)
        const simpleCompany = companyKey
          .replace(/\b(ltd|llc|inc|corp|s\.l\.|limited|gmbh)\b/gi, '')
          .trim()
        if (simpleCompany) {
          consultantMap.set(simpleCompany, consultant)
        }
      }

    } catch (error) {
      console.warn('Error parsing consultant record:', error)
    }
  }

  return { consultants, consultantMap }
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

// Match consultant name from transaction description
export function matchConsultantFromDescription(description: string, consultantMap: Map<string, ConsultantRecord>): ConsultantRecord | null {
  const desc = description.toLowerCase()

  // Try exact matches first
  for (const [key, consultant] of consultantMap.entries()) {
    if (desc.includes(key)) {
      return consultant
    }
  }

  // Try partial matches
  const keywords = ['carmen', 'pepi', 'ivana', 'nikoleta', 'swan', 'abri', 'jan', 'petrana', 'beata', 'marianna', 'nikola', 'trusted', 'inversiones']
  for (const keyword of keywords) {
    if (desc.includes(keyword)) {
      return consultantMap.get(keyword) || null
    }
  }

  return null
}
