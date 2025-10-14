'use client'

import { ParsedCSVData } from '@/types'
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts'

interface FinancialChartsProps {
  checkingData?: ParsedCSVData | null
  creditData?: ParsedCSVData | null
}

// Color palette for consistent chart styling
const CHART_COLORS = {
  primary: '#3B82F6',
  success: '#10B981',
  danger: '#EF4444',
  warning: '#F59E0B',
  info: '#8B5CF6',
  secondary: '#6B7280'
}

const PIE_COLORS = [
  '#3B82F6', '#10B981', '#EF4444', '#F59E0B', '#8B5CF6', 
  '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
]

export default function FinancialCharts({ checkingData, creditData }: FinancialChartsProps) {
  if (!checkingData && !creditData) {
    return (
      <div className="text-center text-gray-500 py-8">
        Upload CSV files to see financial analysis
      </div>
    )
  }

  // Prepare data for charts
  const monthlyData = checkingData?.monthlyData || []
  const categoryData = checkingData?.categories.slice(0, 8) || []
  
  // Format monthly data for line chart
  const monthlyChartData = monthlyData.map(month => ({
    month: new Date(month.month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
    netFlow: month.netFlow,
    credits: month.totalCredits,
    debits: month.totalDebits,
    transactions: month.transactionCount
  }))

  // Format category data for pie chart
  const pieChartData = categoryData.map((category, index) => ({
    name: category.category.length > 20 ? category.category.substring(0, 20) + '...' : category.category,
    value: category.amount,
    color: PIE_COLORS[index % PIE_COLORS.length]
  }))

  // Custom tooltip formatter
  const formatCurrency = (value: number) => `$${value.toLocaleString('en-US', { minimumFractionDigits: 0 })}`
  const formatNumber = (value: number) => value.toLocaleString()

  return (
    <div className="space-y-8">
      {/* Monthly Cash Flow Trend */}
      {monthlyChartData.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Monthly Cash Flow Trend</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis 
                  dataKey="month" 
                  stroke="#6B7280"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#6B7280"
                  fontSize={12}
                  tickFormatter={formatCurrency}
                />
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    formatCurrency(value), 
                    name === 'netFlow' ? 'Net Flow' : 
                    name === 'credits' ? 'Credits' : 
                    name === 'debits' ? 'Debits' : name
                  ]}
                  labelStyle={{ color: '#374151' }}
                  contentStyle={{ 
                    backgroundColor: '#F9FAFB', 
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="netFlow" 
                  stroke={CHART_COLORS.primary} 
                  strokeWidth={3}
                  name="Net Cash Flow"
                />
                <Line 
                  type="monotone" 
                  dataKey="credits" 
                  stroke={CHART_COLORS.success} 
                  strokeWidth={2}
                  name="Total Credits"
                />
                <Line 
                  type="monotone" 
                  dataKey="debits" 
                  stroke={CHART_COLORS.danger} 
                  strokeWidth={2}
                  name="Total Debits"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Category Spending Breakdown */}
      {pieChartData.length > 0 && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Spending by Category</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [formatCurrency(value), 'Amount']}
                    contentStyle={{ 
                      backgroundColor: '#F9FAFB', 
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36}
                    formatter={(value: string) => (
                      <span style={{ fontSize: '12px', color: '#374151' }}>
                        {value}
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category Details Table */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Category Details</h3>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {categoryData.map((category, index) => (
                <div key={category.category} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                    />
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {category.category}
                      </div>
                      <div className="text-xs text-gray-500">
                        {category.count} transactions
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-900">
                      {formatCurrency(category.amount)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {category.percentage.toFixed(1)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Monthly Transaction Volume */}
      {monthlyChartData.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Monthly Transaction Volume</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis 
                  dataKey="month" 
                  stroke="#6B7280"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#6B7280"
                  fontSize={12}
                  tickFormatter={formatNumber}
                />
                <Tooltip 
                  formatter={(value: number) => [formatNumber(value), 'Transactions']}
                  contentStyle={{ 
                    backgroundColor: '#F9FAFB', 
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px'
                  }}
                />
                <Bar 
                  dataKey="transactions" 
                  fill={CHART_COLORS.info}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Account Comparison (if both checking and credit data available) */}
      {checkingData && creditData && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Account Comparison</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-md font-medium text-gray-800 mb-4">Checking Account</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Credits:</span>
                  <span className="font-medium text-green-600">
                    {formatCurrency(checkingData.summary.totalCredits)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Debits:</span>
                  <span className="font-medium text-red-600">
                    {formatCurrency(checkingData.summary.totalDebits)}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-3">
                  <span className="text-gray-900 font-medium">Net Flow:</span>
                  <span className={`font-semibold ${checkingData.summary.netAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(checkingData.summary.netAmount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Transactions:</span>
                  <span className="font-medium">{checkingData.summary.totalTransactions}</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-md font-medium text-gray-800 mb-4">Credit Card</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Spending:</span>
                  <span className="font-medium text-red-600">
                    {formatCurrency(creditData.summary.totalDebits)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Payments:</span>
                  <span className="font-medium text-green-600">
                    {formatCurrency(creditData.summary.totalCredits)}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-3">
                  <span className="text-gray-900 font-medium">Net Amount:</span>
                  <span className={`font-semibold ${creditData.summary.netAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(Math.abs(creditData.summary.netAmount))}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Transactions:</span>
                  <span className="font-medium">{creditData.summary.totalTransactions}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}