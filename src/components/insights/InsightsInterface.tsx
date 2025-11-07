'use client'

import { useState, useEffect } from 'react'
import SearchBox from './SearchBox'
import NarrativeBlock from './NarrativeBlock'
import { getInsightTemplate } from '@/lib/insights/insightTemplates'
import { InsightNarrative, InsightData, Recommendation } from '@/lib/insights/insightTypes'
import { ParsedCSVData } from '@/types'
import { loadCreditCardData } from '@/lib/creditCardDataLoader'
import { loadConsultantSubledger } from '@/lib/consultantSubledgerLoader'
import { loadBillComData } from '@/lib/billComDataLoader'
import { loadConsultantWorkHistoryAsync, ConsultantWorkHistory } from '@/lib/consultantWorkHistoryLoader'

interface InsightsInterfaceProps {
  checkingData: ParsedCSVData | null
  creditData?: ParsedCSVData | null
}

export default function InsightsInterface({ checkingData, creditData }: InsightsInterfaceProps) {
  const [selectedInsightId, setSelectedInsightId] = useState<string | null>(null)
  const [narrative, setNarrative] = useState<InsightNarrative | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [fullCreditCardData, setFullCreditCardData] = useState<any>(null)
  const [consultantSubledger, setConsultantSubledger] = useState<any>(null)
  const [billComData, setBillComData] = useState<any>(null)
  const [consultantWorkHistories, setConsultantWorkHistories] = useState<Map<string, ConsultantWorkHistory>>(new Map())
  const [projects, setProjects] = useState<any[]>([])

  // Load full credit card data, consultant sub-ledger, Bill.com data, work histories, and projects on mount
  useEffect(() => {
    loadCreditCardData().then(data => {
      setFullCreditCardData(data)
    })
    loadConsultantSubledger().then(data => {
      setConsultantSubledger(data)
    })
    loadBillComData().then(data => {
      setBillComData(data)
    })

    // Load project metadata for project-aware insights
    fetch('/api/projects')
      .then(res => res.json())
      .then(data => {
        setProjects(data.projects || [])
        console.log('📊 Loaded project data for insights:', data.projects?.length || 0, 'projects')
      })
      .catch(err => console.error('Failed to load projects:', err))

    // Load work histories for all consultants
    const consultantNames = ['Swan', 'Niki', 'Abri', 'Carmen', 'Jan', 'Petrana']
    const loadAllWorkHistories = async () => {
      const histories = new Map<string, ConsultantWorkHistory>()
      for (const name of consultantNames) {
        const history = await loadConsultantWorkHistoryAsync(name)
        if (history) {
          histories.set(name.toLowerCase(), history)
        }
      }
      setConsultantWorkHistories(histories)
      console.log('📚 Loaded consultant work histories:', histories)
    }
    loadAllWorkHistories()
  }, [])

  useEffect(() => {
    if (selectedInsightId && checkingData) {
      setIsLoading(true)

      // Simulate a slight delay for better UX (makes it feel more "intelligent")
      setTimeout(() => {
        const template = getInsightTemplate(selectedInsightId)
        if (template) {
          const insightData: InsightData = {
            checkingData,
            creditCardData: fullCreditCardData, // Use full credit card data with majorCategory
            consultantSubledger, // Add consultant sub-ledger data
            billComData, // Add Bill.com data
            consultantWorkHistories, // Add work histories loaded from JSON files
            projects, // Add project metadata for project-aware insights
            period: {
              start: checkingData.summary.dateRange.start,
              end: checkingData.summary.dateRange.end,
              label: 'YTD'
            }
          }

          const generatedNarrative = template.generateNarrative(insightData)
          setNarrative(generatedNarrative)
          setIsLoading(false)
        }
      }, 300)
    }
  }, [selectedInsightId, checkingData, fullCreditCardData, consultantSubledger, billComData, consultantWorkHistories, projects])

  const handleSelectInsight = (insightId: string) => {
    setSelectedInsightId(insightId)
    // Smooth scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleRelatedInsightClick = (insightId: string) => {
    setSelectedInsightId(insightId)
    setNarrative(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (!checkingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <div className="text-6xl mb-4">📊</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Data Available</h2>
          <p className="text-gray-600">Upload your financial data to get started with insights</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header - Compact */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <SearchBox onSelectInsight={handleSelectInsight} checkingData={checkingData} />
            </div>
            {selectedInsightId && (
              <button
                onClick={() => {
                  setSelectedInsightId(null)
                  setNarrative(null)
                }}
                className="px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors whitespace-nowrap"
              >
                ← Start New Search
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {!selectedInsightId && (
          <div className="space-y-6 animate-fade-in">
            {/* Welcome State */}
            <div className="text-center py-8">
              <div className="text-6xl mb-4 animate-bounce-slow">💡</div>
              <h2 className="text-3xl font-bold text-gray-900 mb-3">
                What would you like to know?
              </h2>
              <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                Start typing to explore insights about your expenses, revenue, profitability, and more.
              </p>

              {/* Suggested Questions */}
              <div className="max-w-4xl mx-auto">
                <h3 className="text-base font-semibold text-gray-900 mb-4">Popular questions:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {[
                    { id: 'largest-expense-ytd', icon: '💸', question: 'What is my largest expense?', category: 'Expenses' },
                    { id: 'consultant-analysis', icon: '👥', question: 'How much do I spend on consultants?', category: 'Expenses' },
                    { id: 'revenue-sources', icon: '💰', question: 'What are my revenue sources?', category: 'Revenue' },
                    { id: 'top-client-analysis', icon: '🏢', question: 'Who is my top client?', category: 'Revenue' },
                    { id: 'profitability-check', icon: '📊', question: 'Am I profitable?', category: 'Profitability' },
                    { id: 'expense-efficiency', icon: '⚡', question: 'How efficient is my business?', category: 'Profitability' },
                    { id: 'cash-position', icon: '🏦', question: 'What is my cash position?', category: 'Cash Flow' },
                    { id: 'monthly-burn-rate', icon: '📉', question: 'What is my monthly burn rate?', category: 'Cash Flow' },
                    { id: 'revenue-concentration-risk', icon: '⚠️', question: 'Am I too dependent on one client?', category: 'Risk' },
                    { id: 'travel-spending', icon: '✈️', question: 'How much do I spend on travel?', category: 'Expenses' },
                    { id: 'software-spending', icon: '💻', question: 'What are my software costs?', category: 'Expenses' }
                  ].map((suggestion) => (
                    <button
                      key={suggestion.id}
                      onClick={() => handleSelectInsight(suggestion.id)}
                      className="flex flex-col p-3 bg-white rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:shadow-lg transition-all text-left group"
                    >
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-2xl">{suggestion.icon}</span>
                        <span className="text-xs text-gray-500">{suggestion.category}</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900 group-hover:text-blue-600 mb-2">
                        {suggestion.question}
                      </span>
                      <div className="flex items-center text-xs text-gray-400 group-hover:text-blue-500">
                        <span>View insight</span>
                        <svg className="ml-1 h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent mb-3"></div>
              <p className="text-sm text-gray-600">Analyzing your data...</p>
            </div>
          </div>
        )}

        {/* Insight Narrative - Compact Grid Layout */}
        {narrative && !isLoading && (
          <div className="animate-fade-in">
            {/* Compact Headline Bar */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-4 text-white shadow-lg mb-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h2 className="text-xl font-bold mb-1">{narrative.headline.title}</h2>
                  {narrative.headline.subtitle && (
                    <p className="text-blue-100 text-sm">{narrative.headline.subtitle}</p>
                  )}
                </div>
                <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg px-4 py-2 text-right">
                  <div className="text-xs text-blue-100 uppercase tracking-wide mb-1">
                    {narrative.headline.metric.label}
                  </div>
                  <div className="text-2xl font-black">
                    {narrative.headline.metric.value}
                  </div>
                  {narrative.headline.metric.trend && (
                    <div className="text-xs mt-1">
                      <span className={`font-semibold ${
                        narrative.headline.metric.trend.direction === 'up' ? 'text-green-200' :
                        narrative.headline.metric.trend.direction === 'down' ? 'text-red-200' :
                        'text-yellow-200'
                      }`}>
                        {narrative.headline.metric.trend.direction === 'up' ? '↑' :
                         narrative.headline.metric.trend.direction === 'down' ? '↓' : '→'}
                        {narrative.headline.metric.trend.percentage.toFixed(1)}%
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Grid Layout - Main visualizations get more space */}
            <div className="grid grid-cols-12 gap-3">
              {narrative.sections.map((section, index) => {
                // Determine grid span based on section type
                let colSpan = 'col-span-12'

                if (section.type === 'chart' && section.visualization) {
                  // Large charts get full width or 2/3 width
                  colSpan = section.visualization.type === 'bar' || section.visualization.type === 'pie'
                    ? 'col-span-12 md:col-span-8'
                    : 'col-span-12 md:col-span-6'
                } else if (section.type === 'metric') {
                  // Metrics are compact
                  colSpan = 'col-span-12'
                } else if (section.type === 'list' || section.type === 'breakdown') {
                  // Lists take sidebar space
                  colSpan = 'col-span-12 md:col-span-4'
                } else if (section.type === 'callout') {
                  // Callouts are full width but compact
                  colSpan = 'col-span-12'
                }

                return (
                  <div key={index} className={colSpan}>
                    <NarrativeBlock section={section} index={index} />
                  </div>
                )
              })}

              {/* Recommendations - Full Width Grid */}
              {narrative.recommendations && narrative.recommendations.length > 0 && (
                <div className="col-span-12">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-4 shadow-sm">
                    <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center">
                      <span className="mr-2">💡</span> Actionable Recommendations
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {narrative.recommendations.map((rec: Recommendation, index: number) => (
                        <div
                          key={index}
                          className={`p-3 rounded-lg border-2 bg-white shadow-sm hover:shadow-md transition-shadow ${
                            rec.type === 'warning' ? 'border-yellow-300 hover:border-yellow-400' :
                            rec.type === 'opportunity' ? 'border-blue-300 hover:border-blue-400' :
                            rec.type === 'success' ? 'border-green-300 hover:border-green-400' :
                            'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          <div className="flex items-start space-x-2">
                            <span className="text-2xl flex-shrink-0">{rec.icon}</span>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-bold text-gray-900 mb-1">{rec.title}</h4>
                              <p className="text-sm text-gray-700 mb-2 leading-relaxed">{rec.description}</p>
                              {rec.action && (
                                <button
                                  onClick={() => handleRelatedInsightClick(rec.action!.insightId)}
                                  className="inline-flex items-center space-x-1 text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                                >
                                  <span>{rec.action.label}</span>
                                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                  </svg>
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Related Insights - Full Width Grid */}
              {narrative.relatedInsights && narrative.relatedInsights.length > 0 && (
                <div className="col-span-12">
                  <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                    <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center">
                      <span className="mr-2">🔍</span> Explore Related Insights
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {narrative.relatedInsights.slice(0, 3).map((insightId: string) => {
                        const template = getInsightTemplate(insightId)
                        if (!template) return null

                        const categoryIcons = {
                          expense: '💸',
                          revenue: '💰',
                          cash: '🏦',
                          profitability: '📊',
                          efficiency: '⚡',
                          vendors: '🏢'
                        }

                        return (
                          <button
                            key={insightId}
                            onClick={() => handleRelatedInsightClick(insightId)}
                            className="p-3 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border-2 border-gray-200 hover:border-blue-400 hover:shadow-lg transition-all text-left group"
                          >
                            <div className="text-3xl mb-2">{categoryIcons[template.category]}</div>
                            <div className="text-sm font-bold text-gray-900 group-hover:text-blue-600 mb-1">
                              {template.titleTemplate}
                            </div>
                            <div className="flex items-center text-xs text-gray-500 group-hover:text-blue-500">
                              <span>View insight</span>
                              <svg className="ml-1 h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
