'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import { ParsedCSVData } from '@/types'
import { calculateFinancialTotals } from '@/lib/financialCalculations'

interface RevenuePerformanceChartProps {
  checkingData: ParsedCSVData
}

export default function RevenuePerformanceChart({ checkingData }: RevenuePerformanceChartProps) {
  const financials = calculateFinancialTotals(checkingData)

  // Extract client-specific revenue from transactions
  const clientRevenue = checkingData.categories
    .filter(c => c.category.includes('Client Payment'))
    .map(c => ({
      name: c.category.replace('Client Payment - ', ''),
      value: c.amount,
      percentage: (c.amount / financials.businessRevenue) * 100
    }))
    .sort((a, b) => b.value - a.value)

  // Generate monthly revenue data from actual transactions
  const monthlyRevenue = checkingData.monthlyData.map(month => {
    // Find client payments for this month
    const monthTransactions = checkingData.transactions.filter(t => {
      const txDate = new Date(t.date)
      const monthDate = new Date(month.month)
      return (
        txDate.getMonth() === monthDate.getMonth() &&
        txDate.getFullYear() === monthDate.getFullYear() &&
        t.category?.includes('Client Payment')
      )
    })

    const revenue = monthTransactions.reduce((sum, t) => sum + t.amount, 0)

    return {
      month: new Date(month.month).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      revenue: Math.round(revenue),
      target: Math.round(financials.businessRevenue / checkingData.monthlyData.length)
    }
  })

  const COLORS = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#EC4899']

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">{payload[0].name}</p>
          <p className="text-sm text-green-600">
            {formatCurrency(payload[0].value)}
          </p>
          {payload[0].payload.percentage && (
            <p className="text-xs text-gray-600">
              {payload[0].payload.percentage.toFixed(1)}% of total
            </p>
          )}
        </div>
      )
    }
    return null
  }

  const CustomBarTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">{label}</p>
          <p className="text-sm text-green-600">
            Revenue: {formatCurrency(payload[0].value)}
          </p>
          <p className="text-sm text-gray-600">
            Target: {formatCurrency(payload[1].value)}
          </p>
          <p className="text-xs text-gray-500">
            {payload[0].value >= payload[1].value ? '✅' : '⚠️'}
            {' '}
            {((payload[0].value / payload[1].value - 1) * 100).toFixed(1)}% vs target
          </p>
        </div>
      )
    }
    return null
  }

  // Calculate key metrics
  const avgMonthlyRevenue = financials.businessRevenue / checkingData.monthlyData.length
  const bestMonth = Math.max(...monthlyRevenue.map(d => d.revenue))
  const totalRevenue = financials.businessRevenue

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Revenue Performance</h2>
        <p className="text-gray-600">Comprehensive revenue analysis and client breakdown</p>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg p-6 shadow-lg">
          <div className="text-sm font-medium opacity-90 mb-2">Total Revenue</div>
          <div className="text-4xl font-bold mb-1">{formatCurrency(totalRevenue)}</div>
          <div className="text-sm opacity-80">All client payments</div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-6 shadow-lg">
          <div className="text-sm font-medium opacity-90 mb-2">Avg Monthly</div>
          <div className="text-4xl font-bold mb-1">{formatCurrency(avgMonthlyRevenue)}</div>
          <div className="text-sm opacity-80">Per month average</div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg p-6 shadow-lg">
          <div className="text-sm font-medium opacity-90 mb-2">Best Month</div>
          <div className="text-4xl font-bold mb-1">{formatCurrency(bestMonth)}</div>
          <div className="text-sm opacity-80">Peak performance</div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Client Revenue Breakdown - Pie Chart */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Revenue by Client</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={clientRevenue}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(props: any) => `${props.name}: ${props.percentage?.toFixed(0) || 0}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {clientRevenue.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>

          {/* Client List */}
          <div className="mt-6 space-y-2">
            {clientRevenue.map((client, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="font-medium text-gray-900">{client.name}</span>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900">{formatCurrency(client.value)}</div>
                  <div className="text-xs text-gray-500">{client.percentage.toFixed(1)}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Revenue vs Target - Bar Chart */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Monthly Performance vs Target</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyRevenue} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" fontSize={12} />
              <YAxis tickFormatter={formatCurrency} fontSize={12} />
              <Tooltip content={<CustomBarTooltip />} />
              <Legend />
              <Bar dataKey="revenue" fill="#10B981" name="Actual Revenue" />
              <Bar dataKey="target" fill="#E5E7EB" name="Target" />
            </BarChart>
          </ResponsiveContainer>

          {/* Performance Summary */}
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-sm text-green-600 mb-1">Months Above Target</div>
              <div className="text-2xl font-bold text-green-700">
                {monthlyRevenue.filter(m => m.revenue >= m.target).length}
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Months Below Target</div>
              <div className="text-2xl font-bold text-gray-700">
                {monthlyRevenue.filter(m => m.revenue < m.target).length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Insights */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg border border-indigo-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">📊 Revenue Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-start space-x-2">
            <span className="text-green-500 font-bold">✓</span>
            <p className="text-gray-700">
              <strong>{clientRevenue[0]?.name}</strong> is the top revenue source at{' '}
              <strong>{formatCurrency(clientRevenue[0]?.value)}</strong>{' '}
              ({clientRevenue[0]?.percentage.toFixed(0)}% of total)
            </p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-blue-500 font-bold">•</span>
            <p className="text-gray-700">
              Average monthly revenue: <strong>{formatCurrency(avgMonthlyRevenue)}</strong> with{' '}
              <strong>{clientRevenue.length} active clients</strong>
            </p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-purple-500 font-bold">★</span>
            <p className="text-gray-700">
              Revenue concentration: Top client represents{' '}
              <strong>{clientRevenue[0]?.percentage.toFixed(0)}%</strong> of total revenue
              {clientRevenue[0]?.percentage > 50 && ' - consider diversification'}
            </p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-orange-500 font-bold">→</span>
            <p className="text-gray-700">
              Performance consistency:{' '}
              <strong>
                {monthlyRevenue.filter(m => m.revenue >= m.target).length}/
                {monthlyRevenue.length}
              </strong>{' '}
              months met or exceeded target
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
