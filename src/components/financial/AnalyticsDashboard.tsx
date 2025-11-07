'use client'

import { useState } from 'react'
import { ParsedCSVData } from '@/types'
import RevenuePerformanceChart from '@/components/visualizations/RevenuePerformanceChart'
import ExpenseAnalysisChart from '@/components/visualizations/ExpenseAnalysisChart'
import CashFlowInsights from '@/components/visualizations/CashFlowInsights'
import KPIDashboard from '@/components/visualizations/KPIDashboard'
import ComparativeAnalysis from '@/components/visualizations/ComparativeAnalysis'

interface AnalyticsDashboardProps {
  checkingData: ParsedCSVData | null
  creditData?: ParsedCSVData | null
}

type AnalyticsView = 'overview' | 'revenue' | 'expenses' | 'cashflow' | 'kpis' | 'comparative'

export default function AnalyticsDashboard({ checkingData, creditData }: AnalyticsDashboardProps) {
  const [activeView, setActiveView] = useState<AnalyticsView>('overview')

  if (!checkingData) {
    return (
      <div className="p-6">
        <div className="text-center py-20">
          <div className="text-gray-400 text-lg mb-4">Upload your Chase checking account CSV to view Analytics</div>
        </div>
      </div>
    )
  }

  const views = [
    { id: 'overview' as AnalyticsView, label: 'Overview', icon: '📊' },
    { id: 'revenue' as AnalyticsView, label: 'Revenue', icon: '💰' },
    { id: 'expenses' as AnalyticsView, label: 'Expenses', icon: '📉' },
    { id: 'cashflow' as AnalyticsView, label: 'Cash Flow', icon: '💵' },
    { id: 'kpis' as AnalyticsView, label: 'KPIs', icon: '🎯' },
    { id: 'comparative' as AnalyticsView, label: 'Trends', icon: '📈' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Financial Analytics</h1>
              <p className="text-sm text-gray-600">
                Advanced visualizations and insights for {checkingData.summary.dateRange.start} to{' '}
                {checkingData.summary.dateRange.end}
              </p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-2 overflow-x-auto">
            {views.map(view => (
              <button
                key={view.id}
                onClick={() => setActiveView(view.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  activeView === view.id
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="mr-2">{view.icon}</span>
                {view.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-6">
        {activeView === 'overview' && (
          <div className="space-y-8">
            {/* Overview combines all key visualizations */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Overview</h2>
              <p className="text-gray-600 mb-6">
                Select a specific view from the tabs above for detailed analysis, or scroll through this overview
                for a comprehensive summary of all financial metrics.
              </p>

              {/* Quick Links */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {views.slice(1).map(view => (
                  <button
                    key={view.id}
                    onClick={() => setActiveView(view.id)}
                    className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200 hover:shadow-lg transition-all text-left"
                  >
                    <div className="text-3xl mb-2">{view.icon}</div>
                    <div className="text-sm font-semibold text-gray-900">{view.label}</div>
                    <div className="text-xs text-gray-600 mt-1">View detailed analysis →</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Mini versions of each view */}
            <div className="space-y-8">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">💰 Revenue Highlights</h3>
                  <button
                    onClick={() => setActiveView('revenue')}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    View Full Analysis →
                  </button>
                </div>
                <RevenuePerformanceChart checkingData={checkingData} />
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">📉 Expense Highlights</h3>
                  <button
                    onClick={() => setActiveView('expenses')}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    View Full Analysis →
                  </button>
                </div>
                <ExpenseAnalysisChart checkingData={checkingData} creditData={creditData} />
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">💵 Cash Flow Highlights</h3>
                  <button
                    onClick={() => setActiveView('cashflow')}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    View Full Analysis →
                  </button>
                </div>
                <CashFlowInsights checkingData={checkingData} />
              </div>
            </div>
          </div>
        )}

        {activeView === 'revenue' && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <RevenuePerformanceChart checkingData={checkingData} />
          </div>
        )}

        {activeView === 'expenses' && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <ExpenseAnalysisChart checkingData={checkingData} creditData={creditData} />
          </div>
        )}

        {activeView === 'cashflow' && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <CashFlowInsights checkingData={checkingData} />
          </div>
        )}

        {activeView === 'kpis' && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <KPIDashboard checkingData={checkingData} creditData={creditData} />
          </div>
        )}

        {activeView === 'comparative' && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <ComparativeAnalysis checkingData={checkingData} creditData={creditData} />
          </div>
        )}
      </div>
    </div>
  )
}
