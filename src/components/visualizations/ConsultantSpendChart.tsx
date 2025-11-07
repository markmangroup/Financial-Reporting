'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell, Tooltip } from 'recharts'

interface ConsultantSpendProps {
  totalConsultantSpend: number
  checkingData?: any // For detailed transaction breakdown
}

export default function ConsultantSpendChart({ totalConsultantSpend, checkingData }: ConsultantSpendProps) {

  // Extract consultant expenses from checking data
  const consultantBreakdown = checkingData?.categories
    ?.filter((cat: any) => cat.category.includes('Consultant'))
    ?.map((cat: any) => ({
      name: cat.category.replace('Consultant Payment - ', '').replace('Consultant - ', ''),
      amount: Math.abs(cat.amount),
      percentage: (Math.abs(cat.amount) / totalConsultantSpend * 100).toFixed(1),
      color: getConsultantColor(cat.category)
    }))
    ?.sort((a: any, b: any) => b.amount - a.amount) || []

  // Fallback if no detailed data available
  if (consultantBreakdown.length === 0) {
    consultantBreakdown.push({
      name: 'Consultants',
      amount: totalConsultantSpend,
      percentage: '100.0',
      color: '#6366F1'
    })
  }

  function getConsultantColor(category: string): string {
    const colors = [
      '#6366F1', '#8B5CF6', '#EC4899', '#EF4444',
      '#F59E0B', '#10B981', '#06B6D4', '#84CC16'
    ]
    // Simple hash function for consistent colors
    const hash = category.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0)
      return a & a
    }, 0)
    return colors[Math.abs(hash) % colors.length]
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">{label}</p>
          <p className="text-sm text-indigo-600">
            Amount: {formatCurrency(data.amount)}
          </p>
          <p className="text-xs text-gray-600">
            {data.percentage}% of total consultant spend
          </p>
        </div>
      )
    }
    return null
  }

  // Calculate insights
  const topConsultant = consultantBreakdown[0]
  const consultantCount = consultantBreakdown.length
  const avgSpendPerConsultant = totalConsultantSpend / consultantCount

  return (
    <div className="w-full h-96">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Consultant Spend Analysis</h3>
        <p className="text-gray-600">Breakdown by individual consultants</p>
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={consultantBreakdown}
          margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="name"
            angle={-45}
            textAnchor="end"
            height={80}
            fontSize={11}
            interval={0}
          />
          <YAxis
            tickFormatter={formatCurrency}
            fontSize={12}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar
            dataKey="amount"
            fill="#6366F1"
            radius={[4, 4, 0, 0]}
          >
            {consultantBreakdown.map((entry: { name: string; amount: number; color: string }, index: number) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Consultant insights below chart */}
      <div className="mt-4 grid grid-cols-4 gap-3 text-center">
        <div className="bg-indigo-50 p-3 rounded-lg">
          <div className="text-lg font-bold text-indigo-700">{formatCurrency(totalConsultantSpend)}</div>
          <div className="text-xs text-indigo-600">Total Spend</div>
        </div>
        <div className="bg-purple-50 p-3 rounded-lg">
          <div className="text-lg font-bold text-purple-700">{consultantCount}</div>
          <div className="text-xs text-purple-600">Consultants</div>
        </div>
        <div className="bg-pink-50 p-3 rounded-lg">
          <div className="text-lg font-bold text-pink-700">{formatCurrency(avgSpendPerConsultant)}</div>
          <div className="text-xs text-pink-600">Avg per Consultant</div>
        </div>
        <div className="bg-violet-50 p-3 rounded-lg">
          <div className="text-lg font-bold text-violet-700">
            {topConsultant ? topConsultant.percentage : '0'}%
          </div>
          <div className="text-xs text-violet-600">
            Top Consultant Share
          </div>
        </div>
      </div>

      {/* Top consultant callout */}
      {topConsultant && consultantCount > 1 && (
        <div className="mt-4 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-indigo-600 font-medium">🏆 Largest Consultant Expense</span>
          </div>
          <div className="text-sm text-indigo-800">
            <strong>{topConsultant.name}</strong> accounts for {formatCurrency(topConsultant.amount)}
            ({topConsultant.percentage}%) of total consultant spending.
          </div>
        </div>
      )}
    </div>
  )
}