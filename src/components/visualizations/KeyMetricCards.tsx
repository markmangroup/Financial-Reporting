'use client'

import { FinancialTotals } from '@/lib/financialCalculations'

interface KeyMetricCardsProps {
  financials: FinancialTotals
}

interface MetricCardProps {
  title: string
  value: string
  subtext?: string
  trend?: 'positive' | 'negative' | 'neutral'
  highlight?: boolean
}

function MetricCard({ title, value, subtext, trend = 'neutral', highlight = false }: MetricCardProps) {
  const getTrendColor = () => {
    switch (trend) {
      case 'positive': return 'text-green-600'
      case 'negative': return 'text-red-600'
      default: return 'text-gray-900'
    }
  }

  const getBorderColor = () => {
    if (highlight) return 'border-blue-200 bg-blue-50'
    switch (trend) {
      case 'positive': return 'border-green-200 bg-green-50'
      case 'negative': return 'border-red-200 bg-red-50'
      default: return 'border-gray-200 bg-white'
    }
  }

  return (
    <div className={`p-4 rounded-lg border-2 ${getBorderColor()}`}>
      <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
        {title}
      </div>
      <div className={`text-2xl font-bold ${getTrendColor()} mb-1`}>
        {value}
      </div>
      {subtext && (
        <div className="text-xs text-gray-600">
          {subtext}
        </div>
      )}
    </div>
  )
}

export default function KeyMetricCards({ financials }: KeyMetricCardsProps) {
  // Calculate key metrics
  const grossMargin = financials.businessRevenue > 0
    ? ((financials.businessRevenue - financials.totalBusinessExpenses) / financials.businessRevenue * 100)
    : 0

  const expenseRatio = financials.businessRevenue > 0
    ? (financials.totalBusinessExpenses / financials.businessRevenue * 100)
    : 0

  const consultantRatio = financials.businessRevenue > 0
    ? (financials.consultantExpenses / financials.businessRevenue * 100)
    : 0

  const burnRate = financials.totalBusinessExpenses / 12 // Monthly burn rate

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard
        title="Total Revenue"
        value={`$${financials.businessRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
        subtext="Business income"
        trend="positive"
      />

      <MetricCard
        title="Net Income"
        value={`$${financials.netIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
        subtext={`${grossMargin.toFixed(1)}% margin`}
        trend={financials.netIncome >= 0 ? 'positive' : 'negative'}
        highlight={true}
      />

      <MetricCard
        title="Expense Ratio"
        value={`${expenseRatio.toFixed(1)}%`}
        subtext="of total revenue"
        trend={expenseRatio > 100 ? 'negative' : expenseRatio > 80 ? 'neutral' : 'positive'}
      />

      <MetricCard
        title="Monthly Burn"
        value={`$${burnRate.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
        subtext="Average monthly expenses"
        trend="neutral"
      />

      {/* Second row with more detailed metrics */}
      <MetricCard
        title="Consultant Spend"
        value={`$${financials.consultantExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
        subtext={`${consultantRatio.toFixed(1)}% of revenue`}
        trend="neutral"
      />

      <MetricCard
        title="Credit Card Exp"
        value={`$${financials.creditCardTotalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
        subtext="All CC charges"
        trend="neutral"
      />

      <MetricCard
        title="Auto Loan"
        value={`$${financials.autoLoanExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
        subtext="Vehicle payments"
        trend="neutral"
      />

      <MetricCard
        title="Bank Fees"
        value={`$${financials.bankFeesExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
        subtext="Banking costs"
        trend="neutral"
      />

      {/* Executive insights section */}
      <div className="lg:col-span-4 mt-2">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">Executive Insights</h4>
          <div className="grid md:grid-cols-2 gap-3 text-sm text-blue-800">
            <div>
              • <strong>Revenue Concentration:</strong> Business shows client diversification with two major revenue streams
            </div>
            <div>
              • <strong>Cost Structure:</strong> {consultantRatio.toFixed(0)}% of expenses are consultant-related, indicating service-based model
            </div>
            <div>
              • <strong>Profitability:</strong> {financials.netIncome >= 0 ? 'Profitable' : 'Operating at a loss'} with {Math.abs(grossMargin).toFixed(1)}% margin
            </div>
            <div>
              • <strong>Cash Efficiency:</strong> Monthly burn rate of ${burnRate.toLocaleString('en-US', { maximumFractionDigits: 0 })} needs revenue coverage
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}