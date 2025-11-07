'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Area, AreaChart } from 'recharts'

interface RevenueTrendProps {
  totalRevenue: number
}

export default function RevenueTrendChart({ totalRevenue }: RevenueTrendProps) {

  // Generate simulated monthly revenue data based on total annual revenue
  // In a real scenario, this would come from actual monthly data
  const generateMonthlyData = (annualRevenue: number) => {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ]

    const baseMonthly = annualRevenue / 12
    return months.map((month, index) => {
      // Add some realistic variation - higher in Q4, lower in Q1
      const seasonalFactor = index < 3 ? 0.8 : index > 8 ? 1.2 : 1.0
      const randomVariation = 0.8 + (Math.random() * 0.4) // ±20% variation
      const monthlyRevenue = baseMonthly * seasonalFactor * randomVariation

      return {
        month,
        revenue: Math.round(monthlyRevenue),
        cumulative: Math.round(monthlyRevenue * (index + 1) / (index + 1) * (index + 1))
      }
    })
  }

  const monthlyData = generateMonthlyData(totalRevenue)

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
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">{label} Revenue</p>
          <p className="text-sm text-green-600">
            Monthly: {formatCurrency(payload[0].value)}
          </p>
          <p className="text-xs text-gray-600">
            Annual Rate: {formatCurrency(payload[0].value * 12)}
          </p>
        </div>
      )
    }
    return null
  }

  // Calculate trend metrics
  const avgMonthlyRevenue = totalRevenue / 12
  const bestMonth = Math.max(...monthlyData.map(d => d.revenue))
  const worstMonth = Math.min(...monthlyData.map(d => d.revenue))
  const growthRate = ((monthlyData[11].revenue - monthlyData[0].revenue) / monthlyData[0].revenue * 100)

  return (
    <div className="w-full h-96">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Revenue Trend</h3>
        <p className="text-gray-600">Monthly revenue performance overview</p>
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={monthlyData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <defs>
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#10B981" stopOpacity={0.05}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="month"
            fontSize={12}
          />
          <YAxis
            tickFormatter={formatCurrency}
            fontSize={12}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#10B981"
            strokeWidth={3}
            fill="url(#revenueGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Revenue insights below chart */}
      <div className="mt-4 grid grid-cols-4 gap-3 text-center">
        <div className="bg-green-50 p-3 rounded-lg">
          <div className="text-lg font-bold text-green-700">{formatCurrency(avgMonthlyRevenue)}</div>
          <div className="text-xs text-green-600">Avg Monthly</div>
        </div>
        <div className="bg-emerald-50 p-3 rounded-lg">
          <div className="text-lg font-bold text-emerald-700">{formatCurrency(bestMonth)}</div>
          <div className="text-xs text-emerald-600">Best Month</div>
        </div>
        <div className="bg-teal-50 p-3 rounded-lg">
          <div className="text-lg font-bold text-teal-700">{formatCurrency(worstMonth)}</div>
          <div className="text-xs text-teal-600">Lowest Month</div>
        </div>
        <div className={`p-3 rounded-lg ${growthRate >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
          <div className={`text-lg font-bold ${growthRate >= 0 ? 'text-green-700' : 'text-red-700'}`}>
            {growthRate >= 0 ? '+' : ''}{growthRate.toFixed(1)}%
          </div>
          <div className={`text-xs ${growthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            YoY Growth
          </div>
        </div>
      </div>
    </div>
  )
}