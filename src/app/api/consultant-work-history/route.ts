/**
 * API endpoint to fetch consultant work history from Outlook emails
 */

import { NextResponse } from 'next/server'
import { analyzeConsultantCommunications, cacheConsultantWorkHistory } from '@/lib/outlook/outlookClient'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const consultantName = searchParams.get('name')
    const consultantEmail = searchParams.get('email') || undefined

    if (!consultantName) {
      return NextResponse.json(
        { error: 'Consultant name is required' },
        { status: 400 }
      )
    }

    const userEmail = searchParams.get('userEmail') || 'mike@markmanassociates.com'

    console.log(`📧 Analyzing emails for: ${consultantName} in mailbox: ${userEmail}`)

    // Analyze consultant communications
    const workHistory = await analyzeConsultantCommunications(
      consultantName,
      consultantEmail,
      userEmail
    )

    // Cache the results for future use
    await cacheConsultantWorkHistory(consultantName, workHistory)

    return NextResponse.json({
      success: true,
      consultantName: workHistory.consultantName,
      emailCount: workHistory.emails.length,
      projects: workHistory.projects,
      deliverables: workHistory.deliverables,
      timeline: workHistory.timeline,
      message: `Found ${workHistory.emails.length} emails, ${workHistory.projects.length} projects, ${workHistory.deliverables.length} deliverables`,
    })
  } catch (error: any) {
    console.error('Error fetching consultant work history:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch consultant work history' },
      { status: 500 }
    )
  }
}

/**
 * POST endpoint to manually add work history data
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { consultantName, projects, deliverables, timeline } = body

    if (!consultantName) {
      return NextResponse.json(
        { error: 'Consultant name is required' },
        { status: 400 }
      )
    }

    await cacheConsultantWorkHistory(consultantName, {
      consultantName,
      emails: [],
      projects: projects || [],
      deliverables: deliverables || [],
      timeline: timeline || [],
    })

    return NextResponse.json({
      success: true,
      message: `Work history saved for ${consultantName}`,
    })
  } catch (error: any) {
    console.error('Error saving consultant work history:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to save consultant work history' },
      { status: 500 }
    )
  }
}
