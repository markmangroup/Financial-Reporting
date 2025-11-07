/**
 * Bulk export all emails for consultants
 * Creates a comprehensive email database for manual review
 */

import { NextResponse } from 'next/server'
import { searchConsultantEmails } from '@/lib/outlook/outlookClient'
import fs from 'fs'
import path from 'path'

interface ConsultantEmailExport {
  consultantName: string
  email?: string
  totalEmails: number
  emails: Array<{
    id: string
    date: string
    from: string
    to: string[]
    subject: string
    bodyPreview: string
    hasAttachments: boolean
    reviewed: boolean
    isRelevant: boolean
    extractedInfo: {
      projects: string[]
      deliverables: string[]
      notes: string
    }
  }>
  exportDate: string
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { consultants, userEmail = 'mike@markmanassociates.com' } = body

    if (!consultants || !Array.isArray(consultants)) {
      return NextResponse.json(
        { error: 'Consultants array is required' },
        { status: 400 }
      )
    }

    const results: any[] = []
    const exportDir = path.join(process.cwd(), 'public', 'data', 'consultant-emails')

    // Create export directory if it doesn't exist
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true })
    }

    // Export emails for each consultant
    for (const consultant of consultants) {
      console.log(`📧 Exporting emails for: ${consultant.name}`)

      const emails = await searchConsultantEmails(
        consultant.name,
        consultant.email,
        userEmail
      )

      const exportData: ConsultantEmailExport = {
        consultantName: consultant.name,
        email: consultant.email,
        totalEmails: emails.length,
        emails: emails.map(email => ({
          id: email.id,
          date: email.receivedDateTime,
          from: email.from,
          to: email.to,
          subject: email.subject,
          bodyPreview: email.bodyPreview,
          hasAttachments: email.hasAttachments,
          reviewed: false,
          isRelevant: false,
          extractedInfo: {
            projects: [],
            deliverables: [],
            notes: ''
          }
        })),
        exportDate: new Date().toISOString()
      }

      // Save to file
      const filename = `${consultant.name.toLowerCase().replace(/\s+/g, '-')}-emails.json`
      const filepath = path.join(exportDir, filename)
      fs.writeFileSync(filepath, JSON.stringify(exportData, null, 2))

      results.push({
        consultant: consultant.name,
        emailCount: emails.length,
        filepath: `/data/consultant-emails/${filename}`
      })

      console.log(`✅ Exported ${emails.length} emails for ${consultant.name}`)
    }

    return NextResponse.json({
      success: true,
      message: `Exported emails for ${consultants.length} consultants`,
      results,
      reviewUrl: '/review-consultant-emails'
    })

  } catch (error: any) {
    console.error('Error exporting consultant emails:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to export emails' },
      { status: 500 }
    )
  }
}
