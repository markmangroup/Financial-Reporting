'use client'

import { useState, useEffect, useRef } from 'react'
import { searchInsightsWeighted } from '@/lib/insights/tagSystem'
import { SearchSuggestion } from '@/lib/insights/insightTypes'

interface SearchBoxProps {
  onSelectInsight: (insightId: string, query?: string) => void
  checkingData: any
}

export default function SearchBox({ onSelectInsight, checkingData }: SearchBoxProps) {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  useEffect(() => {
    if (query.length >= 2) {
      const results = searchInsightsWeighted(query)

      const newSuggestions: SearchSuggestion[] = results.map(({ insight, score, matchType, matchedTerms }) => {
        // Generate preview based on template
        const categoryIcons: Record<string, string> = {
          expense: '💸',
          revenue: '💰',
          cash: '🏦',
          profitability: '📊',
          efficiency: '⚡',
          vendors: '🏢'
        }

        let display = insight.titleTemplate
        if (matchType === 'exact') {
          display = `Show ${matchedTerms[0]}`
        } else if (matchType === 'tag') {
          display = `${insight.titleTemplate}`
        }

        return {
          insightId: insight.id,
          display: display,
          preview: matchType === 'tag' ? `Matches: ${matchedTerms.join(', ')}` : '',
          confidence: score / 100,
          category: insight.category,
          icon: categoryIcons[insight.category] || '💡'
        }
      })

      setSuggestions(newSuggestions.slice(0, 5))
      setIsOpen(newSuggestions.length > 0)
      setSelectedIndex(0)
    } else {
      setSuggestions([])
      // Don't close immediately if we want to show "I'm listening" state
      if (query.length === 0) setIsOpen(false)
    }
  }, [query, checkingData])

  const handleSelect = (insightId: string, display: string) => {
    onSelectInsight(insightId, display)
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
          handleSelect(suggestions[selectedIndex].insightId, suggestions[selectedIndex].display)
        } else if (query.length > 0 && suggestions.length === 0) {
          // If no suggestions but user hits enter, maybe try to find best match or just clear?
          // For now, let's just clear or do nothing. 
          // Ideally we'd send the query to a "I don't know" handler.
        }
        break
      case 'Escape':
        setIsOpen(false)
        break
    }
  }

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </div>
        <input
          ref={inputRef}
          type="text"
          className="block w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-full leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-0 transition-all duration-200 sm:text-sm shadow-sm hover:border-gray-300"
          placeholder="Ask me about expenses, revenue, or profitability..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsOpen(true)
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
        />
        {query && (
          <button
            onClick={() => {
              setQuery('')
              setSuggestions([])
              setIsOpen(false)
              inputRef.current?.focus()
            }}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {isOpen && (suggestions.length > 0 || query.length > 0) && (
        <div className="absolute z-50 mt-2 w-full bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden animate-fade-in-down">
          {suggestions.length > 0 ? (
            <ul className="max-h-96 overflow-y-auto py-2">
              {suggestions.map((suggestion, index) => (
                <li key={suggestion.insightId}>
                  <button
                    onClick={() => handleSelect(suggestion.insightId, suggestion.display)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`w-full text-left px-4 py-3 transition-colors flex items-start space-x-3 group ${index === selectedIndex ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                  >
                    <span className="text-2xl bg-gray-100 rounded-lg p-1 group-hover:bg-white transition-colors">{suggestion.icon}</span>
                    <div>
                      <p className="text-sm font-medium text-gray-900 group-hover:text-blue-700">
                        {suggestion.display}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {suggestion.preview}
                      </p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          ) : query.length > 0 ? (
            <div className="px-4 py-6 text-center text-sm text-gray-500">
              <p>I'm still learning about that.</p>
              <p className="mt-1 text-xs">Try asking about "expenses", "revenue", or "consultants".</p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}
