'use client'

import { ParsedCSVData } from '@/types'
import { CreditCardData } from '@/lib/creditCardParser'
import { calculateFinancialTotals } from '@/lib/financialCalculations'
import ExpenseWaterfallChart from './ExpenseWaterfallChart'
import KeyMetricCards from './KeyMetricCards'

interface IncomeStatementDashboardProps {
  checkingData: ParsedCSVData
  fullCreditCardData?: CreditCardData | null
}

export default function IncomeStatementDashboard({ checkingData, fullCreditCardData }: IncomeStatementDashboardProps) {
  const financials = calculateFinancialTotals(checkingData, fullCreditCardData)

  return (
    <div className="space-y-8">
      {/* Hero Metrics - Magazine Style */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Income Statement Visual</h1>
          <p className="text-gray-600 text-sm">Revenue flow and expense analysis</p>
        </div>
        <KeyMetricCards financials={financials} />
      </div>

      {/* Main Financial Flow Visualization */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <ExpenseWaterfallChart
          revenue={financials.businessRevenue}
          consultantExpenses={financials.consultantExpenses}
          creditCardOperatingExpenses={financials.creditCardOperatingExpenses}
          creditCardTravelExpenses={financials.creditCardTravelExpenses}
          creditCardMealsExpenses={financials.creditCardMealsExpenses}
          creditCardUtilitiesExpenses={financials.creditCardUtilitiesExpenses}
          creditCardTotalExpenses={financials.creditCardTotalExpenses}
          autoLoanExpenses={financials.autoLoanExpenses}
          bankFees={financials.bankFeesExpenses}
          netIncome={financials.netIncome}
        />
      </div>

      {/* Single Key Insight - Magazine Style */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200 p-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-indigo-900 mb-3">Income Statement Insight</h3>
          <div className="max-w-3xl mx-auto">
            <p className="text-sm text-indigo-800 leading-relaxed">
              The business generates <strong>${financials.businessRevenue.toLocaleString()}</strong> in revenue
              primarily through consultant services ({((financials.consultantExpenses / financials.businessRevenue) * 100).toFixed(0)}% of revenue).
              {financials.netIncome >= 0
                ? `With a ${((financials.netIncome / financials.businessRevenue) * 100).toFixed(1)}% margin, operations are profitable.`
                : 'Current loss position requires focus on cost optimization or revenue enhancement.'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}