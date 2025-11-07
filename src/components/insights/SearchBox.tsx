'use client'

import { useState, useEffect, useRef } from 'react'
import { searchInsights, getInsightTemplate } from '@/lib/insights/insightTemplates'
import { SearchSuggestion } from '@/lib/insights/insightTypes'

interface SearchBoxProps {
  onSelectInsight: (insightId: string) => void
  checkingData: any
}

export default function SearchBox({ onSelectInsight, checkingData }: SearchBoxProps) {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (query.length >= 2) {
      const insightIds = searchInsights(query)
      const newSuggestions: SearchSuggestion[] = insightIds.map(id => {
        const template = getInsightTemplate(id)
        if (!template) return null

        // Generate preview based on template
        let preview = ''
        const categoryIcons = {
          expense: '💸',
          revenue: '💰',
          cash: '🏦',
          profitability: '📊',
          efficiency: '⚡',
          vendors: '🏢'
        }

        return {
          insightId: id,
          display: generateDisplayText(template, query),
          preview: preview,
          confidence: 1,
          category: template.category,
          icon: categoryIcons[template.category] || '💡'
        }
      }).filter(Boolean) as SearchSuggestion[]

      setSuggestions(newSuggestions)
      setIsOpen(newSuggestions.length > 0)
      setSelectedIndex(0)
    } else {
      setSuggestions([])
      setIsOpen(false)
    }
  }, [query, checkingData])

  const generateDisplayText = (template: any, query: string): string => {
    // Find the best matching trigger
    const lowerQuery = query.toLowerCase()
    const matchingTrigger = template.triggers.find((t: string) =>
      t.includes(lowerQuery) || lowerQuery.includes(t)
    ) || template.triggers[0]

    // Convert trigger to question format
    const questions: Record<string, string> = {
      'largest expense': 'What is my largest expense?',
      'biggest expense': 'What is my biggest expense?',
      'top expense': 'What are my top expenses?',
      'revenue': 'What are my revenue sources?',
      'income': 'How much income do I have?',
      'clients': 'Who are my clients?',
      'profitable': 'Am I profitable?',
      'profit': 'What is my profit margin?',
      'cash': 'What is my cash position?',
      'balance': 'What is my bank balance?',
      'software': 'How much am I spending on software?'
    }

    return questions[matchingTrigger] || `Show me ${matchingTrigger}`
  }

  const handleSelect = (insightId: string) => {
    onSelectInsight(insightId)
    setQuery('')
    setIsOpen(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex((prev) => (prev + 1) % suggestions.length)
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length)
        break
      case 'Enter':
        e.preventDefault()
        if (suggestions[selectedIndex]) {
          handleSelect(suggestions[selectedIndex].insightId)
        }
        break
      case 'Escape':
        setIsOpen(false)
        break
    }
  }

  return (
    <div className="relative w-full max-w-3xl mx-auto">
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          placeholder="Ask anything about your finances... (e.g., 'What is my largest expense?')"
          className="w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none shadow-sm hover:shadow-md"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('')
              setIsOpen(false)
              inputRef.current?.focus()
            }}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
          <div className="py-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={suggestion.insightId}
                onClick={() => handleSelect(suggestion.insightId)}
                onMouseEnter={() => setSelectedIndex(index)}
                className={`w-full px-4 py-3 text-left transition-colors ${
                  index === selectedIndex
                    ? 'bg-blue-50 border-l-4 border-blue-500'
                    : 'hover:bg-gray-50 border-l-4 border-transparent'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <span className="text-2xl mt-0.5">{suggestion.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900">
                      {suggestion.display}
                    </div>
                    {suggestion.preview && (
                      <div className="text-xs text-gray-500 mt-0.5 truncate">
                        {suggestion.preview}
                      </div>
                    )}
                  </div>
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Footer hint */}
          <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Press ↵ to select • ↑↓ to navigate</span>
              <span>ESC to close</span>
            </div>
          </div>
        </div>
      )}

      {/* Empty state when typing but no results */}
      {isOpen && query.length >= 2 && suggestions.length === 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 p-6 text-center">
          <div className="text-4xl mb-2">🤔</div>
          <div className="text-sm font-medium text-gray-900 mb-1">No insights found</div>
          <div className="text-xs text-gray-500">
            Try: &quot;What is my largest expense?&quot; or &quot;Am I profitable?&quot;
          </div>
        </div>
      )}
    </div>
  )
}
