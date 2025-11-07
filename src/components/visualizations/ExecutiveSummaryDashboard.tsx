'use client'

import { ParsedCSVData } from '@/types'
import { calculateFinancialTotals } from '@/lib/financialCalculations'

interface ExecutiveSummaryDashboardProps {
  checkingData: ParsedCSVData
}

export default function ExecutiveSummaryDashboard({ checkingData }: ExecutiveSummaryDashboardProps) {
  const financials = calculateFinancialTotals(checkingData)

  // Executive Metrics Calculations
  const grossMargin = (financials.netIncome / financials.businessRevenue) * 100
  const burnRate = financials.totalBusinessExpenses / 12
  const cashRunway = financials.currentCashBalance / burnRate
  const consultantROI = financials.businessRevenue / financials.consultantExpenses

  // Executive Status Indicators
  const getStatusIcon = (metric: string, value: number, thresholds: { good: number, warning: number }) => {
    if (value >= thresholds.good) {
      return <span className="text-green-500">✅</span>
    } else if (value >= thresholds.warning) {
      return <span className="text-yellow-500">⚠️</span>
    } else {
      return <span className="text-red-500">⚠️</span>
    }
  }

  const getStatusColor = (value: number, thresholds: { good: number, warning: number }) => {
    if (value >= thresholds.good) return 'text-green-600 bg-green-50 border-green-200'
    if (value >= thresholds.warning) return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    return 'text-red-600 bg-red-50 border-red-200'
  }

  // Key Business Insights
  const insights = [
    {
      title: 'Revenue Performance',
      value: '$181.3K',
      subtitle: 'Annual Revenue',
      trend: 'stable',
      icon: '💰',
      color: 'bg-blue-500'
    },
    {
      title: 'Profitability',
      value: `${grossMargin.toFixed(1)}%`,
      subtitle: 'Gross Margin',
      trend: grossMargin >= 0 ? 'stable' : 'down',
      icon: '🎯',
      color: grossMargin >= 20 ? 'bg-green-500' : grossMargin >= 10 ? 'bg-yellow-500' : 'bg-red-500'
    },
    {
      title: 'Cash Position',
      value: `${Math.floor(cashRunway)} mo`,
      subtitle: 'Runway Remaining',
      trend: cashRunway >= 6 ? 'stable' : 'down',
      icon: '💵',
      color: cashRunway >= 6 ? 'bg-green-500' : cashRunway >= 3 ? 'bg-yellow-500' : 'bg-red-500'
    },
    {
      title: 'Team Efficiency',
      value: `${consultantROI.toFixed(1)}x`,
      subtitle: 'Consultant ROI',
      trend: consultantROI >= 1.5 ? 'up' : 'stable',
      icon: '👥',
      color: consultantROI >= 1.8 ? 'bg-green-500' : consultantROI >= 1.5 ? 'bg-yellow-500' : 'bg-red-500'
    }
  ]

  // Executive Actions & Priorities
  const priorities = [
    {
      title: 'Immediate (0-30 days)',
      items: [
        'Review and optimize consultant utilization rates',
        'Implement monthly cash flow monitoring',
        'Negotiate extended payment terms with key clients'
      ],
      color: 'border-red-200 bg-red-50'
    },
    {
      title: 'Short-term (1-3 months)',
      items: [
        'Develop pricing optimization strategy',
        'Expand service offerings to high-margin areas',
        'Strengthen client retention programs'
      ],
      color: 'border-yellow-200 bg-yellow-50'
    },
    {
      title: 'Strategic (3-12 months)',
      items: [
        'Scale consultant network in high-demand regions',
        'Diversify revenue streams beyond current clients',
        'Implement automated financial reporting systems'
      ],
      color: 'border-green-200 bg-green-50'
    }
  ]

  return (
    <div className="space-y-8">
      {/* Executive Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-lg text-white p-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-2">Executive Summary</h1>
          <p className="text-slate-300 text-lg">Financial Performance & Strategic Overview</p>
          <div className="mt-4 text-sm text-slate-400">
            Period: {checkingData.summary.dateRange.start} to {checkingData.summary.dateRange.end}
          </div>
        </div>

        {/* Key Metrics Hero Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mt-8">
          {insights.map((insight, index) => (
            <div key={index} className="bg-white/10 backdrop-blur border border-white/20 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${insight.color} text-white`}>
                  {insight.icon}
                </div>
                <div className="flex items-center space-x-1">
                  {insight.trend === 'up' ? (
                    <span className="text-green-400">📈</span>
                  ) : insight.trend === 'down' ? (
                    <span className="text-red-400">📉</span>
                  ) : (
                    <div className="w-4 h-4 rounded-full bg-gray-400"></div>
                  )}
                </div>
              </div>
              <div className="text-3xl font-bold text-white mb-1">{insight.value}</div>
              <div className="text-slate-300 text-sm">{insight.subtitle}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Business Health Status */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Business Health Status</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className={`rounded-lg border p-4 ${getStatusColor(grossMargin, { good: 20, warning: 10 })}`}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">Profitability</h3>
              {getStatusIcon('margin', grossMargin, { good: 20, warning: 10 })}
            </div>
            <div className="text-2xl font-bold">{grossMargin.toFixed(1)}%</div>
            <p className="text-sm mt-1">
              {grossMargin >= 20 ? 'Strong margins' : grossMargin >= 10 ? 'Margins under pressure' : 'Loss position - urgent action needed'}
            </p>
          </div>

          <div className={`rounded-lg border p-4 ${getStatusColor(cashRunway, { good: 6, warning: 3 })}`}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">Liquidity</h3>
              {getStatusIcon('cash', cashRunway, { good: 6, warning: 3 })}
            </div>
            <div className="text-2xl font-bold">{Math.floor(cashRunway)} mo</div>
            <p className="text-sm mt-1">
              {cashRunway >= 6 ? 'Healthy cash runway' : cashRunway >= 3 ? 'Monitor cash closely' : 'Critical - immediate action required'}
            </p>
          </div>

          <div className={`rounded-lg border p-4 ${getStatusColor(consultantROI, { good: 1.8, warning: 1.5 })}`}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">Efficiency</h3>
              {getStatusIcon('roi', consultantROI, { good: 1.8, warning: 1.5 })}
            </div>
            <div className="text-2xl font-bold">{consultantROI.toFixed(1)}x</div>
            <p className="text-sm mt-1">
              {consultantROI >= 1.8 ? 'Excellent ROI' : consultantROI >= 1.5 ? 'Good ROI' : 'ROI needs improvement'}
            </p>
          </div>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Financial Snapshot</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-700">Total Revenue</span>
              <span className="font-semibold text-green-600">
                ${financials.businessRevenue.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-700">Total Expenses</span>
              <span className="font-semibold text-red-600">
                ${financials.totalBusinessExpenses.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-700">Net Income</span>
              <span className={`font-semibold ${financials.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${financials.netIncome.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-700">Current Cash</span>
              <span className="font-semibold text-blue-600">
                ${financials.currentCashBalance.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Key Ratios</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-700">Gross Margin</span>
              <span className={`font-semibold ${grossMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {grossMargin.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-700">Monthly Burn Rate</span>
              <span className="font-semibold text-orange-600">
                ${Math.round(burnRate).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-700">Consultant Efficiency</span>
              <span className="font-semibold text-purple-600">
                {consultantROI.toFixed(1)}x ROI
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-700">Cash Runway</span>
              <span className={`font-semibold ${cashRunway >= 6 ? 'text-green-600' : 'text-yellow-600'}`}>
                {Math.floor(cashRunway)} months
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Strategic Priorities */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Strategic Action Plan</h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {priorities.map((priority, index) => (
            <div key={index} className={`rounded-lg border p-4 ${priority.color}`}>
              <h3 className="font-semibold text-gray-900 mb-3">{priority.title}</h3>
              <ul className="space-y-2">
                {priority.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="text-sm text-gray-700 flex items-start space-x-2">
                    <span className="inline-block w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Line Summary */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg text-white p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Executive Bottom Line</h2>
          <div className="max-w-4xl mx-auto">
            <p className="text-lg leading-relaxed">
              The business demonstrates a strong operational foundation with a diversified global consultant network
              generating <strong>${financials.businessRevenue.toLocaleString()}</strong> in revenue.
              {grossMargin >= 0
                ? `With a ${grossMargin.toFixed(1)}% gross margin, profitability is ${grossMargin >= 20 ? 'strong' : 'moderate'}.`
                : `Current loss position requires immediate attention to restore profitability.`
              }
              {' '}Cash runway of <strong>{Math.floor(cashRunway)} months</strong> provides
              {cashRunway >= 6 ? ' adequate' : ' limited'} time for strategic initiatives.
            </p>
            <p className="text-base text-indigo-100 mt-4">
              <strong>Priority:</strong> Focus on {grossMargin < 0 ? 'cost optimization and revenue enhancement' : 'scaling profitable operations'}
              while maintaining cash discipline and consultant network quality.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}