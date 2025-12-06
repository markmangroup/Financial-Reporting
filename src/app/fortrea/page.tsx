'use client'

import { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import {
  getFortreaQuarters,
  getFortreaAnnual,
  getLatestQuarter,
  getLatestAnnual,
  getLastNQuarters
} from '@/lib/fortreaData'
import type { FortreaQuarterRow, FortreaAnnualRow } from '@/types/fortrea'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, BarChart, Bar } from 'recharts'

type FortreaTab = 'overview' | 'income-statement' | 'balance-sheet' | 'cash-flow' | 'ask-fortrea'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export default function FortreaDashboard() {
  const [activeTab, setActiveTab] = useState<FortreaTab>('overview')
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Load real Fortrea data (memoized to prevent re-renders)
  const quarters = useMemo(() => getFortreaQuarters(), [])
  const annual = useMemo(() => getFortreaAnnual(), [])
  const latestQuarter = useMemo(() => getLatestQuarter(), [])
  const latestAnnual = useMemo(() => getLatestAnnual(), [])
  const last4Quarters = useMemo(() => getLastNQuarters(4), [])
  const q3_2025 = useMemo(() => quarters.find(q => q.id === '2025Q3'), [quarters])
  const q3_2024 = useMemo(() => quarters.find(q => q.id === '2024Q3'), [quarters])

  // Maintain focus on input when Ask Fortrea tab is active
  useEffect(() => {
    if (activeTab === 'ask-fortrea' && inputRef.current && document.activeElement !== inputRef.current) {
      // Only focus if user isn't already interacting with another element
      const timer = setTimeout(() => {
        if (document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
          inputRef.current?.focus()
        }
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [activeTab])

  // Format currency helper
  const formatCurrency = (value: number, decimals: number = 0): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value)
  }

  // Format millions helper
  const formatMillions = (value: number): string => {
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}B`
    }
    return `$${value.toFixed(1)}M`
  }

  // Handle input change - stable callback
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setChatInput(e.target.value)
  }, [])

  // Handle Ask Fortrea chat
  const handleAskFortrea = useCallback(async (e?: React.MouseEvent | React.KeyboardEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }

    const currentInput = chatInput.trim()
    if (!currentInput || chatLoading) return

    const userQuestion = currentInput
    setChatInput('')
    setChatLoading(true)

    // Add user message
    setChatMessages((prevMessages) => {
      const newMessages: ChatMessage[] = [...prevMessages, { role: 'user', content: userQuestion }]
      
      // Fetch answer
      fetch('/api/fortrea/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: userQuestion })
      })
        .then(response => response.json())
        .then(data => {
          setChatMessages((prev) => {
            if (data.answer) {
              return [...prev, { role: 'assistant', content: data.answer }]
            } else {
              return [...prev, { role: 'assistant', content: 'I couldn\'t process that question right now. Please try again.' }]
            }
          })
        })
        .catch(error => {
          setChatMessages((prev) => [...prev, { role: 'assistant', content: 'I couldn\'t process that question right now. Please try again.' }])
        })
        .finally(() => {
          setChatLoading(false)
          // Refocus input after submission
          setTimeout(() => {
            inputRef.current?.focus()
          }, 100)
        })

      return newMessages
    })
  }, [chatInput, chatLoading])

  // Handle Enter key press
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      e.stopPropagation()
      handleAskFortrea(e)
    }
  }, [handleAskFortrea])

  // Tab navigation
  const tabs: { id: FortreaTab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'income-statement', label: 'Income Statement' },
    { id: 'balance-sheet', label: 'Balance Sheet' },
    { id: 'cash-flow', label: 'Cash Flow & Trends' },
    { id: 'ask-fortrea', label: 'Ask Fortrea' }
  ]

  // Overview Tab Content
  const OverviewTab = () => {
    if (!latestQuarter || !latestAnnual) {
      return <div className="text-center py-20 text-gray-400">No data available</div>
    }

    // Calculate sequential changes (Q3 2025 vs Q2 2025)
    const q2_2025 = quarters.find(q => q.id === '2025Q2')
    const revenueSeqChange = q2_2025 
      ? ((latestQuarter.revenue - q2_2025.revenue) / q2_2025.revenue) * 100
      : 0

    // Get all quarters from Q3 2023 through Q3 2025 for charts
    const chartQuarters = quarters.filter(q => 
      (q.year === 2023 && q.quarter >= 3) || 
      (q.year === 2024) ||
      (q.year === 2025 && q.quarter <= 3)
    ).sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year
      return a.quarter - b.quarter
    })

    // Prepare quarterly revenue chart data (Q3 2023 through Q3 2024)
    const revenueChartData = chartQuarters.map(q => ({
      quarter: q.label,
      revenue: q.revenue
    }))

    // Prepare margin chart data
    const marginChartData = chartQuarters.map(q => ({
      quarter: q.label,
      adjEbitdaMargin: q.adjEbitdaMarginPct,
      gaapNetMargin: (q.gaapNetIncome / q.revenue) * 100
    }))

    return (
      <div className="space-y-4">
        {/* Q3 2025 Context & Key Metrics - Compact Header */}
        {q3_2025 && (
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Q3 2025 Highlights */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
              <h2 className="text-sm font-semibold text-gray-800 mb-2">Q3 2025 Highlights</h2>
              <ul className="space-y-1.5 text-xs text-gray-600">
                <li>• Revenue ${q3_2025.revenue.toFixed(1)}M (+3.9% YoY)</li>
                <li>• Adj. EBITDA ${q3_2025.adjEbitda.toFixed(1)}M (7.2% margin)</li>
                <li>• FCF ${q3_2025.freeCashFlow?.toFixed(1) || '79.5'}M</li>
                <li>• Win rates: highest in 6 quarters</li>
              </ul>
            </div>

            {/* Backlog & Demand */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
              <h2 className="text-sm font-semibold text-gray-800 mb-2">Backlog & Demand</h2>
              <div className="text-lg font-semibold text-[#003B5C] mb-2">
                ${((q3_2025.backlog || 0) / 1000).toFixed(2)}B
              </div>
              <p className="text-xs text-gray-600 mb-1">
                Book-to-bill: {q3_2025.bookToBill?.toFixed(2)}x (TTM: 1.07x)
              </p>
              <p className="text-xs text-gray-500">
                DSO improved 13 days to 33 days
              </p>
            </div>

            {/* 2025 Guidance */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
              <h2 className="text-sm font-semibold text-gray-800 mb-2">2025 Guidance</h2>
              <div className="space-y-1.5 text-xs text-gray-600">
                <div><strong>Revenue:</strong> $2.7-2.75B</div>
                <div><strong>Adj. EBITDA:</strong> $175-195M</div>
              </div>
              <p className="text-xs text-gray-500 mt-2 italic">
                Strategic focus: Commercial, Operational & Financial Excellence
              </p>
            </div>
          </section>
        )}

        {/* KPI Cards - Compact */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 hover:shadow-md transition-shadow cursor-pointer">
            <div className="text-xs text-gray-500 mb-2">Revenue</div>
            <div className="text-xl font-semibold text-[#003B5C] mb-1">
              {formatMillions(latestQuarter.revenue)}
            </div>
            <div className="text-xs text-gray-500">
              {revenueSeqChange >= 0 ? '+' : ''}{revenueSeqChange.toFixed(1)}% seq
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 hover:shadow-md transition-shadow cursor-pointer">
            <div className="text-xs text-gray-500 mb-2">GAAP Net Income</div>
            <div className="text-xl font-semibold text-[#003B5C] mb-1">
              {formatMillions(latestQuarter.gaapNetIncome)}
            </div>
            <div className="text-xs text-gray-500">
              {latestQuarter.label}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 hover:shadow-md transition-shadow cursor-pointer">
            <div className="text-xs text-gray-500 mb-2">Adj. EBITDA</div>
            <div className="text-xl font-semibold text-[#003B5C] mb-1">
              {formatMillions(latestQuarter.adjEbitda)}
            </div>
            <div className="text-xs text-gray-500">
              {latestQuarter.adjEbitdaMarginPct.toFixed(1)}% margin
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 hover:shadow-md transition-shadow cursor-pointer">
            <div className="text-xs text-gray-500 mb-2">Adj. EPS</div>
            <div className="text-xl font-semibold text-[#003B5C] mb-1">
              ${latestQuarter.adjDilutedEPS?.toFixed(2) || 'N/A'}
            </div>
            <div className="text-xs text-gray-500">
              {latestQuarter.label}
            </div>
          </div>
        </div>

        {/* Charts - Compact */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Revenue Trend Chart */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <h2 className="text-base font-medium text-gray-700 mb-1">Quarterly Revenue</h2>
            <p className="text-xs text-gray-500 mb-3">Q3 2023 - Q3 2025</p>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={revenueChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="quarter" stroke="#6B7280" />
                <YAxis tickFormatter={(value) => `$${value.toFixed(0)}M`} stroke="#6B7280" />
                <Tooltip
                  formatter={(value: number) => formatMillions(value)}
                  labelFormatter={(label) => `Quarter: ${label}`}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    padding: '8px 12px'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#003B5C"
                  strokeWidth={3}
                  dot={{ fill: '#003B5C', r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
            <p className="text-xs text-gray-500 mt-1.5">+3.9% YoY in Q3 2025</p>
          </div>

          {/* Margin Trend Chart */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <h2 className="text-base font-medium text-gray-700 mb-1">Adj. EBITDA Margin %</h2>
            <p className="text-xs text-gray-500 mb-3">Q3 2023 - Q3 2025</p>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={marginChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="quarter" stroke="#6B7280" />
                <YAxis 
                  domain={[0, 15]}
                  tickFormatter={(value) => `${value.toFixed(1)}%`} 
                  stroke="#6B7280" 
                />
                <Tooltip
                  formatter={(value: number) => `${value.toFixed(1)}%`}
                  labelFormatter={(label) => `Quarter: ${label}`}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    padding: '8px 12px'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="adjEbitdaMargin"
                  stroke="#1D9BF0"
                  strokeWidth={3}
                  dot={{ fill: '#1D9BF0', r: 5 }}
                  name="Adj. EBITDA Margin"
                />
              </LineChart>
            </ResponsiveContainer>
            <p className="text-xs text-gray-500 mt-1.5">7.2% in Q3 2025</p>
          </div>
        </div>

      </div>
    )
  }

  // Income Statement Tab Content
  const IncomeStatementTab = () => {
    if (!latestQuarter) {
      return <div className="text-center py-20 text-gray-400">No data available</div>
    }

    // Get quarters from Q3 2023 through Q3 2025 for charts
    const incomeChartQuarters = quarters.filter(q => 
      (q.year === 2023 && q.quarter >= 3) || 
      (q.year === 2024) ||
      (q.year === 2025 && q.quarter <= 3)
    ).sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year
      return a.quarter - b.quarter
    })

    // Get last 4 quarters for quarterly view
    const quarterlyData = last4Quarters.map(q => ({
      period: q.label,
      revenue: q.revenue,
      gaapNetIncome: q.gaapNetIncome,
      adjEbitda: q.adjEbitda,
      adjEbitdaMargin: q.adjEbitdaMarginPct,
      adjEPS: q.adjDilutedEPS || 0
    }))

    // Prepare revenue trend for chart
    const revenueTrendData = incomeChartQuarters.map(q => ({
      period: q.label,
      revenue: q.revenue
    }))

    return (
      <div className="space-y-4">
        {/* Key Metrics Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <div className="text-xs text-gray-500 mb-1">Latest Revenue</div>
            <div className="text-lg font-semibold text-[#003B5C]">
              {formatMillions(latestQuarter.revenue)}
            </div>
            <div className="text-xs text-gray-500">{latestQuarter.label}</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <div className="text-xs text-gray-500 mb-1">Adj. EBITDA</div>
            <div className="text-lg font-semibold text-[#003B5C]">
              {formatMillions(latestQuarter.adjEbitda)}
            </div>
            <div className="text-xs text-gray-500">{latestQuarter.adjEbitdaMarginPct.toFixed(1)}% margin</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <div className="text-xs text-gray-500 mb-1">GAAP Net Income</div>
            <div className="text-lg font-semibold text-[#003B5C]">
              {formatMillions(latestQuarter.gaapNetIncome)}
            </div>
            <div className="text-xs text-gray-500">{latestQuarter.label}</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <div className="text-xs text-gray-500 mb-1">Adj. EPS</div>
            <div className="text-lg font-semibold text-[#003B5C]">
              ${latestQuarter.adjDilutedEPS?.toFixed(2) || '0.12'}
            </div>
            <div className="text-xs text-gray-500">{latestQuarter.label}</div>
          </div>
        </div>

        {/* Revenue Trend Chart */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <h2 className="text-base font-medium text-gray-700 mb-1">Revenue Trend</h2>
          <p className="text-xs text-gray-500 mb-3">Q3 2023 - Q3 2025</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={revenueTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="period" stroke="#6B7280" tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={(value) => `$${value.toFixed(0)}M`} stroke="#6B7280" tick={{ fontSize: 11 }} />
              <Tooltip
                formatter={(value: number) => formatMillions(value)}
                labelFormatter={(label) => label}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  padding: '6px 10px',
                  fontSize: '12px'
                }}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#003B5C"
                strokeWidth={2}
                dot={{ fill: '#003B5C', r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Quarterly Income Statement */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 bg-gray-100 border-b border-gray-200">
            <h2 className="text-base font-semibold text-gray-800">Quarterly Income Statement</h2>
            <p className="text-xs text-gray-500 mt-0.5">(in millions USD, except per share data)</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">Period</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-700 uppercase">Revenue</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-700 uppercase">GAAP Net Income</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-700 uppercase">Adj. EBITDA</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-700 uppercase">Margin %</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-700 uppercase">Adj. EPS</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {quarterlyData.map((row, index) => (
                  <tr key={row.period} className="hover:bg-gray-50">
                    <td className="px-4 py-2.5 text-sm font-medium text-gray-800">{row.period}</td>
                    <td className="px-4 py-2.5 text-sm text-right text-gray-800">{formatMillions(row.revenue)}</td>
                    <td className="px-4 py-2.5 text-sm text-right text-[#003B5C]">{formatMillions(row.gaapNetIncome)}</td>
                    <td className="px-4 py-2.5 text-sm text-right text-[#003B5C]">{formatMillions(row.adjEbitda)}</td>
                    <td className="px-4 py-2.5 text-sm text-right text-gray-800">{row.adjEbitdaMargin.toFixed(1)}%</td>
                    <td className="px-4 py-2.5 text-sm text-right text-gray-800">${row.adjEPS.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Annual Income Statement */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 bg-gray-100 border-b border-gray-200">
            <h2 className="text-base font-semibold text-gray-800">Annual Income Statement</h2>
            <p className="text-xs text-gray-500 mt-0.5">(in millions USD, except per share data)</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">Year</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-700 uppercase">Revenue</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-700 uppercase">GAAP Net Income</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-700 uppercase">Adj. EBITDA</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-700 uppercase">Margin %</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {annual.map((row) => (
                  <tr key={row.year} className="hover:bg-gray-50">
                    <td className="px-4 py-2.5 text-sm font-medium text-gray-800">{row.year}</td>
                    <td className="px-4 py-2.5 text-sm text-right text-gray-800">{formatMillions(row.revenue)}</td>
                    <td className="px-4 py-2.5 text-sm text-right text-[#003B5C]">{formatMillions(row.gaapNetIncome)}</td>
                    <td className="px-4 py-2.5 text-sm text-right text-[#003B5C]">{formatMillions(row.adjEbitda)}</td>
                    <td className="px-4 py-2.5 text-sm text-right text-gray-800">{row.adjEbitdaMarginPct.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }

  // Balance Sheet Tab Content
  const BalanceSheetTab = () => {
    return (
      <div className="space-y-4">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-2">Balance Sheet</h2>
          <p className="text-sm text-gray-600 mb-4">
            Quarterly balance sheet data is not yet available in Fortrea's public releases. The company provides annual balance sheet information in its 10-K filings, but detailed quarterly balance sheet components are not disclosed in quarterly earnings releases.
          </p>
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-2">What Would Be Available:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-gray-600">
              <div>
                <strong className="text-gray-700">Assets:</strong>
                <ul className="mt-1 space-y-0.5 ml-4">
                  <li>• Cash and cash equivalents</li>
                  <li>• Accounts receivable</li>
                  <li>• Property, plant & equipment</li>
                  <li>• Goodwill and intangibles</li>
                </ul>
              </div>
              <div>
                <strong className="text-gray-700">Liabilities & Equity:</strong>
                <ul className="mt-1 space-y-0.5 ml-4">
                  <li>• Accounts payable</li>
                  <li>• Debt (current & long-term)</li>
                  <li>• Deferred revenue</li>
                  <li>• Total equity</li>
                </ul>
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-4 italic">
            Balance sheet data will be added once quarterly balance sheet information becomes available in future SEC filings or earnings releases.
          </p>
        </div>
      </div>
    )
  }

  // Ask Fortrea Tab Content
  const AskFortreaTab = () => {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Ask Fortrea</h2>
          <p className="text-sm text-gray-500 mb-6">
            Prototype finance copilot trained on Fortrea's public results and commentary.
          </p>
          
          {/* Chat Messages */}
          <div className="max-h-96 overflow-y-auto mb-6 space-y-4 pb-4">
            {chatMessages.length === 0 && (
              <div className="text-center py-12">
                <div className="text-sm text-gray-400 italic mb-2">
                  Ask a question about revenue, margins, backlog, or the transformation phase.
                </div>
                <div className="text-xs text-gray-400 mt-4">
                  Example questions:
                </div>
                <div className="text-xs text-gray-500 mt-2 space-y-1">
                  <div>• "What's our revenue trend?"</div>
                  <div>• "How are our margins?"</div>
                  <div>• "What's our backlog?"</div>
                  <div>• "Tell me about the transformation phase"</div>
                </div>
              </div>
            )}
            {chatMessages.map((msg, idx) => (
              <div
                key={`msg-${idx}-${msg.content.substring(0, 10)}`}
                className={`p-4 rounded-lg ${
                  msg.role === 'user'
                    ? 'bg-[#003B5C] text-white ml-12'
                    : 'bg-gray-100 text-gray-800 mr-12'
                }`}
              >
                <div className="text-xs font-medium mb-2 opacity-80">
                  {msg.role === 'user' ? 'You' : 'Fortrea'}
                </div>
                <div className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</div>
              </div>
            ))}
            {chatLoading && (
              <div className="text-sm text-gray-400 italic text-center py-4">Thinking...</div>
            )}
          </div>

          {/* Chat Input */}
          <div className="flex gap-3">
            <input
              ref={inputRef}
              type="text"
              value={chatInput}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Ask about revenue, margins, backlog, or transformation..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003B5C] focus:border-transparent text-sm"
              disabled={chatLoading}
              autoComplete="off"
              id="fortrea-chat-input"
            />
            <button
              type="button"
              onClick={handleAskFortrea}
              disabled={chatLoading || !chatInput.trim()}
              className="px-8 py-3 bg-[#003B5C] text-white rounded-lg hover:bg-[#002d44] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
            >
              {chatLoading ? 'Sending...' : 'Ask'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Cash Flow Tab Content
  const CashFlowTab = () => {
    // Get quarters with cash flow data (Q4 2023 through Q3 2025)
    const cashFlowQuarters = quarters.filter(q => 
      (q.year === 2023 && q.quarter === 4) || 
      (q.year === 2024) ||
      (q.year === 2025 && q.quarter <= 3)
    ).sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year
      return a.quarter - b.quarter
    })

    // Prepare cash flow chart data
    const cashFlowChartData = cashFlowQuarters.map(q => ({
      quarter: q.label,
      freeCashFlow: q.freeCashFlow || 0,
      adjEbitda: q.adjEbitda,
      operatingCashFlow: q.operatingCashFlow || 0
    }))

    return (
      <div className="space-y-4">
        {/* Q3 2025 Cash Flow Highlights */}
        {q3_2025 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
              <div className="text-xs text-gray-500 mb-1">Operating Cash Flow</div>
              <div className="text-lg font-semibold text-[#003B5C]">
                {formatMillions(q3_2025.operatingCashFlow || 86.8)}
              </div>
              <div className="text-xs text-gray-500">Q3 2025</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
              <div className="text-xs text-gray-500 mb-1">Free Cash Flow</div>
              <div className="text-lg font-semibold text-[#003B5C]">
                {formatMillions(q3_2025.freeCashFlow || 79.5)}
              </div>
              <div className="text-xs text-gray-500">Q3 2025</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
              <div className="text-xs text-gray-500 mb-1">DSO Improvement</div>
              <div className="text-lg font-semibold text-[#003B5C]">-13 days</div>
              <div className="text-xs text-gray-500">To 33 days in Q3 2025</div>
            </div>
          </div>
        )}

        {/* Free Cash Flow Chart */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <h2 className="text-base font-medium text-gray-700 mb-1">Free Cash Flow</h2>
          <p className="text-xs text-gray-500 mb-3">Q4 2023 - Q3 2025</p>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={cashFlowChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="quarter" stroke="#6B7280" tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={(value) => `$${value.toFixed(0)}M`} stroke="#6B7280" tick={{ fontSize: 11 }} />
              <Tooltip
                formatter={(value: number) => `$${value.toFixed(1)}M`}
                labelFormatter={(label) => label}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  padding: '6px 10px',
                  fontSize: '12px'
                }}
              />
              <Bar 
                dataKey="freeCashFlow" 
                fill="#003B5C" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
          <p className="text-xs text-gray-500 mt-1.5">
            Q2 2024 includes ~$200M one-time benefit; Q3 2025: $79.5M
          </p>
        </div>

        {/* EBITDA vs Cash Flow Comparison */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <h2 className="text-base font-medium text-gray-700 mb-1">Adj. EBITDA vs Free Cash Flow</h2>
          <p className="text-xs text-gray-500 mb-3">Cash conversion trend</p>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={cashFlowChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="quarter" stroke="#6B7280" tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={(value) => `$${value.toFixed(0)}M`} stroke="#6B7280" tick={{ fontSize: 11 }} />
              <Tooltip
                formatter={(value: number, name: string) => {
                  return [`$${value.toFixed(1)}M`, name === 'adjEbitda' ? 'Adj. EBITDA' : 'Free Cash Flow']
                }}
                labelFormatter={(label) => label}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  padding: '6px 10px',
                  fontSize: '12px'
                }}
              />
              <Line
                type="monotone"
                dataKey="adjEbitda"
                stroke="#1D9BF0"
                strokeWidth={2}
                dot={{ fill: '#1D9BF0', r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="freeCashFlow"
                stroke="#10B981"
                strokeWidth={2}
                dot={{ fill: '#10B981', r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Cash Flow Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 bg-gray-100 border-b border-gray-200">
            <h2 className="text-base font-semibold text-gray-800">Cash Flow Summary</h2>
            <p className="text-xs text-gray-500 mt-0.5">(in millions USD)</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">Period</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-700 uppercase">Op. Cash Flow</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-700 uppercase">Free Cash Flow</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-700 uppercase">Adj. EBITDA</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {cashFlowChartData.map((row) => (
                  <tr key={row.quarter} className="hover:bg-gray-50">
                    <td className="px-4 py-2.5 text-sm font-medium text-gray-800">{row.quarter}</td>
                    <td className="px-4 py-2.5 text-sm text-right text-gray-800">
                      {row.operatingCashFlow ? formatMillions(row.operatingCashFlow) : '—'}
                    </td>
                    <td className="px-4 py-2.5 text-sm text-right text-[#003B5C]">
                      {row.freeCashFlow ? formatMillions(row.freeCashFlow) : '—'}
                    </td>
                    <td className="px-4 py-2.5 text-sm text-right text-gray-800">{formatMillions(row.adjEbitda)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-screen-xl mx-auto px-6 py-8">
          <h1 className="text-3xl font-semibold text-gray-800">Fortrea Financial Dashboard</h1>
          <p className="text-gray-500 mt-1">
            Prototype view of Fortrea's financial statements and trends built from public filings.
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-screen-xl mx-auto px-6">
          <div className="flex space-x-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 text-sm font-medium rounded-t-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-[#003B5C] text-white border-b-2 border-[#003B5C]'
                    : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-screen-xl mx-auto px-6 py-8">
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'income-statement' && <IncomeStatementTab />}
        {activeTab === 'balance-sheet' && <BalanceSheetTab />}
        {activeTab === 'cash-flow' && <CashFlowTab />}
        {activeTab === 'ask-fortrea' && <AskFortreaTab />}
      </div>

      {/* Footer */}
      <div className="max-w-screen-xl mx-auto px-6 mt-12 mb-8">
        <p className="text-xs text-gray-400 text-center">
          Internal prototype created for demonstration purposes. Data shown is from Fortrea public releases.
        </p>
      </div>
    </div>
  )
}
