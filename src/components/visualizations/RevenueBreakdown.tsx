'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { ParsedCSVData } from '@/types'

interface RevenueBreakdownProps {
  checkingData: ParsedCSVData
}

const COLORS = {
  primary: '#10b981', // Green
  secondary: '#3b82f6', // Blue
  tertiary: '#8b5cf6', // Purple
  accent: '#f59e0b' // Amber
}

export default function RevenueBreakdown({ checkingData }: RevenueBreakdownProps) {
  // Extract revenue by client
  const laurelRevenue = checkingData.categories
    .filter(c => c.category.includes('Laurel Management'))
    .reduce((sum, c) => sum + c.amount, 0)

  const metropolitanRevenue = checkingData.categories
    .filter(c => c.category.includes('Metropolitan Partners'))
    .reduce((sum, c) => sum + c.amount, 0)

  const data = [
    {
      name: 'Laurel Management',
      value: laurelRevenue,
      percentage: ((laurelRevenue / (laurelRevenue + metropolitanRevenue)) * 100).toFixed(1)
    },
    {
      name: 'Metropolitan Partners',
      value: metropolitanRevenue,
      percentage: ((metropolitanRevenue / (laurelRevenue + metropolitanRevenue)) * 100).toFixed(1)
    }
  ]

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border">
          <p className="font-semibold text-gray-900">{data.name}</p>
          <p className="text-green-600 font-medium">
            ${data.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-gray-600 text-sm">{data.percentage}% of total revenue</p>
        </div>
      )
    }
    return null
  }

  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, value, index }: any) => {
    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)
    const percentage = data[index].percentage

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        className="font-semibold text-sm"
      >
        {`${percentage}%`}
      </text>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Revenue Composition</h3>
        <p className="text-sm text-gray-600">Breakdown by client</p>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={CustomLabel}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={index === 0 ? COLORS.primary : COLORS.secondary}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Summary cards below chart */}
      <div className="grid grid-cols-2 gap-4 mt-4">
        {data.map((client, index) => (
          <div key={client.name} className="text-center p-3 rounded-lg bg-gray-50">
            <div
              className="w-3 h-3 rounded-full mx-auto mb-2"
              style={{ backgroundColor: index === 0 ? COLORS.primary : COLORS.secondary }}
            />
            <div className="text-xs font-medium text-gray-600 mb-1">{client.name}</div>
            <div className="text-lg font-bold text-gray-900">
              ${client.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-gray-500">{client.percentage}%</div>
          </div>
        ))}
      </div>
    </div>
  )
}