'use client'

import { ParsedCSVData } from '@/types'
import { calculateFinancialTotals } from '@/lib/financialCalculations'
import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from 'recharts'

interface KPIDashboardProps {
  checkingData: ParsedCSVData
  creditData?: ParsedCSVData | null
}

export default function KPIDashboard({ checkingData, creditData }: KPIDashboardProps) {
  const financials = calculateFinancialTotals(checkingData)

  // Calculate KPIs
  const grossMargin = (financials.netIncome / financials.businessRevenue) * 100
  const avgMonthlyBurn = financials.totalBusinessExpenses / checkingData.monthlyData.length
  const avgMonthlyRevenue = financials.businessRevenue / checkingData.monthlyData.length
  const cashRunway = avgMonthlyBurn > 0 ? financials.currentCashBalance / avgMonthlyBurn : Infinity
  const consultantROI = financials.consultantExpenses > 0 ? financials.businessRevenue / financials.consultantExpenses : 0
  const expenseRatio = (financials.totalBusinessExpenses / financials.businessRevenue) * 100
  const revenuePerConsultant = financials.businessRevenue / checkingData.categories.filter(c => c.category.includes('Consultant')).length

  // Quick Ratio (Cash / Current Liabilities) - simplified as we don't track formal liabilities
  const monthlyLiabilities = avgMonthlyBurn
  const quickRatio = financials.currentCashBalance / monthlyLiabilities

  // Working Capital (Cash - 1 month liabilities)
  const workingCapital = financials.currentCashBalance - monthlyLiabilities

  // Efficiency metrics
  const revenueGrowthRate = 0 // Would need historical data
  const clientCount = checkingData.categories.filter(c => c.category.includes('Client Payment')).length
  const revenuePerClient = financials.businessRevenue / clientCount

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const getHealthStatus = (value: number, good: number, warning: number, reverse: boolean = false) => {
    if (reverse) {
      if (value <= good) return { color: 'green', label: 'Excellent', bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' }
      if (value <= warning) return { color: 'yellow', label: 'Good', bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' }
      return { color: 'red', label: 'Needs Attention', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' }
    }
    if (value >= good) return { color: 'green', label: 'Excellent', bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' }
    if (value >= warning) return { color: 'yellow', label: 'Good', bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' }
    return { color: 'red', label: 'Needs Attention', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' }
  }

  // KPI Cards Configuration
  const kpis = [
    {
      category: 'Profitability',
      metrics: [
        {
          name: 'Gross Margin',
          value: `${grossMargin.toFixed(1)}%`,
          description: 'Net income as % of revenue',
          status: getHealthStatus(grossMargin, 20, 10),
          target: '20%+',
          icon: '📈'
        },
        {
          name: 'Expense Ratio',
          value: `${expenseRatio.toFixed(1)}%`,
          description: 'Expenses as % of revenue',
          status: getHealthStatus(expenseRatio, 70, 80, true),
          target: '< 80%',
          icon: '💰'
        },
        {
          name: 'Net Income',
          value: formatCurrency(financials.netIncome),
          description: 'Total profit for period',
          status: financials.netIncome > 0 ? getHealthStatus(100, 20, 10) : getHealthStatus(0, 20, 10),
          target: 'Positive',
          icon: '✨'
        }
      ]
    },
    {
      category: 'Liquidity',
      metrics: [
        {
          name: 'Cash Runway',
          value: cashRunway === Infinity ? '∞' : `${Math.floor(cashRunway)} mo`,
          description: 'Months of cash remaining',
          status: cashRunway === Infinity ? getHealthStatus(100, 20, 10) : getHealthStatus(cashRunway, 6, 3),
          target: '6+ months',
          icon: '⏱️'
        },
        {
          name: 'Quick Ratio',
          value: quickRatio.toFixed(2),
          description: 'Cash to monthly burn',
          status: getHealthStatus(quickRatio, 3, 1.5),
          target: '3.0+',
          icon: '🎯'
        },
        {
          name: 'Working Capital',
          value: formatCurrency(workingCapital),
          description: 'Available operating cash',
          status: workingCapital > avgMonthlyBurn * 3 ? getHealthStatus(100, 20, 10) : getHealthStatus(0, 20, 10),
          target: '3+ months burn',
          icon: '💵'
        }
      ]
    },
    {
      category: 'Efficiency',
      metrics: [
        {
          name: 'Consultant ROI',
          value: `${consultantROI.toFixed(2)}x`,
          description: 'Revenue per dollar spent',
          status: getHealthStatus(consultantROI, 2.0, 1.5),
          target: '2.0x+',
          icon: '👥'
        },
        {
          name: 'Revenue/Consultant',
          value: formatCurrency(revenuePerConsultant),
          description: 'Avg revenue per consultant',
          status: getHealthStatus(revenuePerConsultant, 50000, 30000),
          target: '$50K+',
          icon: '🎓'
        },
        {
          name: 'Revenue/Client',
          value: formatCurrency(revenuePerClient),
          description: 'Avg revenue per client',
          status: getHealthStatus(revenuePerClient, 75000, 50000),
          target: '$75K+',
          icon: '🤝'
        }
      ]
    },
    {
      category: 'Scale',
      metrics: [
        {
          name: 'Monthly Revenue',
          value: formatCurrency(avgMonthlyRevenue),
          description: 'Average monthly revenue',
          status: getHealthStatus(avgMonthlyRevenue, 20000, 10000),
          target: '$20K+',
          icon: '💵'
        },
        {
          name: 'Monthly Burn',
          value: formatCurrency(avgMonthlyBurn),
          description: 'Average monthly expenses',
          status: getHealthStatus(avgMonthlyBurn, 15000, 20000, true),
          target: 'Under control',
          icon: '🔥'
        },
        {
          name: 'Active Clients',
          value: clientCount.toString(),
          description: 'Number of paying clients',
          status: getHealthStatus(clientCount, 3, 2),
          target: '3+',
          icon: '👔'
        }
      ]
    }
  ]

  // Overall business health score (0-100)
  const healthScore = Math.round(
    (
      (grossMargin >= 20 ? 25 : grossMargin >= 10 ? 15 : 5) +
      (cashRunway === Infinity ? 25 : cashRunway >= 6 ? 25 : cashRunway >= 3 ? 15 : 5) +
      (consultantROI >= 2 ? 25 : consultantROI >= 1.5 ? 15 : 5) +
      (quickRatio >= 3 ? 25 : quickRatio >= 1.5 ? 15 : 5)
    )
  )

  const healthScoreData = [
    {
      name: 'Health Score',
      value: healthScore,
      fill: healthScore >= 75 ? '#10B981' : healthScore >= 50 ? '#F59E0B' : '#EF4444'
    }
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Financial KPI Dashboard</h2>
        <p className="text-gray-600">Key performance indicators and business health metrics</p>
      </div>

      {/* Overall Health Score */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg p-8 text-white">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          <div className="lg:col-span-1">
            <ResponsiveContainer width="100%" height={200}>
              <RadialBarChart
                cx="50%"
                cy="50%"
                innerRadius="60%"
                outerRadius="90%"
                data={healthScoreData}
                startAngle={180}
                endAngle={0}
              >
                <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                <RadialBar
                  background
                  dataKey="value"
                  cornerRadius={10}
                  fill={healthScoreData[0].fill}
                />
                <text
                  x="50%"
                  y="50%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-4xl font-bold"
                  fill="white"
                >
                  {healthScore}
                </text>
              </RadialBarChart>
            </ResponsiveContainer>
          </div>

          <div className="lg:col-span-2">
            <h3 className="text-2xl font-bold mb-2">Overall Business Health</h3>
            <p className="text-slate-300 mb-4">
              Composite score based on profitability, liquidity, efficiency, and growth metrics
            </p>
            <div className="flex items-center space-x-4">
              <div className="text-5xl font-bold">{healthScore}/100</div>
              <div>
                <div className="text-lg font-semibold">
                  {healthScore >= 75 ? '✅ Excellent' : healthScore >= 50 ? '⚠️ Good' : '🚨 Needs Attention'}
                </div>
                <div className="text-sm text-slate-400">
                  {healthScore >= 75
                    ? 'Strong financial position across all metrics'
                    : healthScore >= 50
                    ? 'Solid foundation with room for improvement'
                    : 'Critical areas require immediate attention'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Categories */}
      {kpis.map((category, categoryIndex) => (
        <div key={categoryIndex} className="space-y-4">
          <h3 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
            <span>{category.category} Metrics</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {category.metrics.map((metric, metricIndex) => (
              <div
                key={metricIndex}
                className={`rounded-lg border-2 ${metric.status.border} ${metric.status.bg} p-6 transition-all hover:shadow-lg`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="text-3xl">{metric.icon}</div>
                  <div className={`px-3 py-1 rounded-full text-xs font-semibold ${metric.status.bg} ${metric.status.text} border ${metric.status.border}`}>
                    {metric.status.label}
                  </div>
                </div>

                <div className="mb-2">
                  <div className="text-sm font-medium text-gray-600 mb-1">{metric.name}</div>
                  <div className={`text-3xl font-bold ${metric.status.text}`}>{metric.value}</div>
                </div>

                <div className="text-xs text-gray-600 mb-3">{metric.description}</div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                  <span className="text-xs text-gray-500">Target:</span>
                  <span className="text-xs font-semibold text-gray-700">{metric.target}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Key Insights & Recommendations */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg border border-indigo-200 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">🎯 Key Insights & Recommendations</h3>
        <div className="space-y-3">
          {grossMargin < 10 && (
            <div className="flex items-start space-x-3 p-3 bg-white rounded-lg border border-red-200">
              <span className="text-xl">🚨</span>
              <div>
                <div className="font-semibold text-gray-900">Low Profitability</div>
                <div className="text-sm text-gray-700">
                  Gross margin of {grossMargin.toFixed(1)}% is below target. Consider increasing prices or reducing consultant costs.
                </div>
              </div>
            </div>
          )}

          {cashRunway !== Infinity && cashRunway < 6 && (
            <div className="flex items-start space-x-3 p-3 bg-white rounded-lg border border-yellow-200">
              <span className="text-xl">⚠️</span>
              <div>
                <div className="font-semibold text-gray-900">Limited Cash Runway</div>
                <div className="text-sm text-gray-700">
                  {Math.floor(cashRunway)} months of runway is below the 6-month recommended minimum. Focus on improving cash flow.
                </div>
              </div>
            </div>
          )}

          {consultantROI < 1.5 && (
            <div className="flex items-start space-x-3 p-3 bg-white rounded-lg border border-orange-200">
              <span className="text-xl">📊</span>
              <div>
                <div className="font-semibold text-gray-900">Consultant Efficiency</div>
                <div className="text-sm text-gray-700">
                  ROI of {consultantROI.toFixed(2)}x suggests consultant costs may be too high relative to revenue generated.
                </div>
              </div>
            </div>
          )}

          {clientCount < 3 && (
            <div className="flex items-start space-x-3 p-3 bg-white rounded-lg border border-blue-200">
              <span className="text-xl">🎯</span>
              <div>
                <div className="font-semibold text-gray-900">Client Concentration Risk</div>
                <div className="text-sm text-gray-700">
                  Only {clientCount} active client{clientCount !== 1 ? 's' : ''}. Consider diversifying revenue sources to reduce dependency.
                </div>
              </div>
            </div>
          )}

          {healthScore >= 75 && (
            <div className="flex items-start space-x-3 p-3 bg-white rounded-lg border border-green-200">
              <span className="text-xl">✅</span>
              <div>
                <div className="font-semibold text-gray-900">Strong Financial Position</div>
                <div className="text-sm text-gray-700">
                  Excellent performance across key metrics. Consider strategic investments in growth and expansion.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Financial Summary Table */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Financial Summary</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Metric</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Value</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Target</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="py-3 px-4 text-gray-900">Total Revenue</td>
                <td className="py-3 px-4 text-right font-semibold text-gray-900">
                  {formatCurrency(financials.businessRevenue)}
                </td>
                <td className="py-3 px-4 text-right text-gray-600">-</td>
                <td className="py-3 px-4 text-center">✓</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-3 px-4 text-gray-900">Total Expenses</td>
                <td className="py-3 px-4 text-right font-semibold text-gray-900">
                  {formatCurrency(financials.totalBusinessExpenses)}
                </td>
                <td className="py-3 px-4 text-right text-gray-600">-</td>
                <td className="py-3 px-4 text-center">✓</td>
              </tr>
              <tr className="border-b border-gray-100 bg-green-50">
                <td className="py-3 px-4 font-semibold text-gray-900">Net Income</td>
                <td className="py-3 px-4 text-right font-bold text-green-700">
                  {formatCurrency(financials.netIncome)}
                </td>
                <td className="py-3 px-4 text-right text-gray-600">Positive</td>
                <td className="py-3 px-4 text-center">{financials.netIncome > 0 ? '✅' : '⚠️'}</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-3 px-4 text-gray-900">Current Cash</td>
                <td className="py-3 px-4 text-right font-semibold text-gray-900">
                  {formatCurrency(financials.currentCashBalance)}
                </td>
                <td className="py-3 px-4 text-right text-gray-600">6mo+ burn</td>
                <td className="py-3 px-4 text-center">
                  {financials.currentCashBalance >= avgMonthlyBurn * 6 ? '✅' : '⚠️'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
