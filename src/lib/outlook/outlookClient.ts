/**
 * Microsoft Graph API client for Outlook email access
 * Extracts project details and deliverables from consultant communications
 */

import axios from 'axios'

const TENANT_ID = process.env.AZURE_TENANT_ID || ''
const CLIENT_ID = process.env.AZURE_CLIENT_ID || ''
const CLIENT_SECRET = process.env.AZURE_CLIENT_SECRET || ''

export interface EmailMessage {
  id: string
  subject: string
  from: string
  to: string[]
  receivedDateTime: string
  bodyPreview: string
  body: string
  hasAttachments: boolean
  conversationId: string
}

export interface ConsultantCommunication {
  consultantName: string
  emails: EmailMessage[]
  projects: string[]
  deliverables: string[]
  timeline: { date: string; subject: string }[]
}

/**
 * Get access token for Microsoft Graph API
 */
async function getAccessToken(): Promise<string> {
  const tokenEndpoint = `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token`

  try {
    const response = await axios.post(
      tokenEndpoint,
      new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        scope: 'https://graph.microsoft.com/.default',
        grant_type: 'client_credentials',
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    )

    return response.data.access_token
  } catch (error: any) {
    console.error('Error getting access token:', error.response?.data || error.message)
    throw new Error('Failed to authenticate with Microsoft Graph API')
  }
}

/**
 * Search emails by consultant name or email address
 */
export async function searchConsultantEmails(
  consultantName: string,
  consultantEmail?: string,
  userEmail: string = 'mike@markmanassociates.com' // Default to primary user
): Promise<EmailMessage[]> {
  try {
    const accessToken = await getAccessToken()

    // Build search query - prioritize email address if available
    let searchQuery = ''
    if (consultantEmail) {
      searchQuery = `from:${consultantEmail} OR to:${consultantEmail}`
    } else {
      searchQuery = `"${consultantName}"`
    }

    // Search in specified user's mailbox using application permissions
    // Note: Requires Mail.Read (Application) permission in Azure AD app registration
    const response = await axios.get(
      `https://graph.microsoft.com/v1.0/users/${userEmail}/messages`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          $search: searchQuery,
          $select: 'id,subject,from,toRecipients,receivedDateTime,bodyPreview,body,hasAttachments,conversationId',
          $top: 100,
          $orderby: 'receivedDateTime desc',
        },
      }
    )

    return response.data.value.map((msg: any) => ({
      id: msg.id,
      subject: msg.subject || '',
      from: msg.from?.emailAddress?.address || '',
      to: msg.toRecipients?.map((r: any) => r.emailAddress?.address) || [],
      receivedDateTime: msg.receivedDateTime,
      bodyPreview: msg.bodyPreview || '',
      body: msg.body?.content || '',
      hasAttachments: msg.hasAttachments || false,
      conversationId: msg.conversationId || '',
    }))
  } catch (error: any) {
    console.error('Error searching emails:', error.response?.data || error.message)
    return []
  }
}

/**
 * Extract project details from email content
 */
function extractProjectDetails(emails: EmailMessage[]): {
  projects: string[]
  deliverables: string[]
} {
  const projects = new Set<string>()
  const deliverables = new Set<string>()

  // Keywords to identify project mentions
  const projectKeywords = /(?:project|app|application|platform|system|portal|dashboard|website|service)[\s:]+([A-Z][A-Za-z\s]{3,50})/gi
  const deliverableKeywords = /(?:delivered|completed|implemented|built|developed|created)[\s:]+([A-Za-z\s]{5,80})/gi

  emails.forEach(email => {
    const content = `${email.subject} ${email.bodyPreview} ${email.body}`

    // Extract project names
    let match
    while ((match = projectKeywords.exec(content)) !== null) {
      const projectName = match[1].trim()
      if (projectName.length > 5 && projectName.length < 50) {
        projects.add(projectName)
      }
    }

    // Extract deliverables
    while ((match = deliverableKeywords.exec(content)) !== null) {
      const deliverable = match[1].trim()
      if (deliverable.length > 10 && deliverable.length < 80) {
        deliverables.add(deliverable)
      }
    }

    // Look for common project/deliverable patterns
    if (email.subject) {
      // Check for "Re: Project Name" patterns
      const reMatch = email.subject.match(/Re:\s*([A-Z][A-Za-z\s]{5,40})/i)
      if (reMatch) {
        projects.add(reMatch[1].trim())
      }

      // Check for status update patterns
      if (email.subject.toLowerCase().includes('update') ||
          email.subject.toLowerCase().includes('progress') ||
          email.subject.toLowerCase().includes('status')) {
        const words = email.subject.split(/[-:]/)[0].trim()
        if (words.length > 5 && words.length < 50) {
          projects.add(words)
        }
      }
    }
  })

  return {
    projects: Array.from(projects).slice(0, 10),
    deliverables: Array.from(deliverables).slice(0, 15),
  }
}

/**
 * Analyze consultant communications and extract work details
 */
export async function analyzeConsultantCommunications(
  consultantName: string,
  consultantEmail?: string,
  userEmail: string = 'mike@markmanassociates.com'
): Promise<ConsultantCommunication> {
  const emails = await searchConsultantEmails(consultantName, consultantEmail, userEmail)
  const { projects, deliverables } = extractProjectDetails(emails)

  // Build timeline of key communications
  const timeline = emails
    .slice(0, 20)
    .map(email => ({
      date: new Date(email.receivedDateTime).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      subject: email.subject,
    }))

  return {
    consultantName,
    emails,
    projects,
    deliverables,
    timeline,
  }
}

/**
 * Save consultant work history to local cache
 */
export async function cacheConsultantWorkHistory(
  consultantName: string,
  data: ConsultantCommunication
): Promise<void> {
  // Save to public/data/consultant-work-history/
  const fs = require('fs')
  const path = require('path')

  const cacheDir = path.join(process.cwd(), 'public', 'data', 'consultant-work-history')
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true })
  }

  const filename = `${consultantName.toLowerCase().replace(/\s+/g, '-')}.json`
  const filepath = path.join(cacheDir, filename)

  const cacheData = {
    consultantName,
    projects: data.projects,
    deliverables: data.deliverables,
    timeline: data.timeline,
    emailCount: data.emails.length,
    lastUpdated: new Date().toISOString(),
  }

  fs.writeFileSync(filepath, JSON.stringify(cacheData, null, 2))
  console.log(`✅ Cached work history for ${consultantName} to ${filepath}`)
}
