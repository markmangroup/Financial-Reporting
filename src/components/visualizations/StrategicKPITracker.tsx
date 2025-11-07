'use client'

import { ParsedCSVData } from '@/types'
import { calculateFinancialTotals } from '@/lib/financialCalculations'
import { RadialBarChart, RadialBar, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts'

interface StrategicKPITrackerProps {
  checkingData: ParsedCSVData
}

export default function StrategicKPITracker({ checkingData }: StrategicKPITrackerProps) {
  const financials = calculateFinancialTotals(checkingData)

  // Calculate strategic KPIs
  const grossMarginPercent = (financials.netIncome / financials.businessRevenue) * 100
  const consultantEfficiency = financials.businessRevenue / financials.consultantExpenses
  const burnRate = financials.totalBusinessExpenses / 12
  const cashRunway = financials.currentCashBalance / burnRate
  const revenuePerConsultantDollar = financials.businessRevenue / financials.consultantExpenses

  // KPI Targets and Calculations
  const kpis = [
    {
      name: 'Gross Margin',
      value: Math.max(0, grossMarginPercent),
      target: 25,
      current: grossMarginPercent,
      unit: '%',
      color: grossMarginPercent >= 20 ? '#10B981' : grossMarginPercent >= 10 ? '#F59E0B' : '#EF4444',
      trend: 'stable'
    },
    {
      name: 'Consultant ROI',
      value: Math.min(100, consultantEfficiency * 50), // Scale for gauge
      target: 80,
      current: consultantEfficiency,
      unit: 'x',
      color: consultantEfficiency >= 1.5 ? '#10B981' : consultantEfficiency >= 1.2 ? '#F59E0B' : '#EF4444',
      trend: 'up'
    },
    {
      name: 'Cash Runway',
      value: Math.min(100, (cashRunway / 12) * 100), // 12 months = 100%
      target: 50, // 6 months minimum
      current: cashRunway,
      unit: 'mo',
      color: cashRunway >= 6 ? '#10B981' : cashRunway >= 3 ? '#F59E0B' : '#EF4444',
      trend: cashRunway >= 6 ? 'stable' : 'down'
    },
    {
      name: 'Revenue Efficiency',
      value: Math.min(100, (revenuePerConsultantDollar / 2) * 100),
      target: 80,
      current: revenuePerConsultantDollar,
      unit: '$/$',
      color: revenuePerConsultantDollar >= 1.8 ? '#10B981' : revenuePerConsultantDollar >= 1.5 ? '#F59E0B' : '#EF4444',
      trend: 'up'
    }
  ]

  const KPIGauge = ({ kpi, index }: { kpi: any, index: number }) => {
    const gaugeData = [
      {
        name: kpi.name,
        value: kpi.value,
        fill: kpi.color
      }
    ]

    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{kpi.name}</h3>
          <div className="text-3xl font-bold" style={{ color: kpi.color }}>
            {kpi.unit === '%' ? kpi.current.toFixed(1) : kpi.current.toFixed(2)}
            <span className="text-base font-normal text-gray-500">{kpi.unit}</span>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={120}>
          <RadialBarChart
            cx="50%"
            cy="50%"
            innerRadius="60%"
            outerRadius="90%"
            startAngle={90}
            endAngle={-270}
            data={gaugeData}
          >
            <RadialBar
              dataKey="value"
              cornerRadius={10}
              fill={kpi.color}
              background={{ fill: '#f3f4f6' }}
            />
          </RadialBarChart>
        </ResponsiveContainer>

        <div className="flex items-center justify-between mt-4 text-sm">
          <span className="text-gray-500">Target: {kpi.target}{kpi.unit === '$/$' ? 'x' : kpi.unit}</span>
          <div className="flex items-center space-x-1">
            <span className={`inline-block w-2 h-2 rounded-full ${
              kpi.trend === 'up' ? 'bg-green-400' :
              kpi.trend === 'down' ? 'bg-red-400' : 'bg-yellow-400'
            }`}></span>
            <span className="text-xs text-gray-600 capitalize">{kpi.trend}</span>
          </div>
        </div>
      </div>
    )
  }

  // Strategic Focus Areas Data
  const focusAreas = [
    { name: 'Revenue Growth', value: 30, color: '#10B981' },
    { name: 'Cost Optimization', value: 25, color: '#6366F1' },
    { name: 'Cash Management', value: 20, color: '#F59E0B' },
    { name: 'Client Retention', value: 15, color: '#EF4444' },
    { name: 'Operational Efficiency', value: 10, color: '#8B5CF6' }
  ]

  // Business Health Score (composite)
  const healthComponents = [
    { factor: 'Profitability', weight: 0.3, score: Math.min(100, Math.max(0, grossMarginPercent * 2)) },
    { factor: 'Liquidity', weight: 0.25, score: Math.min(100, (cashRunway / 12) * 100) },
    { factor: 'Efficiency', weight: 0.25, score: Math.min(100, consultantEfficiency * 50) },
    { factor: 'Growth', weight: 0.2, score: 75 } // Simulated growth score
  ]

  const overallHealthScore = healthComponents.reduce((total, comp) =>
    total + (comp.score * comp.weight), 0
  )

  return (
    <div className="space-y-8">
      {/* Strategic KPI Header */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200 p-6">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Strategic KPI Tracker</h1>
          <p className="text-gray-600">Real-time business performance indicators</p>
        </div>

        {/* Overall Health Score */}
        <div className="bg-white rounded-lg p-6 border border-indigo-100">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Business Health Score</h2>
            <div className={`text-6xl font-bold mb-2 ${
              overallHealthScore >= 80 ? 'text-green-500' :
              overallHealthScore >= 60 ? 'text-yellow-500' : 'text-red-500'
            }`}>
              {Math.round(overallHealthScore)}
            </div>
            <div className="text-sm text-gray-600 mb-4">
              {overallHealthScore >= 80 ? 'Excellent Performance' :
               overallHealthScore >= 60 ? 'Good Performance' : 'Needs Improvement'}
            </div>

            {/* Health Components */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-center">
              {healthComponents.map((comp, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-3">
                  <div className="text-lg font-bold text-gray-800">
                    {Math.round(comp.score)}
                  </div>
                  <div className="text-xs text-gray-600">{comp.factor}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* KPI Gauges */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {kpis.map((kpi, index) => (
          <KPIGauge key={index} kpi={kpi} index={index} />
        ))}
      </div>

      {/* Strategic Focus & Risk Assessment */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Strategic Focus Areas */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Strategic Focus Areas</h3>

          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={focusAreas}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {focusAreas.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          <div className="space-y-2">
            {focusAreas.map((area, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: area.color }}
                  ></div>
                  <span className="text-sm text-gray-700">{area.name}</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{area.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Insights */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Performance Insights</h3>

          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-800 mb-2">✅ Strengths</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Strong consultant network globally</li>
                <li>• Diversified client portfolio</li>
                <li>• Variable cost structure</li>
              </ul>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h4 className="font-semibold text-amber-800 mb-2">⚠️ Watch Areas</h4>
              <ul className="text-sm text-amber-700 space-y-1">
                <li>• Cash runway below optimal</li>
                <li>• Margin improvement needed</li>
                <li>• Consultant efficiency optimization</li>
              </ul>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-2">🎯 Action Items</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Increase pricing power</li>
                <li>• Optimize consultant utilization</li>
                <li>• Expand high-margin services</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}