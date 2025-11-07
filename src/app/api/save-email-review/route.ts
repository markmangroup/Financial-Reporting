/**
 * Save reviewed consultant email data back to JSON files
 */

import { NextResponse } from 'next/server'
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
    const emailData: ConsultantEmailExport = await request.json()

    if (!emailData.consultantName) {
      return NextResponse.json(
        { error: 'Consultant name is required' },
        { status: 400 }
      )
    }

    const filename = `${emailData.consultantName.toLowerCase().replace(/\s+/g, '-')}-emails.json`
    const filepath = path.join(process.cwd(), 'public', 'data', 'consultant-emails', filename)

    // Save the reviewed data
    fs.writeFileSync(filepath, JSON.stringify(emailData, null, 2))

    return NextResponse.json({
      success: true,
      message: `Saved review progress for ${emailData.consultantName}`,
      reviewedCount: emailData.emails.filter(e => e.reviewed).length,
      relevantCount: emailData.emails.filter(e => e.isRelevant).length
    })

  } catch (error: any) {
    console.error('Error saving email review:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to save email review' },
      { status: 500 }
    )
  }
}
