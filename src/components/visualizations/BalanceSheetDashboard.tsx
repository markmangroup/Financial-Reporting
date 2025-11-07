'use client'

import { ParsedCSVData } from '@/types'
import { calculateFinancialTotals } from '@/lib/financialCalculations'
import CashFlowBridgeChart from './CashFlowBridgeChart'

interface BalanceSheetDashboardProps {
  checkingData: ParsedCSVData
  creditData?: ParsedCSVData | null
}

export default function BalanceSheetDashboard({ checkingData, creditData }: BalanceSheetDashboardProps) {
  const financials = calculateFinancialTotals(checkingData)

  // Calculate cash metrics
  const currentCash = financials.currentCashBalance
  const creditCardBalance = creditData ? Math.abs(creditData.summary.balance || 0) : 0
  const totalAssets = currentCash
  const totalLiabilities = creditCardBalance
  const totalEquity = financials.totalOwnerEquity
  const burnRate = financials.totalBusinessExpenses / 12

  return (
    <div className="space-y-8">
      {/* Hero Balance Sheet Metrics */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200 p-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Balance Sheet Visual</h1>
          <p className="text-gray-600 text-sm">Cash position and financial strength analysis</p>
        </div>

        {/* Key Balance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 rounded-lg bg-white border border-green-100">
            <div className="text-sm font-medium text-green-700 mb-2">Current Cash</div>
            <div className="text-3xl font-bold text-green-800">
              ${currentCash.toLocaleString()}
            </div>
            <div className="text-xs text-green-600 mt-1">
              {Math.floor(currentCash / burnRate)} months runway
            </div>
          </div>

          <div className="text-center p-4 rounded-lg bg-white border border-red-100">
            <div className="text-sm font-medium text-red-700 mb-2">Total Liabilities</div>
            <div className="text-3xl font-bold text-red-800">
              ${totalLiabilities.toLocaleString()}
            </div>
            <div className="text-xs text-red-600 mt-1">
              {totalLiabilities > 0 ? 'Credit card debt' : 'Debt-free'}
            </div>
          </div>

          <div className="text-center p-4 rounded-lg bg-white border border-blue-100">
            <div className="text-sm font-medium text-blue-700 mb-2">Owner&apos;s Equity</div>
            <div className="text-3xl font-bold text-blue-800">
              ${totalEquity.toLocaleString()}
            </div>
            <div className="text-xs text-blue-600 mt-1">
              Net worth position
            </div>
          </div>
        </div>
      </div>

      {/* Cash Flow Bridge Visualization */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <CashFlowBridgeChart
          openingCash={180000} // Estimated opening cash
          operatingCashFlow={financials.netIncome}
          capitalExpenses={financials.autoLoanExpenses}
          financingCashFlow={0}
          closingCash={financials.currentCashBalance}
          revenue={financials.businessRevenue}
          expenses={financials.totalBusinessExpenses}
        />
      </div>

      {/* Balance Sheet Insight */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border border-emerald-200 p-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-emerald-900 mb-3">Balance Sheet Insight</h3>
          <div className="max-w-3xl mx-auto">
            <p className="text-sm text-emerald-800 leading-relaxed">
              Current cash position of <strong>${currentCash.toLocaleString()}</strong> provides approximately
              <strong> {Math.floor(currentCash / burnRate)} months</strong> of operational runway.
              {totalLiabilities > 0
                ? ` Outstanding liabilities of $${totalLiabilities.toLocaleString()} should be monitored closely.`
                : ' The business maintains a debt-free position, providing financial flexibility.'
              }
              {' '}Owner&apos;s equity of <strong>${totalEquity.toLocaleString()}</strong> reflects
              {totalEquity >= 0 ? ' positive' : ' negative'} accumulated business value.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}