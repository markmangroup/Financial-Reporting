'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell, ReferenceLine } from 'recharts'

interface ExpenseWaterfallProps {
  revenue: number
  consultantExpenses: number
  creditCardOperatingExpenses: number
  creditCardTravelExpenses: number
  creditCardMealsExpenses: number
  creditCardUtilitiesExpenses: number
  creditCardTotalExpenses: number
  autoLoanExpenses: number
  bankFees: number
  netIncome: number
}

export default function ExpenseWaterfallChart({
  revenue,
  consultantExpenses,
  creditCardOperatingExpenses,
  creditCardTravelExpenses,
  creditCardMealsExpenses,
  creditCardUtilitiesExpenses,
  creditCardTotalExpenses,
  autoLoanExpenses,
  bankFees,
  netIncome
}: ExpenseWaterfallProps) {

  // Build waterfall data for revenue → expenses → net income (using subledger breakdown)
  const waterfallItems = [
    {
      name: 'Revenue',
      value: revenue,
      cumulative: revenue,
      type: 'positive',
      color: '#10B981'
    },
    {
      name: 'Consultants',
      value: -consultantExpenses,
      cumulative: revenue - consultantExpenses,
      type: 'negative',
      color: '#EF4444'
    }
  ]

  // Add credit card subledger categories dynamically (only non-zero)
  let cumulative = revenue - consultantExpenses

  if (creditCardOperatingExpenses > 0) {
    cumulative -= creditCardOperatingExpenses
    waterfallItems.push({
      name: 'Software',
      value: -creditCardOperatingExpenses,
      cumulative,
      type: 'negative',
      color: '#8B5CF6'
    })
  }

  if (creditCardTravelExpenses > 0) {
    cumulative -= creditCardTravelExpenses
    waterfallItems.push({
      name: 'Travel',
      value: -creditCardTravelExpenses,
      cumulative,
      type: 'negative',
      color: '#3B82F6'
    })
  }

  if (creditCardMealsExpenses > 0) {
    cumulative -= creditCardMealsExpenses
    waterfallItems.push({
      name: 'Meals',
      value: -creditCardMealsExpenses,
      cumulative,
      type: 'negative',
      color: '#10B981'
    })
  }

  if (creditCardUtilitiesExpenses > 0) {
    cumulative -= creditCardUtilitiesExpenses
    waterfallItems.push({
      name: 'Utilities',
      value: -creditCardUtilitiesExpenses,
      cumulative,
      type: 'negative',
      color: '#06B6D4'
    })
  }

  // Add remaining expenses
  cumulative -= autoLoanExpenses
  waterfallItems.push({
    name: 'Auto Loan',
    value: -autoLoanExpenses,
    cumulative,
    type: 'negative',
    color: '#F59E0B'
  })

  cumulative -= bankFees
  waterfallItems.push({
    name: 'Bank Fees',
    value: -bankFees,
    cumulative,
    type: 'negative',
    color: '#F59E0B'
  })

  waterfallItems.push({
    name: 'Net Income',
    value: netIncome,
    cumulative: netIncome,
    type: netIncome >= 0 ? 'positive' : 'negative',
    color: netIncome >= 0 ? '#10B981' : '#EF4444'
  })

  const waterfallData = waterfallItems

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
          <p className={`text-sm ${data.type === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
            {data.type === 'negative' ? 'Impact: ' : 'Amount: '}{formatCurrency(data.value)}
          </p>
          <p className="text-xs text-gray-600">
            Running Total: {formatCurrency(data.cumulative)}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="w-full h-96">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Financial Waterfall</h3>
        <p className="text-gray-600">Revenue flow to net income</p>
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={waterfallData}
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
            {waterfallData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Key insights below chart */}
      <div className="mt-4 grid grid-cols-3 gap-4 text-center">
        <div className="bg-green-50 p-3 rounded-lg">
          <div className="text-lg font-bold text-green-700">{formatCurrency(revenue)}</div>
          <div className="text-xs text-green-600">Total Revenue</div>
        </div>
        <div className="bg-red-50 p-3 rounded-lg">
          <div className="text-lg font-bold text-red-700">
            {formatCurrency(consultantExpenses + creditCardTotalExpenses + autoLoanExpenses + bankFees)}
          </div>
          <div className="text-xs text-red-600">Total Expenses</div>
        </div>
        <div className={`p-3 rounded-lg ${netIncome >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
          <div className={`text-lg font-bold ${netIncome >= 0 ? 'text-green-700' : 'text-red-700'}`}>
            {formatCurrency(netIncome)}
          </div>
          <div className={`text-xs ${netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            Net {netIncome >= 0 ? 'Income' : 'Loss'}
          </div>
        </div>
      </div>
    </div>
  )
}