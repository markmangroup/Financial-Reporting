'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Legend,
  LineChart,
  Line,
  ComposedChart,
  Cell
} from 'recharts'
import { ParsedCSVData } from '@/types'

interface ComparativeAnalysisProps {
  checkingData: ParsedCSVData
  creditData?: ParsedCSVData | null
}

export default function ComparativeAnalysis({ checkingData, creditData }: ComparativeAnalysisProps) {
  // Calculate monthly metrics for MoM comparison
  const monthlyMetrics = checkingData.monthlyData.map((month, index, array) => {
    const monthTransactions = checkingData.transactions.filter(t => {
      const txDate = new Date(t.date)
      const monthDate = new Date(month.month)
      return (
        txDate.getMonth() === monthDate.getMonth() &&
        txDate.getFullYear() === monthDate.getFullYear()
      )
    })

    // Calculate revenue (client payments)
    const revenue = monthTransactions
      .filter(t => t.category?.includes('Client Payment'))
      .reduce((sum, t) => sum + t.amount, 0)

    // Calculate expenses
    const expenses = Math.abs(
      monthTransactions
        .filter(
          t =>
            t.category?.includes('Consultant') ||
            t.category?.includes('Credit Card Autopay') ||
            t.category?.includes('Auto Loan') ||
            t.category?.includes('Bank Fee')
        )
        .reduce((sum, t) => sum + Math.abs(t.amount), 0)
    )

    const netIncome = revenue - expenses
    const margin = revenue > 0 ? (netIncome / revenue) * 100 : 0

    // Calculate MoM growth
    const prevRevenue = index > 0
      ? array[index - 1].totalCredits
      : revenue
    const revenueGrowth = prevRevenue > 0 ? ((revenue - prevRevenue) / prevRevenue) * 100 : 0

    return {
      month: new Date(month.month).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      revenue: Math.round(revenue),
      expenses: Math.round(expenses),
      netIncome: Math.round(netIncome),
      margin: parseFloat(margin.toFixed(1)),
      revenueGrowth: parseFloat(revenueGrowth.toFixed(1)),
      expenseGrowth: 0 // Would need previous period
    }
  })

  // Generate simulated budget targets (in real app, this would come from user input)
  const avgRevenue = monthlyMetrics.reduce((sum, m) => sum + m.revenue, 0) / monthlyMetrics.length
  const avgExpenses = monthlyMetrics.reduce((sum, m) => sum + m.expenses, 0) / monthlyMetrics.length

  const budgetVsActual = monthlyMetrics.map(month => ({
    month: month.month,
    actualRevenue: month.revenue,
    budgetRevenue: Math.round(avgRevenue * 1.1), // Target 10% above average
    actualExpenses: month.expenses,
    budgetExpenses: Math.round(avgExpenses * 0.9), // Target 10% below average
    variance: month.revenue - Math.round(avgRevenue * 1.1)
  }))

  // Category-wise performance ranking
  const categoryPerformance = checkingData.categories
    .filter(c => c.category.includes('Consultant'))
    .map(c => ({
      category: c.category.replace('Consultant - ', '').split(' (')[0],
      actual: Math.abs(c.amount),
      budget: Math.abs(c.amount) * 0.95, // Assume 5% under budget is good
      variance: Math.abs(c.amount) * 0.05
    }))
    .sort((a, b) => b.actual - a.actual)
    .slice(0, 8)

  // Quarter over Quarter comparison (group by quarters)
  const quarterlyData = monthlyMetrics.reduce((acc, month, index) => {
    const quarter = Math.floor(index / 3)
    if (!acc[quarter]) {
      acc[quarter] = {
        quarter: `Q${quarter + 1}`,
        revenue: 0,
        expenses: 0,
        netIncome: 0,
        months: 0
      }
    }
    acc[quarter].revenue += month.revenue
    acc[quarter].expenses += month.expenses
    acc[quarter].netIncome += month.netIncome
    acc[quarter].months += 1
    return acc
  }, [] as any[])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Math.abs(value))
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  // Calculate aggregate metrics
  const totalRevenue = monthlyMetrics.reduce((sum, m) => sum + m.revenue, 0)
  const totalExpenses = monthlyMetrics.reduce((sum, m) => sum + m.expenses, 0)
  const avgMargin = monthlyMetrics.reduce((sum, m) => sum + m.margin, 0) / monthlyMetrics.length
  const avgGrowth = monthlyMetrics.slice(1).reduce((sum, m) => sum + m.revenueGrowth, 0) / (monthlyMetrics.length - 1)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Comparative Analysis</h2>
        <p className="text-gray-600">Month-over-month trends and budget performance</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-6 shadow-lg">
          <div className="text-sm font-medium opacity-90 mb-2">Avg MoM Growth</div>
          <div className="text-3xl font-bold mb-1">{avgGrowth >= 0 ? '+' : ''}{avgGrowth.toFixed(1)}%</div>
          <div className="text-sm opacity-80">Revenue growth</div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg p-6 shadow-lg">
          <div className="text-sm font-medium opacity-90 mb-2">Avg Margin</div>
          <div className="text-3xl font-bold mb-1">{avgMargin.toFixed(1)}%</div>
          <div className="text-sm opacity-80">Net margin</div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg p-6 shadow-lg">
          <div className="text-sm font-medium opacity-90 mb-2">Budget Variance</div>
          <div className="text-3xl font-bold mb-1">
            {((totalRevenue / (avgRevenue * monthlyMetrics.length) - 1) * 100).toFixed(1)}%
          </div>
          <div className="text-sm opacity-80">vs Plan</div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-lg p-6 shadow-lg">
          <div className="text-sm font-medium opacity-90 mb-2">Best Month</div>
          <div className="text-3xl font-bold mb-1">
            {formatCurrency(Math.max(...monthlyMetrics.map(m => m.revenue)))}
          </div>
          <div className="text-sm opacity-80">Peak revenue</div>
        </div>
      </div>

      {/* Budget vs Actual - Revenue & Expenses */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Budget vs Actual Performance</h3>
        <ResponsiveContainer width="100%" height={350}>
          <ComposedChart data={budgetVsActual} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" fontSize={12} />
            <YAxis tickFormatter={formatCurrency} fontSize={12} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="budgetRevenue" fill="#93C5FD" name="Budget Revenue" radius={[8, 8, 0, 0]} />
            <Bar dataKey="actualRevenue" fill="#3B82F6" name="Actual Revenue" radius={[8, 8, 0, 0]} />
            <Line type="monotone" dataKey="budgetExpenses" stroke="#FCA5A5" strokeWidth={2} name="Budget Expenses" strokeDasharray="5 5" />
            <Line type="monotone" dataKey="actualExpenses" stroke="#EF4444" strokeWidth={3} name="Actual Expenses" />
          </ComposedChart>
        </ResponsiveContainer>

        {/* Variance Summary */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <div className="text-sm text-blue-600 mb-1">Revenue Variance</div>
            <div className={`text-xl font-bold ${totalRevenue >= avgRevenue * monthlyMetrics.length ? 'text-green-600' : 'text-red-600'}`}>
              {((totalRevenue / (avgRevenue * monthlyMetrics.length) - 1) * 100).toFixed(1)}%
            </div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg text-center">
            <div className="text-sm text-red-600 mb-1">Expense Variance</div>
            <div className={`text-xl font-bold ${totalExpenses <= avgExpenses * monthlyMetrics.length ? 'text-green-600' : 'text-red-600'}`}>
              {((totalExpenses / (avgExpenses * monthlyMetrics.length) - 1) * 100).toFixed(1)}%
            </div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg text-center">
            <div className="text-sm text-purple-600 mb-1">Months On Target</div>
            <div className="text-xl font-bold text-purple-700">
              {budgetVsActual.filter(m => m.actualRevenue >= m.budgetRevenue).length}/{budgetVsActual.length}
            </div>
          </div>
        </div>
      </div>

      {/* Month-over-Month Growth Trend */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Month-over-Month Growth Rate</h3>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={monthlyMetrics.slice(1)} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" fontSize={12} />
            <YAxis
              yAxisId="left"
              tickFormatter={(value) => `${value}%`}
              fontSize={12}
              label={{ value: 'Growth %', angle: -90, position: 'insideLeft' }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tickFormatter={(value) => `${value}%`}
              fontSize={12}
              label={{ value: 'Margin %', angle: 90, position: 'insideRight' }}
            />
            <Tooltip
              content={({ active, payload, label }: any) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-white p-3 border rounded-lg shadow-lg">
                      <p className="font-semibold text-gray-900 mb-2">{label}</p>
                      <p className="text-sm text-blue-600">
                        Revenue Growth: {payload[0]?.value >= 0 ? '+' : ''}{payload[0]?.value}%
                      </p>
                      <p className="text-sm text-green-600">Net Margin: {payload[1]?.value}%</p>
                    </div>
                  )
                }
                return null
              }}
            />
            <Legend />
            <Bar yAxisId="left" dataKey="revenueGrowth" name="MoM Growth %" radius={[8, 8, 0, 0]}>
              {monthlyMetrics.slice(1).map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.revenueGrowth >= 0 ? '#10B981' : '#EF4444'} />
              ))}
            </Bar>
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="margin"
              stroke="#8B5CF6"
              strokeWidth={3}
              name="Net Margin %"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Quarterly Comparison */}
      {quarterlyData.length > 1 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Quarterly Performance Comparison</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={quarterlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="quarter" fontSize={12} />
              <YAxis tickFormatter={formatCurrency} fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="revenue" fill="#10B981" name="Revenue" radius={[8, 8, 0, 0]} />
              <Bar dataKey="expenses" fill="#EF4444" name="Expenses" radius={[8, 8, 0, 0]} />
              <Bar dataKey="netIncome" fill="#3B82F6" name="Net Income" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>

          {/* QoQ Growth */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            {quarterlyData.map((quarter, index) => {
              const prevQuarter = quarterlyData[index - 1]
              const qoqGrowth = prevQuarter
                ? ((quarter.revenue - prevQuarter.revenue) / prevQuarter.revenue) * 100
                : 0

              return (
                <div key={index} className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">{quarter.quarter}</div>
                  <div className="text-lg font-bold text-gray-900">{formatCurrency(quarter.revenue)}</div>
                  {index > 0 && (
                    <div className={`text-sm font-semibold ${qoqGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {qoqGrowth >= 0 ? '↑' : '↓'} {Math.abs(qoqGrowth).toFixed(1)}% QoQ
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Category Performance Ranking */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Top Expense Categories - Actual vs Budget</h3>
        <div className="space-y-4">
          {categoryPerformance.map((category, index) => {
            const percentOfBudget = (category.actual / category.budget) * 100
            const isOverBudget = percentOfBudget > 100

            return (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-semibold text-gray-700">#{index + 1}</span>
                    <span className="text-sm font-medium text-gray-900">{category.category}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-900">{formatCurrency(category.actual)}</div>
                    <div className={`text-xs ${isOverBudget ? 'text-red-600' : 'text-green-600'}`}>
                      {isOverBudget ? 'Over' : 'Under'} budget: {formatCurrency(Math.abs(category.actual - category.budget))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div className="flex h-full">
                      <div
                        className={`h-full ${isOverBudget ? 'bg-red-500' : 'bg-green-500'}`}
                        style={{ width: `${Math.min(percentOfBudget, 100)}%` }}
                      />
                      {isOverBudget && (
                        <div className="h-full bg-red-700" style={{ width: `${percentOfBudget - 100}%` }} />
                      )}
                    </div>
                  </div>
                  <span className={`text-xs font-semibold ${isOverBudget ? 'text-red-600' : 'text-green-600'} w-16 text-right`}>
                    {percentOfBudget.toFixed(0)}%
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Insights */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">📊 Comparative Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-start space-x-2">
            <span className="text-blue-500 font-bold">📈</span>
            <p className="text-gray-700">
              Average MoM growth: <strong>{avgGrowth >= 0 ? '+' : ''}{avgGrowth.toFixed(1)}%</strong> showing{' '}
              {avgGrowth >= 5 ? 'strong' : avgGrowth >= 0 ? 'positive' : 'declining'} momentum
            </p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-green-500 font-bold">✓</span>
            <p className="text-gray-700">
              Months meeting budget target:{' '}
              <strong>{budgetVsActual.filter(m => m.actualRevenue >= m.budgetRevenue).length}/{budgetVsActual.length}</strong>
              {' '}({((budgetVsActual.filter(m => m.actualRevenue >= m.budgetRevenue).length / budgetVsActual.length) * 100).toFixed(0)}%)
            </p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-purple-500 font-bold">★</span>
            <p className="text-gray-700">
              Average net margin: <strong>{avgMargin.toFixed(1)}%</strong> across all periods
            </p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-orange-500 font-bold">→</span>
            <p className="text-gray-700">
              Best performing month: <strong>{formatCurrency(Math.max(...monthlyMetrics.map(m => m.revenue)))}</strong> in revenue
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
