'use client'

import { useState, useEffect } from 'react'

interface QuickNote {
  id: string
  content: string
  timestamp: string
  autoTags: string[]
}

export default function QuickCapture() {
  const [noteInput, setNoteInput] = useState('')
  const [recentNotes, setRecentNotes] = useState<QuickNote[]>([])
  const [isExpanded, setIsExpanded] = useState(false)
  const [showRecent, setShowRecent] = useState(false)

  useEffect(() => {
    loadSavedNotes()
  }, [])

  const loadSavedNotes = () => {
    try {
      const saved = localStorage.getItem('mike-os-notes')
      if (saved) {
        setRecentNotes(JSON.parse(saved))
      }
    } catch (error) {
      console.error('Failed to load notes:', error)
    }
  }

  const generateTags = (text: string): string[] => {
    const tags: string[] = []
    const lower = text.toLowerCase()

    // Financial indicators
    if (lower.match(/\$|revenue|invoice|payment|profit|cost|budget|expense/)) tags.push('financial')

    // Client/project indicators
    if (lower.match(/client|project|deliver|milestone|contract/)) tags.push('client')

    // Technical indicators
    if (lower.match(/code|bug|feature|api|database|deploy|github/)) tags.push('technical')

    // Opportunity indicators
    if (lower.match(/idea|could|opportunity|potential|maybe|what if/)) tags.push('opportunity')

    // Action indicators
    if (lower.match(/todo|need to|should|must|remember to|don't forget/)) tags.push('action')

    // Personal/reflection indicators
    if (lower.match(/i feel|i think|i'm|feeling|burnout|energy|stuck|overwhelm/)) tags.push('personal')

    return tags.length > 0 ? tags : ['general']
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!noteInput.trim()) return

    const autoTags = generateTags(noteInput)

    const newNote: QuickNote = {
      id: Date.now().toString(),
      content: noteInput,
      timestamp: new Date().toISOString(),
      autoTags,
    }

    const updated = [newNote, ...recentNotes].slice(0, 50) // Keep last 50
    setRecentNotes(updated)
    localStorage.setItem('mike-os-notes', JSON.stringify(updated))
    setNoteInput('')
    setShowRecent(true)
  }

  const handleDeleteNote = (id: string) => {
    const updated = recentNotes.filter(note => note.id !== id)
    setRecentNotes(updated)
    localStorage.setItem('mike-os-notes', JSON.stringify(updated))
  }

  const getTagColor = (tag: string) => {
    const colors: Record<string, string> = {
      financial: 'bg-green-100 text-green-700',
      client: 'bg-blue-100 text-blue-700',
      technical: 'bg-purple-100 text-purple-700',
      opportunity: 'bg-yellow-100 text-yellow-700',
      action: 'bg-red-100 text-red-700',
      personal: 'bg-pink-100 text-pink-700',
      general: 'bg-gray-100 text-gray-700',
    }
    return colors[tag] || colors.general
  }

  if (!isExpanded) {
    return (
      <div className="bg-white rounded-lg border-2 border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
        <button
          onClick={() => setIsExpanded(true)}
          className="w-full flex items-center justify-between text-left"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">📝</span>
            <div>
              <h3 className="text-base font-bold text-gray-900">Quick Capture</h3>
              <p className="text-sm text-gray-500">Save ideas, next steps, or fragments</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {recentNotes.length > 0 && (
              <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                {recentNotes.length} saved
              </span>
            )}
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border-2 border-indigo-200 p-6 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">📝</span>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Quick Capture</h3>
            <p className="text-sm text-gray-500">Your external brain for ideas and next steps</p>
          </div>
        </div>
        <button
          onClick={() => setIsExpanded(false)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </button>
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="mb-4">
        <textarea
          value={noteInput}
          onChange={(e) => setNoteInput(e.target.value)}
          placeholder="Capture anything: an idea, a task, a thought, a next step..."
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none text-sm"
          rows={3}
        />
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Auto-tags:</span>
            {generateTags(noteInput).map(tag => (
              <span key={tag} className={`text-xs font-semibold px-2 py-1 rounded ${getTagColor(tag)}`}>
                {tag}
              </span>
            ))}
          </div>
          <button
            type="submit"
            disabled={!noteInput.trim()}
            className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Capture
          </button>
        </div>
      </form>

      {/* Toggle Recent Notes */}
      {recentNotes.length > 0 && (
        <div className="border-t border-gray-200 pt-4">
          <button
            onClick={() => setShowRecent(!showRecent)}
            className="w-full flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <span className="text-sm font-semibold text-gray-700">
              Recent Captures ({recentNotes.length})
            </span>
            <svg
              className={`h-4 w-4 text-gray-400 transition-transform ${showRecent ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showRecent && (
            <div className="mt-3 space-y-2 max-h-80 overflow-y-auto">
              {recentNotes.slice(0, 10).map((note) => (
                <div
                  key={note.id}
                  className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm hover:border-indigo-300 transition-colors group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="text-gray-900 mb-2 whitespace-pre-wrap">{note.content}</div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-gray-500">
                          {new Date(note.timestamp).toLocaleString()}
                        </span>
                        {note.autoTags.map((tag) => (
                          <span
                            key={tag}
                            className={`text-xs font-semibold px-2 py-0.5 rounded ${getTagColor(tag)}`}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className="p-1 opacity-0 group-hover:opacity-100 hover:bg-red-100 rounded transition-all"
                      title="Delete note"
                    >
                      <svg className="h-4 w-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
              {recentNotes.length > 10 && (
                <div className="text-center text-xs text-gray-500 pt-2">
                  Showing 10 of {recentNotes.length} notes
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
