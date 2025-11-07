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
  Cell,
  PieChart,
  Pie,
  LineChart,
  Line
} from 'recharts'
import { ParsedCSVData } from '@/types'
import { calculateFinancialTotals } from '@/lib/financialCalculations'

interface ExpenseAnalysisChartProps {
  checkingData: ParsedCSVData
  creditData?: ParsedCSVData | null
}

export default function ExpenseAnalysisChart({ checkingData, creditData }: ExpenseAnalysisChartProps) {
  const financials = calculateFinancialTotals(checkingData)

  // Expense breakdown by category (using credit card subledger breakdown)
  const expenseCategories = [
    { name: 'Consultants', value: financials.consultantExpenses, color: '#EF4444' },
    { name: 'Software & Subscriptions', value: financials.creditCardOperatingExpenses, color: '#8B5CF6' },
    { name: 'Travel & Transportation', value: financials.creditCardTravelExpenses, color: '#3B82F6' },
    { name: 'Meals & Entertainment', value: financials.creditCardMealsExpenses, color: '#10B981' },
    { name: 'Utilities & Bills', value: financials.creditCardUtilitiesExpenses, color: '#06B6D4' },
    { name: 'Auto Loan', value: financials.autoLoanExpenses, color: '#F59E0B' },
    { name: 'Bank Fees', value: financials.bankFeesExpenses, color: '#F59E0B' }
  ].filter(cat => cat.value > 0)

  // Consultant-specific breakdown
  const consultantBreakdown = checkingData.categories
    .filter(c => c.category.includes('Consultant'))
    .map(c => ({
      name: c.category.replace('Consultant - ', '').replace(' via Bill.com', '').replace(' via Swan', '').split(' (')[0],
      value: Math.abs(c.amount),
      count: c.count
    }))
    .sort((a, b) => b.value - a.value)

  // Monthly burn rate trend
  const monthlyBurnRate = checkingData.monthlyData.map(month => {
    const monthExpenses = checkingData.transactions.filter(t => {
      const txDate = new Date(t.date)
      const monthDate = new Date(month.month)
      return (
        txDate.getMonth() === monthDate.getMonth() &&
        txDate.getFullYear() === monthDate.getFullYear() &&
        (t.category?.includes('Consultant') ||
          t.category?.includes('Credit Card Autopay') ||
          t.category?.includes('Auto Loan') ||
          t.category?.includes('Bank Fee'))
      )
    })

    const expenses = Math.abs(monthExpenses.reduce((sum, t) => sum + Math.abs(t.amount), 0))

    return {
      month: new Date(month.month).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      expenses: Math.round(expenses),
      average: Math.round(financials.totalBusinessExpenses / checkingData.monthlyData.length)
    }
  })

  // Waterfall data (Revenue to Net Income) - using subledger breakdown
  const waterfallData = [
    { name: 'Revenue', value: financials.businessRevenue, fill: '#10B981' },
    { name: 'Consultants', value: -financials.consultantExpenses, fill: '#EF4444' },
    { name: 'Software', value: -financials.creditCardOperatingExpenses, fill: '#8B5CF6' },
    { name: 'Travel', value: -financials.creditCardTravelExpenses, fill: '#3B82F6' },
    { name: 'Meals', value: -financials.creditCardMealsExpenses, fill: '#10B981' },
    { name: 'Utilities', value: -financials.creditCardUtilitiesExpenses, fill: '#06B6D4' },
    { name: 'Auto Loan', value: -financials.autoLoanExpenses, fill: '#F59E0B' },
    { name: 'Bank Fees', value: -financials.bankFeesExpenses, fill: '#F59E0B' },
    { name: 'Net Income', value: financials.netIncome, fill: financials.netIncome >= 0 ? '#10B981' : '#EF4444' }
  ].filter(item => item.name === 'Revenue' || item.name === 'Net Income' || item.value !== 0)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Math.abs(value))
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">{payload[0].payload.name}</p>
          <p className="text-sm font-medium" style={{ color: payload[0].fill }}>
            {formatCurrency(payload[0].value)}
          </p>
          {payload[0].payload.count && (
            <p className="text-xs text-gray-600">
              {payload[0].payload.count} transactions
            </p>
          )}
        </div>
      )
    }
    return null
  }

  const expenseRatio = (financials.totalBusinessExpenses / financials.businessRevenue) * 100
  const avgMonthlyBurn = financials.totalBusinessExpenses / checkingData.monthlyData.length
  const topConsultant = consultantBreakdown[0]
  const topConsultantPct = (topConsultant?.value / financials.consultantExpenses) * 100

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Expense Analysis</h2>
        <p className="text-gray-600">Detailed breakdown of business expenses and burn rate</p>
      </div>

      {/* Key Expense Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-lg p-6 shadow-lg">
          <div className="text-sm font-medium opacity-90 mb-2">Total Expenses</div>
          <div className="text-3xl font-bold mb-1">{formatCurrency(financials.totalBusinessExpenses)}</div>
          <div className="text-sm opacity-80">All categories</div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-lg p-6 shadow-lg">
          <div className="text-sm font-medium opacity-90 mb-2">Monthly Burn</div>
          <div className="text-3xl font-bold mb-1">{formatCurrency(avgMonthlyBurn)}</div>
          <div className="text-sm opacity-80">Average per month</div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg p-6 shadow-lg">
          <div className="text-sm font-medium opacity-90 mb-2">Expense Ratio</div>
          <div className="text-3xl font-bold mb-1">{expenseRatio.toFixed(1)}%</div>
          <div className="text-sm opacity-80">Of revenue</div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-6 shadow-lg">
          <div className="text-sm font-medium opacity-90 mb-2">Profit Margin</div>
          <div className="text-3xl font-bold mb-1">{(100 - expenseRatio).toFixed(1)}%</div>
          <div className="text-sm opacity-80">Net margin</div>
        </div>
      </div>

      {/* Expense Waterfall Chart */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Revenue to Net Income Waterfall</h3>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={waterfallData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" fontSize={12} />
            <YAxis tickFormatter={formatCurrency} fontSize={12} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" radius={[8, 8, 0, 0]}>
              {waterfallData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Two Column Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Expense Category Breakdown */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Expense by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={expenseCategories}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(props: any) => `${props.name}: ${formatCurrency(props.value)}`}
                outerRadius={100}
                dataKey="value"
              >
                {expenseCategories.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>

          {/* Category List */}
          <div className="mt-6 space-y-2">
            {expenseCategories.map((category, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: category.color }} />
                  <span className="font-medium text-gray-900">{category.name}</span>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900">{formatCurrency(category.value)}</div>
                  <div className="text-xs text-gray-500">
                    {((category.value / financials.totalBusinessExpenses) * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Consultant Deep Dive */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Top Consultant Expenses</h3>
          <div className="space-y-3">
            {consultantBreakdown.slice(0, 8).map((consultant, index) => {
              const percentage = (consultant.value / financials.consultantExpenses) * 100
              return (
                <div key={index} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">{consultant.name}</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {formatCurrency(consultant.value)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-red-500 to-orange-500 h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 w-12 text-right">
                      {percentage.toFixed(0)}%
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">{consultant.count} payments</div>
                </div>
              )
            })}
          </div>

          {consultantBreakdown.length > 8 && (
            <div className="mt-4 text-sm text-gray-500 text-center">
              +{consultantBreakdown.length - 8} more consultants
            </div>
          )}
        </div>
      </div>

      {/* Monthly Burn Rate Trend */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Monthly Burn Rate Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={monthlyBurnRate} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" fontSize={12} />
            <YAxis tickFormatter={formatCurrency} fontSize={12} />
            <Tooltip
              content={({ active, payload, label }: any) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-white p-3 border rounded-lg shadow-lg">
                      <p className="font-semibold text-gray-900">{label}</p>
                      <p className="text-sm text-red-600">Burn: {formatCurrency(payload[0].value)}</p>
                      <p className="text-sm text-gray-600">Avg: {formatCurrency(payload[1].value)}</p>
                    </div>
                  )
                }
                return null
              }}
            />
            <Legend />
            <Line type="monotone" dataKey="expenses" stroke="#EF4444" strokeWidth={3} name="Monthly Expenses" />
            <Line
              type="monotone"
              dataKey="average"
              stroke="#9CA3AF"
              strokeWidth={2}
              strokeDasharray="5 5"
              name="Average"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Expense Insights */}
      <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-lg border border-red-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">💡 Expense Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-start space-x-2">
            <span className="text-red-500 font-bold">•</span>
            <p className="text-gray-700">
              Consultant expenses represent{' '}
              <strong>{((financials.consultantExpenses / financials.totalBusinessExpenses) * 100).toFixed(0)}%</strong>{' '}
              of total expenses ({formatCurrency(financials.consultantExpenses)})
            </p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-orange-500 font-bold">→</span>
            <p className="text-gray-700">
              Average monthly burn rate: <strong>{formatCurrency(avgMonthlyBurn)}</strong> with{' '}
              <strong>{consultantBreakdown.length} active consultants</strong>
            </p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-purple-500 font-bold">★</span>
            <p className="text-gray-700">
              Top consultant <strong>{topConsultant?.name}</strong> accounts for{' '}
              <strong>{topConsultantPct.toFixed(0)}%</strong> of consultant spend
            </p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-blue-500 font-bold">✓</span>
            <p className="text-gray-700">
              Expense ratio: <strong>{expenseRatio.toFixed(1)}%</strong> of revenue, leaving{' '}
              <strong>{(100 - expenseRatio).toFixed(1)}%</strong> profit margin
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
