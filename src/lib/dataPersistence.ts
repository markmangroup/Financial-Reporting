import { ParsedCSVData } from '@/types'

const STORAGE_KEYS = {
  CHECKING_DATA: 'markman_checking_data',
  CREDIT_DATA: 'markman_credit_data',
  RAW_CHECKING_CSV: 'markman_raw_checking_csv',
  RAW_CREDIT_CSV: 'markman_raw_credit_csv',
  LAST_UPDATED: 'markman_last_updated'
} as const

export interface StoredData {
  checkingData: ParsedCSVData | null
  creditData: ParsedCSVData | null
  rawCheckingCSV: string
  rawCreditCSV: string
  lastUpdated: string
}

/**
 * Check if localStorage is available (client-side only)
 */
function isLocalStorageAvailable(): boolean {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined'
}

/**
 * Save financial data to localStorage
 */
export function saveFinancialData(data: {
  checkingData?: ParsedCSVData | null
  creditData?: ParsedCSVData | null
  rawCheckingCSV?: string
  rawCreditCSV?: string
}): void {
  if (!isLocalStorageAvailable()) {
    console.log('localStorage not available (server-side rendering)')
    return
  }

  try {
    const timestamp = new Date().toISOString()
    
    if (data.checkingData) {
      localStorage.setItem(STORAGE_KEYS.CHECKING_DATA, JSON.stringify(data.checkingData))
    }
    
    if (data.creditData) {
      localStorage.setItem(STORAGE_KEYS.CREDIT_DATA, JSON.stringify(data.creditData))
    }
    
    if (data.rawCheckingCSV) {
      localStorage.setItem(STORAGE_KEYS.RAW_CHECKING_CSV, data.rawCheckingCSV)
    }
    
    if (data.rawCreditCSV) {
      localStorage.setItem(STORAGE_KEYS.RAW_CREDIT_CSV, data.rawCreditCSV)
    }
    
    localStorage.setItem(STORAGE_KEYS.LAST_UPDATED, timestamp)
    
    console.log('Financial data saved to localStorage')
  } catch (error) {
    console.error('Error saving data to localStorage:', error)
    // Fallback: try to save without raw CSV data
    try {
      if (data.checkingData) {
        localStorage.setItem(STORAGE_KEYS.CHECKING_DATA, JSON.stringify(data.checkingData))
      }
      if (data.creditData) {
        localStorage.setItem(STORAGE_KEYS.CREDIT_DATA, JSON.stringify(data.creditData))
      }
      localStorage.setItem(STORAGE_KEYS.LAST_UPDATED, new Date().toISOString())
    } catch (fallbackError) {
      console.error('Fallback save also failed:', fallbackError)
    }
  }
}

/**
 * Load financial data from localStorage
 */
export function loadFinancialData(): StoredData | null {
  if (!isLocalStorageAvailable()) {
    return null
  }

  try {
    const checkingDataStr = localStorage.getItem(STORAGE_KEYS.CHECKING_DATA)
    const creditDataStr = localStorage.getItem(STORAGE_KEYS.CREDIT_DATA)
    const rawCheckingCSV = localStorage.getItem(STORAGE_KEYS.RAW_CHECKING_CSV) || ''
    const rawCreditCSV = localStorage.getItem(STORAGE_KEYS.RAW_CREDIT_CSV) || ''
    const lastUpdated = localStorage.getItem(STORAGE_KEYS.LAST_UPDATED) || ''
    
    if (!checkingDataStr && !creditDataStr) {
      return null
    }
    
    const checkingData = checkingDataStr ? JSON.parse(checkingDataStr) as ParsedCSVData : null
    const creditData = creditDataStr ? JSON.parse(creditDataStr) as ParsedCSVData : null
    
    return {
      checkingData,
      creditData,
      rawCheckingCSV,
      rawCreditCSV,
      lastUpdated
    }
  } catch (error) {
    console.error('Error loading data from localStorage:', error)
    return null
  }
}

/**
 * Clear all financial data from localStorage
 */
export function clearFinancialData(): void {
  if (!isLocalStorageAvailable()) {
    return
  }

  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key)
    })
    console.log('Financial data cleared from localStorage')
  } catch (error) {
    console.error('Error clearing localStorage:', error)
  }
}

/**
 * Check if data exists in localStorage
 */
export function hasStoredData(): boolean {
  if (!isLocalStorageAvailable()) {
    return false
  }

  try {
    const checkingData = localStorage.getItem(STORAGE_KEYS.CHECKING_DATA)
    const creditData = localStorage.getItem(STORAGE_KEYS.CREDIT_DATA)
    return !!(checkingData || creditData)
  } catch (error) {
    console.error('Error checking stored data:', error)
    return false
  }
}

/**
 * Get data age in hours
 */
export function getDataAge(): number {
  if (!isLocalStorageAvailable()) {
    return Infinity
  }

  try {
    const lastUpdated = localStorage.getItem(STORAGE_KEYS.LAST_UPDATED)
    if (!lastUpdated) return Infinity
    
    const lastUpdateTime = new Date(lastUpdated).getTime()
    const now = new Date().getTime()
    return (now - lastUpdateTime) / (1000 * 60 * 60) // Convert to hours
  } catch (error) {
    console.error('Error calculating data age:', error)
    return Infinity
  }
}

/**
 * Check if stored data is stale (older than 24 hours)
 */
export function isDataStale(): boolean {
  return getDataAge() > 24
}

/**
 * Get storage usage information
 */
export function getStorageInfo(): {
  hasData: boolean
  dataAge: number
  isStale: boolean
  lastUpdated: string
} {
  const hasData = hasStoredData()
  const dataAge = getDataAge()
  const isStale = isDataStale()
  const lastUpdated = localStorage.getItem(STORAGE_KEYS.LAST_UPDATED) || ''
  
  return {
    hasData,
    dataAge: Math.round(dataAge * 100) / 100, // Round to 2 decimal places
    isStale,
    lastUpdated: lastUpdated ? new Date(lastUpdated).toLocaleString() : 'Never'
  }
}