/**
 * Load consultant work history from cached email analysis
 * Note: This module uses fs and must only be imported in server-side code
 */

let fs: any
let path: any

// Only import fs/path on server side
if (typeof window === 'undefined') {
  fs = require('fs')
  path = require('path')
}

// Check if we're in a server environment
const isServer = typeof window === 'undefined'

export interface ConsultantWorkHistory {
  consultantName: string
  projects: string[]
  deliverables: string[]
  timeline: { date: string; subject: string }[]
  emailCount: number
  lastUpdated: string
}

/**
 * Load work history for a specific consultant
 * Works on both server and client side
 */
export function loadConsultantWorkHistory(consultantName: string): ConsultantWorkHistory | null {
  if (!isServer) {
    // Client-side: use synchronous fetch is not possible, so return null
    // The caller should use loadConsultantWorkHistoryAsync instead
    console.warn('loadConsultantWorkHistory can only be called on the server. Use loadConsultantWorkHistoryAsync for client-side.')
    return null
  }

  try {
    const filename = `${consultantName.toLowerCase().replace(/\s+/g, '-')}.json`
    const filepath = path.join(process.cwd(), 'public', 'data', 'consultant-work-history', filename)

    if (!fs.existsSync(filepath)) {
      return null
    }

    const data = fs.readFileSync(filepath, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    console.error(`Error loading work history for ${consultantName}:`, error)
    return null
  }
}

/**
 * Load work history for a specific consultant (async version for client-side)
 */
export async function loadConsultantWorkHistoryAsync(consultantName: string): Promise<ConsultantWorkHistory | null> {
  try {
    const filename = `${consultantName.toLowerCase().replace(/\s+/g, '-')}.json`
    const response = await fetch(`/data/consultant-work-history/${filename}`)

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error(`Error loading work history for ${consultantName}:`, error)
    return null
  }
}

/**
 * Load all consultant work histories
 */
export function loadAllConsultantWorkHistories(): Map<string, ConsultantWorkHistory> {
  const workHistories = new Map<string, ConsultantWorkHistory>()

  if (!isServer) {
    console.warn('loadAllConsultantWorkHistories can only be called on the server')
    return workHistories
  }

  try {
    const dirPath = path.join(process.cwd(), 'public', 'data', 'consultant-work-history')

    if (!fs.existsSync(dirPath)) {
      return workHistories
    }

    const files = fs.readdirSync(dirPath)

    files.forEach(file => {
      if (file.endsWith('.json')) {
        const filepath = path.join(dirPath, file)
        const data = fs.readFileSync(filepath, 'utf-8')
        const workHistory = JSON.parse(data)
        workHistories.set(workHistory.consultantName.toLowerCase(), workHistory)
      }
    })
  } catch (error) {
    console.error('Error loading work histories:', error)
  }

  return workHistories
}
