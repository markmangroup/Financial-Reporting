// Reconcile Chase consultant payments with consultant subledger
import { InsightData } from './insightTypes'
import { Consultant } from '../consultantDataLoader'

export interface ReconciledConsultant {
  name: string
  amount: number // From Chase
  subledgerAmount: number // From subledger TotalPaid
  percentage: number
  payments: number
  country?: string
  role?: string
  specialization?: string
  hourlyRate?: number
  contractType?: string
  status?: string
  paymentMethod?: string
  source: 'chase' | 'subledger' | 'both'
  matched: boolean
}

export interface ConsultantReconciliation {
  total: number // Total from Chase
  matched: ReconciledConsultant[] // Consultants in both Chase and subledger
  chaseOnly: ReconciledConsultant[] // Payments in Chase but not in subledger
  subledgerOnly: ReconciledConsultant[] // Contractors in subledger with no Chase payments
  totalMatched: number
  totalUnmatched: number
  totalSubledgerOnly: number
}

/**
 * Reconcile Chase consultant spending with consultant subledger
 */
export function reconcileConsultants(data: InsightData, consultantTotal: number, consultantBreakdown: any[]): ConsultantReconciliation {
  const result: ConsultantReconciliation = {
    total: consultantTotal,
    matched: [],
    chaseOnly: [],
    subledgerOnly: [],
    totalMatched: 0,
    totalUnmatched: 0,
    totalSubledgerOnly: 0
  }

  // If no subledger data, return Chase data only
  if (!data.consultantSubledger || !data.consultantSubledger.consultantMap) {
    result.chaseOnly = consultantBreakdown.map(c => ({
      name: c.name,
      amount: c.amount,
      subledgerAmount: 0,
      percentage: (c.amount / consultantTotal) * 100,
      payments: data.checkingData.transactions.filter((t: any) =>
        t.category && t.category.includes('Consultant') && t.category.includes(c.name)
      ).length,
      source: 'chase' as const,
      matched: false
    }))
    result.totalUnmatched = consultantTotal
    return result
  }

  const subledgerMap = data.consultantSubledger.consultantMap
  const matchedNames = new Set<string>()

  // Process Chase payments and match with subledger
  consultantBreakdown.forEach(chaseConsultant => {
    const simpleName = chaseConsultant.name.toLowerCase().replace(/[()]/g, '').trim()
    let subledgerRecord = null
    let matchedKey = null

    // Try to match with subledger
    for (const [key, value] of subledgerMap.entries()) {
      const keyLower = key.toLowerCase()
      const nameWords = simpleName.split(/[\s-]/)

      // Match if any significant word from Chase name appears in subledger key
      if (nameWords.some((word: string) => word.length >= 3 && keyLower.includes(word)) ||
          keyLower.split(/[\s-]/).some((word: string) => word.length >= 3 && simpleName.includes(word))) {
        subledgerRecord = value
        matchedKey = key
        break
      }
    }

    const paymentCount = data.checkingData.transactions.filter((t: any) =>
      t.category && t.category.includes('Consultant') && t.category.includes(chaseConsultant.name)
    ).length

    const reconciledData: ReconciledConsultant = {
      name: chaseConsultant.name,
      amount: chaseConsultant.amount,
      subledgerAmount: subledgerRecord?.totalPaid || 0,
      percentage: (chaseConsultant.amount / consultantTotal) * 100,
      payments: paymentCount,
      source: subledgerRecord ? 'both' : 'chase',
      matched: !!subledgerRecord
    }

    if (subledgerRecord) {
      reconciledData.country = subledgerRecord.country
      reconciledData.role = subledgerRecord.role
      reconciledData.specialization = subledgerRecord.specialization
      reconciledData.hourlyRate = subledgerRecord.hourlyRate
      reconciledData.contractType = subledgerRecord.contractType
      reconciledData.status = subledgerRecord.status
      reconciledData.paymentMethod = subledgerRecord.paymentMethod
      result.matched.push(reconciledData)
      result.totalMatched += chaseConsultant.amount
      if (matchedKey) matchedNames.add(matchedKey)
    } else {
      result.chaseOnly.push(reconciledData)
      result.totalUnmatched += chaseConsultant.amount
    }
  })

  // Add consultants from subledger that have no Chase payments
  for (const [key, value] of subledgerMap.entries()) {
    if (!matchedNames.has(key) && value.totalPaid > 0) {
      // Only include if they have actual payments recorded in subledger
      result.subledgerOnly.push({
        name: value.name,
        amount: 0, // No Chase payment found
        subledgerAmount: value.totalPaid,
        percentage: 0,
        payments: 0,
        country: value.country,
        role: value.role,
        specialization: value.specialization,
        hourlyRate: value.hourlyRate,
        contractType: value.contractType,
        status: value.status,
        paymentMethod: value.paymentMethod,
        source: 'subledger',
        matched: false
      })
      result.totalSubledgerOnly += value.totalPaid
    }
  }

  return result
}

/**
 * Format reconciliation for display
 */
export function formatReconciliationSummary(reconciliation: ConsultantReconciliation): string {
  const lines = []

  lines.push(`**Total Chase Consultant Spending: $${reconciliation.total.toLocaleString()}**`)
  lines.push('')

  if (reconciliation.matched.length > 0) {
    lines.push(`✓ **Matched Contractors** (${reconciliation.matched.length}): $${reconciliation.totalMatched.toLocaleString()}`)
    lines.push(`  Contractors with payments tracked in both Chase and subledger`)
  }

  if (reconciliation.chaseOnly.length > 0) {
    lines.push(`• **Other Payments** (${reconciliation.chaseOnly.length}): $${reconciliation.totalUnmatched.toLocaleString()}`)
    lines.push(`  Chase payments not yet in contractor subledger`)
  }

  if (reconciliation.subledgerOnly.length > 0) {
    lines.push(`ℹ️ **Subledger-Only Contractors** (${reconciliation.subledgerOnly.length}): $${reconciliation.totalSubledgerOnly.toLocaleString()}`)
    lines.push(`  Contractors paid through other channels (Upwork, etc.)`)
  }

  return lines.join('\n')
}
