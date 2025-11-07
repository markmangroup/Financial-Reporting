'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Area,
  AreaChart,
  BarChart,
  Bar,
  Cell,
  Legend
} from 'recharts'
import { ParsedCSVData } from '@/types'
import { calculateFinancialTotals } from '@/lib/financialCalculations'

interface CashFlowInsightsProps {
  checkingData: ParsedCSVData
}

export default function CashFlowInsights({ checkingData }: CashFlowInsightsProps) {
  const financials = calculateFinancialTotals(checkingData)

  // Sort transactions by date
  const sortedTransactions = [...checkingData.transactions].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  )

  // Daily cash balance
  const dailyCashBalance = sortedTransactions.map(tx => ({
    date: new Date(tx.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    balance: tx.balance || 0,
    fullDate: tx.date
  }))

  // Sample every Nth transaction for cleaner display
  const samplingRate = Math.ceil(dailyCashBalance.length / 30)
  const sampledDailyBalance = dailyCashBalance.filter((_, index) => index % samplingRate === 0)
  // Always include the last transaction
  if (sampledDailyBalance[sampledDailyBalance.length - 1]?.fullDate !== dailyCashBalance[dailyCashBalance.length - 1]?.fullDate) {
    sampledDailyBalance.push(dailyCashBalance[dailyCashBalance.length - 1])
  }

  // Monthly cash flow (inflows vs outflows)
  const monthlyCashFlow = checkingData.monthlyData.map(month => {
    const monthTransactions = checkingData.transactions.filter(t => {
      const txDate = new Date(t.date)
      const monthDate = new Date(month.month)
      return (
        txDate.getMonth() === monthDate.getMonth() &&
        txDate.getFullYear() === monthDate.getFullYear()
      )
    })

    const inflows = monthTransactions
      .filter(t => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0)

    const outflows = Math.abs(
      monthTransactions
        .filter(t => t.amount < 0)
        .reduce((sum, t) => sum + t.amount, 0)
    )

    const netFlow = inflows - outflows

    return {
      month: new Date(month.month).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      inflows: Math.round(inflows),
      outflows: Math.round(outflows),
      netFlow: Math.round(netFlow)
    }
  })

  // Cash Flow Bridge (Opening Balance → Closing Balance)
  const totalInflows = financials.businessRevenue + financials.ownerCapitalContributions + financials.otherCredits
  const totalOutflows = financials.totalBusinessExpenses
  const openingBalance = financials.currentCashBalance - (totalInflows - totalOutflows)

  const cashFlowBridge = [
    { name: 'Opening Cash', value: openingBalance, fill: '#6B7280' },
    { name: 'Revenue', value: financials.businessRevenue, fill: '#10B981' },
    { name: 'Owner Capital', value: financials.ownerCapitalContributions, fill: '#3B82F6' },
    { name: 'Other Credits', value: financials.otherCredits, fill: '#8B5CF6' },
    { name: 'Expenses', value: -financials.totalBusinessExpenses, fill: '#EF4444' },
    { name: 'Closing Cash', value: financials.currentCashBalance, fill: '#059669' }
  ]

  // Cash runway projection
  const avgMonthlyBurn = financials.totalBusinessExpenses / checkingData.monthlyData.length
  const avgMonthlyRevenue = financials.businessRevenue / checkingData.monthlyData.length
  const avgMonthlyNetFlow = avgMonthlyRevenue - avgMonthlyBurn

  const runwayMonths = avgMonthlyNetFlow > 0
    ? Infinity // Growing, not burning
    : Math.abs(financials.currentCashBalance / avgMonthlyNetFlow)

  // Project next 12 months
  const cashRunwayProjection = Array.from({ length: 13 }, (_, i) => {
    const projectedCash = financials.currentCashBalance + (avgMonthlyNetFlow * i)
    const date = new Date()
    date.setMonth(date.getMonth() + i)

    return {
      month: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      projectedCash: Math.max(0, Math.round(projectedCash)),
      criticalLevel: Math.round(avgMonthlyBurn * 3) // 3 months of expenses
    }
  })

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
          <p className="font-semibold text-gray-900">{label}</p>
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

  const avgCashBalance = sampledDailyBalance.reduce((sum, d) => sum + d.balance, 0) / sampledDailyBalance.length
  const maxCashBalance = Math.max(...sampledDailyBalance.map(d => d.balance))
  const minCashBalance = Math.min(...sampledDailyBalance.map(d => d.balance))

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Cash Flow Insights</h2>
        <p className="text-gray-600">Comprehensive cash position analysis and runway projection</p>
      </div>

      {/* Key Cash Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg p-6 shadow-lg">
          <div className="text-sm font-medium opacity-90 mb-2">Current Cash</div>
          <div className="text-3xl font-bold mb-1">{formatCurrency(financials.currentCashBalance)}</div>
          <div className="text-sm opacity-80">Available now</div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-6 shadow-lg">
          <div className="text-sm font-medium opacity-90 mb-2">Avg Balance</div>
          <div className="text-3xl font-bold mb-1">{formatCurrency(avgCashBalance)}</div>
          <div className="text-sm opacity-80">Period average</div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg p-6 shadow-lg">
          <div className="text-sm font-medium opacity-90 mb-2">Monthly Burn</div>
          <div className="text-3xl font-bold mb-1">{formatCurrency(avgMonthlyBurn)}</div>
          <div className="text-sm opacity-80">Net expenses</div>
        </div>

        <div className={`bg-gradient-to-br ${runwayMonths > 12 ? 'from-green-500 to-green-600' : runwayMonths > 6 ? 'from-yellow-500 to-yellow-600' : 'from-red-500 to-red-600'} text-white rounded-lg p-6 shadow-lg`}>
          <div className="text-sm font-medium opacity-90 mb-2">Cash Runway</div>
          <div className="text-3xl font-bold mb-1">
            {runwayMonths === Infinity ? '∞' : Math.floor(runwayMonths)}
          </div>
          <div className="text-sm opacity-80">{runwayMonths === Infinity ? 'Growing' : 'Months left'}</div>
        </div>
      </div>

      {/* Cash Flow Bridge */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Cash Flow Bridge</h3>
        <p className="text-sm text-gray-600 mb-4">How cash moved from opening to closing balance</p>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={cashFlowBridge} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" fontSize={12} />
            <YAxis tickFormatter={formatCurrency} fontSize={12} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" radius={[8, 8, 0, 0]}>
              {cashFlowBridge.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* Bridge Summary */}
        <div className="mt-6 grid grid-cols-3 gap-4 text-center">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Opening Balance</div>
            <div className="text-xl font-bold text-gray-700">{formatCurrency(openingBalance)}</div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-sm text-blue-600 mb-1">Net Change</div>
            <div className={`text-xl font-bold ${(financials.currentCashBalance - openingBalance) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {(financials.currentCashBalance - openingBalance) >= 0 ? '+' : ''}
              {formatCurrency(financials.currentCashBalance - openingBalance)}
            </div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-sm text-green-600 mb-1">Closing Balance</div>
            <div className="text-xl font-bold text-green-700">{formatCurrency(financials.currentCashBalance)}</div>
          </div>
        </div>
      </div>

      {/* Daily Cash Balance Trend */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Daily Cash Balance Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={sampledDailyBalance} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <defs>
              <linearGradient id="cashGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" fontSize={12} />
            <YAxis tickFormatter={formatCurrency} fontSize={12} />
            <Tooltip
              content={({ active, payload, label }: any) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-white p-3 border rounded-lg shadow-lg">
                      <p className="font-semibold text-gray-900">{label}</p>
                      <p className="text-sm text-blue-600">
                        Balance: {formatCurrency(payload[0].value)}
                      </p>
                    </div>
                  )
                }
                return null
              }}
            />
            <Area
              type="monotone"
              dataKey="balance"
              stroke="#3B82F6"
              strokeWidth={3}
              fill="url(#cashGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>

        {/* Balance Statistics */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <div className="text-sm text-blue-600 mb-1">Average</div>
            <div className="text-lg font-bold text-blue-700">{formatCurrency(avgCashBalance)}</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <div className="text-sm text-green-600 mb-1">Peak</div>
            <div className="text-lg font-bold text-green-700">{formatCurrency(maxCashBalance)}</div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg text-center">
            <div className="text-sm text-orange-600 mb-1">Low</div>
            <div className="text-lg font-bold text-orange-700">{formatCurrency(minCashBalance)}</div>
          </div>
        </div>
      </div>

      {/* Monthly Cash Flow (Inflows vs Outflows) */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Monthly Inflows vs Outflows</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthlyCashFlow} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" fontSize={12} />
            <YAxis tickFormatter={formatCurrency} fontSize={12} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="inflows" fill="#10B981" name="Cash Inflows" radius={[8, 8, 0, 0]} />
            <Bar dataKey="outflows" fill="#EF4444" name="Cash Outflows" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Cash Runway Projection */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">12-Month Cash Runway Projection</h3>
        <p className="text-sm text-gray-600 mb-4">
          Based on current burn rate of {formatCurrency(avgMonthlyBurn)}/month and revenue of {formatCurrency(avgMonthlyRevenue)}/month
        </p>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={cashRunwayProjection} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" fontSize={12} />
            <YAxis tickFormatter={formatCurrency} fontSize={12} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line
              type="monotone"
              dataKey="projectedCash"
              stroke="#3B82F6"
              strokeWidth={3}
              name="Projected Cash"
            />
            <Line
              type="monotone"
              dataKey="criticalLevel"
              stroke="#F59E0B"
              strokeWidth={2}
              strokeDasharray="5 5"
              name="Critical Level (3mo burn)"
            />
          </LineChart>
        </ResponsiveContainer>

        {runwayMonths !== Infinity && runwayMonths < 6 && (
          <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <span className="text-xl">⚠️</span>
              <p className="text-sm text-yellow-800">
                <strong>Warning:</strong> Current cash runway of {Math.floor(runwayMonths)} months is below recommended 6 month minimum.
                Consider increasing revenue or reducing expenses.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Cash Flow Insights */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">💰 Cash Flow Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-start space-x-2">
            <span className="text-blue-500 font-bold">•</span>
            <p className="text-gray-700">
              Current cash position: <strong>{formatCurrency(financials.currentCashBalance)}</strong> with{' '}
              {runwayMonths === Infinity ? (
                <strong className="text-green-600">positive cash flow (growing)</strong>
              ) : (
                <>runway of <strong>{Math.floor(runwayMonths)} months</strong></>
              )}
            </p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-green-500 font-bold">↑</span>
            <p className="text-gray-700">
              Average monthly inflows: <strong>{formatCurrency(avgMonthlyRevenue)}</strong> from client payments
            </p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-red-500 font-bold">↓</span>
            <p className="text-gray-700">
              Average monthly outflows: <strong>{formatCurrency(avgMonthlyBurn)}</strong> in business expenses
            </p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-purple-500 font-bold">★</span>
            <p className="text-gray-700">
              Cash balance range: <strong>{formatCurrency(minCashBalance)}</strong> to{' '}
              <strong>{formatCurrency(maxCashBalance)}</strong> over the period
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
