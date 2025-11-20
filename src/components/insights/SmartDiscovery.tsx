'use client'

import { useEffect, useState } from 'react'
import { InsightTemplate } from '@/lib/insights/insightTypes'
import { getRelatedInsights, TAG_REGISTRY } from '@/lib/insights/tagSystem'

interface SmartDiscoveryProps {
    activeTags: string[]
    historyIds: string[]
    onSelectInsight: (insightId: string) => void
}

export default function SmartDiscovery({ activeTags, historyIds, onSelectInsight }: SmartDiscoveryProps) {
    const [suggestions, setSuggestions] = useState<InsightTemplate[]>([])

    useEffect(() => {
        const nextInsights = getRelatedInsights(activeTags, historyIds)
        setSuggestions(nextInsights)
    }, [activeTags, historyIds])

    if (suggestions.length === 0) return null

    return (
        <div className="mt-8 pt-6 border-t border-gray-200 animate-fade-in">
            <div className="flex items-center space-x-2 mb-4">
                <span className="text-xl">✨</span>
                <h3 className="text-lg font-semibold text-gray-900">
                    Based on your exploration...
                </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {suggestions.map((insight) => {
                    // Find which tag triggered this suggestion
                    const matchedTag = insight.tags.find(t => activeTags.includes(t)) || insight.tags[0]
                    const tagLabel = TAG_REGISTRY[matchedTag]?.label || matchedTag

                    return (
                        <button
                            key={insight.id}
                            onClick={() => onSelectInsight(insight.id)}
                            className="group relative p-4 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all text-left"
                        >
                            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </div>

                            <div className="text-xs font-medium text-blue-600 mb-1 flex items-center">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2"></span>
                                Related to {tagLabel}
                            </div>

                            <h4 className="text-base font-bold text-gray-900 mb-1 group-hover:text-blue-700 transition-colors">
                                {insight.titleTemplate}
                            </h4>

                            <div className="flex flex-wrap gap-2 mt-3">
                                {insight.tags.slice(0, 2).map(tag => (
                                    <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                                        #{TAG_REGISTRY[tag]?.label || tag}
                                    </span>
                                ))}
                            </div>
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
