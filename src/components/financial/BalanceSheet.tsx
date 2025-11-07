'use client'

import { ParsedCSVData } from '@/types'
import { calculateFinancialTotals } from '@/lib/financialCalculations'
import DualViewLayout from '@/components/layout/DualViewLayout'
import BalanceSheetDashboard from '@/components/visualizations/BalanceSheetDashboard'
import HeroBalanceSheet from '@/components/visualizations/HeroBalanceSheet'

interface BalanceSheetProps {
  checkingData: ParsedCSVData | null
  creditData: ParsedCSVData | null
}

export default function BalanceSheet({ checkingData, creditData }: BalanceSheetProps) {
  if (!checkingData) {
    return (
      <div className="p-6">
        <div className="text-center py-20">
          <div className="text-gray-400 text-lg mb-4">Upload your Chase checking account CSV to view Balance Sheet</div>
        </div>
      </div>
    )
  }

  // USE GOLDEN RECORD CALCULATIONS
  const financials = calculateFinancialTotals(checkingData)

  // Assets (Point-in-time)
  const cashAndCashEquivalents = financials.currentCashBalance

  // Liabilities (Point-in-time)
  const creditCardBalance = creditData ? Math.abs(creditData.summary.balance || 0) : 0

  // Equity components from golden record
  const initialCapital = financials.initialCapital
  const netOwnerEquity = financials.ownerCapitalContributions
  const netIncome = financials.netIncome
  const otherCredits = financials.otherCredits
  const unaccountedCredits = financials.unaccountedCredits

  // Balance Sheet totals
  const totalAssets = cashAndCashEquivalents
  const totalLiabilities = creditCardBalance
  const totalEquity = financials.totalOwnerEquity
  const totalLiabilitiesAndEquity = totalLiabilities + totalEquity

  // Separate for display
  const businessRevenue = financials.businessRevenue
  const totalExpenses = financials.totalBusinessExpenses

  // For display purposes, separate components
  const retainedEarnings = netIncome

  // Define variables for debug section
  const beginningEquity = 0 // Starting point for cash-based accounting
  const ownerContributions = netOwnerEquity > 0 ? netOwnerEquity : 0
  const ownerWithdrawals = netOwnerEquity < 0 ? Math.abs(netOwnerEquity) : 0

  // Check if balance sheet balances (use actual calculated values)
  const difference = Math.abs(totalAssets - totalLiabilitiesAndEquity)
  const isBalanced = difference < 0.01 // Must be exactly balanced for audit

  // Traditional tabular view
  const traditionalView = (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">MARKMAN GROUP</h1>
          <h2 className="text-xl font-semibold text-gray-700 mt-2">BALANCE SHEET</h2>
          <div className="text-sm text-gray-500 mt-1">
            As of {checkingData.summary.dateRange.end}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Assets */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-300 pb-2">ASSETS</h3>

            <div className="space-y-3">
              <div className="ml-4">
                <h4 className="font-semibold text-gray-800 mb-2">Current Assets</h4>
                <div className="space-y-2 ml-4">
                  <div className="flex justify-between">
                    <span className="text-gray-700">Cash and Cash Equivalents</span>
                    <span className="font-medium">${cashAndCashEquivalents.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 ml-4">- Chase Checking Account 5939</span>
                    <span>${cashAndCashEquivalents.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
                <div className="flex justify-between mt-3 pt-2 border-t border-gray-200 font-semibold">
                  <span>Total Current Assets</span>
                  <span>${cashAndCashEquivalents.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              <div className="flex justify-between text-xl font-bold pt-4 border-t-2 border-gray-300">
                <span>TOTAL ASSETS</span>
                <span>${totalAssets.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          {/* Right Column - Liabilities & Equity */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-300 pb-2">LIABILITIES & EQUITY</h3>

            <div className="space-y-4">
              {/* Liabilities */}
              <div className="ml-4">
                <h4 className="font-semibold text-gray-800 mb-2">Current Liabilities</h4>
                <div className="space-y-2 ml-4">
                  {creditCardBalance > 0 ? (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-700">Credit Card Payable</span>
                        <span className="font-medium">${creditCardBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 ml-4">- Chase Credit Card 8008</span>
                        <span>${creditCardBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-between">
                      <span className="text-gray-500">No current liabilities</span>
                      <span>$0.00</span>
                    </div>
                  )}
                </div>
                <div className="flex justify-between mt-3 pt-2 border-t border-gray-200 font-semibold">
                  <span>Total Liabilities</span>
                  <span>${totalLiabilities.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              {/* Owner&apos;s Equity */}
              <div className="ml-4">
                <h4 className="font-semibold text-gray-800 mb-2">Owner&apos;s Equity</h4>
                <div className="space-y-2 ml-4">
                  {initialCapital > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-700">Initial Capital</span>
                      <span className="font-medium text-green-600">${initialCapital.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-700">Owner Capital Contributions (Net)</span>
                    <span className="font-medium text-blue-600">${netOwnerEquity.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Retained Earnings (Net Income)</span>
                    <span className={`font-medium ${retainedEarnings >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ${retainedEarnings.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  {otherCredits > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-700">Other Credits (Wire Reversals, etc.)</span>
                      <span className="font-medium text-purple-600">
                        ${otherCredits.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  )}
                  {unaccountedCredits > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-700">Unaccounted Credits (Balance Reconciliation)</span>
                      <span className="font-medium text-orange-600">
                        ${unaccountedCredits.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  )}
                  {/* Breakdown of Net Income */}
                  <div className="ml-4 text-xs text-gray-500 border-l-2 border-gray-200 pl-2">
                    <div className="flex justify-between">
                      <span>Business Revenue</span>
                      <span>${businessRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Less: Total Expenses</span>
                      <span>(${totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })})</span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span>Net Income</span>
                      <span className={retainedEarnings >= 0 ? 'text-green-600' : 'text-red-600'}>
                        ${retainedEarnings.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between mt-3 pt-2 border-t border-gray-200 font-semibold">
                  <span>Total Owner&apos;s Equity</span>
                  <span>${totalEquity.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              <div className="flex justify-between text-xl font-bold pt-4 border-t-2 border-gray-300">
                <span>TOTAL LIABILITIES & EQUITY</span>
                <span>${totalLiabilitiesAndEquity.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Balance Check */}
        <div className="mt-8 pt-6 border-t border-gray-300">
          <div className={`text-center p-4 rounded-lg ${
            isBalanced
              ? 'bg-green-50 border border-green-200'
              : 'bg-red-50 border border-red-200'
          }`}>
            <div className={`font-semibold ${isBalanced ? 'text-green-800' : 'text-red-800'}`}>
              {isBalanced ? '✅ BALANCE SHEET BALANCES' : '⚠️ BALANCE SHEET DOES NOT BALANCE'}
            </div>
            <div className="text-sm mt-2">
              Assets: ${totalAssets.toLocaleString('en-US', { minimumFractionDigits: 2 })} =
              Liabilities + Equity: ${totalLiabilitiesAndEquity.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            {!isBalanced && (
              <div className="text-sm text-red-600 mt-1">
                Difference: ${difference.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            )}
            {difference >= 0.01 && (
              <div className="text-xs text-gray-500 mt-1">
                Assets: ${totalAssets.toLocaleString('en-US', { minimumFractionDigits: 2 })} ≠
                Liabilities + Equity: ${totalLiabilitiesAndEquity.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            )}
          </div>

        </div>

        {/* Key Ratios */}
        <div className="mt-6">
          <h4 className="font-semibold text-gray-800 mb-3">KEY FINANCIAL RATIOS</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="text-center">
              <div className="font-medium text-gray-500">DEBT-TO-EQUITY</div>
              <div className="text-lg font-semibold text-gray-900">
                {totalEquity > 0 ? (totalLiabilities / totalEquity).toFixed(2) : 'N/A'}
              </div>
            </div>
            <div className="text-center">
              <div className="font-medium text-gray-500">EQUITY RATIO</div>
              <div className="text-lg font-semibold text-gray-900">
                {totalAssets > 0 ? ((totalEquity / totalAssets) * 100).toFixed(1) + '%' : 'N/A'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  // Visual dashboard view
  const visualView = <BalanceSheetDashboard checkingData={checkingData} creditData={creditData} />

  // Hero magazine view
  const heroView = <HeroBalanceSheet checkingData={checkingData} creditData={creditData} />

  return (
    <DualViewLayout
      title="MARKMAN GROUP BALANCE SHEET"
      subtitle={`As of ${checkingData.summary.dateRange.end}`}
      traditionalView={traditionalView}
      visualView={visualView}
      heroView={heroView}
    />
  )
}