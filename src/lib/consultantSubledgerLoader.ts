import { parseConsultantSubledger, ConsultantSubledger } from './consultantSubledgerParser'

// Load consultant sub-ledger data
export async function loadConsultantSubledger(): Promise<ConsultantSubledger> {
  try {
    // In development, load from the template file
    const response = await fetch('/consultant-subledger-template.csv')

    if (!response.ok) {
      console.warn('Consultant sub-ledger file not found, using empty data')
      return { consultants: [], consultantMap: new Map() }
    }

    const csvContent = await response.text()
    return parseConsultantSubledger(csvContent)
  } catch (error) {
    console.error('Error loading consultant sub-ledger:', error)
    return { consultants: [], consultantMap: new Map() }
  }
}
