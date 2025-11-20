import { InsightTemplate } from './insightTypes'
import { insightTemplates } from './insightTemplates'

export interface TagDefinition {
    id: string
    label: string
    category: 'topic' | 'entity' | 'action' | 'meta'
    relatedTags: string[]
    weight: number // 1-10 importance
}

// Central registry of all known tags
export const TAG_REGISTRY: Record<string, TagDefinition> = {
    // Topics
    'expense': { id: 'expense', label: 'Expenses', category: 'topic', relatedTags: ['cost-saving', 'vendor'], weight: 10 },
    'revenue': { id: 'revenue', label: 'Revenue', category: 'topic', relatedTags: ['client', 'growth'], weight: 10 },
    'profitability': { id: 'profitability', label: 'Profitability', category: 'topic', relatedTags: ['margin', 'efficiency'], weight: 10 },
    'cash-flow': { id: 'cash-flow', label: 'Cash Flow', category: 'topic', relatedTags: ['runway', 'burn-rate'], weight: 10 },

    // Entities
    'vendor': { id: 'vendor', label: 'Vendors', category: 'entity', relatedTags: ['contract', 'negotiation'], weight: 8 },
    'client': { id: 'client', label: 'Clients', category: 'entity', relatedTags: ['revenue', 'concentration'], weight: 8 },
    'consultant': { id: 'consultant', label: 'Consultants', category: 'entity', relatedTags: ['contractor', 'talent'], weight: 8 },
    'software': { id: 'software', label: 'Software', category: 'entity', relatedTags: ['subscription', 'tool'], weight: 7 },
    'travel': { id: 'travel', label: 'Travel', category: 'entity', relatedTags: ['trip', 'location'], weight: 7 },

    // Actions/Goals
    'cost-saving': { id: 'cost-saving', label: 'Cost Saving', category: 'action', relatedTags: ['optimization', 'negotiation'], weight: 9 },
    'growth': { id: 'growth', label: 'Growth', category: 'action', relatedTags: ['revenue', 'investment'], weight: 9 },
    'risk': { id: 'risk', label: 'Risk', category: 'action', relatedTags: ['concentration', 'compliance'], weight: 9 },
    'optimization': { id: 'optimization', label: 'Optimization', category: 'action', relatedTags: ['efficiency', 'automation'], weight: 8 },

    // Meta
    'recurring': { id: 'recurring', label: 'Recurring', category: 'meta', relatedTags: ['subscription'], weight: 5 },
    'one-off': { id: 'one-off', label: 'One-off', category: 'meta', relatedTags: ['project'], weight: 5 },
    'trend': { id: 'trend', label: 'Trend', category: 'meta', relatedTags: ['history', 'forecast'], weight: 6 }
}

export interface ScoredInsight {
    insight: InsightTemplate
    score: number
    matchType: 'exact' | 'tag' | 'semantic' | 'related'
    matchedTerms: string[]
}

/**
 * Search insights using a weighted scoring system based on tags and text matching
 */
export const searchInsightsWeighted = (query: string): ScoredInsight[] => {
    const lowerQuery = query.toLowerCase()
    const queryTerms = lowerQuery.split(' ').filter(t => t.length > 2)

    return insightTemplates
        .map(insight => {
            let score = 0
            let matchType: ScoredInsight['matchType'] = 'related'
            const matchedTerms: string[] = []

            // 1. Direct Trigger Match (Highest Priority)
            const triggerMatch = insight.triggers.find(t => t.includes(lowerQuery) || lowerQuery.includes(t))
            if (triggerMatch) {
                score += 100
                matchType = 'exact'
                matchedTerms.push(triggerMatch)
            }

            // 2. Tag Match
            insight.tags.forEach(tag => {
                if (lowerQuery.includes(tag) || TAG_REGISTRY[tag]?.label.toLowerCase().includes(lowerQuery)) {
                    score += 30
                    if (matchType !== 'exact') matchType = 'tag'
                    matchedTerms.push(tag)
                }
            })

            // 3. Semantic/Keyword Match in Title
            if (insight.titleTemplate.toLowerCase().includes(lowerQuery)) {
                score += 20
                if (matchType === 'related') matchType = 'semantic'
                matchedTerms.push('title')
            }

            // 4. Boost by Priority
            score += insight.priority / 10

            return { insight, score, matchType, matchedTerms }
        })
        .filter(result => result.score > 10)
        .sort((a, b) => b.score - a.score)
}

/**
 * Get suggested next insights based on currently active tags
 */
export const getRelatedInsights = (activeTags: string[], historyIds: string[]): InsightTemplate[] => {
    // 1. Find all related tags from the registry
    const expandedTags = new Set<string>(activeTags)
    activeTags.forEach(tag => {
        const def = TAG_REGISTRY[tag]
        if (def && def.relatedTags) {
            def.relatedTags.forEach(t => expandedTags.add(t))
        }
    })

    // 2. Score insights based on tag overlap
    return insightTemplates
        .filter(insight => !historyIds.includes(insight.id)) // Exclude already viewed
        .map(insight => {
            let score = 0
            insight.tags.forEach(tag => {
                if (expandedTags.has(tag)) score += 10
                if (activeTags.includes(tag)) score += 20 // Direct match bonus
            })

            // Boost if it's a direct "nextQuestion" of the last viewed insight
            // (This logic would require passing the last viewed insight ID, simplified here)

            return { insight, score }
        })
        .filter(result => result.score > 0)
        .sort((a, b) => b.score - a.score)
        .map(result => result.insight)
        .slice(0, 5) // Return top 5 suggestions
}

/**
 * Get all available tags for UI display
 */
export const getAllTags = () => Object.values(TAG_REGISTRY).sort((a, b) => b.weight - a.weight)
