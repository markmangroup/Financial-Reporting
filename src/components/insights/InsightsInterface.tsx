'use client'

import { useState, useEffect, useRef } from 'react'
import SearchBox from './SearchBox'
import NarrativeBlock from './NarrativeBlock'
import SmartDiscovery from './SmartDiscovery'
import QuickCapture from './QuickCapture'
import InsightSkeleton from './InsightSkeleton'
import { getInsightTemplate } from '@/lib/insights/insightTemplates'
import { InsightData, InsightNarrative, Recommendation, ConsultantWorkHistory } from '@/lib/insights/insightTypes'
import { loadCreditCardData, loadConsultantSubledger, loadBillComData, loadConsultantWorkHistoryAsync } from '@/lib/insights/dataLoader'

interface InsightsInterfaceProps {
  checkingData: any
  creditData: any
}

type TimelineItem =
  | { type: 'user'; text: string; id: string }
  | { type: 'insight'; data: InsightNarrative; id: string; insightId: string }

export default function InsightsInterface({ checkingData, creditData }: InsightsInterfaceProps) {
  // State for the "Conversation"
  const [timeline, setTimeline] = useState<TimelineItem[]>([])
  const [isThinking, setIsThinking] = useState(false)
  const [fullCreditCardData, setFullCreditCardData] = useState<any>(null)
  const [consultantSubledger, setConsultantSubledger] = useState<any>(null)
  const [billComData, setBillComData] = useState<any>(null)
  const [consultantWorkHistories, setConsultantWorkHistories] = useState<Map<string, ConsultantWorkHistory>>(new Map())
  const [projects, setProjects] = useState<any[]>([])
  const [activeTags, setActiveTags] = useState<string[]>([])

  const bottomRef = useRef<HTMLDivElement>(null)

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

  // Auto-scroll to bottom when timeline updates
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [timeline, isThinking])

  // Function to add an insight to the conversation
  const addInsightToConversation = (insightId: string, userQuery?: string) => {
    if (isThinking) return

    const template = getInsightTemplate(insightId)
    if (!template) return

    // 1. Add User Message
    const queryText = userQuery || template.titleTemplate
    setTimeline(prev => [...prev, { type: 'user', text: queryText, id: Date.now().toString() }])

    // 2. Show Thinking State
    setIsThinking(true)

    // Simulate "reading/thinking" delay
    setTimeout(() => {
      const insightData: InsightData = {
        checkingData,
        creditCardData: fullCreditCardData,
        consultantSubledger,
        billComData,
        consultantWorkHistories,
        projects,
        period: {
          start: checkingData.summary.dateRange.start,
          end: checkingData.summary.dateRange.end,
          label: 'YTD'
        }
      }

      const generatedNarrative = template.generateNarrative(insightData)

      // 3. Add Insight Message
      setTimeline(prev => [
        ...prev,
        {
          type: 'insight',
          data: generatedNarrative,
          id: (Date.now() + 1).toString(),
          insightId: insightId
        }
      ])

      // Update active tags
      const newTags = [...activeTags, ...template.tags]
      setActiveTags([...new Set(newTags)]) // Unique tags only

      setIsThinking(false)
    }, 800) // Slightly longer delay for "premium" feel
  }

  const handleClearCanvas = () => {
    setTimeline([])
    setActiveTags([])
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pb-32">
      {/* Header - Glassmorphism */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm transition-all duration-200">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <SearchBox onSelectInsight={(id, query) => addInsightToConversation(id, query)} checkingData={checkingData} />
            </div>
            {timeline.length > 0 && (
              <button
                onClick={handleClearCanvas}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                title="Clear Conversation"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content - Conversation Stream */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {timeline.length === 0 && (
          <div className="space-y-8 animate-fade-in mt-8">
            {/* Welcome State */}
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 mb-6 shadow-inner">
                <span className="text-4xl">👋</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-3 tracking-tight">
                Good morning, Mike.
              </h2>
              <p className="text-lg text-gray-600 mb-8 max-w-xl mx-auto leading-relaxed">
                I've analyzed your financials. I can help you track expenses, monitor project profitability, or identify risks.
              </p>

              {/* Quick Starters */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto text-left">
                {[
                  { id: 'largest-expense-ytd', icon: '💸', label: 'What is my largest expense?' },
                  { id: 'revenue-sources', icon: '💰', label: 'Show me revenue sources' },
                  { id: 'profitability-check', icon: '📊', label: 'Am I profitable right now?' },
                  { id: 'consultant-analysis', icon: '👥', label: 'Analyze consultant spending' },
                ].map((starter) => (
                  <button
                    key={starter.id}
                    onClick={() => addInsightToConversation(starter.id, starter.label)}
                    className="group p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all duration-200 flex items-center space-x-3"
                  >
                    <span className="text-2xl group-hover:scale-110 transition-transform duration-200">{starter.icon}</span>
                    <span className="font-medium text-gray-700 group-hover:text-blue-700">{starter.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Conversation Timeline */}
        <div className="space-y-8">
          {timeline.map((item) => (
            <div key={item.id} className="animate-slide-up-fade">
              {item.type === 'user' ? (
                <div className="flex justify-end mb-6">
                  <div className="bg-blue-600 text-white px-5 py-3 rounded-2xl rounded-tr-sm shadow-md max-w-[80%] text-lg font-medium">
                    {item.text}
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Insight Card */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-300">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
                      <div className="flex items-start justify-between">
                        <div>
                          <h2 className="text-2xl font-bold mb-1">{item.data.headline.title}</h2>
                          {item.data.headline.subtitle && (
                            <p className="text-blue-100 text-lg opacity-90">{item.data.headline.subtitle}</p>
                          )}
                        </div>
                        <div className="bg-white/20 backdrop-blur-md rounded-lg px-4 py-2 text-right min-w-[120px]">
                          <div className="text-xs text-blue-100 uppercase tracking-wide font-semibold mb-1">
                            {item.data.headline.metric.label}
                          </div>
                          <div className="text-3xl font-black tracking-tight">
                            {item.data.headline.metric.value}
                          </div>
                          {item.data.headline.metric.trend && (
                            <div className="text-sm mt-1 font-medium">
                              <span className={`${item.data.headline.metric.trend.direction === 'up' ? 'text-green-300' :
                                item.data.headline.metric.trend.direction === 'down' ? 'text-red-300' :
                                  'text-yellow-300'
                                } `}>
                                {item.data.headline.metric.trend.direction === 'up' ? '↑' :
                                  item.data.headline.metric.trend.direction === 'down' ? '↓' : '→'}
                                {item.data.headline.metric.trend.percentage.toFixed(1)}%
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Content Grid */}
                    <div className="p-6">
                      <div className="grid grid-cols-12 gap-6">
                        {item.data.sections.map((section, idx) => {
                          let colSpan = 'col-span-12'
                          if (section.type === 'chart' && section.visualization) {
                            colSpan = section.visualization.type === 'bar' || section.visualization.type === 'pie'
                              ? 'col-span-12 md:col-span-8'
                              : 'col-span-12 md:col-span-6'
                          } else if (section.type === 'list' || section.type === 'breakdown') {
                            colSpan = 'col-span-12 md:col-span-4'
                          }

                          return (
                            <div key={idx} className={colSpan}>
                              <NarrativeBlock section={section} index={idx} />
                            </div>
                          )
                        })}

                        {/* Recommendations */}
                        {item.data.recommendations && item.data.recommendations.length > 0 && (
                          <div className="col-span-12 mt-4">
                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Recommended Actions</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {item.data.recommendations.map((rec: Recommendation, rIdx: number) => (
                                <div
                                  key={rIdx}
                                  className={`p - 4 rounded - xl border - l - 4 bg - gray - 50 hover: bg - white hover: shadow - md transition - all duration - 200 ${rec.type === 'warning' ? 'border-yellow-400' :
                                    rec.type === 'opportunity' ? 'border-blue-400' :
                                      rec.type === 'success' ? 'border-green-400' :
                                        'border-gray-300'
                                    } `}
                                >
                                  <div className="flex items-start space-x-3">
                                    <span className="text-2xl">{rec.icon}</span>
                                    <div className="flex-1">
                                      <h4 className="font-bold text-gray-900 mb-1">{rec.title}</h4>
                                      <p className="text-sm text-gray-600 mb-3">{rec.description}</p>
                                      {rec.action && (
                                        <button
                                          onClick={() => addInsightToConversation(rec.action!.insightId, `Show me ${rec.action!.label.toLowerCase()} `)}
                                          className="text-sm font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                                        >
                                          {rec.action.label} →
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Thinking State */}
          {isThinking && (
            <div className="animate-fade-in">
              <InsightSkeleton />
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Smart Discovery - Contextual Suggestions */}
        {timeline.length > 0 && !isThinking && (
          <SmartDiscovery
            activeTags={activeTags}
            historyIds={timeline.filter(t => t.type === 'insight').map(t => (t as any).insightId)}
            onSelectInsight={(id) => addInsightToConversation(id)}
          />
        )}
      </div>
    </div>
  )
}
