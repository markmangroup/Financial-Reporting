'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell, ReferenceLine } from 'recharts'

interface CashFlowBridgeProps {
  openingCash: number
  operatingCashFlow: number
  capitalExpenses: number
  financingCashFlow: number
  closingCash: number
  revenue: number
  expenses: number
}

export default function CashFlowBridgeChart({
  openingCash,
  operatingCashFlow,
  capitalExpenses,
  financingCashFlow,
  closingCash,
  revenue,
  expenses
}: CashFlowBridgeProps) {

  // Build cash flow bridge data
  const bridgeData = [
    {
      name: 'Opening Cash',
      value: openingCash,
      cumulative: openingCash,
      type: 'starting',
      color: '#6366F1'
    },
    {
      name: 'Revenue',
      value: revenue,
      cumulative: openingCash + revenue,
      type: 'positive',
      color: '#10B981'
    },
    {
      name: 'Operating Exp',
      value: -expenses,
      cumulative: openingCash + revenue - expenses,
      type: 'negative',
      color: '#EF4444'
    },
    {
      name: 'Capital Exp',
      value: -capitalExpenses,
      cumulative: openingCash + revenue - expenses - capitalExpenses,
      type: 'negative',
      color: '#F59E0B'
    },
    {
      name: 'Financing',
      value: financingCashFlow,
      cumulative: openingCash + revenue - expenses - capitalExpenses + financingCashFlow,
      type: financingCashFlow >= 0 ? 'positive' : 'negative',
      color: financingCashFlow >= 0 ? '#10B981' : '#EF4444'
    },
    {
      name: 'Closing Cash',
      value: closingCash,
      cumulative: closingCash,
      type: 'ending',
      color: '#6366F1'
    }
  ]

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
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">{label}</p>
          <p className={`text-sm ${
            data.type === 'positive' ? 'text-green-600' :
            data.type === 'negative' ? 'text-red-600' : 'text-indigo-600'
          }`}>
            {data.type === 'negative' ? 'Cash Out: ' :
             data.type === 'positive' ? 'Cash In: ' : 'Balance: '}{formatCurrency(data.value)}
          </p>
          <p className="text-xs text-gray-600">
            Running Cash: {formatCurrency(data.cumulative)}
          </p>
        </div>
      )
    }
    return null
  }

  // Calculate cash burn rate per month
  const monthlyBurnRate = expenses / 12
  const cashRunwayMonths = Math.floor(closingCash / monthlyBurnRate)

  return (
    <div className="w-full h-96">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Cash Flow Bridge</h3>
        <p className="text-gray-600">From opening to closing cash position</p>
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={bridgeData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="name"
            angle={-45}
            textAnchor="end"
            height={80}
            fontSize={12}
          />
          <YAxis
            tickFormatter={formatCurrency}
            fontSize={12}
          />
          <ReferenceLine y={0} stroke="#666" strokeDasharray="2 2" />
          <Bar
            dataKey="value"
            fill="#8884d8"
            radius={[4, 4, 0, 0]}
          >
            {bridgeData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Cash insights below chart */}
      <div className="mt-4 grid grid-cols-4 gap-3 text-center">
        <div className="bg-indigo-50 p-3 rounded-lg">
          <div className="text-lg font-bold text-indigo-700">{formatCurrency(closingCash)}</div>
          <div className="text-xs text-indigo-600">Current Cash</div>
        </div>
        <div className="bg-amber-50 p-3 rounded-lg">
          <div className="text-lg font-bold text-amber-700">{formatCurrency(monthlyBurnRate)}</div>
          <div className="text-xs text-amber-600">Monthly Burn</div>
        </div>
        <div className={`p-3 rounded-lg ${cashRunwayMonths > 6 ? 'bg-green-50' : cashRunwayMonths > 3 ? 'bg-yellow-50' : 'bg-red-50'}`}>
          <div className={`text-lg font-bold ${
            cashRunwayMonths > 6 ? 'text-green-700' :
            cashRunwayMonths > 3 ? 'text-yellow-700' : 'text-red-700'
          }`}>
            {cashRunwayMonths}
          </div>
          <div className={`text-xs ${
            cashRunwayMonths > 6 ? 'text-green-600' :
            cashRunwayMonths > 3 ? 'text-yellow-600' : 'text-red-600'
          }`}>
            Months Runway
          </div>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="text-lg font-bold text-gray-700">
            {((revenue - expenses) / revenue * 100).toFixed(1)}%
          </div>
          <div className="text-xs text-gray-600">Net Margin</div>
        </div>
      </div>
    </div>
  )
}