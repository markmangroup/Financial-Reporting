'use client'

import { useState, useEffect } from 'react'

interface EmailReview {
  id: string
  date: string
  from: string
  subject: string
  bodyPreview: string
  reviewed: boolean
  isRelevant: boolean
  extractedInfo: {
    projects: string[]
    deliverables: string[]
    notes: string
  }
}

interface ConsultantEmails {
  consultantName: string
  totalEmails: number
  emails: EmailReview[]
}

export default function ReviewConsultantEmailsPage() {
  const [consultants, setConsultants] = useState<string[]>([])
  const [selectedConsultant, setSelectedConsultant] = useState<string>('')
  const [emails, setEmails] = useState<ConsultantEmails | null>(null)
  const [currentEmailIndex, setCurrentEmailIndex] = useState(0)
  const [loading, setLoading] = useState(false)

  // Load available consultant email exports
  useEffect(() => {
    loadAvailableConsultants()
  }, [])

  const loadAvailableConsultants = async () => {
    // For now, hardcode the consultants we want to review
    // In production, this would list files from /public/data/consultant-emails/
    setConsultants(['Swan', 'Niki', 'Abri', 'Carmen', 'Jan', 'Petrana'])
  }

  const loadConsultantEmails = async (consultantName: string) => {
    setLoading(true)
    try {
      const filename = `${consultantName.toLowerCase()}-emails.json`
      const response = await fetch(`/data/consultant-emails/${filename}`)

      if (response.ok) {
        const data = await response.json()
        setEmails(data)
        setCurrentEmailIndex(0)
      } else {
        alert(`No emails exported yet for ${consultantName}. Use the export tool first.`)
      }
    } catch (error) {
      console.error('Error loading emails:', error)
      alert('Failed to load emails')
    } finally {
      setLoading(false)
    }
  }

  const markAsRelevant = () => {
    if (!emails) return

    const updatedEmails = [...emails.emails]
    updatedEmails[currentEmailIndex] = {
      ...updatedEmails[currentEmailIndex],
      reviewed: true,
      isRelevant: true
    }

    setEmails({ ...emails, emails: updatedEmails })
    nextEmail()
  }

  const markAsIrrelevant = () => {
    if (!emails) return

    const updatedEmails = [...emails.emails]
    updatedEmails[currentEmailIndex] = {
      ...updatedEmails[currentEmailIndex],
      reviewed: true,
      isRelevant: false
    }

    setEmails({ ...emails, emails: updatedEmails })
    nextEmail()
  }

  const addProject = () => {
    const project = prompt('Enter project name:')
    if (!project || !emails) return

    const updatedEmails = [...emails.emails]
    updatedEmails[currentEmailIndex].extractedInfo.projects.push(project)
    setEmails({ ...emails, emails: updatedEmails })
  }

  const addDeliverable = () => {
    const deliverable = prompt('Enter deliverable:')
    if (!deliverable || !emails) return

    const updatedEmails = [...emails.emails]
    updatedEmails[currentEmailIndex].extractedInfo.deliverables.push(deliverable)
    setEmails({ ...emails, emails: updatedEmails })
  }

  const addNote = () => {
    const note = prompt('Enter note:')
    if (!note || !emails) return

    const updatedEmails = [...emails.emails]
    updatedEmails[currentEmailIndex].extractedInfo.notes = note
    setEmails({ ...emails, emails: updatedEmails })
  }

  const nextEmail = () => {
    if (emails && currentEmailIndex < emails.emails.length - 1) {
      setCurrentEmailIndex(currentEmailIndex + 1)
    }
  }

  const previousEmail = () => {
    if (currentEmailIndex > 0) {
      setCurrentEmailIndex(currentEmailIndex - 1)
    }
  }

  const saveReview = async () => {
    if (!emails) return

    // Save back to the JSON file via API
    const response = await fetch('/api/save-email-review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(emails)
    })

    if (response.ok) {
      alert('Review saved successfully!')
    } else {
      alert('Failed to save review')
    }
  }

  const exportToWorkHistory = async () => {
    if (!emails) return

    // Extract all relevant information and save to work history
    const relevantEmails = emails.emails.filter(e => e.isRelevant)
    const projects = new Set<string>()
    const deliverables = new Set<string>()

    relevantEmails.forEach(email => {
      email.extractedInfo.projects.forEach(p => projects.add(p))
      email.extractedInfo.deliverables.forEach(d => deliverables.add(d))
    })

    const workHistory = {
      consultantName: emails.consultantName,
      projects: Array.from(projects),
      deliverables: Array.from(deliverables),
      timeline: relevantEmails.map(e => ({
        date: new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        subject: e.subject
      })),
      emailCount: relevantEmails.length,
      lastUpdated: new Date().toISOString()
    }

    const response = await fetch('/api/consultant-work-history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(workHistory)
    })

    if (response.ok) {
      alert(`Exported ${relevantEmails.length} relevant emails to work history!`)
    }
  }

  const currentEmail = emails?.emails[currentEmailIndex]
  const reviewedCount = emails?.emails.filter(e => e.reviewed).length || 0
  const relevantCount = emails?.emails.filter(e => e.isRelevant).length || 0

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            📧 Review Consultant Emails
          </h1>
          <p className="text-gray-600 mb-6">
            Go through emails and extract valuable project information
          </p>

          {/* Consultant Selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Consultant
            </label>
            <div className="flex space-x-2">
              <select
                value={selectedConsultant}
                onChange={(e) => setSelectedConsultant(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">-- Select Consultant --</option>
                {consultants.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <button
                onClick={() => selectedConsultant && loadConsultantEmails(selectedConsultant)}
                disabled={!selectedConsultant || loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
              >
                {loading ? 'Loading...' : 'Load Emails'}
              </button>
            </div>
          </div>

          {/* Progress */}
          {emails && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex justify-between text-sm">
                <span>Email {currentEmailIndex + 1} of {emails.totalEmails}</span>
                <span>Reviewed: {reviewedCount} | Relevant: {relevantCount}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${(reviewedCount / emails.totalEmails) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Email Display */}
          {currentEmail && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-2">
                  {new Date(currentEmail.date).toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  From: {currentEmail.from}
                </div>
                <div className="text-lg font-semibold text-gray-900 mb-3">
                  {currentEmail.subject}
                </div>
                <div className="text-gray-700">
                  {currentEmail.bodyPreview}
                </div>
              </div>

              {/* Extracted Info */}
              {currentEmail.extractedInfo.projects.length > 0 && (
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="font-semibold text-green-900 mb-1">Projects:</div>
                  <ul className="text-sm text-green-800">
                    {currentEmail.extractedInfo.projects.map((p, i) => (
                      <li key={i}>• {p}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-2">
                <button
                  onClick={markAsRelevant}
                  className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  ✓ Relevant
                </button>
                <button
                  onClick={markAsIrrelevant}
                  className="flex-1 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  ✗ Not Relevant
                </button>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={addProject}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  + Add Project
                </button>
                <button
                  onClick={addDeliverable}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  + Add Deliverable
                </button>
                <button
                  onClick={addNote}
                  className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                >
                  + Add Note
                </button>
              </div>

              {/* Navigation */}
              <div className="flex justify-between">
                <button
                  onClick={previousEmail}
                  disabled={currentEmailIndex === 0}
                  className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 disabled:opacity-50"
                >
                  ← Previous
                </button>
                <button
                  onClick={nextEmail}
                  disabled={currentEmailIndex === emails.totalEmails - 1}
                  className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 disabled:opacity-50"
                >
                  Next →
                </button>
              </div>

              {/* Save Actions */}
              <div className="flex space-x-2 pt-4 border-t">
                <button
                  onClick={saveReview}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  💾 Save Progress
                </button>
                <button
                  onClick={exportToWorkHistory}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  📤 Export to Work History
                </button>
              </div>
            </div>
          )}

          {/* Instructions */}
          {!emails && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
              <h3 className="font-semibold text-blue-900 mb-2">How to use:</h3>
              <ol className="text-sm text-blue-800 space-y-1">
                <li>1. First, export emails for consultants you want to review</li>
                <li>2. Select a consultant and load their emails</li>
                <li>3. Review each email and mark if it's relevant</li>
                <li>4. For relevant emails, extract projects, deliverables, and notes</li>
                <li>5. Save your progress as you go</li>
                <li>6. When done, export to work history for use in insights</li>
              </ol>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
