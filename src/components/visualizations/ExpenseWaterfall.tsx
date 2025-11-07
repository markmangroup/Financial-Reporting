'use client'

import { ComposedChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell } from 'recharts'
import { FinancialTotals } from '@/lib/financialCalculations'

interface ExpenseWaterfallProps {
  financials: FinancialTotals
}

const COLORS = {
  positive: '#10b981', // Green - Revenue
  negative: '#ef4444', // Red - Expenses
  neutral: '#6b7280',  // Gray - Intermediate values
  net: '#8b5cf6'       // Purple - Net Income
}

export default function ExpenseWaterfall({ financials }: ExpenseWaterfallProps) {
  // Create waterfall data (using credit card subledger breakdown)
  let runningTotal = 0

  // Build data array with subledger categories
  const dataItems = [
    {
      name: 'Revenue',
      value: financials.businessRevenue,
      cumulative: financials.businessRevenue,
      type: 'positive',
      displayValue: financials.businessRevenue
    },
    {
      name: 'Consultant\nExpenses',
      value: -financials.consultantExpenses,
      cumulative: financials.businessRevenue - financials.consultantExpenses,
      type: 'negative',
      displayValue: -financials.consultantExpenses
    }
  ]

  // Add credit card subledger categories (only if non-zero)
  let cumulativeAfterConsultants = financials.businessRevenue - financials.consultantExpenses

  if (financials.creditCardOperatingExpenses > 0) {
    cumulativeAfterConsultants -= financials.creditCardOperatingExpenses
    dataItems.push({
      name: 'Software &\nSubscriptions',
      value: -financials.creditCardOperatingExpenses,
      cumulative: cumulativeAfterConsultants,
      type: 'negative',
      displayValue: -financials.creditCardOperatingExpenses
    })
  }

  if (financials.creditCardTravelExpenses > 0) {
    cumulativeAfterConsultants -= financials.creditCardTravelExpenses
    dataItems.push({
      name: 'Travel',
      value: -financials.creditCardTravelExpenses,
      cumulative: cumulativeAfterConsultants,
      type: 'negative',
      displayValue: -financials.creditCardTravelExpenses
    })
  }

  if (financials.creditCardMealsExpenses > 0) {
    cumulativeAfterConsultants -= financials.creditCardMealsExpenses
    dataItems.push({
      name: 'Meals',
      value: -financials.creditCardMealsExpenses,
      cumulative: cumulativeAfterConsultants,
      type: 'negative',
      displayValue: -financials.creditCardMealsExpenses
    })
  }

  if (financials.creditCardUtilitiesExpenses > 0) {
    cumulativeAfterConsultants -= financials.creditCardUtilitiesExpenses
    dataItems.push({
      name: 'Utilities',
      value: -financials.creditCardUtilitiesExpenses,
      cumulative: cumulativeAfterConsultants,
      type: 'negative',
      displayValue: -financials.creditCardUtilitiesExpenses
    })
  }

  // Add other expenses
  cumulativeAfterConsultants -= financials.autoLoanExpenses
  dataItems.push({
    name: 'Auto Loan',
    value: -financials.autoLoanExpenses,
    cumulative: cumulativeAfterConsultants,
    type: 'negative',
    displayValue: -financials.autoLoanExpenses
  })

  cumulativeAfterConsultants -= financials.bankFeesExpenses
  dataItems.push({
    name: 'Bank\nFees',
    value: -financials.bankFeesExpenses,
    cumulative: cumulativeAfterConsultants,
    type: 'negative',
    displayValue: -financials.bankFeesExpenses
  })

  // Net income
  dataItems.push({
    name: 'Net Income',
    value: financials.netIncome,
    cumulative: financials.netIncome,
    type: financials.netIncome >= 0 ? 'positive' : 'negative',
    displayValue: financials.netIncome
  })

  const data = dataItems

  // Calculate base positions for stacked effect
  const dataWithBases = data.map((item, index) => {
    if (index === 0 || index === data.length - 1) {
      // First (Revenue) and last (Net Income) bars start from zero
      return {
        ...item,
        base: 0,
        actualValue: Math.abs(item.value)
      }
    } else {
      // Expense bars stack down from previous cumulative
      const previousCumulative = data[index - 1].cumulative
      return {
        ...item,
        base: item.cumulative,
        actualValue: Math.abs(item.value)
      }
    }
  })

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      const isPositive = data.type === 'positive'
      const value = Math.abs(data.displayValue)

      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border">
          <p className="font-semibold text-gray-900">{label.replace('\n', ' ')}</p>
          <p className={`font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? '+' : '-'}${value.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
          {data.name !== 'Revenue' && data.name !== 'Net Income' && (
            <p className="text-gray-600 text-sm">
              Running total: ${data.cumulative.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          )}
        </div>
      )
    }
    return null
  }

  const getBarColor = (type: string) => {
    switch (type) {
      case 'positive': return COLORS.positive
      case 'negative': return COLORS.negative
      case 'net': return COLORS.net
      default: return COLORS.neutral
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Income Waterfall</h3>
        <p className="text-sm text-gray-600">Revenue flow to net income</p>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={dataWithBases}
            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fill: '#6b7280' }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#6b7280' }}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
            />
            <Bar dataKey="actualValue" stackId="waterfall">
              {dataWithBases.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.type)} />
              ))}
            </Bar>
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Key metrics summary */}
      <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-gray-200">
        <div className="text-center">
          <div className="text-xs font-medium text-gray-500 mb-1">TOTAL REVENUE</div>
          <div className="text-lg font-bold text-green-600">
            ${financials.businessRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs font-medium text-gray-500 mb-1">TOTAL EXPENSES</div>
          <div className="text-lg font-bold text-red-600">
            ${financials.totalBusinessExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs font-medium text-gray-500 mb-1">NET INCOME</div>
          <div className={`text-lg font-bold ${financials.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ${financials.netIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
        </div>
      </div>
    </div>
  )
}